const edit = true;
import BaseEstablishDesktopStore from "./BaseEstablishDesktopStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import { each, filter, indexOf, size, subtract, sum } from 'lodash-es';
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS} from "mobx";

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
        each(this.getVisitors(), (visitor, index, all) => {
            visitor.setIndexOfSequence(index + 1);
        })
    }

    /** 旅客明細小計
     *  ==> 所有旅客的售價總額
     * */
    @computed
    get getComputedTotalOfPricePartyB() {
        const result = sum(this.getVisitors().map(visitor => visitor.getPriceOfPartyB()))
        this.setTotalOfPricePartyB(result);
        return result;
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉
     *  ==> "其他特殊需求加減費用"
     * */
    @computed
    get getComputedTotalOfCustomizePrice() {
        const result = sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 3, 4, 5, 6, 7, 8)).map(each => each.getFeeOfPartyB()))
        this.setTotalOfCustomizePrice(result);
        return result;
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉
     *  ==> 只有 1 2 9 10 才是收入
     * */
    @computed
    get getComputedTotalOfReceived() {
        const result = sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 1, 2, 9, 10)).map(each => each.getFeeOfPartyB()))
        this.setTotalOfReceived(result);
        return result
    }

    /** 現金+支票+刷卡(扣手續費)*/
    getPreciseTotalReceived() {
        return sum([this.getTotalOfCashReceived(),this.getTotalOfCreditPreciseReceived()]);
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉 */
    @computed
    get getComputedTotalOfNotReceived() {
        const result = subtract(this.getFeeOfShouldReceived(), this.getTotalOfReceived())
        this.setTotalOfNotReceived(result);
        return result;
    }

    /** 成員累計的實際售價+其他特殊需求加減費用 */
    getFeeOfShouldReceived() {
        return sum([this.getTotalOfCustomizePrice(), ...this.getVisitors().map(visitor => visitor.getPrice())])
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉
     * 所有雜項的售價(給乙方的) */
    getTotalCustomPriceOfFinancePartyB() {
        return sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 3, 4, 5, 6, 7, 8)).map(each => each.getFeeOfPartyB()));
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉
     * 所有雜項的成本(甲方付出的成本) */
    getTotalCustomPriceOfFinancePartyA() {
        return sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 3, 4, 5, 6, 7, 8)).map(each => each.getFeeOfPartyA()));
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉
     * 所有現金匯款收入 */
    getTotalOfCashReceived() {
        return sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 1, 9, 10)).map(each => each.getFeeOfPartyB()))
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉
     * 所有信用卡收入(扣掉手續費)*/
    getTotalOfCreditPreciseReceived() {
        return sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 2)).map(each => each.getFeeOfPartyA()))
    }

    getTotalOfCreditReceived() {
        return sum(filter(this.getFinances(), finance =>
            Util.isOrEquals(finance.getNumberOfSelectedRequest(), 2)).map(each => each.getFeeOfPartyB()))
    }

    /** 所有旅客的成本總額(不含雜項) */
    getTotalPriceOfVisitorPartyA() {
        return sum(this.getVisitors().map(visitor => visitor.getPriceOfPartyA()))
    }

    /** 所有旅客的實際售價(售價-折扣)總額 */
    getTotalPriceOfVisitor() {
        return sum(this.getVisitors().map(visitor => visitor.getPrice()))
    }

    /** 當visitor的名字填入時，自動增加下一個欄位*/
    incrementVisitorColumn(visitor) {
        if (size(this.getVisitors()) <= indexOf(this.getVisitors(), visitor) + 1)
            this.pushVisitors({});
    }

    /** 當visitor的名字填入時，自動增加下一個欄位*/
    incrementFinanceColumn(finance) {
        if (size(this.getFinances()) <= indexOf(this.getFinances(), finance) + 1)
            this.pushFinance({});
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopStore;
