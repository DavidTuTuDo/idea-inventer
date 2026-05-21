const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

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

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        if (this.getPayNow()?.price > 0) this.getComponent().getPayNowDivAlertDialogRef().open();
    }

    getPresetObjOfIreneQrcode() {
        return {
            main: "LINE",
            sub: "PAY",
            title: this.getStore().getPayNow()?.title,
            href: this.getStore().getPayNow()?.href,
            content: `NT$ ${this.getStore().getPayNow()?.price} 元`,
            caution: `(完成支付後，截圖給小編)`,
            color: `#06a748`
        };
    }
}

export default ModularizedEpayAnonymousXDealStore;
