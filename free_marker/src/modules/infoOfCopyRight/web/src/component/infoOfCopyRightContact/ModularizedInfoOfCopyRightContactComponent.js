const edit = true;
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseInfoOfCopyRightContactComponent from "./BaseInfoOfCopyRightContactComponent";

class ModularizedInfoOfCopyRightContactComponent extends BaseInfoOfCopyRightContactComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightContactUpperAreaGroupOfDetailBtnOfEmailIconButtonClicked(param) {
        this.invokeEMailBehavior(this.getStore().getEmail(), `網頁開發諮詢-[局處單位]`);
    }

    onInfoOfCopyRightContactUpperAreaGroupOfDetailBtnOfPhoneIconButtonClicked(param) {
        this.invokePhoneBehavior(this.getStore().getPhone());
    }

    onInfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbIconButtonClicked(param) {
        this.invokeFacebookApp(this.getStore().getFb());
    }

    onInfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgIconButtonClicked(param) {
        this.invokeInstagramApp(this.getStore().getIg());
    }

    onInfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineIconButtonClicked(param) {
        this.invokeLineApp(this.getStore().getLine(), `明悅您好，請問你軟體開發的問題`);
    }

    onInfoOfCopyRightContactCancelChipClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedInfoOfCopyRightContactComponent;
