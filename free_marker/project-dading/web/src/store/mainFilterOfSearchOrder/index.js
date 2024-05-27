const edit = true;
import BaseMainFilterOfSearchOrderStore from "./BaseMainFilterOfSearchOrderStore";
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
import Agent from "../mainFilterOfSearchOrderAgent";
import Salesman from "../mainFilterOfSearchOrderSalesman";
import MethodOfPayment from "../mainFilterOfSearchOrderMethodOfPayment";
import IsPaid from "../mainFilterOfSearchOrderIsPaid";
import IsDepositPaid from "../mainFilterOfSearchOrderIsDepositPaid";
import SuggestDestination from "../mainFilterOfSearchOrderSuggestDestination";
import Destination from "../mainFilterOfSearchOrderDestination";
import moment from "moment";
import BaseStore from "../../base/BaseStore";
import Fuse from 'fuse.js';

class MainFilterOfSearchOrderStore extends BaseMainFilterOfSearchOrderStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setSuggestDestinations(...Config.COUNTRY_OF_TRAVEL);
    this.fuse = new Fuse(Config.COUNTRY_OF_TRAVEL ?? [], {shouldSort: true, includeScore: true, keys: ['label', 'value']})
  }

  async invalidateDestinationSuggestion(keyword) {
    if (!_.isUndefined(keyword) && this.fuse) {
      Util.executeTimeoutTask(async () => {
        const suggests = this.fuse.search(keyword).map(each => each.item);
        this.setSuggestDestinations(...suggests);
      }, 500);
    }
  }

    /** -------------------- async api -------------------- **/
}

export default MainFilterOfSearchOrderStore;
