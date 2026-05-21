const edit = true;
import BaseEstablishDesktopFinanceStore from "./BaseEstablishDesktopFinanceStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import { ceil, indexOf, multiply, subtract } from 'lodash-es';
import libpath from "path";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS} from "mobx";

class EstablishDesktopFinanceStore extends BaseEstablishDesktopFinanceStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/


    constructor(props) {
        super(props);
        this.setIndexOfSequenceDisabled(true)
    }

    invalidate() {
        this.setIndexOfSequence(indexOf(this.getParentNode().getFinances(), this) + 1);
    }

    /** 1.匯款 2.刷卡 3.加購行李 4.加購選位 5.房間費用 6.簽證費用 7.簽證費用 8.小孩不佔 9.訂金支票 10.尾款支票 11.開立代轉 */
    getNumberOfSelectedRequest() {
        return Util.toNumber(this.getSelectedRequest());
    }

    @computed
    get getFeeOfComputedCreditProcedure() {
        const result = this.getFeeOfPartyB() > 0 ? subtract(this.getFeeOfPartyB(), this.getFeeOfCreditProcedure()) : 0;
        this.setFeeOfPartyA(result);
        return result;
    }

    getFeeOfCreditProcedure() {
        if(this.getNumberOfSelectedRequest() === 2) {
            const rate = Util.getNumberOfPercentageToFloat(`${this.getParentNode().getInfo().getRateOfCredit()}%`);
            return ceil(multiply(this.getFeeOfPartyB(), rate))
        }
        return 0;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopFinanceStore;
