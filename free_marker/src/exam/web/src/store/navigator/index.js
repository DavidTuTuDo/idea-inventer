/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-07-01-10-54-37
 */
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseNavigatorStore from "./BaseNavigatorStore";
import Cookie from '../../cookie';
import firebaser from '../../base/CommonFirebaseHelper';
import {makeObservable, observable} from "mobx";
import UserInfo from '../../userInfo';
import {
    action,
} from "mobx";
import {AppBar} from "@material-ui/core";

class NavigatorStore extends BaseNavigatorStore {
    /** -------------------- fields -------------------- **/

    @observable
    drawerOpenStatus = false;

    @action
    setDrawerOpenStatus(status) {
        this.drawerOpenStatus = status;
    }

    getDrawerOpenStatus() {
        return this.drawerOpenStatus;
    }

    setCredential(param) {
        super.setCredential(param);
        /** 當cookie 收到 undefined 就會清空cookie 欄位 */
        Cookie.setCredential(param);
    }

    setUserInfo(param) {
        super.setUserInfo(param);
        Cookie.setUser(param);
    }

    async signInWithCredential() {
        if (Cookie.hasCredential()) {
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
    }

    updateLoginButtonStatus = () => {
        const appBar = this.getAppBar();
        appBar.getToolBar().setLogin(UserInfo.isLoginInSucceed()? '登出':'登入');
        this.setAppBar(appBar);
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
                    this.setCredential(result.credential);
                    this.setUserInfo(result.user);
                }
                Util.appendInfo(`reAuthenticateWithCredential succeed`);
            } catch (error) {
                Util.appendError(error);
                Cookie.removeCredential();
            }
        }
    }

    async logout() {
        await firebaser.logout();
        this.setCredential(undefined);
        this.setUserInfo(undefined);
        this.updateLoginButtonStatus();
    }

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.signInWithCredential().then();
        this.setState('stable');
    }

    /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
