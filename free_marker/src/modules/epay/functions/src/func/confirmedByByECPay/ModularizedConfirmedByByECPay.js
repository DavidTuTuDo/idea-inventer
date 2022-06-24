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

  async handleHttpOnRequest(request, response) {
    console.log('client端帶上來的資訊有以下:', request);
    return {name: 'david', age: 34, gender: 'male'};
  }
  /** -------------------- async api -------------------- **/
}
export default ModularizedConfirmedByByECPay;
