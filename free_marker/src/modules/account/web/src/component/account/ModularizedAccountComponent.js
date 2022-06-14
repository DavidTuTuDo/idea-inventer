import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../.";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseAccountComponent from "./BaseAccountComponent";
import UserInfo from "../../base/BaseUserInfo";

class ModularizedAccountComponent extends BaseAccountComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.setEnableInitFetch(false);
    }

    onAccountFuncAreaOfEditLogoutButtonClicked(param) {
      const self = this;
      UserInfoRef.logout(this.getComponentInstance()).then().finally(() => {
          self.dismiss();
        })
    }

    onAccountFuncAreaOfEditCopyUserIdButtonClicked(param) {
        this.copyTextToClipboard(UserInfo.getUid());
    }

    getInjectStyleOfAccountFuncAreaOfEditToEditModeButton(funcAreaOfEdit) {
        return Util.getVisibleOrNone(UserInfo.isAdmin());
    }

    onAccountFuncAreaOfEditToEditModeButtonClicked(param) {
        Router.gotoEditPage(this.getComponentInstance());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedAccountComponent;
