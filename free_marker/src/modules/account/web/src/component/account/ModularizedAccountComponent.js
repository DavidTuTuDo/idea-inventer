const edit = true;
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseAccountComponent from "./BaseAccountComponent";
import UserInfoRef from "../../base/BaseUserInfo";
import i18n from "../../i18n";
import AccountUser from "../../store/accountUser";

class ModularizedAccountComponent extends BaseAccountComponent {
    constructor(props) {
        super(props);
        this.setEnableInitFetch(false);
        this.api = new AccountUser();
    }

    onAccountLogoutChipClicked(param) {
        const self = this;
        UserInfoRef.logout(this.getComponentInstance())
            .then()
            .finally(() => {
                self.dismiss();
            });
    }

    getWrapInjectStyleOfAccountAreaOfAppendReaderDiv(account) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getWrapInjectStyleOfAccountAreaOfAppendAdminDiv(account) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    onAccountArrowOfTokenIconButtonClicked(param) {
        this.copyTextToClipboard(UserInfoRef.getUid());
    }

    onAccountArrowOfAppendReaderIconButtonClicked(param) {
        const object = param.object;
        const hash = object.getDialogInputValueOfAccountArrowOfAppendReader();
        if (_.size(hash) > 8)
            this.api.updateUserItem(this.getComponentInstance(), { allowRead: true }, hash).then((result) => {
                this.showInfoSnackMessage(`升級 ${hash} 為「悅讀人」成功`);
            });
    }

    onAccountArrowOfAppendAuthorIconButtonClicked(param) {
        const object = param.object;
        const hash = object.getDialogInputValueOfAccountArrowOfAppendAuthor();
        if (_.size(hash) > 8)
            this.api.updateUserItem(this.getComponentInstance(), { isAuthor: true }, hash).then((result) => {
                this.showInfoSnackMessage(`升級 ${hash} 為「賣家」成功`);
            });
    }

    onAccountArrowOfAppendAdminIconButtonClicked(param) {
        const object = param.object;
        const hash = object.getDialogInputValueOfAccountArrowOfAppendAdmin();
        if (_.size(hash) > 8)
            this.api.updateUserItem(this.getComponentInstance(), { isAdmin: true }, hash).then((result) => {
                this.showInfoSnackMessage(`升級 ${hash} 為「管理者」成功`);
            });
    }

    onLangSelectedChange(value, funcAreaOfEdit) {
        i18n.setLanguage(value);
    }

    onAccountArrowOfAppendBoozeIconButtonClicked(param) {
        Router.gotoGaiaPage(this.getComponentInstance(), "generate");
        this.dismiss();
    }

    onAccountArrowOfGoToMyBoozeIconButtonClicked(param) {
        Router.gotoHestiaPage(this.getComponentInstance());
        this.dismiss();
    }

    onAccountArrowOfMyScheduleIconButtonClicked(param) {
        Router.gotoDemeterPage(this.getComponentInstance());
        this.dismiss();
    }

    onAccountArrowOfMarketSettingIconButtonClicked(param) {
        Router.gotoErosPage(this.getComponentInstance());
        this.dismiss();
    }

    onAccountArrowOfMyReportIconButtonClicked(param) {
        Router.gotoHadesPage(this.getComponentInstance());
        this.dismiss();
    }

    onAccountAreaOfListOfUserOrderDivClicked(param) {
        super.onAccountAreaOfListOfUserOrderDivClicked(param);
    }

    onAccountArrowOfListOfAuthorOrderIconButtonClicked(param) {
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "author", "status");
        this.dismiss();
    }

    onAccountArrowOfListOfUserOrderIconButtonClicked(param) {
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "user", "all");
        this.dismiss();
    }

    onAccountArrowOfCleanCacheIconButtonClicked(param) {
        super.onAccountArrowOfCleanCacheIconButtonClicked(param);
    }

    onAccountArrowOfGoEditModeIconButtonClicked(param) {
        super.onAccountArrowOfGoEditModeIconButtonClicked(param);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedAccountComponent;
