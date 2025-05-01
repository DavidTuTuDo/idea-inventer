const edit = true;

import ModularizedCancelPreciseOrder from "./ModularizedCancelPreciseOrder";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseCancelPreciseOrder from "./BaseCancelPreciseOrder";

class CancelPreciseOrder extends ModularizedCancelPreciseOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    customizeBehaviorOfFailureTrade() {
        Util.appendInfo(`customizeBehaviorOfFailureTrade 在 david-tu專案 已經實作`);
    }
    /** -------------------- async api -------------------- **/
}
export default new CancelPreciseOrder();
