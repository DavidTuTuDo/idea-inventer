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
    const nodeOfAddition = this.getParentNode();
    nodeOfAddition.pushMember(nodeOfAddition.columnData());
    nodeOfAddition.getComponent().showInfoSnackMessage(`新增團員成功`);
    /** 還要放進 establish 裡面的 member */
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionMemberStore;
