/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-06-23-19-19-44
*/
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BasePurchasePlanStore from "./BasePurchasePlanStore";

class PurchasePlanStore extends BasePurchasePlanStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

    isTitle(){
        return _.isEqual(this.getId(),1);1
    }
  /** -------------------- async api -------------------- **/
}
export default PurchasePlanStore;
