const edit = true;

import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import Config from "../config";
import { storeOfSplash } from "./SplashX";

class Store4RulesSnack {
    @observable
    visible = false;

    constructor() {
        makeObservable(this);
    }

    @action
    checkConsent = () => {
        if (!document.cookie.includes("threads_consent_accepted=true")) {
            this.visible = true;
        }
    };

    @action
    closeAndSetCookie = () => {
        if (!this.visible) return;
        document.cookie = "threads_consent_accepted=true; max-age=31536000; path=/";
        this.visible = false;
    };
}

export const store4RulesSnack = new Store4RulesSnack();

const RulesSnack = observer(({ componentX }) => {
    const { visible } = store4RulesSnack;

    // 透過 observer 訂閱 SplashX 的可見狀態
    const isSplashVisible = storeOfSplash.visible;

    useEffect(() => {
        // 只有當 SplashX 隱藏時，才去檢查並決定是否顯示 Cookie 提示
        if (!isSplashVisible) {
            store4RulesSnack.checkConsent();
        }
    }, [isSplashVisible]);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") return;
        store4RulesSnack.closeAndSetCookie();
    };

    // 攔截渲染：Splash 還在畫面上時，絕對不顯示
    if (isSplashVisible) return null;
    const stmtOfEPay = Config.useCartie ? `、 《${Config.nameOfBrand} 退換貨政策》` : '';
    return (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
            }}
            open={visible}
            autoHideDuration={10000}
            onClose={handleClose}
            ContentProps={{
                style: {
                    backgroundColor: "#181818", // 💡 1. 改為深色背景 (Threads 深色模式常用的碳黑色)
                    color: "#FFFFFF",           // 💡 2. 改為純白文字
                    borderRadius: "16px",
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.8)", // 💡 3. 陰影加深，讓黑底組件在畫面上更有層次
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    maxWidth: "600px",
                    width: "90%"
                }
            }}
            message={
                <div style={{ display: "flex", alignItems: "center", fontSize: "14px", fontWeight: "500" }}>
                    <span
                        onClick={handleClose}
                        style={{
                            cursor: "pointer",
                            marginRight: "16px",
                            fontSize: "20px",
                            color: "#888888", // 💡 4. X 按鈕改為淺灰色，在黑底上較為協調
                            padding: "4px"
                        }}
                    >
                        ✕
                    </span>
                    <span style={{ lineHeight: "1.5" }}>
                        繼續即表示你同意《{Config.nameOfBrand} 網站使用條款》、 《{Config.nameOfBrand} 隱私權政策》{stmtOfEPay}。
                    </span>
                </div>
            }
        />
    );
});

export default RulesSnack;
