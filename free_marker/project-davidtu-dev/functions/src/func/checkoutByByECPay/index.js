import ModularizedCheckoutByByECPay from "./ModularizedCheckoutByByECPay";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseCheckoutByByECPay from "./BaseCheckoutByByECPay";

class CheckoutByByECPay extends ModularizedCheckoutByByECPay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getURLOfOrderResultURL() {
        return 'https://www.google.com/'
    }

    getURLOfClientBackURL() {
        return 'https://www.google.com/'
    }

    /** -------------------- async api -------------------- **/
}

export default new CheckoutByByECPay();
