import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseInfoOfCopyRightContentComponent from "./BaseInfoOfCopyRightContentComponent";

class ModularizedInfoOfCopyRightContentComponent extends BaseInfoOfCopyRightContentComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightContentProjectDivClicked(param) {
        const project = param.object;
        if (Util.isUndefinedNullEmpty(project.getRoute()) || _.isEqual(project.getRoute(), 'empty'))
            this.showInfoSnackMessage(`施工中，請稍後再試`)
        else
            this.handleProjectRouter(project.getRoute())

    }

    handleProjectRouter(route) {
        this.gotoExternalUrl(route);
    }

    onInfoOfCopyRightContentCancelButtonClicked(param) {
        this.dismiss();
    }


    /** -------------------- async api -------------------- **/
}

export default ModularizedInfoOfCopyRightContentComponent;
