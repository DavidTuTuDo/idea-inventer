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
import BaseDionysusVariantPhotoSetterStore from "./BaseDionysusVariantPhotoSetterStore";

class ModularizedDionysusVariantPhotoSetterStore extends BaseDionysusVariantPhotoSetterStore {
    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const mains = this.getComponent()
            .getStore()
            .getBriefMains()
            .map((each) => each.label);
        const subs = this.getComponent()
            .getStore()
            .getBriefSubs()
            .map((each) => each.label);
        const combinations = Util.generateUidCombinations([mains, subs]);
        this.setVariants(
            ...combinations.map((each) => {
                return { labelOfVariant: Util.getObjectValue(each) };
            })
        );
    }
}

export default ModularizedDionysusVariantPhotoSetterStore;
