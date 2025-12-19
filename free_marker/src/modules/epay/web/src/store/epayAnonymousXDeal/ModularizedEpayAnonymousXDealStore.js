const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseEpayAnonymousXDealStore from "./BaseEpayAnonymousXDealStore";

class ModularizedEpayAnonymousXDealStore extends BaseEpayAnonymousXDealStore {
    constructor(props) {
        super(props);
    }

    async fetch(view = this.getComponent()) {
        const epay = require("../epayPreciseOrder").default;
        const instance = new epay();
        const order = await instance.fetchPreciseOrderItem(view, this.getParamOfIdInPath());
        this.getEpayFootprint().pushOrder(order);
    }
}

export default ModularizedEpayAnonymousXDealStore;
