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

    @action
    setState(state) {
        console.log(state);
        if (Util.isOrEquals(state, 'loading', 'stable', 'error')) {
            this.state = state;
        } else {
            throw new ERROR(7001, `state is ${state}`);
        }
    }

    @action
    setErrorMsg(message) {
        this.errorMsg = message;
    }

    constructor(prop) {
        this.mountFirebase();
    }

    getErrorMsg(){
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

    fromJson(obj){
        this.initial(obj)
    }

    initial(obj){
        throw new ERROR(7002);
    }

    filter(obj){
        return obj;
    }

}

export default BaseStore
