const edit = true;

import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
import BaseConfirmedByECPay from "./BaseConfirmedByECPay";
import Config from "../../config";
import Api from "../../api";
import sendEmail from "../sendEmailOfReceipt";

const CONTENT_OF_ECPAY_RETURN_URL = {
    CustomField1: "",
    CustomField2: "",
    CustomField3: "",
    CustomField4: "",
    MerchantID: "2000132",
    MerchantTradeNo: "qFNuLPLmucnakEdPNaKF",
    PaymentDate: "2022/06/27 17:52:10",
    PaymentType: "Credit_CreditCard",
    PaymentTypeChargeFee: "6",
    RtnCode: "1",
    RtnMsg: "交易成功",
    SimulatePaid: "0",
    StoreID: "",
    TradeAmt: "300",
    TradeDate: "2022/06/27 17:50:30",
    TradeNo: "2206271750301713",
    CheckMacValue: "D6E44FA517E976265D4EBC0A186AC54F404E61EFDC8611A12336C7216A578F92"
};

class ModularizedConfirmedByECPay extends BaseConfirmedByECPay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        Util.setLocaleOfDate("zh-tw");
    }

    async handleHttpOnRequest(request, response) {
        Util.appendInfo("client端帶上來的資訊有以下:", request.body);
        return await this.handlePreciseOrderByECPay(request.body);
    }

    async handlePreciseOrderByECPay(contentOfSucceed) {
        Util.validatePayloadObjectValid(contentOfSucceed, ["CheckMacValue", "MerchantTradeNo", "MerchantID", "PaymentType"], "ConfirmedByECPay");

        this.isECPayCheckMacValueValid(contentOfSucceed, Config.ecpay.MercProfile.HashKey, Config.ecpay.MercProfile.HashIV, "ConfirmedByECPay");

        await this.validateIdOfDocumentQualify(contentOfSucceed.MerchantTradeNo, "ConfirmedByECPay");
        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(contentOfSucceed.MerchantTradeNo);

        await this.validatePreciseOrderIsExist(itemOfPreciseOrder, contentOfSucceed.MerchantTradeNo, "ConfirmedByECPay");
        await this.validateOrderIsUnPaidWaiting(itemOfPreciseOrder, "ConfirmedByECPay");

        if (_.isEqual(_.toInteger(contentOfSucceed.RtnCode), 1)) {
            await Api.updatePreciseOrderItemAtomically(async (item, transaction) => {
                await this.validateOrderIsUnPaidWaiting(item, "ConfirmedByECPay");
                return {
                    stateOfPayment: Config.StateOfPayment.Completed,
                    procedureOfPayment: `${Config.LangOfEPayType.ECPay}${Util.getSeparatorOfUnique()}${contentOfSucceed.PaymentType}`,
                    timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp()),
                    idOfThirdPartyTradeNo: `${contentOfSucceed.TradeNo}`,
                    messageOfPayment: `${contentOfSucceed.RtnMsg}`,
                    contentOfRender: Api._firebase().getDeleteDocAttributeSymbol() /** 成功交易後刪掉，不然太佔document的容量 */
                };
            }, itemOfPreciseOrder.id);

            await Api.updateHadeItemAtomically(
                async (item, transaction) => {
                    return {
                        typeOfTransaction: Config.TransactionMethod.ECPay,
                        stateOfPayment: Config.StateOfPayment.Completed,
                        paid: true,
                        procedureOfPayment: `${Config.LangOfEPayType.ECPay}${Util.getSeparatorOfUnique()}${contentOfSucceed.PaymentType}`,
                        timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
                    };
                },
                itemOfPreciseOrder.id,
                itemOfPreciseOrder.idOfAuthor
            );

            this.customizeBehaviorOfSucceedTrade();
            Util.appendInfo(`ECPAY完成付款項目,更新了訂單(${contentOfSucceed.MerchantTradeNo})狀態`);
            await sendEmail.handleHttpOnCall({ idOfPreciseOrder: itemOfPreciseOrder.id });
            return "1|OK";
        } else {
            await Api.updatePreciseOrderItemAtomically(async (item, transaction) => {
                await this.validateOrderIsUnPaidWaiting(item, "ConfirmedByECPay");
                return {
                    stateOfPayment: Config.StateOfPayment.Failure, //"failure",
                    messageOfPayment: `${contentOfSucceed.RtnMsg}`
                };
            }, itemOfPreciseOrder.id);
            /**  OrderOfPrecise 應該要 更改 state = failure, 失敗的理由 => contentOfSucceed.RtnMsg */
            await Api.deleteHadeItem(itemOfPreciseOrder.id, itemOfPreciseOrder.idOfAuthor);
            this.appendErrorLog(9999, `5482114456 訂單(${contentOfSucceed.MerchantTradeNo})，RtnCode不合規範`);
        }
    }

    customizeBehaviorOfSucceedTrade() {
        this.appendErrorLog(
            9999,
            `47498454876 ${Config.LangOfEPayType.ECPay}|succeed之後，每個專案應該實作各自的record 
        insert(例專案:月薪) 應該要增加 工作行事曆到甲方`
        );
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedConfirmedByECPay;
