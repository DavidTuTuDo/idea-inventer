import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BasePaymentInfoByECPay from "./BasePaymentInfoByECPay";

class ModularizedPaymentInfoByECPay extends BasePaymentInfoByECPay {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnRequest(request, response) {
        const content = request.body;
        console.log(content);
        return '1|OK'
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedPaymentInfoByECPay;
