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

    getListInjectStyleOfDionysusSelectTab(dionysus) {
        return Util.getVisibleOrNone(_.size(this.getStore().getSelects()) > 1, true);
    }

    onDionysusSelectTabClicked(param) {
        const self = this;
        const select = param.object;
        if (param.changed) {
            self.scrollToTop();
            this.getStore().setHasPageItems(true);
            Util.syncDelay(1)
                .then(() => this.getStore().fetchBoozeBySelectedTab())
                .then(() => self.invalidateNextPageBehavior());
        }
    }
}

export default ModularizedDionysusComponent;
