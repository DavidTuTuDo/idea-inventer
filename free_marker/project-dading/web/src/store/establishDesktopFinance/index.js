const edit = true;
import BaseEstablishDesktopFinanceStore from "./BaseEstablishDesktopFinanceStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import Request from "../establishDesktopFinanceRequest";
import Status from "../establishDesktopFinanceStatus";
import BaseStore from "../../base/BaseStore";

class EstablishDesktopFinanceStore extends BaseEstablishDesktopFinanceStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/


  constructor(props) {
    super(props);
    this.setCreateTimeDisabled(true);
    this.setIndexOfSequenceDisabled(true)
  }

  invalidate() {
    this.setIndexOfSequence(_.indexOf(this.getParentNode().getFinances(), this) + 1);
  }

  getNumberOfSelectedStatus() {
    return _.toNumber(this.getSelectedStatus());
  }

  @computed
  get getFeeOfComputedCreditProcedure() {
    const rate = Util.getNumberOfPercentageToFloat(`${this.getParentNode().getInfo().getRateOfCredit()}%`);
    const result = this.getFeeOfPartyB() > 0 ? _.subtract(this.getFeeOfPartyB(),_.ceil(_.multiply(this.getFeeOfPartyB(),rate))) :  0;
    this.setFeeOfPartyA(result);
    return result;
  }

  /** -------------------- async api -------------------- **/
}

export default EstablishDesktopFinanceStore;
