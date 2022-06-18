import ModularizedCheckoutByLinePay from "./ModularizedCheckoutByLinePay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseCheckoutByLinePay from "./BaseCheckoutByLinePay";

class CheckoutByLinePay extends ModularizedCheckoutByLinePay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default new CheckoutByLinePay();
