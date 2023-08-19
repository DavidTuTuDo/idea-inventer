import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseAccountComponent from "./BaseAccountComponent";
import UserInfoRef from "../../base/BaseUserInfo";
import i18n from '../../i18n';
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
        this.copyTextToClipboard(UserInfoRef.getUid());
    }

    getInjectStyleOfAccountFuncAreaOfEditToEditModeButton(funcAreaOfEdit) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    onAccountFuncAreaOfEditToEditModeButtonClicked(param) {
        Router.gotoEditPage(this.getComponentInstance());
    }

    onLangSelectedChange(value, funcAreaOfEdit) {
        console.log(value)
        i18n.setLanguage(value);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedAccountComponent;
