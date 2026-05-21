const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseIreneTimePeriodComponent from "./BaseIreneTimePeriodComponent";

class ModularizedIreneTimePeriodComponent extends BaseIreneTimePeriodComponent {
    constructor(props) {
        super(props);
    }

    onIreneTimePeriodConfirmChipClicked(param) {
        const self = this;
        this.getStore()
            .onTimeConfirmSelected()
            .then(() => {
                self.dismiss();
            })
            .catch((error) => {
                self.showWarningSnackMessage(error.message);
            });
    }

    onIreneTimePeriodLeaveChipClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTimePeriodComponent;
