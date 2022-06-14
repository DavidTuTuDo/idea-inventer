import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmLinePay from "./BaseConfirmLinePay";

class ModularizedConfirmLinePay extends BaseConfirmLinePay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async handleHttpOnCall(data, context) {}
  /** -------------------- async api -------------------- **/
}
export default ModularizedConfirmLinePay;
