const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import firebaser from "./FirebaseHelper";
import Cookie from "../cookie";
import Configer from "../config";
import { makeObservable, action, observable, when, reaction } from "mobx";
import BaseComponent from "./BaseComponent";
import AccountUser from "../store/accountUser";
import CommonPoolHelper from "./CommonPoolHelper";
import { storeOfSplash } from "./SplashX";
import liff from "./LiffHelper";

class UserInfo {

    /** 用來設定是否顯示「筆」 */
    @observable
    enable4EditPan = false

    /** 如果「編輯中」就會是true */
    @observable
    isEditMode = false;

    @observable
    nameOfBrand = Configer.nameOfBrand;

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

    @observable
    globalPerspective = {};

    constructor(props) {
        makeObservable(this);

        reaction(
            () => firebaser.user,
            (user) => this.onAuthStateChangedReceive(user)
        );

        this.apiOfUser = new AccountUser();
        /** 如果卡住Splash就醬子 => storeOfSNplash.hide().then(); */
    }

    /** 登出後刪掉關於個人的區域變數 */
    @action
    cleanPerspectiveVariable() {
        this.isLoginSucceed = false;
        this.uid = false;
        this.displayName = false;
        this.adminUser = false;
        this.authorUser = false;
        this.adminHelper = false;
        this.isPurchaseUser = false;
        this.isAuthProcessingState = false;
        this.isEditMode = false;
        this.email = "";
        this.phone = "";
        this.displayName = "";
        this.uid = "";
        this.photoURL = "";
    }

    isValidUser(user) {
        return user && !Util.isEmpty(user.uid);
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
        Util.exeAsyncT(this.specificBehaviorOfLoginStateChange(user));
    };

    async specificBehaviorOfLoginStateChange(user) {
        try {
            const { Application } = require("../");
            const view = Application.getLatestComponent();
            // --- 階段 B: 處理 Firebase 使用者資料同步 (主邏輯) ---
            let currentData = null;
            if (this.isValidUser(user)) {
                Util.appendInfo(`Firebase 登入成功: ${user.uid}`);
                console.log(`user:`, user);
                console.log(`firebase檢查auth是否有currentUser：`, firebaser.isLoggedIn());
                console.log(`2026.05.01 ***Oooops***`);
                const idToken = await firebaser.auth().currentUser.getIdToken(true);
                console.log(`getIdToken succeed ==> `, idToken);
                await Util.syncDelay(1);
                currentData = await this.apiOfUser.fetchUserItem(view, user.uid);
                if (!currentData.exists) Util.exeAsyncT(this.apiOfUser.submitUserItem(view, { ...user, id: user.uid }, user.uid));
                else Util.exeAsyncT(this.apiOfUser.updateUserItem(view, user, user.uid));
                Cookie.setUser(user);
            }
            this.invalidateLoginState(currentData?.exists ? currentData : user);
        } catch (error) {
            Util.appendError("firebase-auth送來「登入狀態改變」出現異常", error);
            this.setAuthProcessing(false);
            storeOfSplash.hide().then();
        }
    }

    /** 登出清理邏輯 */
    async handleLogoutCleanup() {
        const { Application } = require("../");
        Util.appendInfo("執行登出清理...");
        Cookie.removeUser();
        await firebaser.logout();
        await liff.logout();
        await Application.getAccountStore().clean();
        this.cleanPerspectiveVariable();
        const component = Application.getLatestComponent();
        console.log(`當前的登出頁面className:`, component.getComponentName());
        component.showWarningSnackMessage(`已完成登出`);
        console.log(`已完成登出`);
    }

    @action
    invalidateLoginState = (user = {}) => {
        storeOfSplash.hide().then();
        CommonPoolHelper.enableParallelMode();
        console.warn("不知道爲什麼就進來了", user);
        const loggedIn = !Util.isUndefinedNullEmpty(firebaser.getCurrentUser());
        this.isLoginSucceed = loggedIn;

        // 修正：確保型別正確，避免 boolean 值導致 startsWith 等字串方法噴錯
        this.adminUser = loggedIn && Util.isEqual(this.getUid(true), Configer.superUserUid);
        this.adminHelper = (loggedIn && user.isAdmin) || false;
        this.authorUser = (loggedIn && user.isAuthor) || false;
        this.displayName = (loggedIn && user.displayName) || "";
        this.email = (loggedIn && user.email) || "";
        this.phone = (loggedIn && user.phone) || "";
        this.photoURL = (loggedIn && user.photoURL) || "";
        this.uid = (loggedIn && (user.uid || user.url)) || "";

        this.setAuthProcessing(false);
        this.invalidateCartie();
    };

    isLoginWithSucceed = () => {
        return this.isLoginSucceed;
    };

    isAuthorUser = () => {
        return this.authorUser;
    };

    isSuperAdmin = () => {
        return this.adminUser;
    };

    @action
    modifyEditPen = (enable = true) => {
        this.enable4EditPan = enable
    };

    @action
    modifyEditMode = (enable = true) => {
        this.isEditMode = enable;
    };

    get isEditMode() {
        return this.isEditMode;
    }

    @action
    setNameOfBrand = (name) => {
        this.nameOfBrand = name;
    };

    @action
    setGlobalPerspective = (setting) => {
        this.globalPerspective = setting;
    };

