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
import EpayPreciseOrderStore from "../epayPreciseOrder";
import BaseEpayPurchaseOfHistoryStore from './BaseEpayPurchaseOfHistoryStore';

class ModularizedEpayPurchaseOfHistoryStore extends BaseEpayPurchaseOfHistoryStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.api = new EpayPreciseOrderStore();
    }

    async fetch(view) {
        const state = this.getParamOfTypeOfTabInPath();
        const orders = await this.api.fetchPreciseOrders(this.getComponent(),
            {where: (stmt) => stmt.where('stateOfPayment', '==', state)},
        );
    }

    setCurrentTabByType(type) {
        const tab = _.find(this.getTabs(), (tab) => _.isEqual(tab.getType(), type));
        this.setValueOfSelectedTab(tab.getValue());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayPurchaseOfHistoryStore;
