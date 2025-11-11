const edit = true;

import BaseMainStore from "./BaseMainStore";
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
import InterestingOfFunction from "../mainInterestingOfFunction";
import HotSinger from "../mainHotSinger";
import HotRhythm from "../mainHotRhythm";
import PromotedBanner from "../mainPromotedBanner";
import TraitOfMainUsage from "../mainTraitOfMainUsage";
import BaseStore from "../../base/BaseStore";

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
