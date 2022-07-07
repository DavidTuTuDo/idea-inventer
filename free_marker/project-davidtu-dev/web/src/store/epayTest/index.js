import BaseEpayTestStore from "./BaseEpayTestStore";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import BaseStore from "../../base/BaseStore";
import Functions from "../../functions";
import EPayProductStore from "../epayPreciseProduct";
import EpayOrderStore from "../epayPreciseOrder";

class EpayTestStore extends BaseEpayTestStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.storeOfEPayProduct = new EPayProductStore();
        this.storeOfEPayOrder = new EpayOrderStore();
    }

    async performEPayCreateOrderBehavior() {
        const products = await this.storeOfEPayProduct.fetchPreciseProducts(this.getComponent());

        const productOne = Util.getRandomItemOfArray(products);
        const productTwo = Util.getRandomItemOfArray(products);

        const items = [
            {
                id: productOne.id,
                quantity: Util.getRandomValue(1, 3)
            }, {
                id: productTwo.id,
                quantity: Util.getRandomValue(1, 3)
            }
        ]
        const result = await Functions.httpOnCallCreateEPayPreciseOrder(this.getComponent(), {items});
        this.setIdOfCurrentPreciseOrder(result.idOfPreciseOrder);
    }


    async performCheckoutByEPayBehavior() {
        const result = await Functions.httpOnCallCheckoutByByEcPay(this.getComponent(), {idOfPreciseOrder: this.getIdOfCurrentPreciseOrder()});
        this.getComponent().renderHtmlOfDocument(result.textOfRender);
    }

    async performECPayPageById() {
        const id = this.getIdOfPreciseOrderInput();
        if (!Util.isUndefinedNullEmpty(id)) {
            const order = await this.storeOfEPayOrder.fetchPreciseOrderItem(this.getComponent(), id);
            const textOfRender = order.contentOfRender;
            this.getComponent().renderHtmlOfDocument(textOfRender);
        } else {
            this.getComponent().showInfoSnackMessage(`輸入匡不可為空`)
        }
    }


    /** -------------------- async api -------------------- **/
}

export default EpayTestStore;
