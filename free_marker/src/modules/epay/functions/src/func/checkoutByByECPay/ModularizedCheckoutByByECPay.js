import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseCheckoutByByECPay from "./BaseCheckoutByByECPay";

class ModularizedCheckoutByByECPay extends BaseCheckoutByByECPay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async handleHttpOnCall(data, session) {}
  /** -------------------- async api -------------------- **/
}
export default ModularizedCheckoutByByECPay;
