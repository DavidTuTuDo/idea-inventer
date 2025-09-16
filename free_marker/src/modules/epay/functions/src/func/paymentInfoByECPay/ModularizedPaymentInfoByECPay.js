const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BasePaymentInfoByECPay from "./BasePaymentInfoByECPay";
import Config from "../../config";
import Api from "../../api";

const SAMPLE_OF_CVS_RETURN = {
    Barcode1: "",
    Barcode2: "",
    Barcode3: "",
    ExpireDate: "2022/07/03 15:04:19",
    MerchantID: "2000132",
    MerchantTradeNo: "7RR9gcRnKYISATmXUkiA",
    PaymentNo: "LLL22183786345",
    PaymentType: "CVS_CVS",
    RtnCode: "10100073",
    RtnMsg: "Get CVS Code Succeeded.",
    TradeAmt: "290",
    TradeDate: "2022/07/02 15:04:19",
    TradeNo: "2207021504129557",
    StoreID: "",
    CustomField1: "",
    CustomField2: "",
    CustomField3: "",
    CustomField4: "",
    CheckMacValue: "09600BB27FB73755230940E678EA0D728195A386C0009C48F5590D82BC40DEE8"
};

const SAMPLE_OF_ATM_RETURN = {
    BankCode: "004",
    ExpireDate: "2022/07/03",
    MerchantID: "2000132",
    MerchantTradeNo: "oZeHsq61Nkfgzc0OTY7n",
    PaymentType: "ATM_BOT",
    RtnCode: "2",
    RtnMsg: "Get VirtualAccount Succeeded",
    TradeAmt: "400",
    TradeDate: "2022/07/02 15:08:19",
    TradeNo: "2207021508019558",
    vAccount: "3833532184983047",
    StoreID: "",
    CustomField1: "",
    CustomField2: "",
    CustomField3: "",
    CustomField4: "",
    CheckMacValue: "910E17CE1281DB981DCF4F54108EFFDEF59F57FEFBF5B1E5CB2C2DABD2C4B591"
};

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
        Util.validatePayloadObjectValid(contentOfPaymentInfo, ["CheckMacValue", "MerchantTradeNo", "MerchantID", "PaymentType"], 5481213501);

        /** 檢查 CheckMacValue */
        this.isECPayCheckMacValueValid(contentOfPaymentInfo, Config.ecpay.MercProfile.HashKey, Config.ecpay.MercProfile.HashIV, 48415468462);

        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(contentOfPaymentInfo.MerchantTradeNo);

        this.validatePreciseOrder(itemOfPreciseOrder, false, "15984422");

        /** 利用 PaymentType(CVS-CVS,ATM-BOT) 去更新訂單狀態 */
        const typeOfPayment = contentOfPaymentInfo.PaymentType;
        const timeOfExpired = contentOfPaymentInfo.ExpireDate;
        const idOfOrder = itemOfPreciseOrder.id;
        Util.appendInfo(`87412316842. 訂單(${itemOfPreciseOrder.id})的採用 '${typeOfPayment}' 付費方式`);
        if (_.startsWith(typeOfPayment, "CVS")) {
            /** 當user選擇超商付款時 */
            await Api.updatePreciseOrderItemAtomically((itemOfOrder) => {
                this.validatePreciseOrder(itemOfPreciseOrder, false, "15984422");
                return Api.normalizePreciseOrder(
                    {
                        procedureOfPayment: `${Config.TYPE_OF_THIRD_PARTY_ECPAY}${Util.getSeparatorOfUnique()}${typeOfPayment}`,
                        timeOfExpired: this.getUTCTimestampFromECPayTimeString(timeOfExpired), //CVS ExpireDate: '2022/07/03 15:04:19', ECPay的是台灣國家, 要把timestamp轉回UTC
                        idOfThirdPartyTradeNo: contentOfPaymentInfo.TradeNo,
                        stateOfPayment: 3, //"waiting",
                        infoOfPayment: `${contentOfPaymentInfo.PaymentNo}${Util.getSeparatorOfUnique()}`
                    },
                    true
                );
            }, idOfOrder);
        } else if (_.startsWith(typeOfPayment, "ATM")) {
            /** 當user選擇ATM付款時 */
            await Api.updatePreciseOrderItemAtomically((itemOfOrder) => {
                this.validatePreciseOrder(itemOfPreciseOrder, false, "15984423");
                return Api.normalizePreciseOrder(
                    {
                        procedureOfPayment: `${Config.TYPE_OF_THIRD_PARTY_ECPAY}${Util.getSeparatorOfUnique()}${typeOfPayment}`,
                        timeOfExpired: this.getUTCTimestampFromECPayTimeString(`${timeOfExpired} 23:59:59`), //    ATM ExpireDate:'2022/07/03',
                        idOfThirdPartyTradeNo: contentOfPaymentInfo.TradeNo,
                        stateOfPayment: 3, //"waiting",
                        infoOfPayment: `${contentOfPaymentInfo.BankCode}${Util.getSeparatorOfUnique()}${contentOfPaymentInfo.vAccount}`
                    },
                    true
                );
            }, idOfOrder);
        } else {
            this.appendErrorLog(9999, `654481345 還不支援當前的PaymentType ${typeOfPayment})`);
        }
        this.appendInfo(`588784546546 成功更新EC-PAYMENT-INFO,訂單(${itemOfPreciseOrder.id})`);
        return "update ECPAY paymentInfo succeed";
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedPaymentInfoByECPay;
