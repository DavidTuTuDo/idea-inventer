const edit = true;

import _ from "lodash";
import { makeObservable, action, observable } from "mobx";
import BaseNavigatorStore from "./BaseNavigatorStore";
import UserInfo from "../../base/BaseUserInfo";

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
        let editButton = UserInfo.isAdmin() ? "編輯" : "無";
        self.setToEditMode(editButton);
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        if (_.isArray(this.getKeywords())) {
            this.initialCompleteSuggestBehavior(_.uniqBy(this.getKeywords(), "label"));
        }
    }

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.setState("stable");
    }

    getLabelOfComplete() {
        return `無搜尋的項目`;
    }
}

export default ModularizedNavigatorStore;
