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
        Router.gotoHomePage();
    }

    onEpayAnonymousXDealCopyLinkChipClicked(param) {
        this.copyCurrentLinkToClipboard();
    }
}

export default ModularizedEpayAnonymousXDealComponent;
