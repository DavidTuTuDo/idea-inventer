const edit = true;
import BaseEstablishStore from "./BaseEstablishStore";
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
import Salesman from "../establishSalesman";
import IsPaid from "../establishIsPaid";
import IsDepositPaid from "../establishIsDepositPaid";
import Agent from "../establishAgent";
import moment from "moment";
import MethodOfPayment from "../establishMethodOfPayment";
import BaseStore from "../../base/BaseStore";
import OrderStore from '../mainOrder';

class EstablishStore extends BaseEstablishStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfOrder = new OrderStore();
        this.setBalanceDisabled(true);
    }

    async submitOrder() {
        const bean = this.data();
        const result = await this.apiOfOrder.submitOrderItem(this.getComponent(), bean);
        Application.getMainStore().pushOrdersByIndex(0, result.value);
        this.setId(result.value.id);
    }

    async updateOrder() {
        const bean = this.data();
        await this.apiOfOrder.updateOrderItem(this.getComponent(), bean, bean.id);
        Application.getMainStore().updateOrder(bean);
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishStore;
