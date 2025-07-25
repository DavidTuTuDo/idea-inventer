const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseIreneTextsIndexSetterComponent from "./BaseIreneTextsIndexSetterComponent";

class ModularizedIreneTextsIndexSetterComponent extends BaseIreneTextsIndexSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneTextsIndexSetterUpdateChipClicked(param) {
        this.getStore()
            .onTextsOfIndexUpdateExecuted()
            .then(() => this.dismiss());
    }

    onIreneTextsIndexSetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneTextsIndexSetterRowGoTopChipClicked(param) {
        const tab = param.object;
        this.getStore().modifyTabOrder2Top(tab);
    }

    getInjectStyleOfIreneTextsIndexSetterRowGoTopChip(row) {
        return Util.getVisibleOrHidden(this.getStore().getEnableOfGoTop() && _.indexOf(this.getStore().getRows(), row) > 0);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextsIndexSetterComponent;
