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


class MainStore extends BaseMainStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async deleteOrder(order) {
        await order.deleteOrderItem(this.getComponent());
    }

    async updateOrder(orderOfLast) {
        const order = _.find(this.getOrders(), (order) => _.isEqual(order.id, orderOfLast.id));
        order.initial(orderOfLast);
    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
