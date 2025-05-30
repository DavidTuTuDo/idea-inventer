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
import BaseDionysusErosComponent from "./BaseDionysusErosComponent";

class ModularizedDionysusErosComponent extends BaseDionysusErosComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusErosArrowOfLinepaySetIconButtonClicked(param) {
        this.getStore().setSelected("linepay");
    }

    onDionysusErosArrowOfTabCreatorIconButtonClicked(param) {
        this.getStore().setSelected("tab");
    }

    onDionysusErosArrowOfBrandNameIconButtonClicked(param) {
        this.getStore().setSelected("name");
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusErosComponent;
