const edit = true;
import {inject} from "mobx-react";
import BaseCartieComponent from "./BaseCartieComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Router from '../../router';
import {observer} from "mobx-react";

@inject("cartie")
@observer
class CartieComponent extends BaseCartieComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        const self = this;
    }


    onCartieBriefIncreaseIconButtonClicked(param) {
        const brief = param.object
        this.getStore().validateCountOfOrder(brief);

    }

    onCartieBriefDecreaseIconButtonClicked(param) {
        const brief = param.object
        this.getStore().validateCountOfOrder(brief, false);
    }

    onCartieBriefCancelIconButtonClicked(param) {
        const brief = param.object;
        brief.remove();
    }

    onCartieSubmitChipClicked(param) {
        Router.gotoHermesPage(this);
    }

    /** -------------------- async api -------------------- **/
}

export default CartieComponent;
