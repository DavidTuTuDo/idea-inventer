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
import LiffUser from "../store/accountLiffUser";
import CommonPoolHelper from "./CommonPoolHelper";
import { storeOfSplash } from "./SplashX";
import liff from "@line/liff";
import Functions from "../functions";

class UserInfo {
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

    liffInitialized = false;
    liffLoginAttempted = false;

    constructor(props) {
        makeObservable(this);
        this.subscribeAuthStateChanged();
        this.apiOfUser = new AccountUser();
        this.apiOfLiff = new LiffUser();
        /** 如果卡住Splash就醬子 => storeOfSplash.hide().then(); */
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
        Util.exeAsyncT(this.specificBehaviorOfLoginStateChange(user));
    };

    /** * 1. 判斷是否在 LINE Webview 環境
     * 封裝初始化與環境檢查邏輯
     */
    async checkIsInLineBrowser() {
        const isLiffSetup = await this.initializeLiff();
        if (!isLiffSetup) return false;

        const inClient = liff.isInClient();
        console.log(`[Environment Check] Is in LINE Client: ${inClient}`);
        return inClient;
    }

    /** * 2. 封裝 LINE/LIFF 登入完整邏輯
     */
    async handleLineAutoLoginFlow(view) {
        try {
            Util.appendInfo("執行 LINE 自動登入流程...");
            this.liffLoginAttempted = true;

            // 檢查 LIFF 層級是否登入
            if (!liff.isLoggedIn()) {
                Util.appendInfo("LIFF 未登入，重新導向 LINE Login...");
                liff.login();
                return "REDIRECT";
            }

            const idToken = liff.getIDToken();
            if (!idToken) {
                view?.showErrorSnackMessage("無法從 LINE 取得 ID Token");
                return false;
            }

            // 處理後端驗證與 Firebase Custom Token 登入
            const decodedToken = liff.getDecodedIDToken();
            Util.exeAsyncT(
                this.apiOfLiff.submitLiffUserItem(view, {
                    token: idToken,
                    name: decodedToken?.name || "",
                    photo: decodedToken?.picture || ""
                })
            );

            const result = await Functions.httpOnCallVerifyByLiffIdToken(view, { idToken });
            await firebaser.signInWithCustomToken(
                result.firebaseToken,
                (authResult) => {
                    if (authResult) Util.appendInfo("LINE Custom Token 登入成功");
                },
                view
            );

            return true;
        } catch (error) {
            Util.appendError("LINE 登入程序失敗", error);
            return false;
        }
    }

    /** * 3. 重構後的主入口
     * 只負責「分流」與「同步使用者資料」
     */
    async specificBehaviorOfLoginStateChange(user) {
        try {
            const { Application } = require("../");
            const view = Application.getLatestComponent();
            const isInLine = await this.checkIsInLineBrowser();

            // --- 階段 A: 處理 LINE 環境的自動登入 (分流) ---
            if (isInLine) {
                const isFirebaseAuthed = this.isValidUser(user);
                const isLineIdentity = user?.uid?.startsWith("line:");

                // 如果還沒登入過 LINE 帳號，且沒嘗試過，就執行自動登入
                if (!isFirebaseAuthed && !this.liffLoginAttempted) {
                    const liffResult = await this.handleLineAutoLoginFlow(view);
                    if (liffResult === "REDIRECT") return; // 終止流程，等待重定向回頁面
                }
            }

            // --- 階段 B: 處理 Firebase 使用者資料同步 (主邏輯) ---
            let currentData = null;
            CommonPoolHelper.enableParallelMode();
            if (this.isValidUser(user)) {
                Util.appendInfo(`Firebase 登入成功: ${user.uid}`);
                console.log(`user:`, user);
                console.log(`firebase檢查auth是否有currentUser：`, firebaser.isLoggedIn());
                currentData = await this.apiOfUser.fetchUserItem(view, user.uid);
                if (!currentData.exists) Util.exeAsyncT(this.apiOfUser.submitUserItem(view, { ...user, id: user.uid }, user.uid));
                else Util.exeAsyncT(this.apiOfUser.updateUserItem(view, user, user.uid));
                Cookie.setUser(user);
            } else {
                // 如果已經登出，避免重複清理
                if (this.isLoginSucceed === false) {
                    this.setAuthProcessing(false);
                    return;
                }
                this.handleLogoutCleanup();
            }

            this.invalidateLoginState(currentData?.exists ? currentData : user);
        } catch (error) {
            Util.appendError("登入狀態處理異常", error);
            this.setAuthProcessing(false);
            storeOfSplash.hide().then();
        }
    }

    /** 登出清理邏輯 */
    async handleLogoutCleanup() {
        Util.appendInfo("執行登出清理...");
        Cookie.removeUser();
        await firebaser.logout();
    }

    @action
    invalidateLoginState = (user = {}) => {
        storeOfSplash.hide().then();

        const loggedIn = !Util.isUndefinedNullEmpty(firebaser.getCurrentUser());
        this.isLoginSucceed = loggedIn;

        // 修正：確保型別正確，避免 boolean 值導致 startsWith 等字串方法噴錯
        this.adminUser = loggedIn && _.isEqual(this.getUid(true), Configer.superUserUid);
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

    /** * 初始化 LIFF 並回傳 Promise 確保後續流程可以 await */
    initializeLiff = async () => {
        // 如果已經在初始化中或已完成，直接回傳該 Promise 或 true
        if (this.liffInitPromise) return this.liffInitPromise;
        if (!Configer.liffId) return false;

        this.liffInitPromise = (async () => {
            try {
                await liff.init({ liffId: Configer.liffId });
                this.liffInitialized = true;
                Util.appendInfo("LIFF 初始化完成");
                return true;
            } catch (error) {
                Util.appendError("LIFF 初始化失敗:", error);
                this.liffInitPromise = null; // 失敗時清除，允許下次重試
                return false;
            }
        })();

        return this.liffInitPromise;
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
        const { Application } = require("../");
        const func = async () => {
            await this.executeAsyncTask(async () => {
                Util.appendInfo("45d4741, logout executed");
                this.liffLoginAttempted = false; // 登出時重設嘗試標記
                await firebaser.logout();
                // 如果是 LIFF 環境且已登入，同步登出
                if (this.liffInitialized && liff.isLoggedIn()) {
                    liff.logout();
                    Util.appendInfo("Line LIFF 登出成功。");
                }
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
    joinItemToCart = ({ isTaskJob = false, idOfAuthor, idOfBooze = "", idOfVariant = "", quantity, quantityOfMaximum, component }) => {
        Util.appendInfo({ idOfBooze, quantity, isTaskJob });
        const infoOfCartie = Cookie.getInfoOfCartie();
        const key = [idOfBooze, _.toString(idOfVariant)].filter((each) => !Util.isUndefinedNullEmpty(each)).join(Util.getSeparatorOfUnique());
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
        return _.isArray(items) && items.length > 0 ? items[0].idOfAuthor : "";
    };

    anonymous = () => {
        return !_.isEmpty(this.uid);
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
        Cookie.setTotalPriceOfCartie(_.toString(price));
    }

    getTotalPriceOfCartie() {
        const price = _.toNumber(Cookie.getTotalPriceOfCartie());
        return _.isNumber(price) && price > 0 ? price : 0;
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
        return _.isEqual(result, "true");
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
