const edit = true;

import { utiller as Util, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import * as functions from "firebase-functions";
import Api from "../api";
import Config from "../config";

import ClientRemoteApi from "../base/CommonRemoteApi";
let TEST_MODE = false;
class BaseFunction extends ClientRemoteApi {
    constructor(props) {
        super(props);
    }

    appendLog(...msgs) {
        functions.logger.log(...msgs);
    }

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
        for (const item of itemOfPreciseOrder.items) {
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
        }
        await Api.updatePreciseOrderItem({ isRestoreItems: true }, itemOfPreciseOrder.id);
    }

    getOffSetByLocation(locale) {
        switch (_.toLower(locale)) {
            case "zh_tw":
                return -8;
            default:
                return 0;
        }
    }

    appendInfoLog(message) {
        functions.logger.info(message);
    }

    appendErrorLog(code, message) {
        functions.logger.error(message);
        throw new ERROR(code, message);
    }

    isLoginUser(session) {
        return session.auth && session.auth.uid;
    }

    async isAdminUser(session) {
        if (this.isLoginUser(session)) return await Api.isAdminUser();
        return false;
    }

    getUid(session) {
        return session.auth.uid;
    }

    getPictureUrl(session) {
        return session.auth.token.name || null;
    }

    getEmailAddress(session) {
        return session.auth.token.email || null;
    }

    isECPayCheckMacValueValid(data, key, iv, idOfError = "") {
        const computedMacValue = Util.getECPayCheckMacValue(data, key, iv);

        if (!_.isEqual(computedMacValue, data.CheckMacValue)) {
            /** 判斷檢查碼 [CheckMacValue] */
            Util.appendInfo(`${idOfError}, 訂單(${data.MerchantTradeNo}) CheckMacValue 檢查碼失敗`);
            throw new ERROR(9999, `${idOfError}, 訂單(${data.MerchantTradeNo}) CheckMacValue 檢查碼失敗`);
        }
    }

    /** 檢查訂單是否合理
     *
     * isCreatePaymentProcedure 用於檢查是否訂單用於向第三方建立出訂單, 例如checkoutByXXX(EPAY LINE-PAY), 這就要用來檢查是否已經有選定的支付方式
     *
     * */
    validatePreciseOrder(itemOfPreciseOrder, isUnPaidProcedure = true, idOfError = "") {
        if (!itemOfPreciseOrder.exists) {
            this.appendErrorLog(9999, `8871231-${idOfError} 訂單內容不存在，訂單編號:${itemOfPreciseOrder.idOfPreciseOrder}`);
        }

        if (_.isEqual(Config.StateOfPayment.Completed, itemOfPreciseOrder.stateOfPayment)) {
            this.appendErrorLog(9999, `8871453-${idOfError} 訂單內容已完成手續，無法再更改狀態`);
        }

        if (isUnPaidProcedure && !Util.isOrEquals(itemOfPreciseOrder.stateOfPayment, Config.StateOfPayment.Pending, Config.StateOfPayment.Waiting)) {
            this.appendErrorLog(9999, `8871233-${idOfError} 訂單(${itemOfPreciseOrder.id})狀態已無法更改:${itemOfPreciseOrder.stateOfPayment}`); //todo:stateOfPayment是數字
        }

        // if (isPayingProcedure && !_.isEqual(`unknown`, itemOfPreciseOrder.procedureOfPayment)) {
        //     this.appendErrorLog(9999, `8871234-${idOfError} 訂單(${itemOfPreciseOrder.id})已有選定的付費方式:${this.getStringOfNormalizeProcedureOfPayment(itemOfPreciseOrder.procedureOfPayment)}`);
        // }
    }

    /** 如果是CVS OR ATM 就不能再改變付款狀態了*/
    isPayByCVSorATM() {}

    getStringOfNormalizeProcedureOfPayment(string) {
        const strings = _.split(string, Util.getSeparatorOfUnique());
        if (_.size(string) === 0) return "當前沒有選定的付款方式";

        let result = "";
        result += `第三方支付:${strings.shift()}`;
        if (_.size(strings) > 0) result += `支付方式:${strings.shift()}`;
        return result;
    }

    validateIdOfOrderIsNotEmpty = async (idOfOrder, idOfError) => {
        if (Util.isUndefinedNullEmpty(idOfOrder)) this.appendErrorLog(9999, `48468445123-${idOfError}，訂單編號未提供`);
    };

    validateIdOfDocument = async (id, idOfError, name = "document") => {
        if (Util.isUndefinedNullEmpty(id)) {
            this.appendErrorLog(9999, `4846846519-${idOfError} 沒有提供合理${name}編號`);
        }
    };

    validateOrderIsExist = async (order, id, idOfError) => {
        if (!order.exists) this.appendErrorLog(9999, `88712314561-${idOfError} 訂單內容不存在，訂單編號:${id}`);
    };

    /** 確認訂單付款狀態為'已完成' */
    validateOrderIsCompleted = async (order, idOfError) => {
        if (!_.isOrEquals(order.stateOfPayment, Config.StateOfPayment.Completed)) this.appendErrorLog(9999, `4845461231-${idOfError} 訂單尚未完成付款，請聯繫管理員`);
    };

    /** 確認訂單付款狀態為'未付款 等待中(ATM CVS)' */
    validateOrderIsUnPaidWaiting = async (order, idOfError) => {
        if (!_.isOrEquals(order.stateOfPayment, Config.StateOfPayment.Pending, Config.StateOfPayment.Waiting))
            this.appendErrorLog(9999, `484546121565-${idOfError} 訂單無法付款，請聯繫管理員`);
    };

    /** 確認貨運付款狀態為'未寄出'，備註：訂單內容僅有課程類會是needless */
    validateOrderIsUnDelivered = async (order, idOfError) => {
        if (!_.isOrEquals(order.stateOfDeliver, Config.StateOfDeliver.Pending)) this.appendErrorLog(9999, `4845464541-${idOfError} 訂單無法提供運送，請聯繫管理員`);
    };

    validateIsLoginUser = async (session, idOfError) => {
        if (!this.isLoginUser(session)) this.appendErrorLog(9999, `4845461513-${idOfError} 必須是訂單關係人才能呼叫`);
    };

    validateIsUserOfOrder = async (order, session, idOfError) => {
        if (!_.isEqual(this.getUid(session), order.idOfUser)) this.appendErrorLog(9999, `484546141654-${idOfError} 必須是買家才能呼叫`);
    };

    validateIsAuthorOfOrder = async (order, session, idOfError) => {
        if (!_.isEqual(this.getUid(session), order.idOfAuthor)) this.appendErrorLog(9999, `48454615142-${idOfError} 必須是賣家才能呼叫`);
    };

    validateIsAuthorOrUserOfOrder = async (order, session, idOfError) => {
        if (!_.isOrEquals(this.getUid(session), order.idOfUser, order.idOfAuthor)) this.appendErrorLog(9999, `4845461515-${idOfError} 必須是訂單關係人才能呼叫`);
    };

    /** { typeOfUser:'買家'|'賣家'|'管理員', allowUpdate: false }*/
    async getLoginUserInfo(order, session) {
        let typeOfUser = "";
        let allowUpdate = false;

        if (_.isEqual(this.getUid(session), order.idOfUser)) {
            typeOfUser = "買家";
            allowUpdate = true;
        } else if (_.isEqual(this.getUid(session), order.idOfAuthor)) {
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
