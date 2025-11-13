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

    onInfoOfCopyRightUpperGroupRightAreaCprtButtonClicked(param) {
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
}

export default ModularizedInfoOfCopyRightComponent;
