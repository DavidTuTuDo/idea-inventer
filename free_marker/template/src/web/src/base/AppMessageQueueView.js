const edit = true;

import React from "react";
import { observable, action, makeObservable } from "mobx";
import { observer } from "mobx-react";

/**
 * =========================================================================
 * [AppMessageQueueStore] 
 * 負責管理「微透明訊息佇列」的狀態 (State Management)
 * =========================================================================
 * 開發備註 (Developer Notes):
 * 1. 這裡使用 MobX 進行狀態管理。若未來需要擴充「暫停計時」(Hover 暫停消失) 功能，
 *    可以在 message 物件中增加 `isPaused` 狀態，並在此 Store 實作對應邏輯。
 * 2. 如果需要增加新的訊息類型 (例如 'success')，請在底下的 Style Helper 
 *    (getBackgroundGradient 等) 同步增加對應的視覺設定。
 */
class AppMessageQueueStore {
    // 存放當前所有顯示中的訊息
    @observable
    messages = [];

    // [新增] 允許開發者自行設定畫面上最多同時顯示幾則訊息，預設為 5
    @observable
    maxQueueSize = 5;

    // 內部計數器，用來產生唯一 ID (防呆機制，避免 React key 衝突)
    taskIdCounter = 0;

    constructor() {
        makeObservable(this);
    }

    /**
     * 動態調整最大佇列數量
     * @param {number} size - 畫面上最多顯示的訊息數量
     */
    @action
    setMaxQueueSize = (size) => {
        if (typeof size === "number" && size > 0) {
            this.maxQueueSize = size;
        }
    };

    /**
     * 加入新的微透明訊息到佇列中
     * 
     * @param {Object} payload - 訊息設定物件
     * @param {string} payload.content - 欲顯示的訊息文字內容
     * @param {string} [payload.type="info"] - 訊息類型，預設支援: 'info', 'warn', 'error', 'super'
     * @param {Function} [payload.onClick=null] - 點擊訊息時觸發的 Callback (例如: 導頁)
     * @param {number} [payload.duration=5000] - 訊息停留毫秒數，預設 5 秒後自動銷毀
     */
    @action
    addMessage = ({ content, type = "info", onClick = null, duration = 5000 }) => {
        this.taskIdCounter++;
        const id = `MSG_${this.taskIdCounter}`;

        // 設定自動銷毀的計時器
        const timerId = setTimeout(() => {
            this.removeMessage(id);
        }, duration);

        const message = { id, content, type, onClick, timerId };
        this.messages.push(message);

        // [核心限制] 畫面上最多維持指定的佇列數量 (maxQueueSize)，如果超出，強制將最舊的移除並清除計時器
        if (this.messages.length > this.maxQueueSize) {
            const oldest = this.messages.shift();
            clearTimeout(oldest.timerId);
        }
    };

    /**
     * 依據 ID 手動移除特定的訊息
     * (通常在自動超時，或是使用者點擊訊息時觸發)
     * 
     * @param {string} id - 欲移除的訊息 ID
     */
    @action
    removeMessage = (id) => {
        const index = this.messages.findIndex(m => m.id === id);
        if (index > -1) {
            clearTimeout(this.messages[index].timerId);
            this.messages.splice(index, 1);
        }
    };
}

// 實例化並對外匯出，讓 BaseComponent 或其他地方可以統一呼叫
export const storeOfAppMessageQueue = new AppMessageQueueStore();

/**
 * =========================================================================
 * [Style Helpers] 負責處理不同 type 的 UI 樣式映射
 * =========================================================================
 * 擴充指南 (How to extend):
 * 若未來需要增加新的類型 (例如 "success")，請同步在底下三個函式中加入 `case "success": return ...`
 */

// 1. 取得背景漸層色 (融入 Glassmorphism 微透明質感)
const getBackgroundGradient = (type) => {
    switch (type) {
        case "warn": 
            return "linear-gradient(135deg, rgba(255, 243, 224, 0.85), rgba(255, 216, 155, 0.85))";
        case "error": 
            return "linear-gradient(135deg, rgba(255, 235, 238, 0.85), rgba(255, 185, 195, 0.85))";
        case "super": 
            return "linear-gradient(135deg, rgba(255, 248, 215, 0.9), rgba(255, 225, 130, 0.9))";
        case "info":
        default: 
            return "linear-gradient(135deg, rgba(245, 247, 250, 0.85), rgba(220, 225, 235, 0.85))";
    }
};

