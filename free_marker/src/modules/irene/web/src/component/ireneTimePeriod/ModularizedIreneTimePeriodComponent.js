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
import BaseIreneTimePeriodComponent from "./BaseIreneTimePeriodComponent";

class ModularizedIreneTimePeriodComponent extends BaseIreneTimePeriodComponent {
    constructor(props) {
        super(props);
    }

    onIreneTimePeriodConfirmChipClicked(param) {
        const self = this;
        this.getStore()
            .onTimeConfirmSelected()
            .then(() => {
                self.dismiss();
            })
            .catch((error) => {
                self.showWarningSnackMessage(error.message);
            });
    }

    onIreneTimePeriodLeaveChipClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneTimePeriodComponent;
