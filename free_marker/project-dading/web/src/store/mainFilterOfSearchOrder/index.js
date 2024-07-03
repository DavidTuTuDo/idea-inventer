const edit = true;
import BaseMainFilterOfSearchOrderStore from "./BaseMainFilterOfSearchOrderStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS} from "mobx";

class MainFilterOfSearchOrderStore extends BaseMainFilterOfSearchOrderStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {

        super(props);
        const self = this;
    }

  /** -------------------- async api -------------------- **/
}

export default MainFilterOfSearchOrderStore;
