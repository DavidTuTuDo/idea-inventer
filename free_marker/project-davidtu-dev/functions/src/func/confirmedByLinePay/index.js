import ModularizedConfirmedByLinePay from "./ModularizedConfirmedByLinePay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmedByLinePay from "./BaseConfirmedByLinePay";

class ConfirmedByLinePay extends ModularizedConfirmedByLinePay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default new ConfirmedByLinePay();
