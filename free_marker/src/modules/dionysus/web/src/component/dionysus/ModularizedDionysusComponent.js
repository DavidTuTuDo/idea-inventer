const edit = true;
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseDionysusComponent from "./BaseDionysusComponent";

class ModularizedDionysusComponent extends BaseDionysusComponent {

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
}

export default ModularizedDionysusComponent;
