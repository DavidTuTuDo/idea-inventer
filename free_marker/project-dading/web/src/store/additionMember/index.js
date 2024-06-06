const edit = true;
import BaseAdditionMemberStore from "./BaseAdditionMemberStore";
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
import PayMethod from "../additionMemberPayMethod";
import Citizen from "../additionMemberCitizen";
import Age from "../additionMemberAge";
import Gender from "../additionMemberGender";
import moment from "moment";
import BaseStore from "../../base/BaseStore";

class AdditionMemberStore extends BaseAdditionMemberStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async joinMember2Order(obj = this) {
    Application.getEstablishStore().pushSingleMember(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`新增團員${this.getName()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  async updateMember2Order(obj = this) {
    Application.getEstablishStore().updateSingleMember(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`更新團員${this.getName()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionMemberStore;
