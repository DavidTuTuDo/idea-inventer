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

    isECPayCheckMacValueValid(data, key, iv,idOfError = '') {
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

}


export default BaseFunction
