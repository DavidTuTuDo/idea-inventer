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
        const nameOfBrand = this.getGlobalPerspective().getNameOfBrand();
        if (!Util.isEmpty(nameOfBrand)) UserInfo.setNameOfBrand(nameOfBrand);
        UserInfo.setGlobalPerspective(this.getGlobalPerspective().columnData());

        const { Application } = require("../../");
        const cprt = Application.getInfoOfCopyRightStore();
        cprt.setCompanyO(this.getGlobalPerspective().getCompanyO());
        cprt.setAddressO(this.getGlobalPerspective().getAddressO());
        cprt.setPhoneO(this.getGlobalPerspective().getPhoneO());
        cprt.setUnifiedB(this.getGlobalPerspective().getUnifiedB());
        cprt.setReady(this.getGlobalPerspective().getWhetherDisplaySpecific());
        cprt.setIg(this.getGlobalPerspective().getIgO());
        cprt.setFb(this.getGlobalPerspective().getFbO());
        cprt.setLine(this.getGlobalPerspective().getLineO());
        cprt.setTiktok(this.getGlobalPerspective().getTiktokO());
    };

    fetchKeywordInBackgroundBehavior = async () => {
        try {
            await Util.syncDelay(1);
            const result = await this.apiOfKeyword.fetchKeywords();
            if (Array.isArray(this.getKeywords())) this.initialCompleteSuggestBehavior(_.uniqBy(result, "label"));
            Util.appendInfo(`已拿取完關鍵字！`);
        } catch (error) {
            Util.appendError(`fetchKeywordInBackgroundBehavior => ${error.message}`);
        } finally {
            this.setWhetherKeywordWasFetching(false);
            this.setWhetherSearchMode(true);
        }
    };

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
