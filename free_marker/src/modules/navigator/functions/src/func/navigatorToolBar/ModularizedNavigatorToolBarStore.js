const edit = true;
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../.";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction, override,
} from "mobx";
import BaseNavigatorToolBarStore from "./BaseNavigatorToolBarStore";
import CompleteSuggest from '../navigatorToolBarCompleteSuggest';

class ModularizedNavigatorToolBarStore extends BaseNavigatorToolBarStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getLabelOfInputOfComplete() {
        return `無搜尋的項目`;
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorToolBarStore;
