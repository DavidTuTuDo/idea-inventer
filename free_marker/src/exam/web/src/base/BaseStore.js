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
import {utiller as Util, ERROR} from "utiller";
import _ from 'lodash';
import config from '../config';
import ClientRemoteApi from './ClientRemoteApi'

class BaseStore extends ClientRemoteApi {

    @observable
    state = 'stable';

    @observable
    errorMsg = 'unknown error';

    @observable
    globalLoadingState = false;

    @observable
    globalLoadingTip = '正在載入中';

    parentNode;

    @observable
    selectorParams = this.getDefaultSelectorParam();

    setParentNode(param) {
        this.parentNode = param;
    }

    getParentNode() {
        return this.parentNode;
    }

    @action
    forceToStable() {
        this.state = 'stable';
    }

    @action
    setState(state) {
        console.log(`'${this.getClassName()}', state is '${state}'`);
        if (Util.isOrEquals(state, 'loading', 'stable', 'error')) {
            this.state = state;
        } else {
            throw new ERROR(7001, `'${this.getClassName()}', state is ${state}`);
        }
    }

    getGlobalLoadingState() {
        return this.globalLoadingState;
    }

    @action
    setErrorMsg(message) {
        this.errorMsg = message;
    }

    constructor(props) {
        super(props);
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

    getDefaultSelectorParam() {
        return {
            type: 'file',
            accept: 'file',
            multiple: 'false',
        }
    }

    @action
    setSelectorParam(params) {
        const mixer = {...this.getDefaultSelectorParam(), ...params}
        this.selectorParams = mixer;
    }

}

export default BaseStore
