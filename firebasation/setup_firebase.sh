#!/bin/bash

# 啟用錯誤檢查：確保腳本在任何指令失敗時都會立即終止執行
set -e

# ==========================================
# 0. 環境與權限檢查 (Pre-flight Checks)
# ==========================================
echo "🔍 正在檢查環境設定..."
if ! command -v gcloud &> /dev/null; then
    echo "❌ 錯誤: 未安裝 Google Cloud SDK (gcloud)。請先安裝。" >&2
    exit 1
fi
CURRENT_GCLOUD_ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$CURRENT_GCLOUD_ACCOUNT" ] || [ "$CURRENT_GCLOUD_ACCOUNT" == "(unset)" ]; then
    echo "⚠️ gcloud 尚未登入，正在開啟登入視窗..." >&2
    gcloud auth login
fi
if ! command -v firebase &> /dev/null; then
    echo "❌ 錯誤: 未安裝 Firebase CLI。請執行 npm install -g firebase-tools 進行安裝。" >&2
    exit 1
fi
if ! firebase projects:list --limit 1 &> /dev/null; then
    echo "⚠️ firebase 尚未登入，正在開啟登入視窗..." >&2
    firebase login
fi
echo "✅ 環境檢查通過，權限已確認。"
echo "------------------------------------------------"

# ==========================================
# 1. 使用者輸入區 (專案、Email、密碼)
# ==========================================
echo "請輸入您想要的 Firebase 專案 ID (建議使用小寫英數字):"
read USER_PROJECT_NAME
if [ -z "$USER_PROJECT_NAME" ]; then
    PROJECT_ID="my-app-$(date +%s)"
else
    PROJECT_ID="$USER_PROJECT_NAME"
fi
DEFAULT_EMAIL="freshingmoon0725@gmail.com"
echo "請輸入 Gmail (預設: $DEFAULT_EMAIL):"
read INPUT_EMAIL
USER_EMAIL=${INPUT_EMAIL:-$DEFAULT_EMAIL}
DEFAULT_PASS="onmasfgjcyadbgbe"
echo "請輸入 Gmail 應用程式密碼 (預設: $DEFAULT_PASS):"
read -s INPUT_PASS
echo
USER_PASS=${INPUT_PASS:-$DEFAULT_PASS}
echo "------------------------------------------------"
echo "🚀 準備執行建置作業！"
echo "專案 ID: $PROJECT_ID"
echo "Email: $USER_EMAIL"
echo "------------------------------------------------"
REGION_ASIA="asia-east1"
REGION_US="us-central1"

# ==========================================
# 2. 環境準備與參數檔生成
# ==========================================
mkdir -p credential
SMTP_URI="smtps://${USER_EMAIL}:${USER_PASS}@smtp.gmail.com:465"
cat <<EOF > email_params.env
LOCATION=$REGION_ASIA
STAGING_LOCATION=$REGION_ASIA
SMTP_CONNECTION_URI=$SMTP_URI
DEFAULT_FROM=${USER_EMAIL}
DEFAULT_REPLY_TO=${USER_EMAIL}
MAIL_COLLECTION=mail
EOF

# ==========================================
# 3. Firebase 專案建置與計費設定 (冪等性 + 自動切換帳戶)
# ==========================================

