const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Booze from "../dionysusBooze";
import BaseDionysusStore from "./BaseDionysusStore";

class ModularizedDionysusStore extends BaseDionysusStore {

  constructor(props) {
    super(props);
    this.api = new Booze();
  }

  fetchBoozeBySelectedTab = async () => {
    this.cleanBoozes();
    this.cleanBoozeConditions();
    this.setHasPageItems(true);
    this.cleanBoozeNextIds();
    this.lastItemOfBooze = undefined;

    const valueOfCurrentTab = this.getValueOfSelectClickedTab();
    if(valueOfCurrentTab > 0)
      this.pushBoozeConditions({type: 'where', params: ['valueOfType', '==', this.getValueOfSelectClickedTab()]});
    await Util.syncDelay(20);
    await this.fetch(this.getComponent());

    // const boozes = await this.fetchBoozes(this.getComponent());
    // this.pushBoozes(...boozes);
  }
}

export default ModularizedDionysusStore;
