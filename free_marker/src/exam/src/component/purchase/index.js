/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-05-31-15-09-13
 */
import {observer, inject} from "mobx-react";
import BasePurchaseComponent from "./BasePurchaseComponent";

@inject("purchase")
@observer
class PurchaseComponent extends BasePurchaseComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectStyleOfBuyButton(plan) {
        console.log(plan.getPid(),plan.isTitle());
        return {visibility: plan.isTitle() ? 'hidden' : 'visible'}
    }

    onBuyButtonClicked(param) {
        console.log(param.object.pid)
    }

    /** -------------------- async api -------------------- **/
}

export default PurchaseComponent;
