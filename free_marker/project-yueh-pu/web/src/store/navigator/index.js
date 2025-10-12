const edit = true;

import ModularizedNavigatorStore from "./ModularizedNavigatorStore";

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
import BaseNavigatorStore from "./BaseNavigatorStore";

class NavigatorStore extends ModularizedNavigatorStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getTitle() {
        return "悅譜";
    }

    /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
