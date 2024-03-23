import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import {utiller as Util, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import ClientRemoteApi from './ClientRemoteApi';

class BaseStore extends ClientRemoteApi {

    idOfUniqueView = Util.getUuidOfV4();

    component;

    refreshLocally() {

    }

    @observable
    globalDialogContent = {
        task: async () => {
            await Util.syncDelay(10)
        }, title: '標題', content: '內容'
    }

    @observable
    initialFetchCompleted = false;

    @observable
    state = 'stable';

    @observable
    errorMsg = 'unknown error';

    @observable
    messageOfListIsEmpty = 'unknown error';

    @observable
    globalLoadingState = false;

    @observable
    globalLoadingTip = '正在載入中';

    parentNode;

    docRef;
    /** 用來記錄firebase的doc,可以找到next page的關鍵 */

    @observable
    selectorParams = this.getDefaultSelectorParam();

    @observable
    imageDialogParams = this.getDefaultImageDialogParam()

    @observable
    appBarHeight = 0;

    @observable
    updateTime;

    @observable
    snackVisibility = false;

    hasNextPageItems = true;

    constructor(props) {
        super(props);
    }

    getIdOfStore() {
        return this.idOfUniqueView;
    }

    setComponent(component) {
        this.component = component;
    }

    /** 如果dialog | componentView 要拿到自己的component, 而不是外層的component, selfOnly要設定為true */
    getComponent = (selfOnly = false)=> {
        if (selfOnly)
            return this.component;

        if (this.component)
            return this.component.getComponentInstance();
    }

    isWrapByAlertDialog = () => {
        return  !_.isUndefinedNullEmpty(this.props.dialog);
    }

    @action
    setMessageOfListIsEmpty(text) {
        this.messageOfListIsEmpty = text;
    }

    getMessageOfListIsEmpty() {
        return this.messageOfListIsEmpty;
    }

    @action
    setGlobalDialogContent(
        dialogContent = {
            title: '標題', content: '內容', task: async () => await Util.syncDelay(10)
        }
    ) {
        this.globalDialogContent = dialogContent;
    }

    isFetchAbleToGo() {
        const isLoadingOrError = Util.isOrEquals(this.getState(), 'error', 'loading');
        return !this.isInitialFetchCompleted() && !isLoadingOrError
    }

    isErrorState() {
        return _.isEqual(this.state, 'error');
    }

    getGlobalDialogContent() {
        return this.globalDialogContent;
    }

    @action
    setAppBarHeight(height) {
        this.appBarHeight = height;
    }

    getAppBarHeight() {
        return this.appBarHeight;
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

    hasParent() {
        return !!this.parentNode;
    }

    @action
    setState(state) {
        if (Util.isOrEquals(state, 'loading', 'stable', 'error')) {
            this.state = state;
        } else {
            Util.appendError(`5028 '${this.getClassName()}', state is ${state}`);
        }
    }

    getState() {
        return this.state;
    }

    isGlobalLoading() {
        return _.isEqual(this.state, 'loading');
    }

    getGlobalLoadingState() {
        return this.globalLoadingState;
    }

    @action
    setErrorMsg(message) {
        this.state = `error`;
        this.errorMsg = message;
    }

    getErrorMsg() {
        return this.errorMsg;
    }

    getClassName() {
        return 'unknown store';
    }

    fromJson(obj) {
        this.initial(obj)
    }

    initial(props) {
        if (props && props.parentNode)
            this.setParentNode(props.parentNode);

        if (props && props._doc)
            this.setDocRef(props._doc);

        if (props && props.updateTime)
            this.setUpdateTime(props.updateTime);
    }

    @action
    setUpdateTime(time) {
        this.updateTime = time;
    }

    normalizeTimestamp(obj) {
        if (obj instanceof this.FirebaseTimestampClass())
            return obj.toMillis();
        else
            return obj;
    }

    getUpdateTime() {
        return this.normalizeTimestamp(this.updateTime);
    }

    filter(obj) {
        return obj;
    }

    @action
    setGlobalLoading(loading, string) {
        this.globalLoadingState = loading;
        this.globalLoadingTip = string;
    }

    getGlobalLoadingTip() {
        return this.globalLoadingTip;
    }

    getSelectorParam() {
        return this.selectorParams;
    }

    async onInitialFetchCompleted(collection) {
        if (this.isInitialFetchCompleted())
            return await Util.syncDelay(1);

        this.setInitialFetchCompleted(true);
        if (this.getComponent() !== undefined) {
            await this.getComponent().invalidateNextPageBehavior();
        }
    }

    @action
    setInitialFetchCompleted(finished) {
        this.initialFetchCompleted = finished;
    }

    isInitialFetchCompleted() {
        return this.initialFetchCompleted;
    }

    getImageDialogParam() {
        return this.imageDialogParams
    }

    getDefaultSelectorParam() {
        return {
            type: 'file',
            accept: 'file',
            multiple: false,
        }
    }

    getDefaultImageDialogParam() {
        return {
            pager: false,
            href: 'url',
        }
    }

    @action
    setSelectorParam(params) {
        const mixer = Util.mergeObject(this.getDefaultSelectorParam(), params)
        this.selectorParams = mixer;
    }

    @action
    setImageDialogParam(params) {
        const mixer = Util.mergeObject(this.getDefaultImageDialogParam(), params)
        this.imageDialogParams = mixer
    }

    clean() {
        this.initialFetchCompleted = false;
        this.hasNextPageItems = true;
        this.setState('stable');
    }

    conditions = []

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
        return Util.isUndefinedNullEmpty(lastItem) ? [] : [{
            startAfter: (stmt) =>
                stmt.startAfter(lastItem instanceof BaseStore ? lastItem.getDocRef() : lastItem._doc)
        }]
    }

    getInArrayConditions = (targets) => {
        if (_.isArray(targets)) {
            return [{
                where: (stmt) =>
                    stmt.where(this.getFieldNameOfDocumentId(), "in", targets.length > 0 ? targets : [Util.getRandomHash(30)]),
            }]
        } else {
            throw new ERROR(7008, `${typeof targets}, "${targets}" is not allow`)
        }

    }

    hasNextPage = () => {
        return this.hasNextPageItems;
    }

    setHasPageItems(has) {
        return this.hasNextPageItems = has;
    }

    /** 當fetch回來的item 要再經過一次sort的機制*/
    ruleOfPreviouslySort(items) {
        return items;
    }

    /** 目前是設計為資料獲取後, 可以有一個hook做一些邏輯 */
    invalidate() {
    }

    getColumnData(object) {
        if (object instanceof BaseStore)
            return object.columnData()
        else
            return object;
    }

    /** 每個子類Class要各自實作 */
    columnData() {
        return {}
    }

}

export default BaseStore
