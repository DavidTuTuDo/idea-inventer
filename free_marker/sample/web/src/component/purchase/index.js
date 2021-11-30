/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-06-04-15-31-08
 */
import {observer, inject} from "mobx-react";
import BasePurchaseComponent from "./BasePurchaseComponent";
import Router from "../../router";
import PurchaseOrder from "../../store/purchasePurchaseOrder";
import PurchaseListener from "../../store/purchasePurchaseListener";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import UserInfo from '../../userInfo';
import _ from "lodash";

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

    getInjectStyleOfPurchasePlanBuyButton(plan) {
       return Util.getVisibleOrNone(!plan.isTitle())
    }

    getInjectStyleOfPurchasePlanPriceTipTypography(plan) {
        return Util.getVisibleOrNone(!plan.isTitle())
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
        new PurchaseOrder().submitPurchaseOrderItem(this,{
            price: plan.price,
            productInfos: [{pid: plan.getPid(), quantity: 1}],
            listenerId,
            uid,
        }).then((result) => {
            self.subscribe(
                new PurchaseListener().restfulListenPurchaseListenerItem(uid, listenerId, (result) => {
                    self.handleRestFulResult(result, async (data) => {
                        window.open(data.paymentUrl);
                    }).then()
                },this)
            );
        })
    }


    /** -------------------- async api -------------------- **/
}

export default PurchaseComponent;
