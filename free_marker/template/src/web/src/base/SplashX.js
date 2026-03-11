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
        await Util.syncDelay(500);

        // 3. 動畫結束後，在 action 中更新最後的隱藏狀態
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
                opacity: isFading ? 0 : 1,
                pointerEvents: isFading ? "none" : "auto"
            }}>
            {/* 為了支援您的 logoFadeIn 動畫，順手幫您加上 style 標籤 */}
            <style>
                {`
                    @keyframes logoFadeIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}
            </style>

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
        // 取代 100vh/100vw，這樣能完美貼齊手機真實的 viewport
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#F5F5F5",
        zIndex: 99999,
        transition: "opacity 0.5s ease-out"
        // 移除 flex 相關設定，改由子元素各自進行絕對定位
    },
    centerContent: {
        // 圖層方式：絕對定位在正中央
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%", // 確保內部的 logo 可以根據寬度計算 % 數
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    logo: {
        width: "50%",
        maxWidth: "360px",
        height: "auto",
        objectFit: "contain",
        animation: "logoFadeIn 0.8s ease-out forwards" // 加上 forwards 確保動畫結束停留在最終狀態
    },
    bottomContent: {
        // 圖層方式：絕對定位在底部
        position: "absolute",
        bottom: "40px", // 距離底部的安全距離
        left: "50%",
        transform: "translateX(-50%)", // 讓元素水平置中
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%"
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
