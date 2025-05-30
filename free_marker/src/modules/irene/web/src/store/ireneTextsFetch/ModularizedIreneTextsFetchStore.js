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
import BaseIreneTextsFetchStore from "./BaseIreneTextsFetchStore";

class ModularizedIreneTextsFetchStore extends BaseIreneTextsFetchStore {
    constructor(props) {
        super(props);
    }

    async onTextsFetchChangedNotify() {
        this.invalidate();
        await this.hookOfParamObject.onTextsFetchChanged();
    }

    async onTextsFetchAppendNotify() {
        await this.hookOfParamObject.onTextsFetchAppendClicked();
    }

    async onInitialFetchBeginning() {
        this.hookOfParamObject = this.getComponent(true).propsMobX().paramObject;
    }

    invalidate() {
        if (this.hookOfParamObject.autoIncrementOfTextsFetch()) {
            console.log(`4546465215 invalidate()`);
            /** 自動增加index =>. 1. 2. 3.*/
            this.getTitles().forEach((title, index) => title.setIndex(`${_.sum([index, 1])}. `));
            /** 填入 =>. 1. 2. 3.*/
            if (_.size(_.last(this.getTitles()).getContent()) > 0 && _.size(this.getTitles()) < this.getMaximumRowOfTextsFetch()) this.pushTitle();
        }
    }

    getMaximumRowOfTextsFetch() {
        if (this.hookOfParamObject && this.hookOfParamObject.getMaximumRowOfTextsFetch) return _.toNumber(this.hookOfParamObject.getMaximumRowOfTextsFetch());
        else return 300;
    }

    async onInitialCompleted(props) {
        const exist = this.hookOfParamObject && this.hookOfParamObject.getDefaultTextsOfTextFetch;
        const texts = exist ? await this.hookOfParamObject.getDefaultTextsOfTextFetch() : [];
        if (_.size(texts) > 0) {
            this.cleanTitles();
            this.pushTitles(...texts);
        }
        this.invalidate();
    }
}

export default ModularizedIreneTextsFetchStore;
