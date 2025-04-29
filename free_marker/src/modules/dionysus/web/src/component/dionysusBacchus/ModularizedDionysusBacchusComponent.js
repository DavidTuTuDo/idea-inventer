const editor = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import BaseDionysusBacchusComponent from "./BaseDionysusBacchusComponent";

class ModularizedDionysusBacchusComponent extends BaseDionysusBacchusComponent {
    constructor(props) {
        super(props);
        /** i have some where to go home now yeah, right? baby */
    }

    onDionysusBacchusBackToHomeChipClicked(param) {
        // Router.gotoDionysusPage(this);
        this.gotoPreviewPage();
    }

    onDionysusBacchusBoughtChipClicked(param) {
        UserInfoRef.setGotoCartieDirect(true);
    }

    onDionysusBacchusJoinToCartChipClicked(param) {
        UserInfoRef.setGotoCartieDirect(false);
    }
}

export default ModularizedDionysusBacchusComponent;
