const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseInfoOfCopyRightContactComponent from "./BaseInfoOfCopyRightContactComponent";

class ModularizedInfoOfCopyRightContactComponent extends BaseInfoOfCopyRightContactComponent {
    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightContactBtnOfEmailOIconButtonClicked(param) {
        this.invokeEMailBehavior(this.getStore().getEmail(), `網頁開發諮詢-[局處單位]`);
    }

    onInfoOfCopyRightContactBtnOfPhoneOIconButtonClicked(param) {
        this.invokePhoneBehavior(this.getStore().getPhone());
    }

    onInfoOfCopyRightContactFbOIconButtonClicked(param) {
        this.invokeFacebookApp(this.getStore().getFb());
    }

    onInfoOfCopyRightContactIgOIconButtonClicked(param) {
        this.invokeInstagramApp(this.getStore().getIg());
    }

    onInfoOfCopyRightContactLineOIconButtonClicked(param) {
        this.invokeLineApp(this.getStore().getLine(), `明悅您好，請問你軟體開發的問題`);
    }
}

export default ModularizedInfoOfCopyRightContactComponent;
