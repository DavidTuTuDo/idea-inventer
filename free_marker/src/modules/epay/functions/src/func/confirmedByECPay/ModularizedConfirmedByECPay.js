import {exceptioner as ERROR, utiller as Util,} from "utiller";
import _ from "lodash";
import BaseConfirmedByECPay from "./BaseConfirmedByECPay";
import Config from '../../config';
import Api from '../../api';

const CONTENT_OF_ECPAY_RETURN_URL = {
    CustomField1: '',
    CustomField2: '',
    CustomField3: '',
    CustomField4: '',
    MerchantID: '2000132',
    MerchantTradeNo: 'qFNuLPLmucnakEdPNaKF',
    PaymentDate: '2022/06/27 17:52:10',
    PaymentType: 'Credit_CreditCard',
    PaymentTypeChargeFee: '6',
    RtnCode: '1',
    RtnMsg: '交易成功',
    SimulatePaid: '0',
    StoreID: '',
    TradeAmt: '300',
    TradeDate: '2022/06/27 17:50:30',
    TradeNo: '2206271750301713',
    CheckMacValue: 'D6E44FA517E976265D4EBC0A186AC54F404E61EFDC8611A12336C7216A578F92',
}


class ModularizedConfirmedByECPay extends BaseConfirmedByECPay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        Util.setLocaleOfMoment('zh-tw');
    }

    async handleHttpOnRequest(request, response) {
        Util.appendInfo('client端帶上來的資訊有以下:', request.body);
        return await this.handlePreciseOrderByECPay(request.body);
    }

    async handlePreciseOrderByECPay(contentOfSucceed) {

        Util.validatePayloadObjectValid(contentOfSucceed, ['CheckMacValue', 'MerchantTradeNo', 'MerchantID', 'PaymentType'], 5481213501);

        this.isECPayCheckMacValueValid(contentOfSucceed, Config.ecpay.MercProfile.HashKey, Config.ecpay.MercProfile.HashIV, 415641542115);

        const preciseOrder = await Api.fetchPreciseOrderItem(contentOfSucceed.MerchantTradeNo);

        this.validatePreciseOrder(preciseOrder, false, '84864668772');

        if (_.isEqual(_.toInteger(contentOfSucceed.RtnCode), 1)) {
            await Api.updatePreciseOrderItemAtomically(
                (item, transaction) => {
                    item.exists = true;
                    this.validatePreciseOrder(item, false, '848646546542');
                    return {
                        stateOfPayment: 'completed',
                        procedureOfPayment: `${Config.TYPE_OF_THIRD_PARTY_ECPAY}${Util.getSeparatorOfUnique()}${contentOfSucceed.PaymentType}`,
                        timeOfPayment: Util.getCurrentTimeStamp(),
                        idOfThirdPartyTradeNo: `${contentOfSucceed.TradeNo}`,
                        messageOfPayment: `${contentOfSucceed.RtnMsg}`
                    }
                },
                preciseOrder.id
            );
            this.customizeBehaviorOfSucceedTrade();
            Util.appendInfo(`ECPAY完成付款項目,更新了訂單(${contentOfSucceed.MerchantTradeNo})狀態`);
            return '1|OK';
        } else {
            await Api.updatePreciseOrderItem(
                {
                    stateOfPayment: 'failure',
                    messageOfPayment: `${contentOfSucceed.RtnMsg}`,
                },
                preciseOrder.id,
            );
            /**  OrderOfPrecise 應該要 更改 state = failure, 失敗的理由 => contentOfSucceed.RtnMsg */
            this.appendErrorLog(9999,`5482114456, 訂單(${contentOfSucceed.MerchantTradeNo}) RtnCode不合規範`)
        }
    }

    customizeBehaviorOfSucceedTrade(){
        this.appendErrorLog(9999,`47498454876 ${Config.TYPE_OF_THIRD_PARTY_LINEPAY} succeed之後, 每個專案應該實作各自的record 
        insert(例專案:月薪) 應該要增加 工作行事曆到甲方`)
    }
    /** -------------------- async api -------------------- **/
}

export default ModularizedConfirmedByECPay;
