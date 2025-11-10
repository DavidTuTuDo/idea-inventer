const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseDionysusHermesComponent from "./BaseDionysusHermesComponent";

class ModularizedDionysusHermesComponent extends BaseDionysusHermesComponent {
    constructor(props) {
        super(props);
    }

    getWrapInjectStyleOfDionysusHermesWholeCheckbox(hermes) {
        return Util.getVisibleOrHidden(false);
    }

    onDionysusHermesSubmitChipClicked(param) {
        const self = this;
        if (this.getStore().hasSurelyChoice()) {
            const result = this.getStore().updateTransportInfo();
            /** result = {typeOfTransaction,typeOfTransport,feeOfTransport} */
            Router.gotoPlutusPage(this, result);
        } else this.showWarningSnackMessage(`尚未選擇付款、物流方式`);
    }

    getInjectStyleOfDionysusHermesTransportDiv(transport) {
        const visible = transport.getAvailable();
        return Util.getVisibleOrNone(visible);
    }

    getInjectStyleOfDionysusHermesTransactionDiv(transaction) {
        const visible = transaction.getAvailable();
        return Util.getVisibleOrNone(visible);
    }

    getListInjectStyleOfDionysusHermesTransportDiv(dionysusHermes) {
        return Util.getVisibleOrNone(this.getStore().getHasPhysical());
    }

    getInjectStyleOfDionysusHermesDividerDiv() {
        return Util.getVisibleOrNone(this.getStore().getHasPhysical());
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
        return Util.getVisibleOrNone(this.getStore().getHasPhysical());
    }

    getWrapInjectStyleOfDionysusHermesTransportPriceTypography(transport) {
        return Util.getVisibleOrHidden(this.getStore().getHasPhysical());
    }

    getWrapInjectStyleOfDionysusHermesTransactionPriceTypography(transaction) {
        return Util.getVisibleOrHidden(false);
    }
}

export default ModularizedDionysusHermesComponent;
