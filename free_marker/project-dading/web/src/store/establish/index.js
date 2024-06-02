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
import OrderStore from '../mainOrder';

class EstablishStore extends BaseEstablishStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfOrder = new OrderStore();
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        this.setBalanceDisabled(true);
        this.initialDestinationSuggestBehavior(Config.COUNTRY_OF_TRAVEL);
    }

    result = () => {
        const submit = this.columnData();
        submit.destination = _.isObject(submit.destination) ? submit.destination.value : '0';
        submit.idOfOrder = UserInfoRef.getUid()
        return submit;
    }

    async submitOrder() {
        const result = await this.apiOfOrder.submitOrderItem(this.getComponent(), this.result());
        Application.getMainStore().pushOrdersByIndex(-1, result.value);
        this.setId(result.value.id);
    }

    async updateOrder() {
        const bean = this.result();
        await this.apiOfOrder.updateOrderItem(this.getComponent(), bean, bean.id);
        Application.getMainStore().updateOrder(bean);
    }

    decorate(result) {
        const origin = super.decorate(result);
        const numberOfDestination = _.toNumber(origin.destination);
        origin.destination = numberOfDestination > 0 ? _.find(Config.COUNTRY_OF_TRAVEL, ['value', `${numberOfDestination}`]) : undefined;
        return origin;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishStore;
