import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmedByByECPay from "./BaseConfirmedByByECPay";

class ModularizedConfirmedByByECPay extends BaseConfirmedByByECPay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async handleHttpOnCall(data, session) {}
  /** -------------------- async api -------------------- **/
}
export default ModularizedConfirmedByByECPay;
