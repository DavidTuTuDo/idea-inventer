const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseDionysusTextFetcherComponent from "./BaseDionysusTextFetcherComponent";

class ModularizedDionysusTextFetcherComponent extends BaseDionysusTextFetcherComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusTextFetcherAppendChipClicked(param) {
        this.getStore().onTextFetcherAppendNotify().then();
    }

    onDionysusTextFetcherLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusTextFetcherTitleMainTextFieldChange(param) {
        this.getStore().onTextFetcherChangedNotify().then();
    }

    onDionysusTextFetcherTitleClearIconButtonClicked(param) {
        const title = param.object;
        title.removeMain();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusTextFetcherComponent;
