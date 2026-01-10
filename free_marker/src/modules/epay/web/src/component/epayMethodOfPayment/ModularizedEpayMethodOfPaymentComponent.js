const edit = true;

import Functions from "../../functions";
import BaseEpayMethodOfPaymentComponent from "./BaseEpayMethodOfPaymentComponent";

class ModularizedEpayMethodOfPaymentComponent extends BaseEpayMethodOfPaymentComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEpayMethodOfPaymentOptionCardClicked(param) {
        const order = this.props.paramObject;
        const typeOfPayment = param.object;

        switch (typeOfPayment.idOfUnique) {
            case "linepay":
                this.exeAsyncT(this.performCheckoutByLinePayBehavior(order.raw.id));
                break;
            case "ecpay":
                this.exeAsyncT(this.performCheckoutByECPayBehavior(order.raw.id));
                break;
        }
        // console.log(prop);
        // console.log(order);
        // console.log(typeOfPayment);
    }

    async performCheckoutByLinePayBehavior(idOfPreciseOrder) {
        const result = await Functions.httpOnCallCheckoutByLinePay(this.getComponentInstance(), { idOfPreciseOrder });
        this.getComponentInstance().routeToLinePayCheckoutPage(JSON.stringify(result));
    }

    async performCheckoutByECPayBehavior(idOfPreciseOrder) {
        const result = await Functions.httpOnCallCheckoutByECPay(this.getComponentInstance(), { idOfPreciseOrder });
        this.getComponentInstance().renderHtmlOfDocument(result.textOfRender);
    }

    /** -------------------- async api -------------------- **/
}
export default ModularizedEpayMethodOfPaymentComponent;
