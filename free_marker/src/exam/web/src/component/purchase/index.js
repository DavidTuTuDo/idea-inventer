/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-06-04-15-31-08
 */
import {observer, inject} from "mobx-react";
import BasePurchaseComponent from "./BasePurchaseComponent";
import Router from "../../Router";
import PurchaseOrder from "../../store/purchasePurchaseOrder";
import PurchaseListener from "../../store/purchasePurchaseListener";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import UserInfo from '../../userInfo';

@inject("purchase")
@observer
class PurchaseComponent extends BasePurchaseComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getBannerImageSrc() {
    }

    getPurchasePlanPrice(plan) {
        const origin = super.getPurchasePlanPrice(plan);
        if (!plan.isTitle())
            return `${origin} 元`;
        return origin;
    }

    getInjectStyleOfPurchasePlanBuyButton(plan) {
        return {display: plan.isTitle() ? 'none' : 'visible'};
    }

    getInjectStyleOfPurchasePlanPriceTipTypography(plan) {
        return {display: plan.isTitle() ? 'none' : 'visible'};
    }

    onBuyButtonClicked(param) {
        if (!UserInfo.isLoginInSucceed()) {
            Router.gotoLoginPage(this);
            return;
        }
        const self = this;
        const plan = param.object;
        const uid = UserInfo.getUid();
        const listenerId = Util.getRandomHash(25);
        new PurchaseOrder().submitPurchaseOrderItem({
            price: plan.price,
            productInfos: [{pid: plan.getId(), quantity: 1}],
            listenerId,
            uid,
        }).then((result) => {
            self.subscribe(
                new PurchaseListener().listenPurchaseListenerItem(uid, listenerId, (data, error) => {
                    console.log(`dataContent==> `, data, `error===> `, error);
                    if (data) {
                        window.open(data.paymentUrl);
                    }
                })
            );
        })
    }


    /** -------------------- async api -------------------- **/
}

export default PurchaseComponent;
