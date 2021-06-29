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
    state = 'loading';

    @observable
    errorMsg = 'unknown error';

    parentNode;

    setParentNode(param) {
        this.parentNode = param;
    }

    getParentNode() {
        return this.parentNode;
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

}

export default BaseStore
