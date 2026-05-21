const edit = true;

import BaseMainStore from "./BaseMainStore";
import { size, sortBy } from 'lodash-es';

class MainStore extends BaseMainStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const main = this.getTraitOfMainUsage();
        if (size(main.hotRhythm) > 0) this.setHotRhythms(...main.hotRhythm);
        if (size(main.hotSinger) > 0) this.setHotSingers(...main.hotSinger);
        if (size(main.interestingOfFunction) > 0) this.setInterestingOfFunctions(...sortBy(main.interestingOfFunction, "indexOfSequence"));
    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
