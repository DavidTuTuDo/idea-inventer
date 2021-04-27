import firebase from 'firebase/app';
import 'firebase/database';
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

class BaseStore {

    firebaseApp;
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
        this.mountFirebase();
    }

    getErrorMsg() {
        return this.errorMsg;
    }

    mountFirebase() {
        if (!firebase.apps.length) {
            this.firebaseApp = firebase.initializeApp(config.firebase);
        } else {
            this.firebaseApp = firebase.app(); // if already initialized, use that one
        }
        this.database = this.firebaseApp.database();
    }

    async fetchValue(refPath) {
        console.log(`fetch ${refPath}`);
        return await this.database.ref(refPath).once('value');
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

}

export default BaseStore
