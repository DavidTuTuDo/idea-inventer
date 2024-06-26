const edit = true;
import BaseEstablishDesktopFinanceStore from "./BaseEstablishDesktopFinanceStore";
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
import Request from "../establishDesktopFinanceRequest";
import Status from "../establishDesktopFinanceStatus";
import BaseStore from "../../base/BaseStore";

class EstablishDesktopFinanceStore extends BaseEstablishDesktopFinanceStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/


    constructor(props) {
        super(props);
        this.setIndexOfSequenceDisabled(true)
    }

    invalidate() {
        this.setIndexOfSequence(_.indexOf(this.getParentNode().getFinances(), this) + 1);
    }

    /** 1.匯款 2.刷卡 3.加購 4.簽證 5.雜項 6.費用 7.代轉 */
    getNumberOfSelectedStatus() {
        return _.toNumber(this.getSelectedStatus());
    }

    @computed
    get getFeeOfComputedCreditProcedure() {
        const result = this.getFeeOfPartyB() > 0 ? _.subtract(this.getFeeOfPartyB(), this.getFeeOfCreditProcedure()) : 0;
        this.setFeeOfPartyA(result);
        return result;
    }

    getFeeOfCreditProcedure() {
        if(this.getNumberOfSelectedStatus() === 2) {
            const rate = Util.getNumberOfPercentageToFloat(`${this.getParentNode().getInfo().getRateOfCredit()}%`);
            return _.ceil(_.multiply(this.getFeeOfPartyB(), rate))
        }
        return 0;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishDesktopFinanceStore;
