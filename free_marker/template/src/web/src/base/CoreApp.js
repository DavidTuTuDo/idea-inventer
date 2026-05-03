const edit = true;

import "../less";
import { createRoot } from "react-dom/client";
import I18n from "../i18n";
import LiffHelper from "./LiffHelper";
import FirebaseHelper from "./FirebaseHelper";
import Store from "../store";
import { utiller as Util } from "utiller";

/** Application的概念，如果有客製化的邏輯就寫在這裡，會用到source.js裡面的資源就必續進到 freemarker裡面執行。 */
class CoreApp {
    observedCache = new WeakMap();

    latestComponent = undefined;

    extraPages = [];

    store = new Store();

    // 1. 可佇列化：儲存任務的佇列
    taskQueue = [];

    // 2. Event-driven 機制：使用 EventTarget 實作事件驅動
    taskEventTarget = new EventTarget();

    // 標記是否正在處理任務，避免併發執行
    isProcessingTasks = false;

    constructor() {
        // 註冊自訂事件監聽：當有任務加入時，觸發 task_added 事件來處理佇列
        this.taskEventTarget.addEventListener("task_added", this.processTaskQueue);
    }

    getExtraPages() {
        /** --- push <Route /> in to pages */
        return this.extraPages;
    }

    pushPage(page) {
        this.extraPages.push(page);
    }

    safeObserver = (component) => {
        // 若已經被包裝過（不管是 class 還是已包裝結果），直接回傳記憶的版本
        if (this.observedCache.has(component)) return this.observedCache.get(component);
        try {
            // 嘗試包裝
            const Observed = observer(component);
            // 成功包裝後，記憶「原始 component」與「包裝後的 component」
            this.observedCache.set(component, Observed);
            this.observedCache.set(Observed, Observed); // 避免未來傳進來的是已包裝的也會識別
            return Observed;
        } catch (err) {
            // 嘗試 fallback：如果是已經包裝過的元件，直接回傳它自己
            this.observedCache.set(component, component);
            return component;
        }
    };

    /**
     * 3. 註解和範例
     * 將任務推入佇列，並透過 event-driven 機制觸發處理。
     * 適用情境：Dialog 關閉後，當前畫面必須顯示一個 snackbar，或者需要依序執行多個 UI 更新動作。
     *
     * 範例：
     * App.enqueueTask((component) => {
     *     component.props.enqueueSnackbar("操作成功！", { variant: "success" });
     * });
     *
     * @param {Function} task - 接收最新 component 作為參數的任務函數
     */
    enqueueTask = (task) => {
        this.taskQueue.push(task);
        // 發送事件，通知系統有新任務加入，觸發處理流程
        this.taskEventTarget.dispatchEvent(new Event("task_added"));
    };

    /**
     * 處理任務佇列
     */
    processTaskQueue = async () => {
        // 若正在處理中，則直接返回，避免併發執行
        if (this.isProcessingTasks) return;
        this.isProcessingTasks = true;

        // 給予一點緩衝時間，確保 Dialog 等 UI 元件已經確實關閉或完成狀態更新
        await Util.syncDelay(100);

        const component = this.getLatestComponent();

        if (component) {
            // 將佇列中所有任務依序取出並執行
            while (this.taskQueue.length > 0) {
                const task = this.taskQueue.shift();
                try {
                    await task(component);
                } catch (error) {
                    console.error("執行 enqueueTask 任務時發生錯誤：", error);
                }
            }
        } else {
            console.warn("找不到 latestComponent，目前任務無法執行。");
        }

        this.isProcessingTasks = false;

        // 如果在非同步執行過程中，又有新任務被加入佇列，再次派發事件以確保所有任務都能被處理
        if (this.taskQueue.length > 0) {
            this.taskEventTarget.dispatchEvent(new Event("task_added"));
        }
    };

    mount() {
        const container = document.getElementById("app");
        const root = createRoot(container); // createRoot(container!) if you use TypeScript
        root.render(this.getRenderView());
        FirebaseHelper.startAuthListener();
        LiffHelper.activate().then();
        I18n.startApplicationReactions();
    }

    setLatestComponent(component) {
        if (component?.isNotNavigatorNComponentNCprtView?.() && !component?.isDialogComponent?.()) this.latestComponent = component.getComponentInstance();
    }

    getLatestComponent() {
        return this.latestComponent;
    }
}

export default CoreApp;
