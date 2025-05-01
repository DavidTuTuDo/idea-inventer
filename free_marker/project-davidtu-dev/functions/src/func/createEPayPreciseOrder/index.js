const edit = true;

import ModularizedCreateEPayPreciseOrder from "./ModularizedCreateEPayPreciseOrder";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class CreateEPayPreciseOrder extends ModularizedCreateEPayPreciseOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    preCheckOfCustomizeRule() {
        Util.appendInfo(`488154543545 preCheckOfCustomizeRule succeed`);
    }
    /** -------------------- async api -------------------- **/
}
export default new CreateEPayPreciseOrder();
