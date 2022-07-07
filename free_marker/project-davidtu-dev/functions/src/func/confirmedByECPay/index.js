import ModularizedConfirmedByECPay from "./ModularizedConfirmedByECPay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmedByECPay from "./BaseConfirmedByECPay";

class ConfirmedByECPay extends ModularizedConfirmedByECPay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default new ConfirmedByECPay();
