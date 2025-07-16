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
import BaseDionysusPriceSetterComponent from "./BaseDionysusPriceSetterComponent";

class ModularizedDionysusPriceSetterComponent extends BaseDionysusPriceSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusPriceSetterLeaveChipClicked(param) {
        this.dismiss();
    }

    onDionysusPriceSetterBatchUpdateChipClicked(param) {
        const self = this;
        this.getComponentInstance().getStore().onVariantsPriceUpdate(this.getStore().getVariants()).then();
    }

    onDionysusPriceSetterVariantUpdateIconButtonClicked(param) {
        this.getComponentInstance().getStore().onVariantPriceUpdate(param.object).then();
    }

    onDionysusPriceSetterVariantCommonChipClicked(param) {
        this.showSuccessSnackMessage(`統一價格`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusPriceSetterComponent;
