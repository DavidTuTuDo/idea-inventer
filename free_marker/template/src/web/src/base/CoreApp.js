const edit = true;

import "../less";
import { createRoot } from "react-dom/client";
import I18n from "../i18n";
import LiffHelper from "./LiffHelper";
import FirebaseHelper from "./FirebaseHelper";
import Store from "../store";

/** Application的概念，如果有客製化的邏輯就寫在這裡，會用到source.js裡面的資源就必續進到 freemarker裡面執行。 */
class CoreApp {

    observedCache = new WeakMap();

    latestComponent = undefined;

    extraPages = [];

    store = new Store();

    constructor() {}

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

    pushTask = (task) => {
        Util.syncDelay(100).then(() => {
            const component = this.getLatestComponent();
            if(component) task(component);
        })
    }

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

