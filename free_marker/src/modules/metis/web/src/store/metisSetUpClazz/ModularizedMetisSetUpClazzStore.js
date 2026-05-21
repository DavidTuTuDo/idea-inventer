const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseMetisSetUpClazzStore from "./BaseMetisSetUpClazzStore";

class ModularizedMetisSetUpClazzStore extends BaseMetisSetUpClazzStore {
    async onInitialCompleted(object) {
        await super.onInitialCompleted(object);
        this.setSpecificClass([this.getStartOfSpecificClass(), this.getEndOfSpecificClass()]);
    }
}

export default ModularizedMetisSetUpClazzStore;
