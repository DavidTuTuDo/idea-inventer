const edit = true;

import BaseEpayTestComponent from "./BaseEpayTestComponent";

class EpayTestComponent extends BaseEpayTestComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEpayTestCreatePreciseOrderButtonClicked(param) {
        this.exeAsyncT(this.getStore().performEPayCreateOrderBehavior());
    }

    onEpayTestCheckoutByEcPayButtonClicked(param) {
        this.exeAsyncT(this.getStore().performCheckoutByECPayBehavior());
    }

    onEpayTestCheckoutByLinePayButtonClicked(param) {
        this.exeAsyncT(this.getStore().performCheckoutByLinePayBehavior());
    }

    onEpayTestFindEcPayPageByIdButtonClicked(param) {
        this.exeAsyncT(this.getStore().performECPayPageById());
    }

    onEpayTestFindLinePayPageByIdButtonClicked(param) {
        this.exeAsyncT(this.getStore().performLinePayPageById());
    }

    onEpayTestCancelPreciseOrderButtonClicked(param) {
        this.exeAsyncT(this.getStore().performEPayCancelOrderBehavior());
    }

    /** -------------------- async api -------------------- **/
}

export default EpayTestComponent;
