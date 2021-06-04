/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-06-04-15-31-08
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

    getBannerImageSrc() {
        return 'images/IMG_9348.jpg';
    }

    getPlanPrice(plan) {
        const origin = super.getPlanPrice(plan);
        if(!plan.isTitle())
            return `${origin} 元`;
        return origin;
    }

    getPlanPriceTip(plan) {
        const tip = super.getPlanPriceTip(plan);
        return `${tip} ${this.getDiscount(plan)} 元`
    }

    getDiscount(plan){
        return Math.round(plan.getPrice()/(Number.parseInt(plan.getName().substring(0,1))));
    }

    getInjectStyleOfBuyButton(plan) {
        return { display : plan.isTitle() ? 'none':'visible' };
    }

    getInjectStyleOfPriceTipTypography(plan) {
        return { display : plan.isTitle() ? 'none':'visible' };
    }


    // getPlanPriceTip(plan) {
    //     return + ''+ ${plan.getPrice()}+' 元';
    // }
    //
    // getPlanPrice(plan) {
    //     return super.getPlanPrice(plan)+ '元';
    // }


    /** -------------------- async api -------------------- **/
}

export default PurchaseComponent;
