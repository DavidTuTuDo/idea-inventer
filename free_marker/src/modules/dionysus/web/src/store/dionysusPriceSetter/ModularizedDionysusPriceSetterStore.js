const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
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
