import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmLinPayInfo from "./BaseConfirmLinPayInfo";

class ConfirmLinPayInfo extends BaseConfirmLinPayInfo {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async handleHttpOnCall(data, context) {
    return {data:'this is ConfirmLinPayInfo:handleHttpOnCall'}
  }

  /** -------------------- async api -------------------- **/
}
export default new ConfirmLinPayInfo();
