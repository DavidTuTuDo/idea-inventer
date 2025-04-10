const edit = true;
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
import AccountUser from '../../store/accountUser'

class ModularizedAccountComponent extends BaseAccountComponent {

    constructor(props) {
        super(props);
        this.setEnableInitFetch(false);
        this.api = new AccountUser();
    }

    onAccountFuncAreaOfEditLogoutButtonClicked(param) {
        const self = this;
        UserInfoRef.logout(this.getComponentInstance()).then().finally(() => {
            self.dismiss();
        })
    }

    getInjectStyleOfAccountFuncAreaOfEditBtnOfJoinReaderButton(funcAreaOfEdit) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getInjectStyleOfAccountFuncAreaOfEditBtnOfJoinAdminButton(funcAreaOfEdit) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
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

    onAccountFuncAreaOfEditBtnOfJoinReaderButtonClicked(param) {
        const object = param.object;
        const hash = object.getDialogInputValueOfAccountFuncAreaOfEditBtnOfJoinReader();
        if (_.size(hash) > 8)
            this.api.updateUserItem(this.getComponentInstance(), {allowRead: true}, hash).then((result) => {
                this.showInfoSnackMessage(`升級 ${hash} 為 ALLOW READ 成功`);
            })
    }

    onAccountFuncAreaOfEditBtnOfJoinAdminButtonClicked(param) {
        const object = param.object;
        const hash = object.getDialogInputValueOfAccountFuncAreaOfEditBtnOfJoinAdmin();
        if (_.size(hash) > 8)
            this.api.updateUserItem(this.getComponentInstance(), {isAdmin: true}, hash).then((result) => {
                this.showInfoSnackMessage(`升級 ${hash} 為 ADMIN 成功`);
            })

    }

    onAccountCancelChipClicked(param) {
        this.dismiss()
    }

    onLangSelectedChange(value, funcAreaOfEdit) {
        i18n.setLanguage(value);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedAccountComponent;
