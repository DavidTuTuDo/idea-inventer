const edit = true;
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import ModularizedInfoOfCopyRightComponent from "./ModularizedInfoOfCopyRightComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";

@inject("infoOfCopyRight")
@observer
class InfoOfCopyRightComponent extends ModularizedInfoOfCopyRightComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectStyleOfInfoOfCopyRightUpperGroupLeftAreaBusinessButton(leftArea) {
        return Util.getVisibleOrNone(false);
    }

    /** -------------------- async api -------------------- **/
}

export default InfoOfCopyRightComponent;
