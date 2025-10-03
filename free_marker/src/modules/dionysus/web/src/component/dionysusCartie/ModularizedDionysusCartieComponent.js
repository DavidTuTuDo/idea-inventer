const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseDionysusCartieComponent from "./BaseDionysusCartieComponent";
import UserInfo from "../../base/BaseUserInfo";

class ModularizedDionysusCartieComponent extends BaseDionysusCartieComponent {
    constructor(props) {
        super(props);
        const self = this;
    }

    onDionysusCartieBriefIncreaseIconButtonClicked(param) {
        const brief = param.object;
        this.getStore().validateCountOfOrder(brief);
    }

    onDionysusCartieBriefDecreaseIconButtonClicked(param) {
        const brief = param.object;
        this.getStore().validateCountOfOrder(brief, false);
    }

    onDionysusCartieBriefCancelIconButtonClicked(param) {
        const brief = param.object;
        this.getStore().validateCountOfOrder(brief, false, true);
    }

    getInjectPropsOfDionysusCartieBriefSureCheckbox(brief) {
        return { disabled: brief.quantity <= 0 };
    }

    getInjectStyleOfDionysusCartieBriefDiv(brief) {
        return {
            backgroundColor:
                brief.quantity <= 0
                    ? "rgba(200, 200, 200, 0.3)" // 售罄樣式
                    : "unset" // 還原為預設 class 設定 };
        };
    }

    onDionysusCartieWholeCheckboxChange(param) {
        this.getStore().updateBriefByWholeStatus();
    }

    onDionysusCartieSubmitChipClicked = (param) => {
        const self = this;
        self.getStore()
            .isCheckedVariantValid()
            .then(() => {
                self.getStore().updateInfosOfCartieCookie();
                Router.gotoHermesPage(self);
            })
            .catch((error) => self.showWarningSnackMessage(error.message));
    };

    onDionysusCartieBriefSureCheckboxChange(param) {
        this.getStore().updateWholeStatusByBrief();
    }

    getWrapInjectStyleOfDionysusCartiePriceOfDiscountTypography(cartie) {
        return Util.getVisibleOrNone(false, true);
    }

    getBriefPriceB4Discount(brief) {
        const origin = super.getBriefPriceB4Discount(brief);
        return `＄${origin}`;
    }
}

export default ModularizedDionysusCartieComponent;
