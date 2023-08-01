import ModularizedSchedulerOfExpiredOrder from "./ModularizedSchedulerOfExpiredOrder";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseSchedulerOfExpiredOrder from "./BaseSchedulerOfExpiredOrder";

class SchedulerOfExpiredOrder extends ModularizedSchedulerOfExpiredOrder {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default new SchedulerOfExpiredOrder();
