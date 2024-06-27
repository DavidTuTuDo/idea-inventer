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

    /** 旅客明細小計
     *  ==> 所有旅客的售價總額
     * */
    @computed
    get getComputedTotalOfPricePartyB() {
        const result = _.sum(this.getVisitors().map(visitor => visitor.getPriceOfPartyB()))
        this.setTotalOfPricePartyB(result);
        return result;
    }

    /** 1.匯款 2.刷卡 3.加購 4.簽證 5.雜項 6.費用 7.代轉
     *  ==> "其他特殊需求加減費用"
     * */
    @computed
    get getComputedTotalOfCustomizePrice() {
        const result = _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 3, 4, 5)).map(each => each.getFeeOfPartyB()))
        this.setTotalOfCustomizePrice(result);
        return result;
    }

    /** 1.匯款 2.刷卡 3.加購 4.簽證 5.雜項 6.費用 7.代轉
     *  ==> 只有 1 和 2 才是收入
     * */
    @computed
    get getComputedTotalOfReceived() {
        const result = _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 1, 2)).map(each => each.getFeeOfPartyB()))
        this.setTotalOfReceived(result);
        return result
    }

    /** 1.匯款 2.刷卡 3.加購 4.簽證 5.雜項 6.費用 7.代轉 */
    @computed
    get getComputedTotalOfNotReceived() {
        const result = _.subtract(this.getFeeOfShouldReceived(), this.getTotalOfReceived())
        this.setTotalOfNotReceived(result);
        return result;
    }

    /** 成員累計的實際售價+其他特殊需求加減費用 */
    getFeeOfShouldReceived() {
        return _.sum([this.getTotalOfCustomizePrice(), ...this.getVisitors().map(visitor => visitor.getPrice())])
    }

    /** 所有雜項的售價(給乙方的) */
    getTotalCustomPriceOfFinancePartyB() {
        return _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 3, 4, 5)).map(each => each.getFeeOfPartyB()));
    }

    /** 所有雜項的成本(甲方付出的成本) */
    getTotalCustomPriceOfFinancePartyA() {
        return _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 3, 4, 5)).map(each => each.getFeeOfPartyA()));
    }

    /** 所有現金匯款收入 */
    getTotalOfCashReceived() {
        return _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 1)).map(each => each.getFeeOfPartyB()))
    }

    /** 所有信用卡收入(扣掉手續費)*/
    getTotalOfCreditPreciseReceived() {
        return _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 2)).map(each => each.getFeeOfPartyA()))
    }

    getTotalOfCreditReceived() {
        return _.sum(_.filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedStatus(), 2)).map(each => each.getFeeOfPartyB()))
    }

    /** 所有旅客的成本總額(不含雜項) */
    getTotalPriceOfVisitorPartyA() {
        return _.sum(this.getVisitors().map(visitor => visitor.getPriceOfPartyA()))
    }

    /** 所有旅客的實際售價(售價-折扣)總額 */
    getTotalPriceOfVisitor() {
        return _.sum(this.getVisitors().map(visitor => visitor.getPrice()))
    }

    /** 當visitor的名字填入時，自動增加下一個欄位*/
    incrementVisitorColumn(visitor) {
        if (_.size(this.getVisitors()) <= _.indexOf(this.getVisitors(), visitor) + 1)
            this.pushVisitors({});
    }

    /** 當visitor的名字填入時，自動增加下一個欄位*/
    incrementFinanceColumn(finance) {
        if (_.size(this.getFinances()) <= _.indexOf(this.getFinances(), finance) + 1)
            this.pushFinance({});
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopStore;
