import { inject } from "mobx-react";
import BaseEpayTestComponent from "./BaseEpayTestComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";

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
