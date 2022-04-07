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
import BaseNavigatorAppBarToolBarCompleteStore from "./BaseNavigatorAppBarToolBarCompleteStore";

class ModularizedNavigatorAppBarToolBarCompleteStore extends BaseNavigatorAppBarToolBarCompleteStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getLabelOfInput() {
    return '請輸入歌手/歌曲'
  }

  /** -------------------- async api -------------------- **/
}
export default ModularizedNavigatorAppBarToolBarCompleteStore;
