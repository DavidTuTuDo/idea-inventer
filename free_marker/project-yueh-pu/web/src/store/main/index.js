const edit = true;

import BaseMainStore from "./BaseMainStore";
import _ from "lodash";

class MainStore extends BaseMainStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const main = this.getTraitOfMainUsage();
        if (_.size(main.hotRhythm) > 0) this.setHotRhythms(...main.hotRhythm);
        if (_.size(main.hotSinger) > 0) this.setHotSingers(...main.hotSinger);
        if (_.size(main.interestingOfFunction) > 0) this.setInterestingOfFunctions(..._.sortBy(main.interestingOfFunction, "indexOfSequence"));
    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
