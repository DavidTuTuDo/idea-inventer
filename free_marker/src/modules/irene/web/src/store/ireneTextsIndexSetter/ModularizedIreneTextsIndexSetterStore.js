const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import {  action } from "mobx";
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
        this.modifyGoTop();
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

    @action
    modifyGoTop() {
        const func = this.getComponent().getStore().enableGopTopOfIndexSetter;
        this.setEnableOfGoTop(_.isFunction(func) ? func() : true);
    }

    async onTextsOfIndexUpdateExecuted() {
        const functionOfSubmitTexts = this.getComponent().getStore().submitTextsOfIndexSetter;
        if (_.isFunction(functionOfSubmitTexts)) await functionOfSubmitTexts(this.getRows().map((each) => each.columnData()));
        else Util.appendError(`87456646 ${this.getComponent().getComponentName()} not implement 'submitTextsOfIndexSetter()'`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextsIndexSetterStore;
