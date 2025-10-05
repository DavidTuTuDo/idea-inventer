const editor = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import BaseDionysusBacchusComponent from "./BaseDionysusBacchusComponent";
import Router from "../../router";

class ModularizedDionysusBacchusComponent extends BaseDionysusBacchusComponent {
    constructor(props) {
        super(props);
    }

    onDionysusBacchusBackToHomeChipClicked(param) {
        // Router.gotoDionysusPage(this);
        this.gotoPreviewPage();
    }

    onDionysusBacchusBoughtChipClicked(param) {
        Util.appendInfo(`cookie紀錄->直接購買`);
        UserInfoRef.setGotoCartieDirect(true);
    }

    onDionysusBacchusJoinToCartChipClicked(param) {
        Util.appendInfo(`cookie紀錄->加入購物車`);
        UserInfoRef.setGotoCartieDirect(false);
    }

    getInjectStyleOfDionysusBacchusEditChip(dionysusBacchus) {
        return Util.getVisibleOrNone(_.isEqual(dionysusBacchus.booze.idOfAuthor, UserInfoRef.getUid()));
    }

    onDionysusBacchusEditChipClicked(param) {
        const booze = this.getStore().getBooze();
        if (booze) Router.gotoGaiaPage(this, booze.id, booze);
        else this.showWarningSnackMessage(`發生錯誤，請稍後再試`);
    }
}

export default ModularizedDionysusBacchusComponent;
