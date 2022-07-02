import ModularizedPaymentInfoByECPay from "./ModularizedPaymentInfoByECPay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BasePaymentInfoByECPay from "./BasePaymentInfoByECPay";

class PaymentInfoByECPay extends ModularizedPaymentInfoByECPay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default new PaymentInfoByECPay();
