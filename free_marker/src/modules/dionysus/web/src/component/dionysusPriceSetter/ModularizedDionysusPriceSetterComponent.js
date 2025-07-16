const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusPriceSetterComponent from "./BaseDionysusPriceSetterComponent";

class ModularizedDionysusPriceSetterComponent extends BaseDionysusPriceSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

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

    onDionysusPriceSetterVariantCommonChipClicked(param) {
        this.showSuccessSnackMessage(`統一價格`);
    }

    getInjectStyleOfDionysusPriceSetterVariantUpdateIconButton(variant) {
        return Util.getVisibleOrHidden(variant.existing, true);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusPriceSetterComponent;
