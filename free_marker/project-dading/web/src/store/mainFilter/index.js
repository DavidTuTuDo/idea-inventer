const edit = true;
import BaseMainFilterStore from "./BaseMainFilterStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Config from "../../config";

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
