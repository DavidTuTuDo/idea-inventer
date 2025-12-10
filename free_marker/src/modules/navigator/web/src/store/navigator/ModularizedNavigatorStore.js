const edit = true;

import _ from "lodash";
import { makeObservable, action, observable } from "mobx";
import BaseNavigatorStore from "./BaseNavigatorStore";
import NavigatorKeywordStore from "../navigatorKeyword";
import UserInfo from "../../base/BaseUserInfo";
import { utiller as Util } from "utiller";

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

    getTitle() {
        return UserInfo.getNameOfBrand() ?? super.getTitle();
    }

    @action
    updateEditButtonStatus() {
        const self = this;
        let editButton = UserInfo.isAdmin() ? "編輯" : "無";
        self.setToEditMode(editButton);
    }

    onInitialFetchCompleted = async (collection) => {
        await super.onInitialFetchCompleted(collection);
        this.fetchKeywordInBackgroundBehavior(this).then();
        const nameOfBrand = this.getGlobalPerspective().getNameOfBrand();
        if (!_.isEmpty(nameOfBrand)) UserInfo.setNameOfBrand(nameOfBrand);
        UserInfo.setGlobalPerspective(this.getGlobalPerspective().columnData());

        const { Application } = require("../../");
        Application.getInfoOfCopyRightStore();
    };

    fetchKeywordInBackgroundBehavior = async (self) => {
        try {
            const result = await self.apiOfKeyword.fetchKeywords();
            if (_.isArray(self.getKeywords())) self.initialCompleteSuggestBehavior(_.uniqBy(result, "label"));
            Util.appendInfo(`已拿取完關鍵字！`);
        } catch (error) {
            Util.appendError(`fetchKeywordInBackgroundBehavior => ${error.message}`);
        } finally {
            self.setWhetherKeywordWasFetching(false);
        }
    };

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.setState("stable");
        this.apiOfKeyword = new NavigatorKeywordStore();
    }

    getLabelOfComplete() {
        return `無搜尋的項目`;
    }
}

export default ModularizedNavigatorStore;
