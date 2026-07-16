const edit = true;

import { utiller as Util, exceptioner as ERROR } from "utiller";
import { nth, size, split, toLower } from "lodash-es";
// 1. 修改導入方式，使用 v2 專用的 logger
import * as logger from "firebase-functions/logger";
import Api from "../api";
import Config from "../config";
import ClientRemoteApi from "../base/CommonRemoteApi";
import { linepayer as LinePay } from "linepayer";
import ECPay from "ecpay_aio_nodejs";

const LINEPAY_CREDENTIAL = ({ channelId, channelSecret }) => (channelId && channelSecret ? { channelId, channelSecret, uri: "https://api-pay.line.me" } : Config.LINEPAY_SANDBOX);
const ECPAY_CREDENTIAL = ({ MerchantID, HashKey, HashIV }) =>
    MerchantID && HashKey && HashIV
        ? {
              OperationMode: "Production",
              MercProfile: { MerchantID, HashKey, HashIV },
              IgnorePayment: ["BARCODE", "AndroidPay", "ApplePay", "TWQR", "BNPL"],
              IsProjectContractor: false
          }
        : Config.ECPAY_SANDBOX;

class BaseFunction extends ClientRemoteApi {
    constructor(props) {
        super(props);
        this.TEST_MODE = false;
        this.fingerprint = "";
    }

    setFingerprint = (hash) => {
        this.fingerprint = hash;
    };

    getFingerprint = () => {
        return this.fingerprint;
    };

    enableTestMode = () => {
        this.TEST_MODE = true;
    };

    linepayO = async (idOfAuthor) => {
        //todo：取得eros裡面如果有[linepay machine id]的處理，沒有提供又開啟，就走sandbox讓user體驗
        if (Util.isUndefinedNullEmpty(idOfAuthor)) this.appendErrorLog(9999, `98211512-${this.getName()} 沒有賣家資訊，無法完成交易`);
        const secret = await Api.fetchCupidSecret(idOfAuthor);
        const credential = LINEPAY_CREDENTIAL({ channelId: nth(secret.linepaySet, 0), channelSecret: nth(secret.linepaySet, 1) });
        this.appendLog("line credential: ", credential);
        return new LinePay(credential);
    };

    ecpayO = async (idOfAuthor) => {
        //todo：取得eros裡面如果有[linepay machine id]的處理，沒有提供又開啟，就走sandbox讓user體驗
        if (Util.isUndefinedNullEmpty(idOfAuthor)) this.appendErrorLog(9999, `98211519-${this.getName()} 沒有賣家資訊，無法完成交易`);
        const secret = await Api.fetchCupidSecret(idOfAuthor);
        const credential = ECPAY_CREDENTIAL({ MerchantID: nth(secret?.ECPaySet, 0), HashKey: nth(secret?.ECPaySet, 1), HashIV: nth(secret?.ECPaySet, 2) });
        this.appendLog("ecpay credential: ", credential);
        const instance = new ECPay(credential);
        instance.HashKeyXGetter = () => credential.MercProfile.HashKey;
        instance.HashIVXGetter = () => credential.MercProfile.HashIV;
        instance.MerchantIDXGetter = () => credential.MercProfile.MerchantID;
        return instance;
    };

    appendLog = (...messages) => {
        if (this.TEST_MODE) this.appendLog(...messages);
        else logger.info(...messages);
    };

    /**
     * 應該要依照locale 去換算出 2022/03/12 12:10:39 *
     * 因為server在美國 UTC+8
     * @param string 2022/12/12 11:12:14
     * @param locale 用來換算多少
     */
    getUTCTimestampFromECPayTimeString(string, locale = "zh_tw") {
        const offset = this.getOffSetByLocation(locale);
        return Util.getTimeStampWithConditions({ hours: offset }, Util.getTimeStampFromECPayStringFormat(string));
    }

    getTWTimeOfFireTS(tsOfFirebase) {
        const ts = this.normalizeTimestamp(tsOfFirebase);
        return Util.formatTimeByLocale(ts);
    }

    async incrementProductCountsAtomically(itemOfPreciseOrder) {
        await Promise.all(
            itemOfPreciseOrder.items.map(async (item) => {
                const param = item.idOfPreciseProduct.split(Util.getSeparatorOfUnique());
                const idOfVariant = param.pop();
                const idOfBooze = param.shift();
                const infoOfHera = item.infoOfHera;
                await Api.updateVariantItemAtomically(
                    async (variant, transaction) => {
                        return { quantity: variant.quantity + item.quantity };
                    },
                    idOfVariant,
                    idOfBooze
                );

                /** 刪掉useMainTrunk運用的hera */
                if (!Util.isUndefinedNullEmpty(infoOfHera)) {
                    try {
                        const obj = JSON.parse(infoOfHera);
                        await Api.deleteHeraItem(obj.id, obj.idOfAuthor);
                    } catch (error) {
                        /** ignore errors */
                    }
                }
            })
        );
        await Api.updatePreciseOrderItem({ isRestoreItems: true }, itemOfPreciseOrder.id);
    }

    getOffSetByLocation(locale) {
        switch (toLower(locale)) {
            case "zh_tw":
                return -8;
            default:
                return 0;
        }
    }

    // 3. 修改日誌等級輸出
    appendInfoLog(message) {
        logger.info(message);
    }

    appendErrorLog(code, message) {
        logger.error(message);
        throw new ERROR(code, message);
    }

