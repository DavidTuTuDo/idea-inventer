const edit = true;

import { utiller as Util, exceptioner as ERROR } from "utiller";
import Config from "../../config";
import Api from "../../api";
import { linepayer as LinePay } from "linepayer";
import BaseConfirmedByLinePay from "./BaseConfirmedByLinePay";
import sendEmail from "../sendEmailOfReceipt";

const MAP_OF_CODE_MESSAGE_FROM_CONFIRM_RESULT = {
    "0000": "成功",
    1101: "買家不是LINE Pay用戶",
    1102: "買方被停止交易",
    1104: "此商家不存在",
    1105: "此商家無法使用 LINE Pay",
    1106: "標頭(Header)資訊錯誤",
    1110: "無法使用的信用卡",
    1124: "金額錯誤 (scale)",
    1141: "付款帳戶狀態錯誤",
    1142: "Balance餘額不足",
    1150: "交易記錄不存在",
    1152: "該transactionId的交易記錄已經存在",
    1153: "付款request時的金額與申請時的金額不一致",
    1159: "無付款申請資訊",
    1169: "用來確認付款的資訊錯誤（請訪問LINE Pay設置付款方式與密碼認證）",
    1170: "使用者帳戶的餘額有變動",
    1172: "該訂單編號(orderId)的交易記錄已經存在",
    1180: "付款時限已過",
    1198: "API調用重覆",
    1199: "內部請求錯誤",
    1264: "一卡通MONEY通相關錯誤",
    1280: "信用卡付款時候發生了臨時錯誤",
    1281: "信用卡付款錯誤",
    1282: "信用卡授權錯誤",
    1283: "因有異常交易疑慮暫停交易，請洽 LINE Pay 客服確認",
    1284: "暫時無法以信用卡付款",
    1285: "信用卡資訊不完整",
    1286: "信用卡付款資訊不正確",
    1287: "信用卡已過期",
    1288: "信用卡的額度不足",
    1289: "超過信用卡付款金額上限",
    1290: "超過一次性付款的額度",
    1291: "此信用卡已被掛失",
    1292: "此信用卡已被停卡",
    1293: "信用卡驗證碼 (CVN) 無效",
    1294: "此信用卡已被列入黑名單",
    1295: "信用卡號無效",
    1296: "無效的金額",
    1298: "信用卡付款遭拒絕",
    9000: "內部錯誤"
};

class ModularizedConfirmedByLinePay extends BaseConfirmedByLinePay {
    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        Util.validatePayloadObjectValid(data, ["idOfPreciseOrder", "idOfTransaction"], "ConfirmedByLinePay");
        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(data.idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(itemOfPreciseOrder, data.idOfPreciseOrder);

        const payloadOfConfirmLinePay = {
            amount: itemOfPreciseOrder.priceOfTotal,
            currency: itemOfPreciseOrder.typeOfCurrency
        };

        const linepay = await this.linepayO(itemOfPreciseOrder.idOfAuthor);
        const resultOfLinePayConfirm = await linepay.confirm(payloadOfConfirmLinePay, data.idOfTransaction);
        const codeOfReturn = resultOfLinePayConfirm.returnCode;
        if (Util.isEqual(codeOfReturn, "0000")) {
            await Promise.all([
                Api.updatePreciseOrderItemAtomically(async (item, transaction) => {
                    await this.validateOrderIsUnPaidWaiting(item);
                    return {
                        stateOfPayment: Config.StateOfPayment.Completed,
                        procedureOfPayment: `${Config.LangOfEPayType.LinePay}`,
                        timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp()),
                        idOfThirdPartyTradeNo: data.idOfTransaction,
                        messageOfPayment: `${resultOfLinePayConfirm.returnMessage}`
                    };
                }, itemOfPreciseOrder.id),
                Api.updateHadeItemAtomically(
                    (item, transaction) => {
                        return {
                            typeOfTransaction: Config.TransactionMethod.LinePay,
                            paid: true,
                            procedureOfPayment: `${Config.LangOfEPayType.LinePay}`,
                            timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
                        };
                    },
                    itemOfPreciseOrder.id,
                    itemOfPreciseOrder.idOfAuthor
                )
            ]);
            this.customizeBehaviorOfSucceedTrade();
            Util.appendInfo(`LINE-PAY完成付款項目,更新了訂單(${data.idOfPreciseOrder})狀態`);
            Util.exeAsyncT(sendEmail.handleHttpOnCall({ idOfPreciseOrder: data.idOfPreciseOrder }, session));
            return { message: `confirmed by ${Config.EPayType.LinePay}|succeed` };
        } else {
            await Api.updatePreciseOrderItemAtomically(async (item, transaction) => {
                await this.validateOrderIsUnPaidWaiting(item);
                return {
                    procedureOfPayment: `${Config.LangOfEPayType.LinePay}`,
                    timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp()),
                    stateOfPayment: Config.StateOfPayment.Failure,
                    messageOfPayment: `${MAP_OF_CODE_MESSAGE_FROM_CONFIRM_RESULT[codeOfReturn]}-${resultOfLinePayConfirm.returnMessage}`
                };
            }, itemOfPreciseOrder.id);
            await Api.deleteHadeItem(itemOfPreciseOrder.id, itemOfPreciseOrder.idOfAuthor);
            this.appendErrorLog(9999, `98895454354 訂單('${itemOfPreciseOrder.id}')LinePay線上付款款時發生錯誤(${MAP_OF_CODE_MESSAGE_FROM_CONFIRM_RESULT[codeOfReturn]})`);
        }
    }

    customizeBehaviorOfSucceedTrade() {
        /** this.appendErrorLog(9999, `47498412486 ${Config.EPayType.LinePay}succeed之後，每個專案應該實作各自的record，insert(例專案:月薪) 應該要增加 工作行事曆到甲方`); */
    }
}

export default ModularizedConfirmedByLinePay;
