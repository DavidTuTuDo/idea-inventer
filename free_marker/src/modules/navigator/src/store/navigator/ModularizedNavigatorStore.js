import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
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
import BaseNavigatorStore from "./BaseNavigatorStore";
import UserInfo from "../../base/BaseUserInfo";
import firebaser from "../../base/CommonFirebaseHelper";
import CommonPoolHelper from "../../base/CommonPoolHelper";

class ModularizedNavigatorStore extends BaseNavigatorStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    @observable
    drawerOpenStatus = false;

    @action
    setDrawerOpenStatus(status) {
        this.drawerOpenStatus = status;
    }

    getDrawerOpenStatus() {
        return this.drawerOpenStatus;
    }

    async signInWithCredential() {
        if (Cookie.hasCredential() && !UserInfo.isLoginInSucceed()) {
            try {
                const result = await firebaser.signInWithExistedCredential(Cookie.getCredential());
                if (result !== undefined) {
                    this.setCredential(result.credential);
                }
            } catch (error) {
                Util.appendError(error);
                Cookie.removeCredential();
            }
        }
        CommonPoolHelper.enableParallelMode();
    }

    @action
    updateEditButtonStatus() {
        const self = this;
        let editButton = UserInfo.isAdmin() ? '編輯模式' : '無功能按鍵';
        self.getAppBar().getToolBar().setToEditMode(editButton);
    }

    @action
    updateLoginButtonStatus(text) {
        const self = this;
        let loginStateString = UserInfo.isLoginInSucceed() ? '登出' : '登入';
        if (text !== undefined)
            loginStateString = text;
        self.getAppBar().getToolBar().setLogin(loginStateString);
    }

    /**
     * @deprecated 根本沒用到
     */
    async reAuthenticateWithCredential() {
        Util.appendInfo(`reAuthenticateWithCredential start`);
        if (Cookie.hasCredential()) {
            await Util.syncDelay(10);
            try {
                const result = await firebaser.reAuthWithCredential(Cookie.getCredential());
                if (result !== undefined) {
                }
                Util.appendInfo(`reAuthenticateWithCredential succeed`);
            } catch (error) {
                Util.appendError(error);
                Cookie.removeCredential();
            }
        }
    }

    async logout() {
        Util.appendInfo('logout executed');
        await firebaser.logout();
        this.setCredential(undefined);
        this.setUserInfo(undefined);
        Cookie.removeCredential()
        Cookie.removeUser();
    }

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.signInWithCredential().then();
        this.setState('stable');
    }

    /** -------------------- async api -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorStore;
