const edit = true;
import BaseMainFilterStore from "./BaseMainFilterStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";

class MainFilterStore extends BaseMainFilterStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async onInitialCompleted(object) {
    const self = this;
    Util.syncDelay(1).then(() => {
      self.initialDestToSuggestBehavior(Config.COUNTRY_OF_TRAVEL);
      self.setSelectedDestTo(0);
      self.toggleKeyOfDestTo();
    })

  }

  /** -------------------- async api -------------------- **/
}

export default MainFilterStore;
