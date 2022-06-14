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
  runInAction, override,
} from "mobx";
import BaseNavigatorToolBarStore from "./BaseNavigatorToolBarStore";
import SuggestComplete from "../navigatorToolBarSuggestComplete";

class ModularizedNavigatorToolBarStore extends BaseNavigatorToolBarStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  @override
  setSuggestCompletes(...items) {
    const self = this;
    items = _.uniqBy(items,'label');
    if (items !== undefined && _.isArray(items)) {
      this.suggestCompletes.length = 0;
      this.suggestCompletes.push(
          ...items.map((each) =>
              each instanceof SuggestComplete
                  ? each
                  : new SuggestComplete({...each, parentNode: self})
          )
      );
    } else {
      this.suggestCompletes.length = 0;
    }
  }
  /** -------------------- async api -------------------- **/
}
export default ModularizedNavigatorToolBarStore;
