const edit = true;
import BaseEstablishVisitorStore from "./BaseEstablishVisitorStore";
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
import BaseStore from "../../base/BaseStore";

class EstablishVisitorStore extends BaseEstablishVisitorStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setIndexOfSequenceDisabled(true)
  }

  invalidate() {
    this.setIndexOfSequence(_.indexOf(this.getParentNode().getVisitors(), this) + 1);
  }

  /** -------------------- async api -------------------- **/
}

export default EstablishVisitorStore;
