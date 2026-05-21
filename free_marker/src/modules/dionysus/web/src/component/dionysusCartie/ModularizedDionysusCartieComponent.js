const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Router from "../../router";
import BaseDionysusCartieComponent from "./BaseDionysusCartieComponent";

class ModularizedDionysusCartieComponent extends BaseDionysusCartieComponent {
    constructor(props) {
        super(props);
        const self = this;
    }

    onDionysusCartieBriefIncreaseIconButtonClicked(param) {
        const brief = param.object;
        this.getStore().validateCountOfOrder(brief);
    }

    onDionysusCartieBriefCountOfSubmitTextFieldChange(param) {
        const brief = param.object;
        if (brief.getCountOfSubmit() >= brief.getQuantity()) brief.setCountOfSubmit(brief.getQuantity());
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
        return { disabled: brief.quantity <= 0 || !brief.visibility };
    }

    getInjectStyleOfDionysusCartieBriefDiv(brief) {
        return {
            backgroundColor:
                brief.quantity <= 0 || !brief.visibility
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
            .then((itemsOfChecked) => Router.gotoHermesPage(self, { priceB4Transport: self.getStore().getPriceOfTotal(), itemsOfChecked }))
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
