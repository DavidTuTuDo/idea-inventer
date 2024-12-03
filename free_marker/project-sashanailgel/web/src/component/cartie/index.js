const edit = true;
import {inject} from "mobx-react";
import BaseCartieComponent from "./BaseCartieComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Router from '../../router';
import {observer} from "mobx-react";

@inject("cartie")
@observer
class CartieComponent extends BaseCartieComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        const self = this;
    }


    onCartieBriefIncreaseIconButtonClicked(param) {
        const brief = param.object
        this.getStore().validateCountOfOrder(brief);

    }

    onCartieBriefDecreaseIconButtonClicked(param) {
        const brief = param.object
        this.getStore().validateCountOfOrder(brief, false);
    }

    onCartieBriefCancelIconButtonClicked(param) {
        const brief = param.object;
        brief.remove();
    }

    onCartieSubmitChipClicked(param) {
        this.getStore().updateTotalPriceOfCookie();
        Router.gotoHermesPage(this);
    }

    getWrapInjectStyleOfCartiePriceOfDiscountTypography(cartie) {
        return Util.getVisibleOrNone(false, true);
    }

    getBriefPriceB4Discount(brief) {
        const origin = super.getBriefPriceB4Discount(brief);
        return `＄${origin}`
    }

    /** -------------------- async api -------------------- **/
}

export default CartieComponent;
