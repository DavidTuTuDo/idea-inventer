const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseDionysusQuantitySetterComponent from "./BaseDionysusQuantitySetterComponent";

class ModularizedDionysusQuantitySetterComponent extends BaseDionysusQuantitySetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusQuantitySetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusQuantitySetterBatchUpdateChipClicked(param) {
        this.exeAsyncT(this.getComponentInstance().getStore().onVariantsQuantityUpdate(this.getStore().getVariants(), this));
    }

    onDionysusQuantitySetterVariantUpdateIconButtonClicked(param) {
        this.exeAsyncT(this.getComponentInstance().getStore().onVariantQuantityUpdate(param.object));
    }

    getInjectStyleOfDionysusQuantitySetterVariantUpdateIconButton(variant) {
        return Util.getVisibleOrHidden(variant.existing, true);
    }

    onNumberSetterDialogSubmit = async (...param) => {
        const quantity = param.shift();
        this.getStore()
            .getVariants()
            .forEach((each) => each.setQuantity(quantity));
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusQuantitySetterComponent;
