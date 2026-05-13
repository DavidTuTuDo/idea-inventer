const edit = true;
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import Config from "../../config";
import Router from "../../router";
import BaseNavigatorComponent from "./BaseNavigatorComponent";

class NavigatorComponent extends ModularizedNavigatorComponent {
    constructor(props) {
        super(props);
    }

    onNavigatorEditIconButtonClicked(param) {
        this.getStore().onNavigatorEditIconButtonClicked(param);
    }

    getInjectStyleOfNavigatorEditIconButton(navigator) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin(), true);
    }
}

export default NavigatorComponent;
