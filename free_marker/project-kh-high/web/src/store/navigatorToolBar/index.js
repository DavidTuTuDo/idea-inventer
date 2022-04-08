import ModularizedNavigatorToolBarStore from "./ModularizedNavigatorToolBarStore";
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
import BaseNavigatorToolBarStore from "./BaseNavigatorToolBarStore";

class NavigatorToolBarStore extends ModularizedNavigatorToolBarStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getTitle() {
    return '悅考'
  }

  /** -------------------- async api -------------------- **/
}
export default NavigatorToolBarStore;
