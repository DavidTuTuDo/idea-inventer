const edit = true;

import { computed, action, observable, isObservableObject, toJS, runInAction } from "mobx"; // [新增] 引入 runInAction
import { utiller as Util, exceptioner as ERROR } from "utiller";

import ClientRemoteApi from "./ClientRemoteApi";
import dayjs from "dayjs";

class BaseStore extends ClientRemoteApi {
    idOfUniqueView = Util.getUuidOfV4();

    component;

    /** 用來放initial completed 之後的任務! 例如disposable page 每次都會fetch，然後又要把bean inject value的行為機制，就要放在這裡*/
    taskOfCompleted = [];

    refreshLocally() {}

    pushTaskOfCompleted(task = async () => true) {
        this.taskOfCompleted.push(task);
    }

    pushTasksOfCompleted(...task) {
        this.taskOfCompleted.push(...task);
    }

    /** 因為range pick view的設計有增添兩個column start-end，在inject到store之前把 view需要用到的value還原成[dayjs,dayjs]*/
    decorate(result) {
        return result;
    }

    @observable
    initialFetchCompleted = false;

    @observable
    state = "stable";

    @observable
    errorMsg = "未知的錯誤";

    @observable
    messageOfListIsEmpty = "目前遠端沒有資料";

    parentNode;

    docRef;
    /** 用來記錄firebase的doc,可以找到next page的關鍵 */

    @observable
    appBarHeight = 0;

    @observable
    updateTime;

    hasNextPageBehavior = true;

    // ==========================================
    // [新增] Loading Timeout 相關設定
    // ==========================================

    /** 預設 60 秒超時 */
    @observable
    loadingTimeoutSeconds = 60;

    /** 是否啟用超時自動重置機制 */
    @observable
    enableLoadingTimeout = true;

    /** 計時器 ID，不需要 observable */
    _loadingTimer = null;

    constructor(props) {
        super(props);
    }

    getIdOfStore() {
        return this.idOfUniqueView;
    }

    setComponent(component) {
        this.component = component;
    }

    /** 如果dialog | componentView 要拿到自己的component, 而不是外層的component, selfOnly要設定為true
     * 有多個dialog蝶再一起的時候，最上層要的要dismiss()就肯定要getComponent(true);
     * 或是component 裡面用到 ref產出的 => component inside component <yueh-pu|chordinventer>
     * */
    getComponent = (selfOnly = false) => {
        if (selfOnly) return this.component;

        if (this.component) return this.component.getComponentInstance();
    };

    isWrapByAlertDialog = () => {
        return !Util.isUndefinedNullEmpty(this.props.dialog);
    };

    @action
    setMessageOfListIsEmpty(text) {
        this.messageOfListIsEmpty = text;
    }

    getMessageOfListIsEmpty() {
        return this.messageOfListIsEmpty;
    }

    asJS(param) {
        return isObservableObject(param) ? toJS(param) : param;
    }

    isFetchAbleToGo() {
        const isLoadingOrError = Util.isOrEquals(this.getState(), "error", "loading");
        return !this.isInitialFetchCompleted() && !isLoadingOrError;
    }

    isErrorState() {
        return Util.isEqual(this.state, "error");
    }

    @action
    setAppBarHeight(height) {
        this.appBarHeight = height;
    }

    getAppBarHeight() {
        return this.appBarHeight;
    }

    hasAppBar() {
        return this.appBarHeight > 0;
    }

    getIdOfUniqueView() {
        return this.idOfUniqueView;
    }

    getSnackVisibility() {
        return this.snackVisibility;
    }

    @action
    setSnackVisibility(visible) {
        this.snackVisibility = visible;
    }

    setParentNode(param) {
        this.parentNode = param;
    }

    setDocRef(doc) {
        this.docRef = doc;
    }

    getDocRef() {
        return this.docRef;
    }

    getParentNode() {
        return this.parentNode;
    }

    /** 拿到對應component的store,這樣才能呼叫getComponent() */
    getStoreOfComponent() {
        let node = this;
        while (node.getParentNode() !== undefined) {
            node = node.getParentNode();
        }
        return node;
    }

    hasParent() {
        return !!this.parentNode;
    }

    // ==========================================
    // [修改] setState 邏輯
    // ==========================================
    @action
    setState(state) {
        if (Util.isOrEquals(state, "loading", "stable", "error")) {
            Util.appendInfo(`${this.getComponent(true)?.getComponentName() ?? "[not ready]"} state changed => '${this.state}' -> '${state}'`);

            this.state = state;

            // 1. 無論切換成什麼狀態，先清除舊的計時器
            this._clearLoadingTimer();

            // 2. 如果切換成 loading 且機制開啟，啟動計時器
            if (state === "loading" && this.enableLoadingTimeout) {
                this._startLoadingTimer();
            }
        } else {
            Util.appendError(`5028 '${this.getClassName()}', state is ${state}`);
        }
    }

    /** 內部私有：清除計時器 */
    _clearLoadingTimer() {
        if (this._loadingTimer) {
            clearTimeout(this._loadingTimer);
            this._loadingTimer = null;
        }
    }

    /** 內部私有：啟動計時器 */
    _startLoadingTimer() {
        const self = this;
        const duration = this.loadingTimeoutSeconds * 1000;

        this._loadingTimer = setTimeout(() => {
            // 使用 runInAction 確保在非 action 堆疊中修改 observable
            runInAction(() => {
                // 再次確認狀態是否仍為 loading (避免 race condition)
                if (this.state === "loading") {
                    Util.appendInfo(`[Timeout] ${this.getClassName()} loading 超過 ${this.loadingTimeoutSeconds} 秒，強制重置為 stable`);
                    self.setState("stable");
                    // 也可以考慮在這裡觸發一個錯誤訊息
                    // this.errorMsg = "請求逾時，請稍後再試";
                }
            });
        }, duration);
    }

