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
import BaseNavigatorCredentialStore from "./BaseNavigatorCredentialStore";

class ModularizedNavigatorCredentialStore extends BaseNavigatorCredentialStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  exist(){
    return Util.or(
        !_.isEmpty(this.getIdToken()),
        !_.isEmpty(this.getOauthIdToken())
    )
  }
  /** -------------------- async api -------------------- **/
}
export default ModularizedNavigatorCredentialStore;