    @action
    setGlobalPerspectiveAttr = (attr) => {
        this.globalPerspective[Util.getObjectKey(attr)] = Util.getObjectValue(attr);
    };

    getGlobalPerspectiveAttr = (key) => {
        return this.globalPerspective[key];
    };

    getNameOfBrand = () => {
        return this.nameOfBrand;
    };

    isAdmin = () => {
        return this.adminHelper;
    };

    getUid = (allowCache = true) => {
        if (!Util.isEmpty(this.uid)) return this.uid;
        let uid = firebaser.getUid();
        if (!Util.isEmpty(uid)) return uid;
        if (allowCache) {
            const user = Cookie.getUser();
            if (Util.exist(user)) uid = user.uid;
            if (!Util.isEmpty(uid)) return uid;
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
                try {
                    // Google 登入作為 Fallback 或預設
                    Util.appendInfo("嘗試使用 Google 登入...");
                    await firebaser.signInWithGoogle(async (authResult) => {
                        if (authResult !== undefined) {
                            Util.appendInfo(`Google 登入成功 authResult => `, authResult);
                        } else {
                            Util.appendInfo(`Google 登入失敗，未取得 credential`);
                        }
                    }, view);
                } catch (error) {
                    Util.appendError(`登入過程中發生錯誤: ${error.message}`);
                    view.showErrorSnackMessage(`登入失敗: ${error.message}`);
                } finally {
                    self.setAuthProcessing(false);
                    storeOfSplash.hide().then();
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
                await this.handleLogoutCleanup();
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
    joinItemToCart = ({ isTaskJob = false, idOfAuthor, idOfBooze = "", idOfVariant = "", quantity, quantityOfMaximum, component }) => {
        Util.appendInfo({ idOfBooze, quantity, isTaskJob });
        const infoOfCartie = Cookie.getInfoOfCartie();
        const key = [idOfBooze, Util.toString(idOfVariant)].filter((each) => !Util.isUndefinedNullEmpty(each)).join(Util.getSeparatorOfUnique());
        const object = infoOfCartie[key];
        Util.appendInfo(`joinItemToCart ==>`);
        Util.appendInfo({ idOfBooze, idOfVariant, quantity, isTaskJob, key });

        const maximum = this.getGlobalPerspectiveAttr(`maximumOfUniqueItems`);
        if (object) object.quantity = Math.min(object.quantity + quantity, quantityOfMaximum);
        else if (this.getCountsOfVariant(infoOfCartie) >= maximum) {
            component?.showErrorSnackMessage(`添加失敗，購物車數量上限為 ${maximum} 個`);
            return false;
        } else infoOfCartie[key] = { idOfAuthor, isTaskJob, idOfBooze, idOfVariant, quantity, idOfCookieUsage: key };
        Cookie.setInfoOfCartie(infoOfCartie);
        this.invalidateCartie(infoOfCartie);
        return true;
    };

    updateItemToCart({ key, quantity, checked }) {
        const infoOfCartie = Cookie.getInfoOfCartie();
        const item = infoOfCartie[key];
        if (item) {
            item.quantity = Util.toNumber(quantity);
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
        this.invalidateCartie(latest);
    }

    getCheckedCartieItems = () => {
        const infoOfCartie = Cookie.getInfoOfCartie();
        return _.values(_.filter(infoOfCartie, (each) => each.checked));
    };

    /**
     * 檢查勾選商品裡有沒有實體商品
     * _.some(collection, predicate)：會遍歷陣列，只要有一個元素符合條件就回傳 true。 */
    containsPhysicalGoodOfCheckedItem = () => _.some(this.getCheckedCartieItems(), { isTaskJob: false });

    /** 拿勾選項目裡第一個idOfAuthor */
    getAuthorOfHeadItemOfCartie = () => {
        const items = this.getCheckedCartieItems();
        return Array.isArray(items) && items.length > 0 ? items[0].idOfAuthor : "";
    };

    anonymous = () => {
        return Util.isEmpty(this.uid);
    };

    getArrayOfCartieItem() {
        const infoOfCartie = Cookie.getInfoOfCartie();
        return _.values(infoOfCartie);
    }

    deleteWholeItemFromCart() {
        Cookie.removeInfoOfCartie();
        this.invalidateCartie();
    }

    setTotalPriceOfCartie(price) {
        Cookie.setTotalPriceOfCartie(Util.toString(price));
    }

    getTotalPriceOfCartie() {
        const price = Util.toNumber(Cookie.getTotalPriceOfCartie());
        return Util.isNumber(price) && price > 0 ? price : 0;
    }

    invalidateCartie = (cartie) => {
        const { Application } = require("../");
        Application.getNavigatorStore().setBadgeOfCartie(this.getCountOfBadge(cartie));
    };

    getCountOfBadge = (cartie) => {
        const infoOfCartie = cartie ?? Cookie.getInfoOfCartie();
        return _.sum(_.values(infoOfCartie).map((info) => info.quantity));
    };

    getCountsOfVariant = (cartie) => {
        const infoOfCartie = cartie ?? Cookie.getInfoOfCartie();
        return _.size(_.values(infoOfCartie).map((info) => info.idOfVariant));
    };

    setGotoCartieDirect(enable = false) {
        Cookie.setGotoCartieDirectly(enable ? "true" : "false");
    }

    isGotoCartieDirect() {
        const result = Cookie.getGotoCartieDirectly();
        return Util.isEqual(result, "true");
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
