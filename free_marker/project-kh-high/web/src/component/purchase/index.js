/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-06-04-15-31-08
 */
import {observer, inject} from "mobx-react";
import BasePurchaseComponent from "./BasePurchaseComponent";
import Router from "../../router";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import UserInfo from '../../base/BaseUserInfo';
import _ from "lodash";
import Functions from '../../functions';


@inject("purchase")
@observer
class PurchaseComponent extends BasePurchaseComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }


    getPurchasePlanPrice(plan) {
        const origin = super.getPurchasePlanPrice(plan);
        if (!plan.isTitle())
            return `${origin} 元`;
        return origin;
    }

    getInjectStyleOfPurchasePurchasePlanBuyButton(purchasePlan) {
        super.getInjectStyleOfPurchasePurchasePlanBuyButton(purchasePlan);
    }

    getInjectStyleOfPurchasePurchasePlanBuyButton(plan) {
        return Util.getVisibleOrHidden(!plan.isTitle())
    }

    getInjectStyleOfPurchasePurchasePlanPriceTipTypography(plan) {
        return Util.getVisibleOrHidden(!plan.isTitle())
    }

    onPurchasePurchasePlanBuyButtonClicked(param) {
        const self = this;
        const plan = param.object;
        const uid = UserInfo.getUid();
        Functions.httpOnCallFetchLinePayInfo(self, {isMobile: this.isMobileDevice(), pid: plan.getPid()})
            .then((linepayInfo) => {
                this.gotoExternalUrl(linepayInfo.paymentUrl)
            })
    }


    /** -------------------- async api -------------------- **/
}

export default PurchaseComponent;
