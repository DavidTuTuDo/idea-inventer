const edit = true;
import {inject} from "mobx-react";
import BaseDionysusComponent from "./BaseDionysusComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {observer} from "mobx-react";
import Router from "../../router";
import Cookie from "../../cookie";

@inject("dionysus")
@observer
class DionysusComponent extends BaseDionysusComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getBoozePhotoOfHead(booze) {
        const url = super.getBoozePhotoOfHead(booze);
        return url;
    }

    onDionysusBoozeDivClicked(param) {
        const booze = param.object;
        Router.gotoBacchusDetailPage(this.getComponentInstance(), booze.getId(), booze.columnData());
    }

    onDionysusSelectTabChange(param) {
        const dionysus = param.object;
    }

    onDionysusSelectTabClicked(param) {
        const self = this;
        const select = param.object;
        if (param.changed) {
            self.scrollToTop();
            Util.syncDelay(1).then(() => this.getStore().fetchBoozeBySelectedTab().then())
        }
    }


    /** -------------------- async api -------------------- **/
}

export default DionysusComponent;
