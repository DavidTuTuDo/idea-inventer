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
import BaseIreneTextsFetchComponent from "./BaseIreneTextsFetchComponent";

class ModularizedIreneTextsFetchComponent extends BaseIreneTextsFetchComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneTextsFetchAppendChipClicked(param) {
        this.getStore().onTextsFetchAppendNotify().then();
    }

    onIreneTextsFetchLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneTextsFetchTitleContentTextFieldChange(param) {
        this.getStore().onTextsFetchChangedNotify().then();
    }

    onIreneTextsFetchTitleClearIconButtonClicked(param) {
        const title = param.object;
        title.removeContent();
    }
}

export default ModularizedIreneTextsFetchComponent;
