const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusPriceSetterComponent from "./BaseDionysusPriceSetterComponent";

class ModularizedDionysusPriceSetterComponent extends BaseDionysusPriceSetterComponent {
    constructor(props) {
        super(props);
    }

    onDionysusPriceSetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusPriceSetterBatchUpdateChipClicked(param) {
        this.getComponentInstance().getStore().onVariantsPriceUpdate(this.getStore().getVariants(), this).then();
    }

    onDionysusPriceSetterVariantUpdateIconButtonClicked(param) {
        this.getComponentInstance().getStore().onVariantPriceUpdate(param.object).then();
    }

    getInjectStyleOfDionysusPriceSetterVariantUpdateIconButton(variant) {
        return Util.getVisibleOrHidden(variant.existing, true);
    }

    onNumberSetterDialogSubmit = async (...param) => {
        const price = param.shift();
        const priceB4Discount = param.pop();
        this.getStore()
            .getVariants()
            .forEach((each) => {
                each.setPrice(price);
                each.setPriceB4Discount(priceB4Discount);
            });
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusPriceSetterComponent;
