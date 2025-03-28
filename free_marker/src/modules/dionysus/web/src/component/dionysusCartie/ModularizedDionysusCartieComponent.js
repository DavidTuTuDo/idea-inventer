const edit = true;

import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseDionysusCartieComponent from "./BaseDionysusCartieComponent";

class ModularizedDionysusCartieComponent extends BaseDionysusCartieComponent {

  constructor(props) {
        super(props);
        const self = this;
    }


    onDionysusCartieBriefIncreaseIconButtonClicked(param) {
        const brief = param.object
        this.getStore().validateCountOfOrder(brief);
    }

    onDionysusCartieBriefDecreaseIconButtonClicked(param) {
        const brief = param.object
        this.getStore().validateCountOfOrder(brief, false);
    }

    onDionysusCartieBriefCancelIconButtonClicked(param) {
        const brief = param.object;
        this.getStore().validateCountOfOrder(brief, false, true);
    }

    onDionysusCartieWholeCheckboxChange(param) {
        this.getStore().updateBriefByWholeStatus();
    }

    onDionysusCartieSubmitChipClicked(param) {
        this.getStore().updateInfosOfCartieCookie();
        Router.gotoHermesPage(this);
    }

    onDionysusCartieBriefSureCheckboxChange(param) {
        this.getStore().updateWholeStatusByBrief();
    }

    getWrapInjectStyleOfDionysusCartiePriceOfDiscountTypography(cartie) {
        return Util.getVisibleOrNone(false, true);
    }

    getBriefPriceB4Discount(brief) {
        const origin = super.getBriefPriceB4Discount(brief);
        return `＄${origin}`
    }
}

export default ModularizedDionysusCartieComponent;
