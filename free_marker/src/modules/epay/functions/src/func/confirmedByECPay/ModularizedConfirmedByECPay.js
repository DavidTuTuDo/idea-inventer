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

    Util.isPayloadObjectValid(contentOfSucceed,['CheckMacValue','MerchantTradeNo','MerchantID','PaymentType'],5481213501);

    this.isECPayCheckMacValueValid(contentOfSucceed,Config.ecpay.MercProfile.HashKey,Config.ecpay.MercProfile.HashIV, 415641542115);

    const preciseOrder = await Api.fetchPreciseOrderItem(contentOfSucceed.MerchantTradeNo);
    if (!preciseOrder.exists) {
      Util.appendInfo(`488843213, ECPAY呼叫RETURN URL時, 沒有找到訂單(${contentOfSucceed.MerchantTradeNo})`);
      throw new ERROR(9999, `488843213, ECPAY呼叫RETURN URL時, 沒有找到訂單(${contentOfSucceed.MerchantTradeNo})`);
    }

    if(!_.isEqual(preciseOrder.stateOfPayment,'wait')) {
      throw new ERROR(9999, `48884745, 訂單(${contentOfSucceed.MerchantTradeNo}) 狀態已無法更改`);
    }

    if (_.isEqual(_.toInteger(contentOfSucceed.RtnCode), 1)) {
      await Api.updatePreciseOrderItem(
          {
            stateOfPayment: 'succeed',
            procedureOfPayment: `${Config.TYPE_OF_THIRD_PARTY_ECPAY}${Util.getSeparatorOfUnique()}${contentOfSucceed.PaymentType}`,
            timeOfPayment: Util.getCurrentTimeStamp(),
            idOfThirdPartyTradeNo: `${contentOfSucceed.TradeNo}`,
            messageOfPayment: `${contentOfSucceed.RtnMsg}`,

          },
          preciseOrder.id
      );
      Util.appendInfo(`ECPAY完成付款項目,更新了訂單(${contentOfSucceed.MerchantTradeNo})狀態`);
      return '1|OK';
    } else {
      await Api.updatePreciseOrderItem(
          {
            stateOfPayment: 'fail',
            messageOfPayment: `${contentOfSucceed.RtnMsg}`,
          },
          preciseOrder.id,
      );
      /**  OrderOfPrecise 應該要 更改 state = fail, 失敗的理由 => contentOfSucceed.RtnMsg */
      Util.appendInfo(`5482114456, 訂單(${contentOfSucceed.MerchantTradeNo}) RtnCode不合規範`);
      throw new ERROR(9999, `5482114456, 訂單(${contentOfSucceed.MerchantTradeNo}) RtnCode不合規範`);
    }
  }

  /** -------------------- async api -------------------- **/
}

export default ModularizedConfirmedByECPay;