# --- 內部函數：尋找並連結計費帳戶 ---
link_project_to_billing() {
    local project_id=$1
    local action_msg=$2

    local ALL_BILLING_ACCOUNTS
    local WORKING_BILLING_ACCOUNT=""

    # 獲取所有 OPEN=True 的計費帳戶 ID
    ALL_BILLING_ACCOUNTS=$(gcloud beta billing accounts list --format="value(ACCOUNT_ID)" --filter="OPEN=True")

    if [ -z "$ALL_BILLING_ACCOUNTS" ]; then
        echo "❌ 錯誤：找不到任何有效的 Google Cloud 計費帳戶。" >&2
        return 1
    fi

    echo "💳 正在嘗試對專案 $project_id 執行 $action_msg..." >&2
    set +e # 暫時關閉 set -e，因為連結失敗 (配額超限) 是預期的錯誤

    for ACCOUNT_ID in $ALL_BILLING_ACCOUNTS; do
        echo "   -> 嘗試連結 $ACCOUNT_ID..." >&2
        # 執行連結指令，將 stdout (成功訊息) 和 stderr (錯誤訊息) 都重定向到 /dev/null
        if (gcloud beta billing projects link "$project_id" --billing-account="$ACCOUNT_ID") >/dev/null 2>&1; then
            WORKING_BILLING_ACCOUNT="$ACCOUNT_ID"
            echo "✅ 成功連結/確認 $ACCOUNT_ID！" >&2
            break
        fi
    done

    set -e # 重新開啟 set -e

    if [ -z "$WORKING_BILLING_ACCOUNT" ]; then
        echo "❌ 錯誤：嘗試連結所有找到的計費帳戶皆失敗。您的所有帳戶可能皆已達到專案連結配額上限。" >&2
        echo "   請手動聯繫 Google Cloud 計費支援團隊，請求清除待刪除專案。" >&2
        return 1
    fi

    echo "$WORKING_BILLING_ACCOUNT" # 此行是唯一一個輸出到 stdout，供外部捕獲的值
    return 0
}
# --- 結束：內部函數 ---

# --- 函數：從函式輸出中提取乾淨 ID ---
extract_clean_billing_id() {
    local full_output=$1
    # 提取最後一行，並移除換行符和可能的空格
    echo "$full_output" | tail -n 1 | tr -d '\r\n '
}

echo "🔍 檢查專案 $PROJECT_ID 是否已存在..."

set +e
firebase projects:list | grep -q "$PROJECT_ID"
PROJECT_CHECK_EXIT_CODE=$?
set -e

if [ $PROJECT_CHECK_EXIT_CODE -eq 0 ]; then
    PROJECT_WAS_NEWLY_CREATED=false
    echo "✅ 專案 $PROJECT_ID 已存在。進入『續行模式』，跳過建立與計費設定。"

    CURRENT_LINKED_ACCOUNT=$(gcloud beta billing projects describe "$PROJECT_ID" --format="value(billingAccountName)" 2>/dev/null)

    if [ -z "$CURRENT_LINKED_ACCOUNT" ] || [[ "$CURRENT_LINKED_ACCOUNT" == "projects/$PROJECT_ID/billingInfo" ]]; then
        WORKING_BILLING_ACCOUNT_FULL_OUTPUT=$(link_project_to_billing "$PROJECT_ID" "確認/重新連結計費")
        if [ $? -ne 0 ]; then
            exit 1
        fi
    else
        echo "✅ 專案已連結計費帳戶：${CURRENT_LINKED_ACCOUNT##*/}"
        WORKING_BILLING_ACCOUNT_FULL_OUTPUT="$CURRENT_LINKED_ACCOUNT"
    fi

    BILLING_ACCOUNT=$(extract_clean_billing_id "$WORKING_BILLING_ACCOUNT_FULL_OUTPUT")


