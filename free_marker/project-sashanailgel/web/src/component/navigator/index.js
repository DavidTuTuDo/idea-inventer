const edit = true;

import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import { utiller as Util } from "utiller";

import Router from "../../router";

class NavigatorComponent extends ModularizedNavigatorComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onNavigatorMenuIconButtonClicked(param) {
        Router.gotoHomePage(this);
    }

    getInjectStyleOfNavigatorMenuIconButton() {
        return Util.getVisibleOrNone(false);
    }
}

export default NavigatorComponent;
