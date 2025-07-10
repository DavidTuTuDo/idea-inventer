const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmLinePayInfo from "./BaseConfirmLinePayInfo";
import Api from "../../api";
import { linepayer as LinePay } from "linepayer";
import firebase from "../../base/CommonFirebaseHelper";
import Config from "../../config";
import moment from "moment";

class ConfirmLinePayInfo extends BaseConfirmLinePayInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.linePayerRef = new LinePay(Config.linepay);
    }

    async handleHttpOnCall(data, context) {
        if (data.orderId) {
            const updateContent = {};
            this.appendLog(data);
            const orderId = data.orderId;
            const transactionId = data.transactionId;
            const orderObject = await Api.fetchPurchaseOrderItem(orderId);

            this.appendLog("orderObject ===> ", orderObject);

            if (!orderObject.exists) {
                throw new Error(`交易${orderId} 不存在`);
            }

            if (Util.isOrEquals(orderObject.status, "succeed", "fail")) {
                throw new Error("交易已過期");
            }

            try {
                const confirmContent = {
                    amount: orderObject.price,
                    currency: "TWD"
                };
                const linePayResult = await this.linePayerRef.confirm(confirmContent, transactionId);
                Util.appendInfo(confirmContent);

                const days = _.toNumber(Util.getNormalizedStringNotEndWith(orderObject.duration, "d"));
                const startTime = await firebase.getCurrentServerTimeStamp();
                const endTime = firebase.getTimeStampObj(moment(startTime.toMillis()).add(days, "days").valueOf());

                await Api.submitPurchaseProductItem(orderObject.uid, {
                    orderId,
                    expiration: {
                        startTime,
                        endTime
                    }
                });
                updateContent.status = "succeed";
                updateContent.transactionId = linePayResult.info.transactionId;
            } catch (error) {
                Util.appendError(error);
                updateContent.status = "fail";
                updateContent.message = error.message;
            } finally {
                await Api.updatePurchaseOrderItem(orderId, updateContent);
            }
            return { message: "交易成功" };
        }
        throw new Error("7211246,請不要玩弄API,開發者很辛苦");
    }
}

export default new ConfirmLinePayInfo();
