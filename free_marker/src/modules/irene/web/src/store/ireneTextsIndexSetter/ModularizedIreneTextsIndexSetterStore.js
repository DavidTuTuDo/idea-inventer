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
import BaseIreneTextsIndexSetterStore from "./BaseIreneTextsIndexSetterStore";

class ModularizedIreneTextsIndexSetterStore extends BaseIreneTextsIndexSetterStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        await this.fetchListOfTab();
    }

    fetchListOfTab = async () => {
        const functionOfFetchTexts = this.getComponent().getStore().fetchTextsOfIndexSetter;
        if (_.isFunction(functionOfFetchTexts)) this.setRows(...(await functionOfFetchTexts()));
        else Util.appendError(`87456646 ${this.getComponent().getComponentName()} not implement 'fetchTextsOfIndexSetter()'`);
    };

    @action
    modifyTabOrder2Top(tab) {
        Util.mutateIndexOfArrayItem(this.getRows(), tab);
    }

    async onTextsOfIndexUpdateExecuted() {
        const functionOfSubmitTexts = this.getComponent().getStore().submitTextsOfIndexSetter;
        if (_.isFunction(functionOfSubmitTexts)) await functionOfSubmitTexts(this.getRows().map((each) => each.columnData()));
        else Util.appendError(`87456646 ${this.getComponent().getComponentName()} not implement 'submitTextsOfIndexSetter()'`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextsIndexSetterStore;
