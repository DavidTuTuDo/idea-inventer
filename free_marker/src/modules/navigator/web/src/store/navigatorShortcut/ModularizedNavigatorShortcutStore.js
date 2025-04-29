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
import BaseNavigatorShortcutStore from "./BaseNavigatorShortcutStore";

class ModularizedNavigatorShortcutStore extends BaseNavigatorShortcutStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    isSubOpen() {
        return this.getOpen() === 1;
    }

    @action
    setSubOpen(open) {
        this.setOpen(open ? 1 : 0);
    }

    hasSubItems() {
        return this.getSubs().length > 0;
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorShortcutStore;
