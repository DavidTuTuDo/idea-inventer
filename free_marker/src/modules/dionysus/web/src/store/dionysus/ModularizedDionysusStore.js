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

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        await Util.syncDelay(1);

        if (collection && _.size(collection.selects) > 0) {
            this.setSelects(...[{ label: "所有商品", value: 0, type: "all" }, ...collection.selects]);
        }
    }

    fetchBoozeBySelectedTab = async () => {
        this.cleanBoozes();
        this.cleanBoozeConditions();
        this.setHasPageItems(true);
        this.cleanBoozeNextIds();
        this.lastItemOfBooze = undefined;
        const valueOfCurrentTab = this.getValueOfSelectClickedTab();
        if (valueOfCurrentTab > 0) this.pushBoozeConditions({ type: "where", params: ["category", "array-contains", this.getValueOfSelectClickedTab()] });
        await Util.syncDelay(20);
        const boozes = this.enrichBoozes(await this.fetchBoozes(this.getComponent()));
        this.setBoozes(...boozes);
    };
}

export default ModularizedDionysusStore;
