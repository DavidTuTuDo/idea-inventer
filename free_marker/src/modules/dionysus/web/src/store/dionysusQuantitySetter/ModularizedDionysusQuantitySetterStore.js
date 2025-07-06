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
        const mains = this.getComponent()
            .getStore()
            .getBriefMains()
            .map((each) => each.main);
        const subs = this.getComponent()
            .getStore()
            .getBriefSubs()
            .map((each) => each.sub);
        console.log(mains);
        const combinations = Util.generateUidCombinations([mains, subs]);
        this.setVariants(
            ...combinations.map((each) => {
                return { labelOfVariant: Util.getObjectValue(each), quantity: Util.getRandomValue(10, 30) };
            })
        );
    }
}

export default ModularizedDionysusQuantitySetterStore;
