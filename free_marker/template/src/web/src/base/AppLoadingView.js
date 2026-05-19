const edit = true;

import React from "react";
import { observable, action, computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import LinearProgress from "@mui/material/LinearProgress";

class AppLoadingStore {
    // 1. 原本的單純開關機制狀態
    @observable
    basicVisible = false;

    // 2. Lasting Visible 的任務追蹤 Map (MobX 會自動將其轉為 ObservableMap)
    @observable
    activeTasks = new Map();

    constructor() {
        makeObservable(this);
    }

    // 5. 綜合判斷：原本的機制被打開，或是佇列裡還有任務時，就會顯示 LinearProgress
    @computed
    get visible() {
        return this.basicVisible || this.activeTasks.size > 0;
    }

    // ==========================================
    //  原本的機制 (簡單直接的狀態覆蓋)
    // ==========================================
    @action
    setVisible(isVisible) {
        this.basicVisible = !!isVisible;
    }

    // 給任務自動分配唯一 ID 的計數器
    taskIdCounter = 0;

    // ==========================================
    //  Lasting Visible 機制 (更優雅的 Closure 寫法)
    // ==========================================
    /**
     * 啟動一個具備超時防呆的 Loading 任務。
     * 呼叫後會回傳一個「專屬的結束函式」，你不需要苦惱如何命名 taskName。
     *
     * 範例：
     * // 1. 開啟 Loading，並取得關閉該任務的鑰匙
     * const finishLoading = storeOfAppLoading.enableLasting({ seconds: 15000 });
     *
     * try {
     *     await doSomething();
     * } finally {
     *     // 2. 結束時直接呼叫這把鑰匙即可！
     *     finishLoading();
     * }
     *
     * @param {object} [options]
     * @param {number} [options.seconds=30000] - 預設 30 秒後自動防呆結束
     * @returns {Function} 呼叫此函式可手動結束該次 Loading
     */
    @action
    enableLasting({ seconds = 30000 } = {}) {
        this.taskIdCounter++;
        const currentTaskId = `TASK_${this.taskIdCounter}`;

        // 任務超時防呆機制
        const timerId = setTimeout(() => {
            this.disableLasting(currentTaskId);
            console.log(`[AppLoading] ⚠️ 內部任務 ${currentTaskId} 已超時 ${seconds / 1000} 秒，觸發自動防呆機制結束。`);
        }, seconds);

        this.activeTasks.set(currentTaskId, timerId);

        // 回傳一個已經綁定好 ID 的 Closure (閉包) 作為關閉鑰匙
        return () => {
            this.disableLasting(currentTaskId);
        };
    }

    @action
    disableLasting = (taskId) => {
        if (this.activeTasks.has(taskId)) {
            clearTimeout(this.activeTasks.get(taskId));
            this.activeTasks.delete(taskId);
        }
    };
}

export const storeOfAppLoading = new AppLoadingStore();

/**
 * 獨立的 Loading View
 * 使用 observer 確保只有這裡會因為 visible 改變而 re-render
 */
const AppLoadingView = observer(({ componentX } = {}) => {
    const { visible } = storeOfAppLoading;
    /** 提升到 CoreApp 後不再需要 componentX 判斷，此 View 永遠在 Route 外層 */
    if (componentX && typeof componentX.isNotNavigatorNComponentNCprtView === "function") {
        if (!componentX.isNotNavigatorNComponentNCprtView()) return null;
    }
    if (!visible) return null;

    return (
        <div className="BaseLoadingViewDiv">
            <LinearProgress className="BaseLoadingLinearProgress" />
        </div>
    );
});

export default AppLoadingView;
