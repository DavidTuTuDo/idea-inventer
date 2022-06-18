import ModularizedConfirmedByByECPay from "./ModularizedConfirmedByByECPay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmedByByECPay from "./BaseConfirmedByByECPay";

class ConfirmedByByECPay extends ModularizedConfirmedByByECPay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default new ConfirmedByByECPay();
