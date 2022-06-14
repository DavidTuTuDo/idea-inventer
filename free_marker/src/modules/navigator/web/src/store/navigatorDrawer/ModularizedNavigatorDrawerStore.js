import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../.";
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
import BaseNavigatorDrawerStore from "./BaseNavigatorDrawerStore";

class ModularizedNavigatorDrawerStore extends BaseNavigatorDrawerStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async fetch(view) {
    const result = await super.fetch(view);
    if(UserInfoRef.isLoginWithSucceed()){
      result.shortcuts.push(...result.myShortcuts)
    }
    return result;
  }

  /** -------------------- async api -------------------- **/
}
export default ModularizedNavigatorDrawerStore;
