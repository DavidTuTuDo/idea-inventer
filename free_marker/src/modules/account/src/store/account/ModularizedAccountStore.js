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
    await this.onInitialFetchSucceed(collection);
    const user = Cookie.getUser();
    if(UserInfoRef.isValidUser(user)) {
      this.setUrlOfHeadPhoto(user.photoURL);
      this.getFuncAreaOfEmail().getStateAreaOfEmail().setValueOfEmail(user.email)
      this.getFuncAreaOfName().getStateAreaOfName().setValueOfName(user.displayName)
      this.getFuncAreaOfId().getStateAreaOfId().setValueOfId(user.uid);
    }
  }

  /** -------------------- async api -------------------- **/
}
export default ModularizedAccountStore;
