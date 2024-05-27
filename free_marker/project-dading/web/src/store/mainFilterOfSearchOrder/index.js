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
import moment from "moment";
import BaseStore from "../../base/BaseStore";

class MainFilterOfSearchOrderStore extends BaseMainFilterOfSearchOrderStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.pushDestinationSuggests(...Config.COUNTRY_OF_TRAVEL);
  }


    /** -------------------- async api -------------------- **/
}

export default MainFilterOfSearchOrderStore;
