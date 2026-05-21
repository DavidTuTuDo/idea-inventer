const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseIreneTextFetchComponent from "./BaseIreneTextFetchComponent";

class ModularizedIreneTextFetchComponent extends BaseIreneTextFetchComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneTextFetchAppendChipClicked(param) {
        const self = this;
        this.getStore()
            .onTextFetchAppendNotify()
            .then(() => self.dismiss());
    }

    onIreneTextFetchLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneTextFetchContentTextFieldChange(param) {
        this.exeAsyncT(this.getStore().onTextFetchChangedNotify());
    }

    onIreneTextFetchClearIconButtonClicked(param) {
        const title = param.object;
        title.removeContent();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextFetchComponent;
