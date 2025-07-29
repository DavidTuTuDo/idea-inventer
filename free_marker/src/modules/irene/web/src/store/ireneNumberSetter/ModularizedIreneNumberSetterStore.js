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
import BaseIreneNumberSetterStore from "./BaseIreneNumberSetterStore";

class ModularizedIreneNumberSetterStore extends BaseIreneNumberSetterStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onNumberSetConfirmed() {
        const func = this.getComponent(true).funcOfDialogCallback();
        const values = this.getRows().map((each) => each.getValue());
        await func(...values);
    }

    /** rows = [...{label:'',value:0}]*/
    async onInitialFetchCompleted(collection) {
        const rows = await this.getComponent().getStore().fetchRowValuesOfNumberSetter();
        this.setRows(...rows);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneNumberSetterStore;
