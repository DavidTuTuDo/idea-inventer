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
        if (this.getStore().hasSurelyChoice()) {
            this.getStore().updateTransportInfo();
            Router.gotoPlutusPage(this);
        } else this.showWarningSnackMessage(`尚未選擇付款方式`);
    }

    getInjectStyleOfDionysusHermesTransportDiv(transport) {
        const visible = transport.getAvailable();
        return Util.getVisibleOrHidden(visible);
    }

    onDionysusHermesTransportChoiceCheckboxChange(param) {
        const transport = param.object;
        this.getStore().updateCheckboxStatus(transport);
    }
}

export default ModularizedDionysusHermesComponent;
