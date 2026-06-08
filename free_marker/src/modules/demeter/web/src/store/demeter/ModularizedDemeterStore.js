const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import libpath from "path";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDemeterStore from "./BaseDemeterStore";

class ModularizedDemeterStore extends BaseDemeterStore {
    constructor(props) {
        super(props);
    }

    async onInitialFetchBeginning() {
        this.clean();
    }
}

export default ModularizedDemeterStore;
