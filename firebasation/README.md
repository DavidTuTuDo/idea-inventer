好的，為了確保未來在增加功能時能高效溝通並有效追蹤配置，我為您編寫了一個詳盡的 `README.md` 內容。

這個 `README.md` 腳本不僅解釋了您當前自動化腳本 (`setup_firebase.sh`) 中的每一步操作，還提供了**清晰的目的和未來擴展的指引**。

---

## 📘 專案配置與部署手冊 (`README.md`)

本手冊詳述了此 Firebase 專案的初始化、雲端資源配置和服務設定，目的是為了提供一個清晰的配置藍圖，以便進行功能擴展與維護。

### 1. 專案概述 (Project Overview)

* **專案名稱 (Project ID):** `{PROJECT_ID}` (例如: `sample-abc987`)
* **主要區域 (Primary Region):** `{REGION_ASIA}` (例如: `asia-east1` - 台灣/香港，適用於低延遲服務)
* **核心功能:** 整合 Firestore、Storage 與 Cloud Functions，並使用 Extention 實現自動化郵件發送服務。

---

### 2. 環境與工具準備 (Environment Setup)

在執行任何腳本前，需確保以下工具已安裝並登入：

| 工具 | 目的 | 檢查指令 |
| :--- | :--- | :--- |
| **Google Cloud SDK (`gcloud`)** | 核心 CLI，用於管理 GCP 資源、IAM 及計費。 | `gcloud version` |
| **Firebase CLI (`firebase`)** | 用於管理 Firebase 專案、部署 functions 及 Hosting。 | `firebase --version` |
| **Node.js / npm** | 運行 Functions 程式碼及安裝 Firebase/GCP 工具。 | `node -v` |

---

### 3. 自動化設定步驟 (`setup_firebase.sh` 解析)

以下是 `setup_firebase.sh` 腳本的執行流程及每一步驟的目的：

#### 3.1. 變數設定與憑證檔生成 (Section 1 & 2)

* **目標:** 獲取使用者輸入的 **專案 ID**、**Gmail** 和 **App 密碼**，並創建一個環境配置檔。
* **配置檔:** 創建 `email_params.env`，其中包含了 Extension 所需的 **SMTP URI** (`smtps://user:pass@smtp.gmail.com:465`)。
* **未來擴展考量:** 如果需要引入其他服務（如 Twilio、SendGrid），新的環境變數應在此處或透過 Secret Manager 進行統一管理。

#### 3.2. Firebase 專案與計費設定 (Section 3)

| 操作 | 目的 | 冪等性考量 (Idempotency) |
| :--- | :--- | :--- |
| **專案創建/檢查** | 確保 `firebase projects:create` 僅在專案不存在時執行。 | 腳本會先檢查專案是否存在，若存在則進入「續行模式」。 |
| **計費連結** | 啟用 **Blaze Plan (Pay-as-you-go)**，這是運行 Functions 和 Extension 的最低要求。 | 腳本會自動尋找一個有效的計費帳戶並連結專案，同時處理 CLI 輸出污染問題，確保只獲取乾淨的 `BILLING_ACCOUNT` ID。 |
| **預算設定** | 創建一個每月 **100 TWD** 的預算警示，用於成本控制。 | 確保使用者能及時收到超額警示，避免意外費用。 |

#### 3.3. 核心服務初始化 (Section 4)

| 服務 | 目的 | 啟用指令 |
| :--- | :--- | :--- |
| **Web 應用程式** | 創建一個 Web App 實例，用於生成前端 SDK 配置 (`firebaseConfig.json`)。 | `firebase apps:create WEB` |
| **Firestore** | 創建 NoSQL 資料庫，作為主要資料儲存層及 Extension 的觸發器。 | `gcloud firestore databases create --location=$REGION_ASIA` |
| **Storage** | 啟用雲端儲存服務，用於存儲使用者上傳的檔案。 | `gcloud services enable storage-component.googleapis.com` |

#### 3.4. Extension 與 Secret Manager 配置 (Section 5)

