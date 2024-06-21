const edit = true;
import BaseEstablishDesktopStore from "./BaseEstablishDesktopStore";
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

  /** -------------------- async api -------------------- **/
}

export default EstablishDesktopStore;
