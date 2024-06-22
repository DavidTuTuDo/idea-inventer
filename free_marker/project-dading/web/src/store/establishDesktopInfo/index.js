const edit = true;
import BaseEstablishDesktopInfoStore from "./BaseEstablishDesktopInfoStore";
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
import Fuse from "fuse.js";
import StatusOfSend from "../establishDesktopInfoStatusOfSend";
import DestinationSuggest from "../establishDesktopInfoDestinationSuggest";
import Salesman from "../establishDesktopInfoSalesman";
import moment from "moment";
import BaseStore from "../../base/BaseStore";

class EstablishDesktopInfoStore extends BaseEstablishDesktopInfoStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setIdDisabled(true);
  }

  /** -------------------- async api -------------------- **/
}

export default EstablishDesktopInfoStore;
