const edit = true;

import BaseEstablishDesktopInfoStore from "./BaseEstablishDesktopInfoStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import { ceil, multiply, subtract, sum } from 'lodash-es';
import libpath from "path";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS} from "mobx";

class EstablishDesktopInfoStore extends BaseEstablishDesktopInfoStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.setIdDisabled(true);
    }

    /** 實際售價 + 其他特殊加減費用 */
    @computed
    get getComputedFeeOfTotal() {
        const result = this.getParentNode().getFeeOfShouldReceived()
        this.setFeeOfTotal(result);
        return result;
    }

    @computed
    get getComputedFeeOfReceived() {
        const result = this.getParentNode().getTotalOfReceived();
        this.setFeeOfReceived(result);
        return result;
    }

    @computed
    get getComputedFeeOfNotReceived() {
        const result = this.getParentNode().getTotalOfNotReceived();
        this.setFeeOfNotReceived(result);
        return result;
    }

    /** */
    @computed
    get getComputedTotalOfNet() {
        const parent = this.getParentNode();
        const net = sum([parent.getTotalPriceOfVisitorPartyA(), parent.getTotalCustomPriceOfFinancePartyA()]);
        this.setTotalOfNet(net);
        return net;

    }

    @computed
    get getComputedFeeOfCashReceived() {
        const fee = this.getParentNode().getTotalOfCashReceived();
        this.setFeeOfCashReceived(fee);
        return fee;
    }

    @computed
    get getComputedFeeOfCreditReceived() {
        const fee = this.getParentNode().getTotalOfCreditReceived();
        this.setFeeOfCreditReceived(fee);
        return fee;
    }

    @computed
    get getComputedFeeOfAgent() {
        const base = subtract(this.getParentNode().getPreciseTotalReceived() ,this.getTotalOfNet());
        const fee = ceil(multiply(base,0.03))
        this.setFeeOfAgent(fee);
        return fee;
    }

    @computed
    get getComputedFeeOfProfit() {
        const income = this.getParentNode().getPreciseTotalReceived()
        const cost = sum([this.getTotalOfNet() , this.getFeeOfAgent()])
        const result = subtract(income, cost);
        this.setFeeOfProfit(result);
        return result;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopInfoStore;