elif [ $PROJECT_CHECK_EXIT_CODE -eq 1 ]; then
    PROJECT_WAS_NEWLY_CREATED=true
    echo "🔥 專案 $PROJECT_ID 不存在。正在建立新專案 (請耐心等候)..."

    if ! firebase projects:create "$PROJECT_ID" ; then
        echo "❌ 專案建立失敗。可能專案 ID 已被佔用，或權限不足。" >&2
        exit 1
    fi
    echo "✅ 專案 $PROJECT_ID 建立成功！"

    # === 自動尋找並連結有效的計費帳戶並提取乾淨 ID ===
    WORKING_BILLING_ACCOUNT_FULL_OUTPUT=$(link_project_to_billing "$PROJECT_ID" "連結新專案")
    if [ $? -ne 0 ]; then
        exit 1
    fi
    BILLING_ACCOUNT=$(extract_clean_billing_id "$WORKING_BILLING_ACCOUNT_FULL_OUTPUT")
    # ==============================================

    echo "💰 設定預算上限為 100 TWD..."
    gcloud services enable billingbudgets.googleapis.com --project "$PROJECT_ID"

    gcloud billing budgets create --billing-account="$BILLING_ACCOUNT" \
        --display-name="Budget-100-TWD-$PROJECT_ID" \
        --billing-project="$PROJECT_ID" \
        --budget-amount=100.00TWD \
        --threshold-rule=percent=0.5 \
        --threshold-rule=percent=1.0 \
        --filter-projects=projects/"$PROJECT_ID"
    echo "✅ 預算設定成功！"

else
    echo "❌ 嚴重錯誤：執行 'firebase projects:list' 時失敗 (Exit Code $PROJECT_CHECK_EXIT_CODE)。" >&2
    echo "   請確認您已執行 'firebase login' 且憑證有效，並檢查您的網路連線。" >&2
    exit 1
fi

# ==========================================
# 4. 初始化服務 (Web, Firestore, Storage) (冪等性)
# ==========================================
# --- 4A. Web App 檢查與創建 (獲取 firebaseConfig.json) ---
WEB_APP_EXISTS=false
set +e
if firebase apps:list --project "$PROJECT_ID" | grep -q "$PROJECT_ID-web"; then
    WEB_APP_EXISTS=true
    echo "⚠️ Web 應用程式 ($PROJECT_ID-web) 已存在，跳過創建。"
fi
set -e

if [ "$WEB_APP_EXISTS" = false ]; then
    echo "🌐 啟用 Web 應用程式..."
    firebase apps:create WEB "$PROJECT_ID-web" --project "$PROJECT_ID"
else
    echo "🌐 獲取 Web App 配置 (firebaseConfig.json)..."
fi
firebase apps:sdkconfig WEB --project "$PROJECT_ID" > ./credential/firebaseConfig.json
echo "✅ Web App 配置檔已存至 ./credential/firebaseConfig.json"

# --- 4B. Firestore ---
echo "🔥 建立 Firestore 服務 ($REGION_ASIA)..."
gcloud services enable firestore.googleapis.com --project "$PROJECT_ID"

if [ "$PROJECT_WAS_NEWLY_CREATED" = true ]; then
    gcloud firestore databases create --location="$REGION_ASIA" --project "$PROJECT_ID"
    echo "✅ Firestore 資料庫已創建。"
else
    echo "⚠️ Firestore 資料庫假設已存在。跳過創建指令以避免錯誤。"
fi

# --- 4C. Storage ---
echo "📦 啟用 Storage 服務 (使用 Firebase 預設儲存桶)..."
gcloud services enable storage-component.googleapis.com --project "$PROJECT_ID"
echo "✅ 儲存桶 gs://${PROJECT_ID}.appspot.com 已存在，跳過手動創建。"

# ==========================================
# 5. 安裝 Extension (冪等性，強制重新嘗試)
# ==========================================

# --- 5A. 確保 Blaze 計費與 Secret Manager API ---
echo "⚙️ 確保 Blaze 計費已連結並啟用 Secret Manager API..."
# 計費連結已在第 3 節處理，這裡只需啟用 API
gcloud services enable secretmanager.googleapis.com --project "$PROJECT_ID"
echo "✅ 計費連結與 Secret Manager API 啟用完成。"

# --- 5B. Extension 檢查與強制安裝 ---
EXTENSION_INSTALLED=false
set +e
if firebase ext:list --project "$PROJECT_ID" | grep -q "firestore-send-email"; then
    EXTENSION_INSTALLED=true
    echo "✅ Email Extension (firestore-send-email) 已成功註冊，跳過安裝步驟。"
fi
set -e

