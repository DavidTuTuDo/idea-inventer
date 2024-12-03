const edit = true;
import BaseHermesStore from "./BaseHermesStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";

class HermesStore extends BaseHermesStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  @computed
  get getComputedPriceOfTotal() {
    return 0;
  }

  /** -------------------- async api -------------------- **/
}

export default HermesStore;
