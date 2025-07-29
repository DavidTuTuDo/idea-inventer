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
