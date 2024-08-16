const edit = true;
import Config from "../../config";
import BaseInfoOfCopyRightComponent from "./BaseInfoOfCopyRightComponent";
import Router from "../../router";

class ModularizedInfoOfCopyRightComponent extends BaseInfoOfCopyRightComponent {

    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightUpperGroupRightAreaCprtButtonClicked(param) {
        this.showInfoSnackMessage(`當前版本：${Config.VERSION_OF_PACKAGE_JSON}`);
        Router.gotoMainPage(this);
    }

    onInfoOfCopyRightGroupOfSocialMediaFbIconButtonClicked(param) {
        this.invokeFacebookApp(this.getStore().getFb());
    }

    onInfoOfCopyRightGroupOfSocialMediaIgIconButtonClicked(param) {
        this.invokeInstagramApp(this.getStore().getIg());
    }

    onInfoOfCopyRightGroupOfSocialMediaLineIconButtonClicked(param) {
        this.invokeLineApp(this.getStore().getLine());

    }

}

export default ModularizedInfoOfCopyRightComponent;
