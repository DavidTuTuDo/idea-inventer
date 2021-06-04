/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-28-15-15-13
 */
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
import Cookie from '../../cookie';
import firebaser from '../../base/BaseFirebase';
import { utiller as Util, exceptioner as ERROR } from "utiller";
import { Application } from '../../index'

class NavigatorStore extends BaseNavigatorStore {
    /** -------------------- fields -------------------- **/
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

    async reAuthByCredential() {
        if (Cookie.hasCredential()) {
            await Util.syncDelay(50);
            const result = await firebaser.authByCredential(Cookie.getCredential());
            if (result !== undefined) {
                this.setCredential(result.credential);
                this.setUserInfo(result.user);
            }
        }
    }

    async logout() {
        this.setCredential(undefined);
        this.setUserInfo(undefined);
        Cookie.removeCredential();
        Cookie.removeUser();
    }

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.setState('stable');
    }

    /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
