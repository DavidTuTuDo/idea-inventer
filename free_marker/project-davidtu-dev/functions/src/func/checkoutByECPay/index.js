import ModularizedCheckoutByECPay from "./ModularizedCheckoutByECPay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";

class CheckoutByECPay extends ModularizedCheckoutByECPay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getURLOfOrderResultURL() {
    return 'https://www.google.com/'
  }

  getURLOfClientBackURL() {
    return 'https://www.google.com/'
  }
  /** -------------------- async api -------------------- **/
}
export default new CheckoutByECPay();
