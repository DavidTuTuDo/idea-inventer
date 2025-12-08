const edit = true;

import BaseEstablishDesktopInfoStore from "./BaseEstablishDesktopInfoStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
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
        const net = _.sum([parent.getTotalPriceOfVisitorPartyA(), parent.getTotalCustomPriceOfFinancePartyA()]);
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
        const base = _.subtract(this.getParentNode().getPreciseTotalReceived() ,this.getTotalOfNet());
        const fee = _.ceil(_.multiply(base,0.03))
        this.setFeeOfAgent(fee);
        return fee;
    }

    @computed
    get getComputedFeeOfProfit() {
        const income = this.getParentNode().getPreciseTotalReceived()
        const cost = _.sum([this.getTotalOfNet() , this.getFeeOfAgent()])
        const result = _.subtract(income, cost);
        this.setFeeOfProfit(result);
        return result;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopInfoStore;
