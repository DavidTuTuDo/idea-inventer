const edit = true;

import liff from "@line/liff";
import Functions from "../functions";
import firebaser from "./FirebaseHelper";
import Configer from "../config";
import { utiller as Util } from "utiller";

class LiffHelper {

    liffInitialized = false;
    liffLoginAttempted = false;
    /**
     * 判斷是否在 LINE Webview 環境
     * 封裝初始化與環境檢查邏輯
     */
    async checkIsInLineBrowser() {
        const isLiffSetup = await this.initializeLiff();
        if (!isLiffSetup) return false;

        const inClient = liff.isInClient();
        console.log(`[Environment Check] Is in LINE Client: ${inClient}`);
        return inClient;
    }

    logout = async () => {
        if (this.liffInitialized && liff.isLoggedIn()) {
            liff.logout();
            Util.appendInfo("Line LIFF 登出成功。");
            this.liffLoginAttempted = false; // 登出時重設嘗試標記
            this.liffInitialized = false;
        }
    }

    /** 初始化 LIFF 並回傳 Promise 確保後續流程可以 await */
    initializeLiff = async () => {
        // 如果已經在初始化中或已完成，直接回傳該 Promise 或 true
        if (this.liffInitPromise) return this.liffInitPromise;
        if (!Configer.liffId) return false;

        this.liffInitPromise = (async () => {
            try {
                await liff.init({ liffId: Configer.liffId });
                this.liffInitialized = true;
                Util.appendInfo("LIFF 初始化完成");
                return true;
            } catch (error) {
                Util.appendError("LIFF 初始化失敗:", error);
                this.liffInitPromise = null; // 失敗時清除，允許下次重試
                return false;
            }
        })();
        return this.liffInitPromise;
    };

    /** 2. 封裝 LINE/LIFF 登入完整邏輯 */
    async handleLineAutoLoginFlow() {
        const { Application } = require("../");
        const view = Application.getLatestComponent();
        try {
            console.log(view.getComponentName());
            view.enableAppLoading();
            Util.appendInfo("執行 LINE 自動登入流程...");
            this.liffLoginAttempted = true;
            // 檢查 LIFF 層級是否登入
            if (!liff.isLoggedIn()) {
                Util.appendInfo("LIFF 未登入，重新導向 LINE Login...");
                liff.login();
                return "REDIRECT";
            }
            const idToken = liff.getIDToken();
            if (!idToken) {
                view?.showErrorSnackMessage("無法從 LINE 取得 ID Token");
                return false;
            }
            const result = await Functions.httpOnCallVerifyByLiffIdToken(view, { idToken });
            await firebaser.signInWithCustomToken(
                result.firebaseToken,
                async (resultOfTokenAuth) => {
                    if (resultOfTokenAuth)
                        Util.appendInfo("LINE Custom Token 登入成功")
                });
            return true;
        } catch (error) {
            Util.appendError("LINE 登入程序失敗", error);
            return false;
        } finally {
            view.enableAppLoading(false);
        }
    }

    activate = async () => {
        const isInLine = await this.checkIsInLineBrowser();
        if (isInLine) {
            if (!this.liffLoginAttempted) {
                const liffResult = await this.handleLineAutoLoginFlow();
                if (liffResult === "REDIRECT") return; // 終止流程，等待重定向回頁面
            }
            return true;
        }
    }
}

export default new LiffHelper();
