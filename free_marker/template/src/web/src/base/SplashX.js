const edit = true;

import React from "react";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import Config from "../config";
import { utiller as Util } from "utiller";

class SplashStore {
    @observable
    visible = true;

    // 新增 isFading 狀態來控制 CSS 動畫
    @observable
    isFading = false;

    constructor() {
        makeObservable(this);
    }

    @action
    show = () => {
        this.visible = true;
        this.isFading = false;
    };

    @action
    async hide() {
        if (!this.visible) return;

        // 1. 先觸發淡出動畫
        this.isFading = true;

        // 2. 使用您定義的 syncDelay 等待動畫時間 (500ms)
        // 假設 Util.syncDelay 已經在您的工具類別中
        await Util.syncDelay(500);

        // 3. 動畫結束後，在 action 中更新最後的隱藏狀態
        // 這裡直接修改或是呼叫另一個 action 都可以
        this.executeClose();
    }

    @action
    executeClose = () => {
        this.visible = false;
        this.isFading = false;
    };
}

export const storeOfSplash = new SplashStore();

const SplashX = observer(({ componentX }) => {
    const { visible, isFading } = storeOfSplash;

    // 如果完全不需要顯示，才 render null
    if (!visible) return null;

    return (
        <div
            style={{
                ...styles.container,
                // 根據 isFading 狀態切換透明度
                opacity: isFading ? 0 : 1,
                // 淡出時關閉點擊事件，避免擋住底層 APP 的操作
                pointerEvents: isFading ? "none" : "auto"
            }}>
            <div style={styles.centerContent}>
                <img src="./images/logo.png" alt="App Logo" style={styles.logo} />
            </div>

            <div style={styles.bottomContent}>
                <span style={styles.fromText}>from</span>
                <div style={styles.brandName}>{Config.nameOfBrand}</div>
            </div>
        </div>
    );
});

const styles = {
    container: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#F5F5F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 99999,
        // 加入 CSS transition 漸變效果，時間與 setTimeout 保持一致 (500ms = 0.5s)
        transition: "opacity 0.5s ease-out"
    },
    centerContent: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        width: "50%",
        maxWidth: "360px",
        height: "auto", // 確保比例正確
        objectFit: "contain",
        animation: "logoFadeIn 0.8s ease-out"
    },
    bottomContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "40px"
    },
    fromText: {
        color: "#888888",
        fontSize: "0.9rem",
        marginBottom: "4px",
        fontFamily: "sans-serif"
    },
    brandName: {
        color: `${Config.colorX}`,
        fontSize: "1.1rem",
        fontWeight: "bold",
        fontFamily: "sans-serif"
    }
};

export default SplashX;
