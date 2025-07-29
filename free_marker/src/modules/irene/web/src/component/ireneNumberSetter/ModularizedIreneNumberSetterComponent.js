const edit = true;

import BaseIreneNumberSetterComponent from "./BaseIreneNumberSetterComponent";

class ModularizedIreneNumberSetterComponent extends BaseIreneNumberSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneNumberSetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneNumberSetterConfirmChipClicked(param) {
        const self = this;
        this.getStore()
            .onNumberSetConfirmed()
            .then(() => self.dismiss())
            .catch((error) => this.showWarningSnackMessage(error.message));
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneNumberSetterComponent;
