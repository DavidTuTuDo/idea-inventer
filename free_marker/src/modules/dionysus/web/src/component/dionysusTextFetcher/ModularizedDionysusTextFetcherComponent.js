const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseDionysusTextFetcherComponent from "./BaseDionysusTextFetcherComponent";

class ModularizedDionysusTextFetcherComponent extends BaseDionysusTextFetcherComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusTextFetcherAppendChipClicked(param) {
        this.exeAsyncT(this.getStore().onTextFetcherAppendNotify());
    }

    onDionysusTextFetcherLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusTextFetcherTitleMainTextFieldChange(param) {
        this.exeAsyncT(this.getStore().onTextFetcherChangedNotify());
    }

    onDionysusTextFetcherTitleClearIconButtonClicked(param) {
        const title = param.object;
        title.removeMain();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusTextFetcherComponent;
