const edit = true;
import BaseMainStore from "./BaseMainStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS} from "mobx";
import Order from "../mainOrder";
import AreaOfFunc from "../mainAreaOfFunc";
import BaseStore from "../../base/BaseStore";
import Establish from '../establish';

class MainStore extends BaseMainStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.establish =  new Establish();
    }

    async deleteOrder(order) {
        await order.deleteOrderItem(this.getComponent());
    }

    async updateOrder(orderOfLast) {
        const order = _.find(this.getOrders(), (order) => _.isEqual(order.id, orderOfLast.id));
        order.initial(orderOfLast);
        order.invalidate(this.establish);
    }

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        this.invalidate();
        return result
    }

    invalidate() {
        this.getOrders().map(order => order.invalidate(this.establish))
    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
