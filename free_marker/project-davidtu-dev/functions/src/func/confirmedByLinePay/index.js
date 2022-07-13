import ModularizedConfirmedByLinePay from "./ModularizedConfirmedByLinePay";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";

class ConfirmedByLinePay extends ModularizedConfirmedByLinePay {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  customizeBehaviorOfSucceedTrade(){
    Util.appendInfo(`48453134213, customizeBehaviorOfSucceedTrade() completed`);
  }
  /** -------------------- async api -------------------- **/
}
export default new ConfirmedByLinePay();
