const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseAccountComponent from "./BaseAccountComponent";
import UserInfoRef from "../../base/BaseUserInfo";
import i18n from "../../i18n";
import Config from "../../config";
import AccountUser from "../../store/accountUser";

class ModularizedAccountComponent extends BaseAccountComponent {
    constructor(props) {
        super(props);
        this.setEnableInitFetch(false);
        this.api = new AccountUser();
    }

    onAccountArrowOfLogoutIconButtonClicked(param) {
        const self = this;
        UserInfoRef.logout(this.getComponentInstance())
            .catch((error) => self.showErrorSnackMessage(error.message))
            .finally(() => {
                self.dismiss();
                const { Application } = require("../../");
                const view = Application.getLatestComponent();
                Application.enqueueTask(async (app) => {
                    Router.gotoHomePage(app);
                    await Util.syncDelay(100);
                    app.showWarningSnackMessage(`已完成登出`);
                });
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
                this.showInfoSnackMessage(`升級 ${hash} 為「無限悅讀」成功`);
            });
    }

    onAccountArrowOfAppendAuthorIconButtonClicked(param) {
        const object = param.object;
        const hash = object.getDialogInputValueOfAccountArrowOfAppendAuthor();
        if (_.size(hash) > 8) console.log(`user id =>`, hash);
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
        UserInfoRef.deleteWholeItemFromCart();
    }

    onAccountArrowOfGoEditModeIconButtonClicked(param) {
        super.onAccountArrowOfGoEditModeIconButtonClicked(param);
    }

    getPresetObjOfIreneQrcode() {
        console.log(`我是被需要才被呼叫到的QQQQ`);
        return { href: "https://tw.yahoo.com/?p=us", title: "測試Title", content: "測試content" };
    }

    getWrapInjectStyleOfAccountAreaOfAppendAuthorDiv(account) {
        return Util.getVisibleOrNone(this.isEcommerceEnabled());
    }

    isEcommerceEnabled() {
        return !Util.isUndefinedNullEmpty(Config.EPayType) && !Util.isEqual(Config.EPayType, {});
    }
}

export default ModularizedAccountComponent;
