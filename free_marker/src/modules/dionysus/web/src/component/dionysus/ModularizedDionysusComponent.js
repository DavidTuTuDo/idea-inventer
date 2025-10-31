const edit = true;

import { utiller as Util } from "utiller";
import Router from "../../router";
import BaseDionysusComponent from "./BaseDionysusComponent";

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
        Router.gotoBacchusDetailPage(this.getComponentInstance(), booze.getId(), booze.columnData());
    }

    getListInjectStyleOfDionysusSelectBoundTab(dionysus) {
        return Util.getVisibleOrNone(_.size(this.getStore().getSelectBounds()) > 1, true);
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
}

export default ModularizedDionysusComponent;