    /**
     * [新增需求 3] 動態修改超時秒數
     * @param {number} seconds
     */
    @action
    setLoadingTimeoutDuration(seconds) {
        this.loadingTimeoutSeconds = seconds;
    }

    /**
     * [新增需求 4] 停用/啟用超時機制
     * @param {boolean} enabled
     */
    @action
    setLoadingTimeoutEnabled(enabled) {
        this.enableLoadingTimeout = enabled;
        // 如果當下正在 loading 且被關閉，應該清除計時器
        if (!enabled) {
            this._clearLoadingTimer();
        }
    }

    getState() {
        return this.state;
    }

    @computed
    get allowed() {
        return this.state === "stable" || this.state === "loading";
    }

    isAppLoading() {
        return this.getComponent()?.isAppStillLoading();
    }

    @action
    setErrorMsg(message) {
        Util.appendError(`${this.getComponent().getComponentName()} setErrorMsg被呼叫 => ${message}，這會導致fetch()失效`);
        this.state = `error`;
        this.errorMsg = message;
        this._clearLoadingTimer();
    }

    getErrorMsg() {
        return this.errorMsg;
    }

    getClassName() {
        return "unknown store";
    }

    fromJson(obj) {
        this.decorate(obj);
        this.initial(obj);
        return obj;
    }

    initial(props) {
        if (props && props.parentNode) this.setParentNode(props.parentNode);

        if (props && props._doc) this.setDocRef(props._doc);

        if (props && props.updateTime) this.setUpdateTime(props.updateTime);

        this.onInitialCompleted(props).catch((error) => console.log(`88932 ${this.getClassName()} `, error.message));
    }

    /** 當initial()執行完之後，後續要做的項目 */
    async onInitialCompleted(props) {}

    @action
    setUpdateTime(time) {
        this.updateTime = time;
    }

    /**
     * 將各種日期格式標準化為毫秒時間戳 (Number)。
     * * @param {any} obj - 欲轉換的對象 (Firebase Timestamp, Day.js, Date, 或數字)
     * @param {boolean} [force=false] - 是否強制轉換為數字
     * @returns {number|any} 毫秒時間戳或原始對象
     */
    normalizeTimestamp(obj, force = false) {
        // 1. 優先處理 Firebase Timestamp 對象
        if (obj instanceof this.FirebaseTimestampClass()) {
            return obj.toMillis();
        }

        if (force) {
            if (dayjs.isDayjs(obj)) {
                return obj.valueOf();
            }

            // 3. 處理原生 Date 對象
            if (obj instanceof Date) {
                return obj.getTime();
            }

            // 4. 其他情況嘗試轉為數字 (處理數字字串等)
            return Util.toNumber(obj);
        }

        return obj;
    }

    getUpdateTime() {
        return this.normalizeTimestamp(this.updateTime);
    }

    filter(obj) {
        return obj;
    }

    /**
     * 當viewDidMount時 可使用三個時態的切入介面
     * onInitialFetchBeginning()
     * fetch()
     * onInitialFetchCompleted()
     * */
    async onInitialFetchBeginning() {
        /** 執行在fetch開始之前的動作 */
    }

    App = () => {
        return require("../").Application;
    };

    async onInitialFetchCompleted(collection) {
        if (this.isInitialFetchCompleted()) return await Util.syncDelay(1);

        this.setInitialFetchCompleted(true);
        if (this.getComponent() !== undefined) {
            await this.getComponent().invalidateNextPageBehavior();
        }

        while (!Util.isEmpty(this.taskOfCompleted)) {
            const task = this.taskOfCompleted.shift();
            await task(this); /** this就是store本人*/
        }
    }

    @action
    setInitialFetchCompleted(finished) {
        this.initialFetchCompleted = finished;
    }

    isInitialFetchCompleted() {
        return this.initialFetchCompleted;
    }

    getDefaultImageDialogParam() {
        return {
            pager: false,
            href: "url"
        };
    }

    clean() {
        this.initialFetchCompleted = false;
        this.hasNextPageBehavior = true;
        this.setState("stable");
    }

    conditions = [];

    getFetchConditions() {
        return this.conditions;
    }

    pushFetchConditions(...conditions) {
        this.conditions.push(...conditions);
    }

    clearFetchConditions() {
        this.conditions.length = 0;
    }

    getStartAfterConditions(lastItem) {
        return Util.isUndefinedNullEmpty(lastItem) ? [] : [{ type: "startAfter", params: [lastItem instanceof BaseStore ? lastItem.getDocRef() : lastItem._doc] }];
    }

    getInArrayConditions = (targets) => {
        if (Array.isArray(targets)) {
            return [{ type: "where", params: [this.getFieldNameOfDocumentId(), "in", targets.length > 0 ? targets : [Util.getRandomHash(30)]] }];
        } else {
            throw new ERROR(7008, `${typeof targets}, "${targets}" is not allow`);
        }
    };

    hasNextPage = () => {
        return this.hasNextPageBehavior;
    };

    setHasNextPageBehavior(has) {
        return (this.hasNextPageBehavior = has);
    }

    /** 當fetch回來的item 要再經過一次sort的機制*/
    ruleOfPreviouslySort(items) {
        return items;
    }

    /** 目前是設計為資料獲取後, 可以有一個hook做一些邏輯 */
    invalidate() {}

    getColumnData(object) {
        if (object instanceof BaseStore) return object.columnData();
        else return object;
    }

    /** 每個子類Class要各自實作 */
    columnData() {
        return {};
    }

    onComponentUnmount() {
        // [新增] 確保元件銷毀時，計時器也被清除
        this._clearLoadingTimer();
    }
}

export default BaseStore;
