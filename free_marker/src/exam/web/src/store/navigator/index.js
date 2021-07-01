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
import {Application} from '../../index'
import {makeObservable, observable} from "mobx";
import {
    action,
} from "mobx";

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

    isLoginInSucceed() {
        return (this.getCredential().exist())
    }

    getLogin() {
        if (!this.isLoginInSucceed())
            return super.getLogin();
        else
            return '登出';
    }

    setCredential(param) {
        super.setCredential(param);
        Cookie.setCredential(param);
    }

    setUserInfo(param) {
        super.setUserInfo(param);
        Cookie.setUser(param);
        Application.setUserInfo(param);
    }

    async signInWithCredential() {
        if (Cookie.hasCredential()) {
            try {
                const result = await firebaser.signInWithCredential(Cookie.getCredential());
                if (result !== undefined) {
                    this.setCredential(result.credential);
                    this.setUserInfo(result.user);
                }
            } catch (error) {
                Util.appendError(error);
                Cookie.removeCredential();
            }
        }
    }

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
        Cookie.removeCredential();
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
}

export default NavigatorStore;
