import {utiller as Util, exceptioner as ERROR} from "utiller";
import _ from "lodash";
import * as functions from 'firebase-functions';
import Config from "../config";

class BaseFunction {

    constructor() {
    }

    appendLog(...msgs) {
        functions.logger.log(...msgs);
    }


    appendError(...msgs) {
        functions.logger.error(...msgs);
    }

    isLoginUser(context) {
        return context.auth && context.auth.uid;
    }

    getUid(context) {
        return context.auth.uid;
    }

    getPictureUrl(context) {
        return context.auth.token.name || null;
    }

    getEmailAddress(context) {
        return context.auth.token.email || null;
    }

    isECPayCheckMacValueValid(data, key, iv, idOfError = '') {
        const computedMacValue = Util.getECPayCheckMacValue(
            data,
            key,
            iv,
        )

        if (!_.isEqual(computedMacValue, data.CheckMacValue)) {
            /** 判斷檢查碼 [CheckMacValue] */
            Util.appendInfo(`${idOfError}, 訂單(${data.MerchantTradeNo}) CheckMacValue 檢查碼失敗`);
            throw new ERROR(9999, `${idOfError}, 訂單(${data.MerchantTradeNo}) CheckMacValue 檢查碼失敗`);
        }
    }

    /** 檢查訂單是否合理*/
    validatePreciseOrder(itemOfPreciseOrder, idOfError = '') {
        if (!itemOfPreciseOrder.exists) {
            throw new ERROR(9999, `8871231-${idOfError} 訂單內容不存在, idOfPreciseOrder:${data.idOfPreciseOrder}`)
        }

        if (!_.isEqual('wait', itemOfPreciseOrder.stateOfPayment)) {
            throw new ERROR(9999, `8871233-${idOfError} 訂單(${itemOfPreciseOrder.id})狀態已無法更改:${itemOfPreciseOrder.stateOfPayment}`)
        }

        if (!Util.isUndefinedNullEmpty(itemOfPreciseOrder.procedureOfPayment)) {
            throw new ERROR(9999, `8871234-${idOfError} 訂單(${itemOfPreciseOrder.id})已有選定的付費方式:${this.getStringOfNormalizeProcedureOfPayment(itemOfPreciseOrder.procedureOfPayment)}`)
        }
    }

    getStringOfNormalizeProcedureOfPayment(string) {
        const strings = _.split(string, Util.getSeparatorOfUnique());
        if (_.size(string) === 0) return '當前沒有選定的付款方式';

        let result = '';
        result += `第三方支付:${strings.shift()}`;
        if (_.size(strings) > 0)
            result += `支付方式:${strings.shift()}`;
        return result;
    }
}


export default BaseFunction
