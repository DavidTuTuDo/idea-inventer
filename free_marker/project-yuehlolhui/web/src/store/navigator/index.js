const edit = true;

import ModularizedNavigatorStore from "./ModularizedNavigatorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import libpath from "path";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseNavigatorStore from "./BaseNavigatorStore";

class NavigatorStore extends ModularizedNavigatorStore {
    /** -------------------- fields -------------------- **/

    @observable
    editTriggerSignal = 0;

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
    }

    @action
    onNavigatorEditIconButtonClicked(param) {
        UserInfoRef.modifyEditMode(true);
        this.editTriggerSignal = Date.now();
    }

    /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
