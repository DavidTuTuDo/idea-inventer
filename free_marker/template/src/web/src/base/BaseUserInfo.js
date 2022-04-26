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
    handleLoginState() {
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

    async performLoginBehavior(task, view) {
        await this.executeAsyncTask(async () => {
            await firebaser.signInWithGoogle(task, view);
        }, view);
    }

    async executeAsyncTask(task, view) {
        if (view instanceof BaseComponent)
            await view.executeAsyncTaskWithLoading(task)
        else
            await task();
    }

    async logout(view) {
        await this.executeAsyncTask(async () => {
            Util.appendInfo('logout executed');
            await firebaser.logout();
        }, view);

    }
}

export default new UserInfo();
