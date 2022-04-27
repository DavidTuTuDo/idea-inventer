import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import application from '../';
import firebaser from './CommonFirebaseHelper'
import Cookie from '../cookie';
import Configer from '../config';
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
import BaseComponent from "./BaseComponent";
import EventBus from "./CommonEventBus";
import AccountUserInfo from "../store/accountUserInfo";
import AccountCredential from "../store/accountCredential";
import {Application} from "../";

class UserInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    @observable
    isLoginSucceed = false;

    @observable
    isAdminUser = false;

    @observable
    isPurchaseUser = false;

    constructor(props) {
        makeObservable(this);
        this.subscribeAuthStateChanged();
        this.user = new AccountUserInfo();
        this.crendential = new AccountCredential()
    }


    subscribeAuthStateChanged() {
        EventBus.self().on("authStateChanged", this.onAuthStateChangedReceive);
    }

    isValidUser(user) {
        return user && !_.isEmpty(user.uid);
    }

    onAuthStateChangedReceive =(user) => {
        this.specificBehaviorOfLoginStateChange(user).then()
    }

    async specificBehaviorOfLoginStateChange(user) {
        if (this.isValidUser(user)) {
            const credential = Cookie.getCredential();
            await this.user.submitUserInfo(undefined, undefined, user);
            await this.crendential.submitCredential(undefined, undefined, credential);
            /** 應該在login 以及 signInByCredential 就會把 credential 存到 cache */
            Cookie.setUser(user);
            Util.appendInfo('登入成功, 所以寫入資料')
            Util.appendInfo('user info:', user);
            Util.appendInfo('user credential:', credential);
        } else {
            Cookie.removeCredential()
            Cookie.removeUser();
        }
        this.invalidateLoginState();
        Util.appendInfo(`Navigator收到登入狀態改變的事件,login狀態:${this.isLoginWithSucceed()} `);
    }

    /** -------------------- async api -------------------- **/

    getCurrentUser(allowCache = true) {
        /**
         const displayName = user.displayName;
         const email = user.email;
         const photoURL = user.photoURL;
         const emailVerified = user.emailVerified;
         const uid = user.uid;
         */

        let user = firebaser.getCurrentUser();
        if (Util.exist(user)) return user;

        if (allowCache) {
            user = Cookie.getUser();
            if (Util.exist(user)) return user;
        }
        return {};
    }

    @action
    invalidateLoginState() {
        this.isLoginSucceed = !_.isNull(firebaser.getCurrentUser());
        this.isAdminUser = this.isLoginWithSucceed() && _.isEqual(this.getUid(true), Configer.superUserUid);
    }

    isLoginWithSucceed() {
        return this.isLoginSucceed;
    }

    isAdmin() {
        return this.isAdminUser;
    }

    getUid(allowCache = true) {
        let uid = firebaser.getUid();
        if (!_.isEmpty(uid)) return uid;
        if (allowCache) {
            const user = Cookie.getUser();
            if (Util.exist(user))
                uid = user.uid;
            if (!_.isEmpty(uid)) return uid;
        }
        return 'empty';
    }

    async performLoginBehavior(view) {
        await this.executeAsyncTask(async () => {
            Util.appendInfo('454841, login by google account');

            await firebaser.signInWithGoogle(async (authResult) => {
                /** 只有在登入傳回直裡面有credential */
                const credential = authResult.credential;
                Util.appendInfo('4548412, retrieve credential:', credential);
                Cookie.setCredential(credential);
            }, view)
        });
    }

    async executeAsyncTask(task, view) {
        if (view instanceof BaseComponent)
            await view.executeAsyncTaskWithLoading(task)
        else
            await task();
    }

    async logout(view) {
        await this.executeAsyncTask(async () => {
            Util.appendInfo('45d4741, logout executed');
            await firebaser.logout();
        }, view);

    }
}

export default new UserInfo();