* **Secret Manager API 啟用:** 啟用此 API 是為了讓 Firebase Extension 能夠安全地儲存敏感資訊，例如您的 **Gmail 應用程式密碼**。
* **Extension 安裝:** 安裝 `firebase/firestore-send-email` (郵件擴展)。
    * **重要:** 由於 Extension 安裝是互動式的，腳本會在此處暫停，要求使用者手動輸入配置參數。
    * **配置參數核心:** `SMTP_CONNECTION_URI`（包含 Email 和密碼）將會被儲存到 Secret Manager 中。
* **未來擴展考量:** 任何需要安全儲存 API Key 或密碼的新服務，都應該透過 **Secret Manager** 進行管理。

#### 3.5. Admin SDK 金鑰生成 (Section 6)

* **服務帳戶名稱:** 創建名稱為 `{PROJECT_ID}-admin` 的服務帳戶 (Service Account, SA)。
* **賦予權限:** 將 `roles/editor` 角色賦予給此 SA，使其擁有足夠權限在後端讀寫所有 Firebase/GCP 資源。
* **延遲與權限傳播:** 腳本強制等待 **60 秒** (`sleep 60`)，以確保 SA 創建和權限綁定在全球範圍內充分傳播，避免 Admin SDK 因權限不足而初始化失敗。
* **金鑰檔案:** 生成 `admin-sdk-key.json`，供 Node.js Functions 或其他後端服務使用。

---

### 4. 專案配置檔案結構 (File Structure)

| 檔案/目錄 | 目的 | 誰使用它？ |
| :--- | :--- | :--- |
| `setup_firebase.sh` | **自動化配置**所有雲端資源及服務。 | 開發/維護人員 |
| `credential/` | 儲存所有敏感或配置相關的 JSON 檔案。 | **請勿上傳至 Git 倉庫！** |
| ├── `firebaseConfig.json` | 前端初始化 Firebase SDK 所需的配置。 | 前端 (Web/App) |
| └── `admin-sdk-key.json` | 後端 Admin SDK 初始化及權限驗證所需的金鑰。 | Functions / 後端服務 |
| `email_params.env` | 僅用於腳本執行時的配置變數輸入。 | `setup_firebase.sh` |
| `firebase.json` | Firebase CLI 的主要配置檔，定義 Functions 部署、Hosting 規則等。 | Firebase CLI |

---

### 5. 功能擴展與維護指引 (Maintenance Guide)

#### A. 擴展新服務 (Adding New Features)

| 需求 | 擴展步驟 |
| :--- | :--- |
| **新增需要權限的 API (e.g., Maps API)** | 1. 執行 `gcloud services enable [SERVICE_ID].googleapis.com --project $PROJECT_ID`。 2. 如果服務帳戶需要新角色，執行 `gcloud projects add-iam-policy-binding` 賦予。 |
| **新增雲端 Functions** | 1. 在本地執行 `firebase init functions`。 2. 在 `firebase.json` 中配置 Functions 的區域，建議統一使用 `$REGION_ASIA` (`asia-east1`)。 3. 部署：`firebase deploy --only functions` |
| **修改或重新安裝 Extension** | 由於 Extension 是有狀態的，請使用 `firebase ext:update [INSTANCE_ID]` 或 `firebase ext:configure [INSTANCE_ID]` 進行安全更新。 |

#### B. 憑證更新 (Credential Management)

* **SMTP 密碼/帳號更新:** 1.  如果需要更新 Gmail 密碼，必須到 Firebase Console 手動更新 Extension 實例的配置。
    2.  路徑：`Firebase Console -> Extensions -> 點擊 firestore-send-email 實例 -> 配置 (Configure)`。
* **Admin Key 輪換:**
    1.  執行 `gcloud iam service-accounts keys delete [KEY_ID]` 刪除舊金鑰。
    2.  重新執行 `setup_firebase.sh` 中的 **Section 6** 即可生成新的 `admin-sdk-key.json`。

---

希望這個 `README.md` 腳本能讓您的團隊溝通更有效率！
