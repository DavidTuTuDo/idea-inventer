const edit = true;
import BaseAdditionStore from "./BaseAdditionStore";
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
import Member from "../additionMember";
import BaseStore from "../../base/BaseStore";

class AdditionStore extends BaseAdditionStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async batchUpdateMember2Order(obj = this) {
    Application.getEstablishStore().setBatchMember(...this.getMembers().map(member=> member.columnData()));
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`批次更新成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
    /** 還要放進 establish 裡面的 member */
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionStore;
