/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-05-31-15-09-12
*/
import BasePlanStore from "./BasePlanStore";

class PlanStore extends BasePlanStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

    isTitle(){
        return _.isEqual(this.getPid(), 1);
    }
  /** -------------------- async api -------------------- **/
}
export default PlanStore;
