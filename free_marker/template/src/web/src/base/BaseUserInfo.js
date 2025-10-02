const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import firebaser from "./FirebaseHelper";
import Cookie from "../cookie";
import Configer from "../config";
import { makeObservable, action, observable, when } from "mobx";
import BaseComponent from "./BaseComponent";
import EventBus from "./CommonEventBus";
import AccountUser from "../store/accountUser";
import { Application } from "../";
import CommonPoolHelper from "./CommonPoolHelper";

class UserInfo {
    @observable
    nameOfBrand = "";

    @observable
    isLoginSucceed = undefined;

    /** 最高級別的admin(增加悅譜的閱讀permission) */
    @observable
    adminUser = false;

    /** 可以開啟商品的權限 */
    @observable
    authorUser = false;

    /** 一般級別的admin(修改譜) */
    @observable
    adminHelper = false;

    @observable
    isPurchaseUser = false;

    @observable
    isAuthProcessingState = true;

    @observable
    email = "";

    @observable
    phone = "";

    @observable
    displayName = "";

    @observable
    uid = "";

    @observable
    photoURL = "";

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

    getEmailOfCurrentUser = () => {
        return this.email;
    };

    getPhoneOfCurrentUser = () => {
        return this.phone;
    };

    getDisplayNameOfUser = () => {
        return this.displayName;
    };

    getPhotoURL = () => {
        return this.photoURL;
    };

    onAuthStateChangedReceive = (user) => {
        Util.appendInfo("4565231213 收到authStateChanged 通知，我改變了 =>", user);
        this.specificBehaviorOfLoginStateChange(user).then();
    };

    /** 拿cookie的token去換到登入資訊然後呼叫emitAuthStateChanged之後的行為 */
    async specificBehaviorOfLoginStateChange(user) {
        let current = "";
        if (this.isValidUser(user)) {
            Util.appendInfo(`firebase-auth取得authorized user(${user.uid})，執行enableParallelMode，讓firebase api依據權限拿資料`);
            CommonPoolHelper.enableParallelMode();
            Util.appendInfo(`7381271928 => 會員在firebase-authentication存在裡了`, user);
            current = await this.apiOfUser.fetchUserItem(Application.getLatestComponent(), user.uid);
            if (!current.exists) this.apiOfUser.submitUserItem(Application.getLatestComponent(), { ...user, id: user.uid }, user.uid).then();
            else this.apiOfUser.updateUserItem(Application.getLatestComponent(), user, user.uid).then(); //不要讓main thread卡住
            Cookie.setUser(user);
            Util.appendInfo("登入成功, 所以寫入資料");
            Util.appendInfo("user info:", user);
        } else {
            Util.appendInfo(`73812711238 => 在firebase-authentication不存在裡了，無差別清理掉髒東西`);
            Cookie.removeUser();
            await firebaser.logout();
        }
        this.invalidateLoginState(current);
        Util.appendInfo(`Navigator收到登入狀態改變的事件,login狀態:${this.isLoginWithSucceed()} `);
    }

    @action
    invalidateLoginState = (user) => {
        Util.appendInfo(`112132132 不論有沒有有登入，都要記得enableParallelMode`);
        CommonPoolHelper.enableParallelMode();
        this.isLoginSucceed = !Util.isUndefinedNullEmpty(firebaser.getCurrentUser());
        this.adminUser = this.isLoginWithSucceed() && _.isEqual(this.getUid(true), Configer.superUserUid);
        this.adminHelper = this.isLoginWithSucceed() && user.isAdmin;
        this.authorUser = this.isLoginWithSucceed() && user.isAuthor;
        this.displayName = this.isLoginWithSucceed() && user.displayName;
        this.email = this.isLoginWithSucceed() && user.email;
        this.phone = this.isLoginWithSucceed() && user.phone;
        this.photoURL = this.isLoginWithSucceed() && user.photoURL;
        this.uid = this.isLoginWithSucceed() && user.url;
        this.setAuthProcessing(false);
        this.invalidateCartie();
    };

    isLoginWithSucceed = () => {
        return this.isLoginSucceed;
    };

    isAuthorUser = () => {
        return this.authorUser;
    };

    isSuperAdmin() {
        return this.adminUser;
    }

    @action
    setNameOfBrand = (name) => {
        this.nameOfBrand = name;
    };

    getNameOfBrand = () => {
        return this.nameOfBrand;
    };

    isAdmin = () => {
        return this.adminHelper;
    };

    getUid = (allowCache = true) => {
        if (!_.isEmpty(this.uid)) return this.uid;
        let uid = firebaser.getUid();
        if (!_.isEmpty(uid)) return uid;
        if (allowCache) {
            const user = Cookie.getUser();
            if (Util.exist(user)) uid = user.uid;
            if (!_.isEmpty(uid)) return uid;
        }
        return "";
    };

    performLoginBehavior = async (view) => {
        const self = this;
        if (this.isAuthProcessing()) {
            view.showWarningSnackMessage(`認證流程處理中，請稍後再試`);
            return;
        }

        const func = async () => {
            await this.executeAsyncTask(async () => {
                Util.appendInfo("4548411231, user click login（google account only）");
                try {
                    await firebaser.signInWithGoogle(async (authResult) => {
                        /** 只有在登入傳回直裡面有credential */
                        if (authResult !== undefined) {
                            Util.appendInfo(`7328438281 authResult => `, authResult);
                        } else {
                            Util.appendInfo(`4548414, didn't retrieve credential`);
                            self.setAuthProcessing(false);
                        }
                    }, view);
                } catch (error) {
                    Util.appendError(`${error.message}`);
                    self.setAuthProcessing(false);
                }
            });
        };
        await this.authProcessBehavior(func);
    };

