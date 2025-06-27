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
import BaseIreneTextsIndexSetterComponent from "./BaseIreneTextsIndexSetterComponent";

class ModularizedIreneTextsIndexSetterComponent extends BaseIreneTextsIndexSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onIreneTextsIndexSetterUpdateChipClicked(param) {
        /** 更新順序 */
    }

    onIreneTextsIndexSetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onIreneTextsIndexSetterRowGoTopChipClicked(param) {
        const tab = param.object;
        this.getStore().modifyTabOrder2Top(tab);
    }

    getInjectStyleOfIreneTextsIndexSetterRowGoTopChip(row) {
        return Util.getVisibleOrHidden(_.indexOf(this.getStore().getRows(), row) > 0);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTextsIndexSetterComponent;
