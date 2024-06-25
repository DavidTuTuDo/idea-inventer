const edit = true;
import BaseEstablishDesktopVisitorStore from "./BaseEstablishDesktopVisitorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS, override} from "mobx";


class EstablishDesktopVisitorStore extends BaseEstablishDesktopVisitorStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setIndexOfSequenceDisabled(true)
  }

  invalidate() {
    this.setIndexOfSequence(_.indexOf(this.getParentNode().getVisitors(), this) + 1);
  }

  @computed
  get getComputedPrice() {
    const value = this.getPriceOfPartyB() - this.getDiscount();
    this.setPrice(value);
    return value;
  }

  @computed
  get getComputedFeeOfProfit() {
    const value = this.getPrice() - this.getPriceOfPartyA();
    this.setFeeOfProfit(value);
    return value;
  }

  /** -------------------- async api -------------------- **/
}

export default EstablishDesktopVisitorStore;
