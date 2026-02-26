const edit = true;

import Config from "../../config";
import BaseInfoOfCopyRightComponent from "./BaseInfoOfCopyRightComponent";
import Router from "../../router";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { isMobile } from "react-device-detect";

class ModularizedInfoOfCopyRightComponent extends BaseInfoOfCopyRightComponent {
    constructor(props) {
        super(props);
    }

    getInjectStyleOfInfoOfCopyRightRefundNTurnPolicyButton(infoOfCopyRight) {
        return Util.getVisibleOrNone(Config.useCartie);
    }

    getInjectStyleOfInfoOfCopyRightCprtButton(infoOfCopyRight) {
        return Util.getVisibleOrNone(Config.useCartie ? !isMobile : false);
    }

    onInfoOfCopyRightCprtButtonClicked(param) {
        const self = this;
        this.showInfoSnackMessage(`當前版本：${Config.VERSION_OF_PACKAGE_JSON}`, {
            name: "首頁",
            task: async () => Router.gotoHomePage(self)
        });
    }

    getInjectStyleOfInfoOfCopyRightContactButton(infoOfCopyRight) {
        return Util.getVisibleOrNone(false);
    }

    onInfoOfCopyRightFbOIconButtonClicked(param) {
        this.invokeFacebookApp(this.getStore().getFb());
    }

    onInfoOfCopyRightIgOIconButtonClicked(param) {
        this.invokeInstagramApp(this.getStore().getIg());
    }

    onInfoOfCopyRightLineOIconButtonClicked(param) {
        this.invokeLineApp(this.getStore().getLine());
    }

    getInjectStyleOfInfoOfCopyRightFbOIconButton(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getFb()));
    }

    getInjectStyleOfInfoOfCopyRightIgOIconButton(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getIg()));
    }

    getInjectStyleOfInfoOfCopyRightLineOIconButton(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getLine()));
    }

    getInjectStyleOfInfoOfCopyRightColDiv(infoOfCopyRight) {
        return Util.getVisibleOrNone(infoOfCopyRight.getReady());
    }

    getInjectStyleOfInfoOfCopyRightCompanyOTypography(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getCompanyO()));
    }

    getWrapInjectStyleOfInfoOfCopyRightPhoneOTypography(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getPhoneO()));
    }

    getWrapInjectStyleOfInfoOfCopyRightUnifiedBTypography(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getUnifiedB()));
    }

    getWrapInjectStyleOfInfoOfCopyRightAddressOTypography(infoOfCopyRight) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(infoOfCopyRight.getAddressO()));
    }
}

export default ModularizedInfoOfCopyRightComponent;
