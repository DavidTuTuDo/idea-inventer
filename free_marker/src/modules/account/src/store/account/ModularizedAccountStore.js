import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
  makeAutoObservable,
  makeObservable,
  action,
  observable,
  comparer,
  computed,
  autorun,
  runInAction,
} from "mobx";
import BaseAccountStore from "./BaseAccountStore";

class ModularizedAccountStore extends BaseAccountStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async onInitialFetchSucceed(collection) {
    super.onInitialFetchSucceed(collection);
    const userInfo = this.getUserInfo();
    this.setUrlOfHeadPhoto(userInfo.getPhotoURL());
    this.getFuncAreaOfEmail().getStateAreaOfEmail().setValueOfEmail(userInfo.getEmail())
    this.getFuncAreaOfName().getStateAreaOfName().setValueOfName(userInfo.getDisplayName())
    this.getFuncAreaOfId().getStateAreaOfId().setValueOfId(userInfo.getUid());
  }

  /** -------------------- async api -------------------- **/
}
export default ModularizedAccountStore;
