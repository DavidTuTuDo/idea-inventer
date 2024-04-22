import ModularizedInfoOfCopyRightUpperGroupStore from "./ModularizedInfoOfCopyRightUpperGroupStore";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
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
import BaseInfoOfCopyRightUpperGroupStore from "./BaseInfoOfCopyRightUpperGroupStore";

class InfoOfCopyRightUpperGroupStore extends ModularizedInfoOfCopyRightUpperGroupStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  /** -------------------- async api -------------------- **/
}

export default InfoOfCopyRightUpperGroupStore;
