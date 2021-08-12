import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BasePurchasePurchasePlanStore from "./BasePurchasePurchasePlanStore";

class PurchasePurchasePlanStore extends BasePurchasePurchasePlanStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  isTitle(){
    console.log(`pid===> `,this.getPid())
    return _.isEqual(this.getPid(),-1);
  }

  /** -------------------- async api -------------------- **/
}
export default PurchasePurchasePlanStore;
