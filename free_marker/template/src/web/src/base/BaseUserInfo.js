const edit = true
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import firebaser from './FirebaseHelper'
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
        this.apiOfUser = new AccountUser();
    }

    subscribeAuthStateChanged() {
        EventBus.self().on("authStateChanged", this.onAuthStateChangedReceive);
    }

    isValidUser(user) {
        return user && !_.isEmpty(user.uid);
    }

    onAuthStateChangedReceive = (user) => {
        Util.appendInfo('4565231213 收到authStateChanged 通知，我改變了 =>', user)
        this.specificBehaviorOfLoginStateChange(user).then()
    }

    /** 拿cookie的token去換到登入資訊然後呼叫emitAuthStateChanged之後的行為 */
    async specificBehaviorOfLoginStateChange(user) {
        if (this.isValidUser(user)) {
            Util.appendInfo(`firebase-auth取得authorized user(${user.uid})，執行enableParallelMode，讓firebase api依據權限拿資料`);
            CommonPoolHelper.enableParallelMode();
            Util.appendInfo(`7381271928 => 會員在firebase-authentication存在裡了`, user);
            const current = await this.apiOfUser.fetchUserItem(Application.getLatestComponent(), user.uid);
            if (!current.exists) await this.apiOfUser.submitUserItem(Application.getLatestComponent(), {...user, id: user.uid}, user.uid);
            else await this.apiOfUser.updateUserItem(Application.getLatestComponent(), user, user.uid);
            Cookie.setUser(user);
            Util.appendInfo('登入成功, 所以寫入資料')
            Util.appendInfo('user info:', user);
        } else {
            Util.appendInfo(`73812711238 => 在firebase-authentication不存在裡了，無差別清理掉髒東西`);
            Cookie.removeUser();
            await firebaser.logout();
        }
        this.invalidateLoginState();
        Util.appendInfo(`Navigator收到登入狀態改變的事件,login狀態:${this.isLoginWithSucceed()} `);
    }

    @action
    invalidateLoginState() {
        Util.appendInfo(`112132132 不論有沒有有登入，都要記得enableParallelMode`)
        CommonPoolHelper.enableParallelMode();
        this.isLoginSucceed = !Util.isUndefinedNullEmpty(firebaser.getCurrentUser());
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
                Util.appendInfo('4548411231, user click login（google account only）');
                try {
                    await firebaser.signInWithGoogle(async (authResult) => {
                        /** 只有在登入傳回直裡面有credential */
                        if (authResult !== undefined) {
                            Util.appendInfo(`7328438281 authResult => `, authResult);
                        } else {
                            Util.appendInfo(`4548414, didn't retrieve credential`);
                            self.setAuthProcessing(false);
                        }
                    }, view)
                } catch (error) {
                    Util.appendError(`${error.message}`);
                    self.setAuthProcessing(false);
                }
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

}

export default new UserInfo();
