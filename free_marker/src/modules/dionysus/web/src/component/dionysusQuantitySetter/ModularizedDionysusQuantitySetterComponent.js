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
import BaseDionysusQuantitySetterComponent from "./BaseDionysusQuantitySetterComponent";

class ModularizedDionysusQuantitySetterComponent extends BaseDionysusQuantitySetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusQuantitySetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusQuantitySetterBatchUpdateChipClicked(param) {
        this.getComponentInstance().getStore().onVariantsQuantityUpdate(this.getStore().getVariants()).then();
    }

    onDionysusQuantitySetterVariantUpdateIconButtonClicked(param) {
        this.getComponentInstance().getStore().onVariantQuantityUpdate(param.object).then();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusQuantitySetterComponent;
