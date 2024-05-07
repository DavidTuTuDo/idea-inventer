import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseInfoOfCopyRightComponent from "./BaseInfoOfCopyRightComponent";

class ModularizedInfoOfCopyRightComponent extends BaseInfoOfCopyRightComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightUpperGroupRightAreaCprtButtonClicked(param) {
        this.showInfoSnackMessage(`當前版本：${Config.VERSION_OF_PACKAGE_JSON}`);
    }

    onInfoOfCopyRightGroupOfSocialMediaFbIconButtonClicked(param) {
        this.invokeFacebookApp(this.getStore().getFb());
    }

    onInfoOfCopyRightGroupOfSocialMediaIgIconButtonClicked(param) {
        this.invokeInstagramApp(this.getStore().getIg());
    }

    onInfoOfCopyRightGroupOfSocialMediaLineIconButtonClicked(param) {
        this.invokeLineApp(this.getStore().getLine(), `明悅您好，請問你軟體開發的問題`);

    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedInfoOfCopyRightComponent;
