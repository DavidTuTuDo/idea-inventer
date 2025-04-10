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
import Fuse from 'fuse.js';
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import BaseNavigatorStore from "./BaseNavigatorStore";
import UserInfo from "../../base/BaseUserInfo";
import firebaser from "../../base/FirebaseHelper";
import CommonPoolHelper from "../../base/CommonPoolHelper";

class ModularizedNavigatorStore extends BaseNavigatorStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    @observable
    drawerOpenStatus = false;

    @action
    setDrawerOpenStatus(status) {
        this.drawerOpenStatus = status;
    }

    getDrawerOpenStatus() {
        return this.drawerOpenStatus;
    }

    getSuggestKeywordDetail() {
        return this.getSelectedComplete();
    }

    clearKeywordDetail() {
        this.removeSelectedComplete();
        this.toggleKeyOfComplete();
    }

    @action
    updateEditButtonStatus() {
        const self = this;
        let editButton = UserInfo.isAdmin() ? '編輯' : '無';
        self.setToEditMode(editButton);
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        if (_.isArray(this.getKeywords())) {
            this.initialCompleteSuggestBehavior(_.uniqBy(this.getKeywords(), 'label'))
        }
    }

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.setState('stable');
    }

    getLabelOfComplete() {
        return `無搜尋的項目`;
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

}

export default ModularizedNavigatorStore;