    // 4. 修改 Session 判斷邏輯
    // 在 Gen 2 中，onCall 的 session 傳入的是 request.auth
    isLoginUser(session) {
        // Gen 2 的 Callable 函數中，session (request.auth) 如果未登入會是 undefined 或 null
        return session && session.uid;
    }

    isAnonymousUser(session) {
        return !this.isLoginUser(session);
    }

    async isAdminUser(session) {
        if (this.isLoginUser(session)) return await Api.isAdminUser();
        return false;
    }

    getUid(session) {
        return session?.uid;
    }

    getPictureUrl(session) {
        // Gen 2 的 token 結構通常在 request.auth.token 裡
        return session?.token?.name || null;
    }

    getEmailAddress(session) {
        return session?.token?.email || null;
    }

    isECPayCheckMacValueValid(data, key, iv) {
        const computedMacValue = Util.getECPayCheckMacValue(data, key, iv);
        /** 判斷檢查碼 [CheckMacValue] */
        if (!Util.isEqual(computedMacValue, data.CheckMacValue)) this.appendErrorLog(9999, `65451953-${this.getName()} 訂單(${data.MerchantTradeNo})CheckMacValue檢查碼失敗`);
    }

    /** 如果是CVS OR ATM 就不能再改變付款狀態了*/
    isPayByCVSorATM() {}

    getStringOfNormalizeProcedureOfPayment(string) {
        const strings = split(string, Util.getSeparatorOfUnique());
        if (size(string) === 0) return "當前沒有選定的付款方式";

        let result = "";
        result += `第三方支付:${strings.shift()}`;
        if (size(strings) > 0) result += `支付方式:${strings.shift()}`;
        return result;
    }

    /**  判斷即將做fetch搜尋的document id是合法 */
    validateIdOfDocumentQualify = async (idOfOrder) => {
        if (Util.isUndefinedNullEmpty(idOfOrder)) this.appendErrorLog(9999, `48468445123-${this.getName()} 未提供可查詢的編號`);
    };

    /** [epay]判斷order是存在 */
    validatePreciseOrderIsExist = async (order, id) => {
        if (!order.exists) this.appendErrorLog(9999, `88712314561-${this.getName()} 訂單內容不存在，訂單編號:${id}`);
    };

    /** 確認訂單付款狀態為'已完成' */
    validateOrderIsCompletedPayment = async (order) => {
        if (!Util.isOrEquals(order.stateOfPayment, Config.StateOfPayment.Completed)) this.appendErrorLog(9999, `4845461231-${this.getName()} 訂單必須為「已付款」，請聯繫管理員`);
    };

    validateOrderIsNotSendingYet = async (order) => {
        if (!Util.isOrEquals(order.stateOfTransport, Config.StateOfTransport.Pending))
            this.appendErrorLog(9999, `484546123121-${this.getName()} 訂單必須為「待出貨」，請聯繫管理員`);
    };

    /** 確認訂單付款狀態為'未付款 等待中(ATM CVS)' */
    validateOrderIsUnPaidWaiting = async (order) => {
        if (!Util.isOrEquals(order.stateOfPayment, Config.StateOfPayment.Pending, Config.StateOfPayment.Waiting))
            this.appendErrorLog(9999, `484546121565-${this.getName()} 訂單必須為「待付款」，請聯繫管理員`);
    };

    /** 確認貨運付款狀態為'未寄出'，備註：訂單內容僅有課程類會是needless */
    validateOrderIsNotTransportYet = async (order) => {
        if (!Util.isOrEquals(order.stateOfTransport, Config.StateOfTransport.Pending)) this.appendErrorLog(9999, `4845464541-${this.getName()} 訂單必須為「未寄出」，請聯繫管理員`);
    };

    validateIsLoginUser = async (session) => {
        if (!this.isLoginUser(session)) this.appendErrorLog(9999, `4845461513-${this.getName()} 必須是「登入」狀態`);
    };

    validateIsUserOfOrder = async (order, session) => {
        if (!Util.isEqual(this.getUid(session), order.idOfUser)) this.appendErrorLog(9999, `484546141654-${this.getName()} 「必須是買家」`);
    };

    validateIsAuthorOfOrder = async (order, session) => {
        if (!Util.isEqual(this.getUid(session), order.idOfAuthor)) this.appendErrorLog(9999, `48454615142-${this.getName()} 「必須是賣家」`);
    };

    validateIsAuthorOrUserOfOrder = async (order, session) => {
        if (!Util.isOrEquals(this.getUid(session), order.idOfUser, order.idOfAuthor)) this.appendErrorLog(9999, `4845461515-${this.getName()} 必須是「訂單關係人」`);
    };

    /** { typeOfUser:'買家'|'賣家'|'管理員', allowUpdate: false }*/
    async getLoginUserInfo(order, session) {
        let typeOfUser = "";
        let allowUpdate = false;

        if (Util.isEqual(this.getUid(session), order.idOfUser)) {
            typeOfUser = "買家";
            allowUpdate = true;
        } else if (Util.isEqual(this.getUid(session), order.idOfAuthor)) {
            typeOfUser = "賣家";
            allowUpdate = true;
        } else if (await this.isAdminUser(session)) {
            typeOfUser = "管理員";
            allowUpdate = true;
        } else {
            typeOfUser = "未知";
            allowUpdate = false;
        }
        return { typeOfUser, allowUpdate };
    }
}

export default BaseFunction;
