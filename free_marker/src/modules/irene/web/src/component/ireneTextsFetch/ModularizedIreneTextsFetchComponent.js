const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseIreneTextsFetchComponent from "./BaseIreneTextsFetchComponent";

class ModularizedIreneTextsFetchComponent extends BaseIreneTextsFetchComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneTextsFetchAppendChipClicked(param) {
        const self = this;
        this.getStore()
            .onTextsFetchAppendNotify()
            .then(() => self.dismiss());
    }

    onIreneTextsFetchLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneTextsFetchTitleContentTextFieldChange(param) {
        this.getStore().onTextsFetchChangedNotify().then();
    }

    onIreneTextsFetchTitleClearIconButtonClicked(param) {
        const title = param.object;
        title.removeContent();
    }
}

export default ModularizedIreneTextsFetchComponent;
