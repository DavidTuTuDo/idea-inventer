const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseIreneQrcodeStore from "./BaseIreneQrcodeStore";

class ModularizedIreneQrcodeStore extends BaseIreneQrcodeStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialCompleted(props) {
        await super.onInitialCompleted(props);
        if (this.getUseRemit()) this.setTip(`（點擊複製匯款帳號）`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneQrcodeStore;
