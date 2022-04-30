import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
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
import firebaser from "../../base/CommonFirebaseHelper";
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
        return this.getToolBar().getComplete().getSelectedComplete();
    }

    clearKeywordDetail() {
        this.getToolBar().getComplete().setSelectedComplete(null);
    }

    @action
    updateEditButtonStatus() {
        const self = this;
        let editButton = UserInfo.isAdmin() ? '編輯' : '無';
        self.getToolBar().setToEditMode(editButton);
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection)
        this.fuse = new Fuse(this.getKeywords() ?? [], {shouldSort: true, includeScore: true, keys: ['label', 'value']})
    }

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.setState('stable');
    }

    @action
    async invalidateSuggestion(keyword) {
        const self = this;
        if (!Util.isUndefinedNullEmpty(keyword) && this.fuse) {
            Util.executeTimeoutTask(async () => {
                const suggests = this.fuse.search(keyword).map(each => each.item);
                self.getToolBar().setSuggestCompletes(...suggests);
            }, 500, "NAVIGATOR_SEARCH_FUNCTION");
        }
    }

}

export default ModularizedNavigatorStore;