    async executeAsyncTask(task, view) {
        if (view instanceof BaseComponent) await view.executeAsyncTaskWithLoading(task);
        else await task();
    }

    async authProcessBehavior(functionOfAsyncTask) {
        this.setAuthProcessing(true);
        await functionOfAsyncTask();
    }

    async logout(view) {
        const func = async () => {
            await this.executeAsyncTask(async () => {
                Util.appendInfo("45d4741, logout executed");
                await firebaser.logout();
                Application.getAccountStore().clean();
            }, view);
        };
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

    /** 購物車邏輯 */
    joinItemToCart = ({ idOfBooze = "", idOfVariant = "", quantity, nameOfBooze = "", quantityOfMaximum, isTaskJob, allowSelfPickUp, isHomeTeaching }) => {
        Util.appendInfo({ idOfBooze, quantity });
        const infoOfCartie = Cookie.getInfoOfCartie();
        const key = [idOfBooze, _.toString(idOfVariant)].filter((each) => !Util.isUndefinedNullEmpty(each)).join(Util.getSeparatorOfUnique());
        const object = infoOfCartie[key];
        Util.appendInfo(`joinItemToCart ==>`);
        Util.appendInfo({ idOfBooze, idOfVariant, quantity, key, nameOfBooze });

        if (object) object.quantity = Math.min(object.quantity + quantity, quantityOfMaximum);
        else infoOfCartie[key] = { idOfBooze, idOfVariant, quantity, idOfCookieUsage: key, nameOfBooze, isTaskJob, allowSelfPickUp, isHomeTeaching };
        Cookie.setInfoOfCartie(infoOfCartie);
        this.invalidateCartie(infoOfCartie);
    };

    updateItemToCart({ key, quantity, checked }) {
        const infoOfCartie = Cookie.getInfoOfCartie();
        const item = infoOfCartie[key];
        if (item) {
            item.quantity = _.toNumber(quantity);
            item.checked = checked;
        }
        Cookie.setInfoOfCartie(infoOfCartie);
        this.invalidateCartie(infoOfCartie);
    }

    deleteItemFromCart(key) {
        const infoOfCartie = Cookie.getInfoOfCartie();
        delete infoOfCartie[key];
        Cookie.setInfoOfCartie(infoOfCartie);
        this.invalidateCartie(infoOfCartie);
    }

    deleteCheckedCartieItemBehavior() {
        const infoOfCartie = Cookie.getInfoOfCartie();
        const latest = _.filter(infoOfCartie, (each) => !each.checked);
        const latestOfInfoOfCartie = Util.toObjectWithAttributeKey(latest, "idOfCookieUsage");
        Cookie.setInfoOfCartie(latestOfInfoOfCartie);
        Cookie.removeTotalPriceOfCartie();
        Cookie.removeInfoOfSelectedTransport();
        this.invalidateCartie(latest);
    }

    getCheckedCartieItem() {
        const infoOfCartie = Cookie.getInfoOfCartie();
        return _.values(_.filter(infoOfCartie, (each) => each.checked));
    }

    getArrayOfCartieItem() {
        const infoOfCartie = Cookie.getInfoOfCartie();
        return _.values(infoOfCartie);
    }

    deleteWholeItemFromCart() {
        Cookie.removeInfoOfCartie();
        this.invalidateCartie();
    }

    setTotalPriceOfCartie(price) {
        Cookie.setTotalPriceOfCartie(_.toString(price));
    }

    getTotalPriceOfCartie() {
        const price = _.toNumber(Cookie.getTotalPriceOfCartie());
        return _.isNumber(price) && price > 0 ? price : 0;
    }

    getTypeOfTransport() {
        Util.appendInfo("45613123選擇的是", Cookie.getInfoOfSelectedTransport().typeOfTransport);
        return _.toNumber(Cookie.getInfoOfSelectedTransport().typeOfTransport);
    }

    cleanCookieAfterSubmitToTransaction() {
        Cookie.removeTotalPriceOfCartie();
        Cookie.removeTypeOfTransport();
    }

    invalidateCartie = (cartie) => {
        Application.getNavigatorStore().setBadgeOfCartie(this.getCountOfBadge(cartie));
    };

    getCountOfBadge = (cartie) => {
        const infoOfCartie = cartie ?? Cookie.getInfoOfCartie();
        return _.sum(_.values(infoOfCartie).map((info) => info.quantity));
    };

    setGotoCartieDirect(enable = false) {
        Cookie.setGotoCartieDirectly(enable ? "true" : "");
    }

    isGotoCartieDirect() {
        const result = Cookie.getGotoCartieDirectly();
        return !Util.isUndefinedNullEmpty(result);
    }

    waitLoginCompleted = () => {
        return new Promise((resolve) => {
            if (this.isLoginSucceed !== undefined) {
                resolve(this.isLoginSucceed);
            } else {
                when(
                    () => this.isLoginSucceed !== undefined,
                    () => {
                        resolve(this.isLoginSucceed);
                    }
                );
            }
        });
    };
}

export default new UserInfo();
