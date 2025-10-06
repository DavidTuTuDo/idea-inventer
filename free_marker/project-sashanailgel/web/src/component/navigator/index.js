const edit = true;

import { observer } from "mobx-react";
import { inject } from "mobx-react";
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import { utiller as Util } from "utiller";
import _ from "lodash";
import Router from "../../router";

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onNavigatorMenuIconButtonClicked(param) {
        Router.gotoHomePage(this);
    }

    onSearchPressed(content) {
        if (_.isObject(content) && content.uid) {
            Router.gotoBacchusDetailPage(this, content.uid);
        }
    }
}

export default NavigatorComponent;
