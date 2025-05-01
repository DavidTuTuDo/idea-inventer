const edit = true;

import ModularizedCheckoutByLinePay from "./ModularizedCheckoutByLinePay";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class CheckoutByLinePay extends ModularizedCheckoutByLinePay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getBranchName() {
        return `明悅科技`;
    }
    /** -------------------- async api -------------------- **/
}
export default new CheckoutByLinePay();
