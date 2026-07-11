const edit = true;

import { utiller as Util, exceptioner as ERROR } from "utiller";
import { startsWith } from "lodash-es";
import BasePaymentInfoByECPay from "./BasePaymentInfoByECPay";
import Config from "../../config";
import Api from "../../api";

class ModularizedPaymentInfoByECPay extends BasePaymentInfoByECPay {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnRequest(request, response) {
        const contentOfPaymentInfo = request.body;
        Util.appendInfo(`以下是PaymentInfoByECPay的帶入內容:`, contentOfPaymentInfo);

        /** isValidPaymentInfo */
        Util.validatePayloadObjectValid(contentOfPaymentInfo, ["CheckMacValue", "MerchantTradeNo", "MerchantID", "PaymentType"], "PaymentInfoByECPay");

        /** 檢查 CheckMacValue */
        await this.validateIdOfDocumentQualify(contentOfPaymentInfo.MerchantTradeNo);
        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(contentOfPaymentInfo.MerchantTradeNo);
        await this.validatePreciseOrderIsExist(itemOfPreciseOrder, contentOfPaymentInfo.MerchantTradeNo);
        await this.validateOrderIsUnPaidWaiting(itemOfPreciseOrder);
        const ecpay = await this.ecpayO(itemOfPreciseOrder.idOfAuthor);
        this.isECPayCheckMacValueValid(contentOfPaymentInfo, ecpay.HashKeyXGetter(), ecpay.HashIVXGetter());

        /** 利用 PaymentType(CVS-CVS,ATM-BOT) 去更新訂單狀態 */
        const typeOfPayment = contentOfPaymentInfo.PaymentType;
        const timeOfExpired = contentOfPaymentInfo.ExpireDate;
        const idOfOrder = itemOfPreciseOrder.id;
        Util.appendInfo(`訂單(${itemOfPreciseOrder.id})的採用'${typeOfPayment}'付費方式`);
        if (startsWith(typeOfPayment, "CVS")) {
            /** 當user選擇超商付款時 */
            await Api.updatePreciseOrderItemAtomically(async (itemOfOrder) => {
                await this.validateOrderIsUnPaidWaiting(itemOfOrder);
                return Api.normalizePreciseOrder(
                    {
                        typeOfTransaction: Config.TransactionMethod.ECPay,
                        procedureOfPayment: `${Config.LangOfEPayType.ECPay}${Util.getSeparatorOfUnique()}${typeOfPayment}`,
                        timeOfExpired: this.getUTCTimestampFromECPayTimeString(timeOfExpired), //CVS ExpireDate: '2022/07/03 15:04:19', ECPay的是台灣國家, 要把timestamp轉回UTC
                        idOfThirdPartyTradeNo: contentOfPaymentInfo.TradeNo,
                        stateOfPayment: Config.StateOfPayment.Waiting,
                        infoOfPayment: `${contentOfPaymentInfo.PaymentNo}${Util.getSeparatorOfUnique()}`
                    },
                    true
                );
            }, idOfOrder);
        } else if (startsWith(typeOfPayment, "ATM")) {
            /** 當user選擇ATM付款時 */
            await Api.updatePreciseOrderItemAtomically(async (itemOfOrder) => {
                await this.validateOrderIsUnPaidWaiting(itemOfOrder);
                return Api.normalizePreciseOrder(
                    {
                        typeOfTransaction: Config.TransactionMethod.ECPay,
                        procedureOfPayment: `${Config.LangOfEPayType.ECPay}${Util.getSeparatorOfUnique()}${typeOfPayment}`,
                        timeOfExpired: this.getUTCTimestampFromECPayTimeString(`${timeOfExpired} 23:59:59`), //    ATM ExpireDate:'2022/07/03',
                        idOfThirdPartyTradeNo: contentOfPaymentInfo.TradeNo,
                        stateOfPayment: Config.StateOfPayment.Waiting,
                        infoOfPayment: `${contentOfPaymentInfo.BankCode}${Util.getSeparatorOfUnique()}${contentOfPaymentInfo.vAccount}`
                    },
                    true
                );
            }, idOfOrder);
        } else this.appendErrorLog(9999, `654481345-PaymentInfoByECPay 還不支援當前的支付方式(綠界支付(${typeOfPayment})`);
        this.appendInfo(`成功更新EC-PAYMENT-INFO，訂單(${itemOfPreciseOrder.id})`);
        return "update ECPAY paymentInfo succeed";
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedPaymentInfoByECPay;
