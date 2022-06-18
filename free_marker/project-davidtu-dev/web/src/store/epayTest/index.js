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
import EPayProductStore from "../epayProduct";

class EpayTestStore extends BaseEpayTestStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.storeOfEPayProduct = new EPayProductStore();
    }

    async performEPayBehavior() {
        const products = await this.storeOfEPayProduct.fetchProducts(this.getComponent());

        const productOne = Util.getRandomItemOfArray(products);
        const productTwo = Util.getRandomItemOfArray(products);

        const items = [
            {
                id: productOne.id,
                count: Util.getRandomValue(1, 3)
            }, {
                id: productTwo.id,
                count: Util.getRandomValue(1, 3)
            }
        ]


        Functions.httpOnCallCreateEPayPreciseOrder(this.getComponent(), {items}).then();
    }

    /** -------------------- async api -------------------- **/
}

export default EpayTestStore;
