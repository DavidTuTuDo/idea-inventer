const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Router from "../../router";
import UserInfo from "../../base/BaseUserInfo";
import BaseDionysusHermesComponent from "./BaseDionysusHermesComponent";

class ModularizedDionysusHermesComponent extends BaseDionysusHermesComponent {
    constructor(props) {
        super(props);
    }

    getWrapInjectStyleOfDionysusHermesWholeCheckbox(hermes) {
        return Util.getVisibleOrHidden(false);
    }

    onDionysusHermesSubmitChipClicked(param) {
        if (this.getStore().hasSurelyChoice()) {
            this.getStore().updateTransportInfo();
            Router.gotoPlutusPage(this);
        } else this.showWarningSnackMessage(`尚未選擇付款方式`);
    }

    getInjectStyleOfDionysusHermesTransportDiv(transport) {
        const visible = transport.getAvailable();
        if (!UserInfo.containsPhysicalGoodOfCheckedItem() && Util.isOrEquals(transport.getTypeOfTransport(), 4, 5, 7, 8)) return Util.getVisibleOrNone(false);
        return Util.getVisibleOrNone(visible);
    }

    onDionysusHermesTransportChoiceCheckboxChange(param) {
        const transport = param.object;
        this.getStore().updateTransportCheckboxStatus(transport);
    }

    onDionysusHermesTransactionChoiceCheckboxChange(param) {
        const transport = param.object;
        this.getStore().updateTransactionCheckboxStatus(transport);
    }

    getInjectStyleOfDionysusHermesTransportDescriptionTypography(transport) {
        return Util.getVisibleOrNone(UserInfo.containsPhysicalGoodOfCheckedItem());
    }

    getWrapInjectStyleOfDionysusHermesTransportPriceTypography(transport) {
        return Util.getVisibleOrHidden(UserInfo.containsPhysicalGoodOfCheckedItem());
    }

    getWrapInjectStyleOfDionysusHermesTransactionPriceTypography(transaction) {
        return Util.getVisibleOrHidden(false);
    }
}

export default ModularizedDionysusHermesComponent;
