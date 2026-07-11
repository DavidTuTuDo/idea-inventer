const edit = true;

import { utiller as Util } from "utiller";

import Config from "../../config";
import BaseVerifyByLiffIdToken from "./BaseVerifyByLiffIdToken";

class ModularizedVerifyByLiffIdToken extends BaseVerifyByLiffIdToken {
    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const idToken = data.idToken;
        const startTime = Date.now();

        console.log(`[Auth Start] 開始處理 LINE 驗證流...`);

        // 1. 檢查輸入
        if (!idToken) {
            this.appendLog("[Auth Error] 缺少 idToken");
            return this.appendErrorLog(9999, "Missing idToken");
        }

        try {
            // 2. 驗證 LINE Token 並取得資料
            this.appendLog("[Step 1/3] 正在向 LINE 伺服器請求驗證...");
            const lineProfile = await this.verifyLineToken(idToken);

            if (!lineProfile) {
                console.error("[Auth Error] LINE 驗證回傳為空或失敗");
                return this.appendErrorLog(9999, "Invalid LINE idToken");
            }
            this.appendLog(`[Step 1 Success] 取得 LINE 用戶: ${lineProfile.name} (${lineProfile.sub})`);

            const { sub, name, picture, email } = lineProfile;
            const uid = `line:${sub}`; // 保持統一的 UID 格式

            // 3. Firebase Auth 處理 (Get or Create)
            let userRecord;
            this.appendLog(`[Step 2/3] 檢查 Firebase Auth 是否存在 UID: ${uid}`);

            try {
                userRecord = await this._firebase().auth().getUser(uid);
                this.appendLog(`[Step 2 Success] 發現現有用戶: ${userRecord.uid}`);

                // (選配) 如果想同步 LINE 的最新資料到 Firebase，可以在此更新 userRecord
            } catch (error) {
                if (error.code === "auth/user-not-found") {
                    this.appendLog(`[Step 2 Notice] 用戶不存在，準備創建新帳號...`);
                    userRecord = await this._firebase().auth().createUser({
                        uid: uid,
                        displayName: name,
                        photoURL: picture,
                        email: email,
                        emailVerified: !!email
                    });
                    this.appendLog(`[Step 2 Success] 成功創建新用戶: ${userRecord.uid}`);
                } else {
                    console.error(`[Step 2 Error] Firebase getUser 發生非預期錯誤:`, error);
                    throw error;
                }
            }

            // 4. 生成 Custom Token
            this.appendLog(`[Step 3/3] 正在生成 Firebase Custom Token...`);
            const firebaseToken = await this._firebase().auth().createCustomToken(uid);

            const duration = Date.now() - startTime;
            this.appendLog(`[Auth Complete] 流程成功結束。總耗時: ${duration}ms`);

            return {
                firebaseToken,
                uid: userRecord.uid,
                isNewUser: !userRecord.metadata.lastSignInTime // 簡單判斷是否為新用戶
            };
        } catch (error) {
            console.error("[Fatal Error] 驗證流程中斷:", error);
            return this.appendErrorLog(9999, `Auth Error: ${error.message}`);
        }
    }

    verifyLineToken = async (idToken) => {
        const channelId = Config.liffChannelId;
        const lineVerifyUrl = "https://api.line.me/oauth2/v2.1/verify";

        const params = new URLSearchParams();
        params.append("id_token", idToken);
        params.append("client_id", channelId);

        const fetchStart = Date.now();
        try {
            const response = await fetch(lineVerifyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });

            const latency = Date.now() - fetchStart;

            if (!response.ok) {
                const errorDetail = await response.json();
                console.error(`[LINE API Error] (${latency}ms):`, errorDetail);
                return null;
            }

            const data = await response.json();
            this.appendLog(`[LINE API Success] 驗證耗時: ${latency}ms`);
            return data;
        } catch (error) {
            console.error(`[LINE Network Error] 請求失敗:`, error);
            throw error;
        }
    };
}

export default ModularizedVerifyByLiffIdToken;
