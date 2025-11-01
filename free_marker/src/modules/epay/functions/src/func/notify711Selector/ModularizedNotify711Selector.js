const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseNotify711Selector from "./BaseNotify711Selector";

class ModularizedNotify711Selector extends BaseNotify711Selector {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnRequest(request, response) {
        const storeData = request.body;
        this.appendLog(`有沒有==> `, storeData);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedNotify711Selector;
