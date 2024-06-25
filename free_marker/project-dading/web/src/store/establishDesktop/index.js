const edit = true;
import BaseEstablishDesktopStore from "./BaseEstablishDesktopStore";
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
import Fuse from "fuse.js";
import moment from "moment";
import BaseStore from "../../base/BaseStore";

class EstablishDesktopStore extends BaseEstablishDesktopStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    invalidate() {
        this.getFinances().map(item => item.invalidate());
        this.getVisitors().map(item => item.invalidate());
    }

    moveItemToTop(visitor) {
        this.removeVisitors(visitor);
        this.pushVisitorsByIndex(-1, visitor);
        this.refreshVisitorIndexOfSequence();
    }

    refreshVisitorIndexOfSequence() {
        _.each(this.getVisitors(), (visitor, index, all) => {
            visitor.setIndexOfSequence(index + 1);
        })
    }

    @computed
    get getComputedTotalOfPricePartyB() {
        const result = _.sum(this.getVisitors().map(visitor => visitor.getPriceOfPartyB()))
        this.setTotalOfPricePartyB(result);
        return result;
    }

    @computed
    get getComputedTotalOfCustomizePrice() {
        const result = _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 3, 4, 5)).map(each => each.getFeeOfPartyB()))
        this.setTotalOfCustomizePrice(result);
        return result;
    }

    @computed
    get getComputedTotalOfReceived() {
        const result = _.sum(this.getFinances().map(finance => finance.getFeeOfPartyB()));
        this.setTotalOfReceived(result);
        return result
    }

    @computed
    get getComputedTotalOfNotReceived() {
        const received = _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 1, 2)).map(each => each.getFeeOfPartyB()))
        const result = _.subtract(this.getTotalOfReceived(), received)
        this.setTotalOfNotReceived(result);
        return result;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopStore;
