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
import BaseIreneTextFetchStore from "./BaseIreneTextFetchStore";

class ModularizedIreneTextFetchStore extends BaseIreneTextFetchStore {
    constructor(props) {
        super(props);
    }

    async onTextFetchChangedNotify() {
        this.invalidate();
        await this.hookOfParamObject.onTextFetchChanged(this.getContent());
    }

    async onTextFetchAppendNotify() {
        await this.hookOfParamObject.onTextFetchAppendClicked(this.getContent());
    }

    async onInitialFetchBeginning() {
        this.hookOfParamObject = this.getComponent(true).propsMobX().paramObject;
    }

    async onInitialCompleted(props) {
        if (this.hookOfParamObject && this.hookOfParamObject.getDefaultTitleOfTextFetch) this.setTitle(this.hookOfParamObject.getDefaultTitleOfTextFetch());

        if (this.hookOfParamObject && this.hookOfParamObject.getDefaultTextOfTextFetch) this.setContent(this.hookOfParamObject.getDefaultTextOfTextFetch());
    }

    invalidate() {}
}

export default ModularizedIreneTextFetchStore;
