const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusPriceSetterComponent from "./BaseDionysusPriceSetterComponent";

const useRandomPriceB4Discount = true;
class ModularizedDionysusPriceSetterComponent extends BaseDionysusPriceSetterComponent {
    constructor(props) {
        super(props);
    }

    onDionysusPriceSetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusPriceSetterBatchUpdateChipClicked(param) {
        const self = this;
        self.exeAsyncT({task:this.getComponentInstance()
            .getStore()
            .onVariantsPriceUpdate(
                self.getStore()
                    .getVariants()
                    .map((each) => this.normalize(each)),
                self
            )})
    }

    onDionysusPriceSetterVariantUpdateIconButtonClicked(param) {
        this.exeAsyncT({task:this.getComponentInstance()
            .getStore()
            .onVariantPriceUpdate(
                this.normalize(param.object),
                this.getStore()
                    .getVariants()
                    .map((each) => this.normalize(each))
            )})
    }

    getInjectStyleOfDionysusPriceSetterVariantUpdateIconButton(variant) {
        return Util.getVisibleOrHidden(variant.existing, true);
    }

    getInjectStyleOfDionysusPriceSetterVariantPriceB4DiscountTextField(variant) {
        return Util.getVisibleOrNone(false);
    }

    onNumberSetterDialogSubmit = async (...param) => {
        const price = param.shift();
        const priceB4Discount = param.pop();
        this.getStore()
            .getVariants()
            .forEach((each) => {
                each.setPrice(price);
                each.setPriceB4Discount(priceB4Discount);
            });
    };

    normalize = (variant) => {
        if (!useRandomPriceB4Discount) return variant;
        const price = variant.getPrice();
        const priceB4 = variant.getPriceB4Discount();
        /** 後續價格後，發現折扣後的價格更高，就必須要normalize */
        if (price > 0 || price <= priceB4) variant.setPriceB4Discount(this.getValueOfSpecificPrice(price));
        return variant;
    };

    /**
     * 隨機回傳 price 的 1.1 ~ 1.3 倍，條件：
     * - 為整數
     * - 個位數為 5 或 0
     * - 必須大於原 price
     */
    getValueOfSpecificPrice = (price) => {
        const min = Math.ceil(price * 1.1);
        const max = Math.floor(price * 1.3);

        // 建立所有符合條件的數值清單
        const candidates = _.filter(_.range(min, max + 1), (n) => {
            const lastDigit = n % 10;
            return (lastDigit === 0 || lastDigit === 5) && n > price;
        });

        return _.sample(candidates) ?? price + 5; // 若沒找到，保底回傳 price + 5
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusPriceSetterComponent;