// 2. 取得邊框顏色 (細緻的半透明邊線，貼近 MUI 設計)
const getBorderColor = (type) => {
    switch (type) {
        case "warn": return "rgba(255, 152, 0, 0.3)";
        case "error": return "rgba(244, 67, 54, 0.2)";
        case "super": return "rgba(255, 215, 0, 0.5)";
        case "info":
        default: return "rgba(0, 0, 0, 0.05)"; 
    }
};

// 3. 取得 MUI 標準陰影 (預設使用 Elevation 6)
const getMuiBoxShadow = (type) => {
    if (type === "super") {
        // 特別為 super 類型保留專屬的金色光暈，但結構遵守 MUI 規範
        return "0px 3px 5px -1px rgba(255, 215, 0, 0.2), 0px 6px 10px 0px rgba(255, 215, 0, 0.14), 0px 1px 18px 0px rgba(255, 215, 0, 0.12)";
    }
    // 標準 MUI Snackbar Elevation 6
    return "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)";
};

/**
 * =========================================================================
 * [AppMessageQueueView] 訊息佇列的 React 視圖元件
 * =========================================================================
 * 
 * 元件特性:
 * 1. 使用 MobX @observer 監聽 `storeOfAppMessageQueue.messages`。
 * 2. `pointerEvents: "none"` 加在外層，確保沒有訊息時，這塊隱形區域不會阻擋到底下 UI 的點擊操作。
 *    並在子元件 (message item) 單獨開啟 `pointerEvents: "auto"` 以恢復點擊。
 * 3. 樣式參數已高度對齊 Material-UI (MUI) 的標準 (包含字體、間距、圓角與動畫)。
 */
const AppMessageQueueView = observer(({ componentX }) => {
    const { messages, removeMessage } = storeOfAppMessageQueue;

    // 與 BaseComponent 的防禦邏輯一致：若不在允許的渲染範圍，則不顯示
    if (!componentX.isNotNavigatorNComponentNCprtView()) return null;
    if (messages.length === 0) return null;

    return (
        <div style={{
            position: "fixed",
            top: "80px", // 避免被專案上方的 Header 遮擋
            left: "20px",
            zIndex: 9999, // 確保訊息顯示在最上層
            display: "flex",
            flexDirection: "column", // 確保訊息以直列式排版
            gap: "10px", // MUI 風格緊湊間距
            maxWidth: "320px",
            pointerEvents: "none" // [極重要] 讓外層容器不阻擋底下元件的點擊
        }}>
            {messages.map(msg => (
                <div
                    key={msg.id}
                    onClick={() => {
                        // 如果訊息帶有自訂的 onClick (例如導航)，則觸發之
                        if (msg.onClick) msg.onClick();
                        // 點擊後不論是否有 onClick 行為，一律手動提早移除訊息
                        removeMessage(msg.id); 
                    }}
                    style={{
                        background: getBackgroundGradient(msg.type),
                        color: "#5A4231", // 全面採用高質感的深暖咖啡色字體
                        
                        /* MUI Layout & Spacing */
                        padding: "10px 16px", // MUI Alert 標準 Padding
                        borderRadius: "4px", // MUI 標準導角
                        border: `1px solid ${getBorderColor(msg.type)}`,
                        boxShadow: getMuiBoxShadow(msg.type),
                        
                        /* Interaction */
                        cursor: msg.onClick ? "pointer" : "default",
                        pointerEvents: "auto", // 恢復單一訊息的點擊功能
                        
                        /* Animation (MUI 標準進入曲線) */
                        transition: "all 225ms cubic-bezier(0.4, 0, 0.2, 1)", 
                        
                        /* Glassmorphism Effect */
                        backdropFilter: "blur(8px)", 
                        WebkitBackdropFilter: "blur(8px)", 
                        
                        /* MUI Typography */
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: msg.type === "super" ? "500" : "400", // 500=Medium, 400=Normal
                        letterSpacing: "0.01071em",
                        lineHeight: "1.43",
                        fontSize: "0.875rem", // 14px
                        
                        display: "flex",
                        alignItems: "center", // 文字垂直置中
                        wordBreak: "break-word"
                    }}
                >
                    {msg.content}
                </div>
            ))}
        </div>
    );
});

export default AppMessageQueueView;
