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
import BaseIreneTextFetchComponent from "./BaseIreneTextFetchComponent";

class ModularizedIreneTextFetchComponent extends BaseIreneTextFetchComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneTextFetchAppendChipClicked(param) {
        this.getStore().onTextFetcherAppendNotify().then();
    }

    onIreneTextFetchLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneTextFetchContentTextFieldChange(param) {
        this.getStore().onTextFetcherChangedNotify().then();
    }

    onIreneTextFetchClearIconButtonClicked(param) {
        const title = param.object;
        title.removeContent();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextFetchComponent;
