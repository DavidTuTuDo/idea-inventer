import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseFetchLinePayInfo from "./BaseFetchLinePayInfo";

class FetchLinePayInfo extends BaseFetchLinePayInfo {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async handleHttpOnCall(data, context) {
    return {data:'this is FetchLinePayInfo:handleHttpOnCall'}
  }

  /** -------------------- async api -------------------- **/
}
export default new FetchLinePayInfo();
