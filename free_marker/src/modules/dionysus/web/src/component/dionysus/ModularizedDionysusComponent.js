const edit = true;

import { utiller as Util } from "utiller";
import Router from "../../router";
import BaseDionysusComponent from "./BaseDionysusComponent";
import UserInfo from "../../base/BaseUserInfo";
import { size } from "lodash-es";

class ModularizedDionysusComponent extends BaseDionysusComponent {
    constructor(props) {
        super(props);
        /** cool man, r u here*/
    }

    getBoozePhotoOfHead(booze) {
        const url = super.getBoozePhotoOfHead(booze);
        return url;
    }

    onDionysusBoozeDivClicked(param) {
        const booze = param.object;
        if (UserInfo.isEditMode) return booze.toggleChecked();
        Router.gotoBacchusDetailPage(this.getComponentInstance(), booze.getId(), booze.columnData());
    }

    getListInjectStyleOfDionysusSelectBoundTab(dionysus) {
        return Util.getVisibleOrNone(size(this.getStore().getSelectBounds()) > 1, true);
    }

    onDionysusSelectBoundTabClicked(param) {
        const self = this;
        const select = param.object;
        if (param.changed) {
            self.scrollToTop();
            this.getStore().setHasNextPageBehavior(true);
            Util.syncDelay(1)
                .then(() => this.getStore().fetchBoozeBySelectedTab())
                .then(() => self.invalidateNextPageBehavior());
        }
    }

    isValidOfParamOfKeyword(keyword) {
        return true;
    }

    getInjectStyleOfDionysusBoozeCheckedCheckbox(booze) {
        return Util.getVisibleOrNone(UserInfo.isEditMode, true);
    }

    getWrapInjectStyleOfDionysusBatchDiv(dionysus) {
        return Util.getVisibleOrNone(UserInfo.isEditMode, true);
    }

    onDionysusBatchDismissChipClicked(param) {
        UserInfo.modifyEditMode(false);
    }

    onDionysusBatchMv2HeadChipClicked(param) {
        this.exeAsyncT(this.getStore().mvChecked2Head());
    }

    /** 商品下架 */
    onDionysusBatchDownChipClicked(param) {
        this.exeAsyncT(this.getStore().mvChecked2Down());
    }
}

export default ModularizedDionysusComponent;
