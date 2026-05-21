const edit = true;

import BaseEpayTestStore from "./BaseEpayTestStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Functions from "../../functions";
import EpayOrderStore from "../epayPreciseOrder";

class EpayTestStore extends BaseEpayTestStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        // this.storeOfEPayProduct = new EPayProductStore();
        this.storeOfEPayOrder = new EpayOrderStore();
    }

    async performEPayCreateOrderBehavior() {
        // const products = await this.storeOfEPayProduct.fetchPreciseProducts(this.getComponent());
        //
        // const productOne = Util.getRandomItemOfArray(products);
        // await Util.syncDelay(10);
        // const productTwo = Util.getRandomItemOfArray(products);
        // await Util.syncDelay(10);
        // const productThree = Util.getRandomItemOfArray(products);
        // await Util.syncDelay(10);
        // const productFour = Util.getRandomItemOfArray(products);
        //
        // const items = [
        //     {
        //         id: productOne.id,
        //         quantity: Util.getRandomValue(1, 3)
        //     },
        //     {
        //         id: productTwo.id,
        //         quantity: Util.getRandomValue(1, 3)
        //     },
        //     {
        //         id: productThree.id,
        //         quantity: Util.getRandomValue(1, 3)
        //     },
        //     {
        //         id: productFour.id,
        //         quantity: Util.getRandomValue(1, 3)
        //     }
        // ];

        const result = await Functions.httpOnCallCreateEPayPreciseOrder(this.getComponent(), { items });
        this.setIdOfCurrentPreciseOrder(result.idOfPreciseOrder);
    }

    async performEPayCancelOrderBehavior() {
        await Functions.httpOnCallCancelPreciseOrder(this.getComponent(), { idOfPreciseOrder: this.getIdOfCurrentPreciseOrder() });
        this.getComponent().showInfoSnackMessage(`已成功cancel ${this.getIdOfCurrentPreciseOrder()}`);
    }

    async performCheckoutByLinePayBehavior() {
        const result = await Functions.httpOnCallCheckoutByLinePay(this.getComponent(), { idOfPreciseOrder: this.getIdOfCurrentPreciseOrder() });
        this.getComponent().routeToLinePayCheckoutPage(JSON.stringify(result));
    }

    async performCheckoutByECPayBehavior() {
        const result = await Functions.httpOnCallCheckoutByECPay(this.getComponent(), { idOfPreciseOrder: this.getIdOfCurrentPreciseOrder() });
        this.getComponent().renderHtmlOfDocument(result.textOfRender);
    }

    async performECPayPageById() {
        const id = this.getIdOfPreciseOrderInput();
        if (!Util.isUndefinedNullEmpty(id)) {
            const order = await this.storeOfEPayOrder.fetchPreciseOrderItem(this.getComponent(), id);
            const textOfRender = order.contentOfRender;
            this.getComponent().renderHtmlOfDocument(textOfRender);
        } else {
            this.getComponent().showInfoSnackMessage(`輸入匡不可為空`);
        }
    }

    async performLinePayPageById() {
        const id = this.getIdOfPreciseOrderInput();
        if (!Util.isUndefinedNullEmpty(id)) {
            const order = await this.storeOfEPayOrder.fetchPreciseOrderItem(this.getComponent(), id);
            const textOfRender = order.contentOfRender;
            this.getComponent().routeToLinePayCheckoutPage(textOfRender);
        } else {
            this.getComponent().showInfoSnackMessage(`輸入匡不可為空`);
        }
    }

    /** -------------------- async api -------------------- **/
}

export default EpayTestStore;
