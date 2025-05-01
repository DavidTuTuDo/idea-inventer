const edit = true;

import ModularizedConfirmedByECPay from "./ModularizedConfirmedByECPay";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class ConfirmedByECPay extends ModularizedConfirmedByECPay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    customizeBehaviorOfSucceedTrade() {
        Util.appendInfo(`4844456187122, customizeBehaviorOfSucceedTrade() completed`);
    }
    /** -------------------- async api -------------------- **/
}
export default new ConfirmedByECPay();
