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
import _ from 'lodash'
import config from '../config';
import firebaser from './BaseFirebase';

class BaseStore {

    database;

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
        console.log(`'${this.getName()}', state is '${state}'`);
        if (Util.isOrEquals(state, 'loading', 'stable', 'error')) {
            this.state = state;
        } else {
            throw new ERROR(7001, `'${this.getName()}', state is ${state}`);
        }
    }

    @action
    setErrorMsg(message) {
        this.errorMsg = message;
    }


    constructor(props) {
        this.database = firebaser.db();
    }

    getErrorMsg() {
        return this.errorMsg;
    }

    getName(){
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

    async fetchObject(refPath, filtering = (ref) => ref.once('value')) {
        console.log(`fetch ${refPath}`);
        return await filtering(this.database.ref(refPath))
    }

    async postObject(refPath, obj = {}) {
        console.log(`write ${refPath}, param ${JSON.stringify(obj)}`);
        return await this.database.ref(refPath).set(obj);
    }


}

export default BaseStore
