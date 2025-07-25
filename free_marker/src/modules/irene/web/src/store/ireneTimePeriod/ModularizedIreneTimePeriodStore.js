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
import BaseIreneTimePeriodStore from "./BaseIreneTimePeriodStore";

class ModularizedIreneTimePeriodStore extends BaseIreneTimePeriodStore {
    constructor(props) {
        super(props);
    }

    onTimeConfirmSelected = async () => {
        const func = this.getComponent(true).funcOfDialogCallback();
    };
}

export default ModularizedIreneTimePeriodStore;
