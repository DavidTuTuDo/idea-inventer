const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseDionysusQuantitySetterStore from "./BaseDionysusQuantitySetterStore";

class ModularizedDionysusQuantitySetterStore extends BaseDionysusQuantitySetterStore {
    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const variants = await this.getComponent().getStore().getVariantsOfCombination();
        this.setVariants(...variants);
    }

    async fetchRowValuesOfNumberSetter() {
        return [{ label: "數量(均)", value: 1 }];
    }
}

export default ModularizedDionysusQuantitySetterStore;
