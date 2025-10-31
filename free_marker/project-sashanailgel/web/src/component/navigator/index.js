const edit = true;

import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import { utiller as Util } from "utiller";
import _ from "lodash";
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

    onSearchPressed(content) {
        if (_.isObject(content) && content.uid) {
            /** 處理整理過的關鍵字們{參考悅譜} */
        } else if (_.size(content) > 1) Router.gotoDionysusPage(this, content);
        else this.showWarningSnackMessage(`搜尋條件至少2個字元`);
    }
}

export default NavigatorComponent;
