const edit = true;

import BaseEpayTestComponent from "./BaseEpayTestComponent";

class EpayTestComponent extends BaseEpayTestComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEpayTestCreatePreciseOrderButtonClicked(param) {
        this.getStore().performEPayCreateOrderBehavior().then();
    }

    onEpayTestCheckoutByEcPayButtonClicked(param) {
        this.getStore().performCheckoutByECPayBehavior().then();
    }

    onEpayTestCheckoutByLinePayButtonClicked(param) {
        this.getStore().performCheckoutByLinePayBehavior().then();
    }

    onEpayTestFindEcPayPageByIdButtonClicked(param) {
        this.getStore().performECPayPageById().then();
    }

    onEpayTestFindLinePayPageByIdButtonClicked(param) {
        this.getStore().performLinePayPageById().then();
    }

    onEpayTestCancelPreciseOrderButtonClicked(param) {
        this.getStore().performEPayCancelOrderBehavior().then();
    }

    /** -------------------- async api -------------------- **/
}

export default EpayTestComponent;
