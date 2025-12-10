const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusPriceSetterStore from "./BaseDionysusPriceSetterStore";

class ModularizedDionysusPriceSetterStore extends BaseDionysusPriceSetterStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const variants = await this.getComponent().getStore().getVariantsOfCombination();
        this.setVariants(...variants);
    }

    async fetchRowValuesOfNumberSetter() {
        return [
            { label: "售價", value: "0" }
            // { label: "原價(均)", value: "120" }
        ];
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusPriceSetterStore;
