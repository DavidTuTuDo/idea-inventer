const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseEpayAnonymousXDealComponent from "./BaseEpayAnonymousXDealComponent";

class ModularizedEpayAnonymousXDealComponent extends BaseEpayAnonymousXDealComponent {
    constructor(props) {
        super(props);
    }

    getListInjectStyleOfEpayFootprintTabTab() {
        return () => Util.getVisibleOrNone(false);
    }

    getInjectPropOfParamOfAuthor() {
        return "userX";
    }

    getInjectPropOfParamOfTypeOfTab() {
        return "anonymousX";
    }

    isValidOfParamOfId() {
        return true;
    }

    onEpayAnonymousXDealToMainChipClicked(param) {
        Router.gotoHomePage(this);
    }

    onEpayAnonymousXDealCopyLinkChipClicked(param) {
        this.copyCurrentLinkToClipboard();
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

export default ModularizedEpayAnonymousXDealComponent;
