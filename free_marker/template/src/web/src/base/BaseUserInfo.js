import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
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
import AccountUser from "../store/accountUser";
import AccountCredential from "../store/accountCredential";
import {Application} from "../";
import CommonPoolHelper from "./CommonPoolHelper";

class UserInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/


    @observable
    isLoginSucceed = false;

    @observable
    isAdminUser = false;

    @observable
    isPurchaseUser = false;

    @observable
    isAuthProcessingState = true;

    constructor(props) {
        makeObservable(this);
        this.subscribeAuthStateChanged();
        this.signInWithCredential().then();
        this.apiOfUser = new AccountUser();
        this.crendential = new AccountCredential()
    }


    subscribeAuthStateChanged() {
        EventBus.self().on("authStateChanged", this.onAuthStateChangedReceive);
    }

    isValidUser(user) {
        return user && !_.isEmpty(user.uid);
    }

    onAuthStateChangedReceive = (user) => {
        Util.appendInfo('4565231213 收到authStateChanged 通知，我改變了')
        this.specificBehaviorOfLoginStateChange(user).then()
    }

    /** 拿cookie的token去換到登入資訊然後呼叫emitAuthStateChanged之後的行為 */
    async specificBehaviorOfLoginStateChange(user) {
        if (this.isValidUser(user)) {
            const credential = Cookie.getCredential();
            /** view 不能放 Application.getLatestComponent(),會讓當前的component發生錯誤 */
            if (await this.apiOfUser.fetchUserIsExist(user.uid)) {
                await this.apiOfUser.updateUserItem(Application.getLatestComponent(), {
                    ...user,
                    updateTime: -1
                }, user.uid);
            } else {
                await this.apiOfUser.submitUserItem(Application.getLatestComponent(), {
                    ...user,
                    id: user.uid
                }, user.uid);
            }
            await this.crendential.submitCredential(Application.getLatestComponent(), credential, user.uid);
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
        this.setAuthProcessing(false);
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

    performLoginBehavior = async (view) => {
        const self = this;
        if (this.isAuthProcessing()) {
            view.showWarningSnackMessage(`認證流程處理中，請稍後再試`);
            return;
        }

        const func = async () => {
            await this.executeAsyncTask(async () => {
                Util.appendInfo('454841, login by google account');
                await firebaser.signInWithGoogle(async (authResult) => {
                    /** 只有在登入傳回直裡面有credential */
                    if (authResult != undefined) {
                        const credential = authResult.credential;
                        Util.appendInfo('4548412, retrieve credential:', credential);
                        Cookie.setCredential(credential);
                        /** 拿到authResult,會觸發 firebase 的 listner ==> this.auth().onAuthStateChanged((user) */
                    } else {
                        Util.appendInfo(`4548414, didn't retrieve credential`);
                        self.setAuthProcessing(false);
                    }
                }, view)
            })
        };
        await this.authProcessBehavior(func);
    }

    async executeAsyncTask(task, view) {
        if (view instanceof BaseComponent)
            await view.executeAsyncTaskWithLoading(task)
        else
            await task();
    }

    async authProcessBehavior(functionOfAsyncTask) {
        this.setAuthProcessing(true);
        await functionOfAsyncTask();
    }

    async logout(view) {
        const func = async () => {
            await this.executeAsyncTask(async () => {
                Util.appendInfo('45d4741, logout executed');
                await firebaser.logout();
                Application.getAccountStore().clean()
            }, view);
        }
        await this.authProcessBehavior(func);
    }

    @action
    setAuthProcessing(ing) {
        Util.appendInfo(`認證流程狀況 ==> `, ing);
        this.isAuthProcessingState = ing;
    }

    isAuthProcessing() {
        return this.isAuthProcessingState;
    }

    signInWithCredential = async () => {
        Util.appendInfo(`45431646 進入認證流程`);
        const self = this;
        if (Cookie.hasCredential() && !this.isLoginWithSucceed()) {
            Util.appendInfo(`45431696 有cookie，和google hand shake取得latest token`);
            const func = async () => {
                try {
                    const result = await firebaser.signInWithExistedCredential(Cookie.getCredential());
                    Cookie.setCredential(result.credential);
                } catch (error) {
                    Util.appendError(error);
                    Cookie.removeCredential();
                }
            }
            await this.authProcessBehavior(func);
        } else {
            Util.appendInfo(`45431616 沒有cookie，和google hand shake取得latest token`);
        }
        CommonPoolHelper.enableParallelMode();
    }

}

export default new UserInfo();
