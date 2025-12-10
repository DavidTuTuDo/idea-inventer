const edit = true;

import Config from "../../config";
import BaseInfoOfCopyRightComponent from "./BaseInfoOfCopyRightComponent";
import Router from "../../router";
import { isMobile } from "react-device-detect";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

class ModularizedInfoOfCopyRightComponent extends BaseInfoOfCopyRightComponent {
    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightCprtButtonClicked(param) {
        this.showInfoSnackMessage(`當前版本：${Config.VERSION_OF_PACKAGE_JSON}`);
        Router.gotoHomePage(this);
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

    getInjectStyleOfInfoOfCopyRightPrivilegeDiv(rightArea) {
        return Util.getVisibleOrNone(!isMobile);
    }

    getInjectStyleOfInfoOfCopyRightFbOIconButton(infoOfCopyRight) {
        super.getInjectStyleOfInfoOfCopyRightFbOIconButton(infoOfCopyRight);
    }

    getInjectStyleOfInfoOfCopyRightIgOIconButton(infoOfCopyRight) {
        super.getInjectStyleOfInfoOfCopyRightIgOIconButton(infoOfCopyRight);
    }

    getInjectStyleOfInfoOfCopyRightLineOIconButton(infoOfCopyRight) {
        super.getInjectStyleOfInfoOfCopyRightLineOIconButton(infoOfCopyRight);
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