if [ "$EXTENSION_INSTALLED" = false ]; then
    echo "========================================================================"
    echo "📧 最終嘗試：安裝 Email Extension (進入互動模式)"
    echo "🚨🚨🚨 極度重要：請遵循以下步驟並耐心等待 3-5 分鐘 🚨🚨🚨"
    echo "========================================================================"
    echo "1. 腳本將暫停，請您手動輸入以下 6 個參數："
    echo "   - LOCATION: $REGION_ASIA"
    echo "   - STAGING_LOCATION: $REGION_ASIA"
    # 【語法修正】已修正此行缺少 'echo' 的錯誤
    echo "   - SMTP_CONNECTION_URI: $SMTP_URI (請直接貼上此完整字串)"
    echo "   - DEFAULT_FROM: $USER_EMAIL"
    echo "   - DEFAULT_REPLY_TO: $USER_EMAIL"
    echo "   - MAIL_COLLECTION: mail"
    echo "2. 當您看到 **Resources created:** 時，請回答『✔ Continue? Yes』。"
    echo "3. **回答 Yes 後，請等待 3-5 分鐘！** 讓部署完成，即使您看到 Error: Not currently in a Firebase directory. 也不要中斷。"
    echo "========================================================================"

    set +e
    firebase ext:install firebase/firestore-send-email --project "$PROJECT_ID"
    set -e

    echo "✅ Email Extension 雲端註冊嘗試已完成。請立即檢查 Firebase Console。"
fi

# ==========================================
# 6. 產生 Admin SDK Key (冪等性) (已加入 60 秒延遲修正)
# ==========================================
# --- 6A. 金鑰檔案存在性檢查 (獲取 admin-sdk-key.json) ---
if [ -f "./credential/admin-sdk-key.json" ]; then
    echo "✅ Admin SDK 金鑰檔案已存在，跳過創建服務帳戶與金鑰。"
else
    echo "🔑 產生 Admin SDK 金鑰..."
    SA_ID_SUFFIX="admin"
    FINAL_SA_NAME="${PROJECT_ID}-${SA_ID_SUFFIX}"
    FINAL_SA_EMAIL="${FINAL_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

    echo "   > 修正為具備後綴的 ID: ${FINAL_SA_NAME}"

    set +e
    # 創建服務帳戶 (會忽略已存在的錯誤)
    gcloud iam service-accounts create "$FINAL_SA_NAME" \
        --display-name="Admin SDK Service Account for $PROJECT_ID" \
        --project "$PROJECT_ID"
    set -e

    # === 關鍵修正：等待傳播 60 秒 (確保權限綁定成功) ===
    echo "⏸️ 等待 60 秒，確保服務帳戶在全球傳播 (解決權限綁定失敗)..."
    sleep 60
    # ==========================

    echo "   > 賦予 'Editor' 角色給 ${FINAL_SA_NAME}"
    # 賦予權限
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$FINAL_SA_EMAIL" \
        --role="roles/editor"

    echo "   > 產生金鑰檔案至 ./credential/admin-sdk-key.json"
    # 產生金鑰
    gcloud iam service-accounts keys create ./credential/admin-sdk-key.json \
        --iam-account="$FINAL_SA_EMAIL"
    echo "✅ Admin SDK 金鑰檔案已成功生成！"
fi


# ==========================================
# 7. 完成與後續步驟
# ==========================================
echo "------------------------------------------------"
echo "🎉 雲端服務配置與憑證獲取已全部完成！"
echo "憑證位置:"
echo "   - Web App 配置: ./credential/firebaseConfig.json"
echo "   - Admin SDK 金鑰: ./credential/admin-sdk-key.json"
echo ""
echo "💡 後續步驟 (請手動執行):"
echo "1. 在當前目錄執行 'firebase init' 建立本地專案結構 (firebase.json)。"
echo "2. 配置您的 Functions、Hosting 相關檔案。"
echo "3. 運行 'firebase emulators:start' 開始開發。"
echo "------------------------------------------------"
