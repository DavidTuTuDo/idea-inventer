import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmedByLinePay from "./BaseConfirmedByLinePay";

class ModularizedConfirmedByLinePay extends BaseConfirmedByLinePay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async handleHttpOnRequest(request, response) {}
  /** -------------------- async api -------------------- **/
}
export default ModularizedConfirmedByLinePay;
