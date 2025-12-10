const edit = true
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import ModularizedInfoOfCopyRightComponent from "./ModularizedInfoOfCopyRightComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import libpath from "path";
import React from "react";
import Cookie from "../../cookie";
import BaseInfoOfCopyRightComponent from "./BaseInfoOfCopyRightComponent";

@inject("infoOfCopyRight")
@observer
class InfoOfCopyRightComponent extends ModularizedInfoOfCopyRightComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectStyleOfInfoOfCopyRightUpperGroupLeftAreaBusinessButton() {
        return Util.getVisibleOrNone(false, true);
    }

    /** -------------------- async api -------------------- **/
}

export default InfoOfCopyRightComponent;
