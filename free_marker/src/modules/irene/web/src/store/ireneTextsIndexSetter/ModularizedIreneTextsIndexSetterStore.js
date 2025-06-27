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

    @action
    modifyTabOrder2Top(tab) {
        Util.mutateIndexOfArrayItem(this.getRows(), tab);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextsIndexSetterStore;
