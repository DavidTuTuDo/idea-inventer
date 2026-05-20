const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import BaseDionysusBacchusComponent from "./BaseDionysusBacchusComponent";
import Router from "../../router";

class ModularizedDionysusBacchusComponent extends BaseDionysusBacchusComponent {
    constructor(props) {
        super(props);
    }

    getListInjectStyleOfDionysusBacchusBanDiv(dionysusBacchus) {
        return Util.getVisibleOrNone(_.size(dionysusBacchus.getBans()) > 0);
    }

    getWrapInjectStyleOfDionysusBacchusStatementTypography(dionysusBacchus) {
        return Util.getVisibleOrNone(_.size(dionysusBacchus.getStatement()) > 0);
    }

    onDionysusBacchusBackToHomeChipClicked(param) {
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
        if (booze) {
            Router.gotoGaiaPage(this, booze.id, booze);
        } else {
            this.showWarningSnackMessage(`發生錯誤，請稍後再試`);
        }
    }

    // ==========================================
    // UI Dialog 輔助方法 (共用邏輯)
    // ==========================================
    openBriefDialogWithNotes(notes) {
        this.getPretendDivAlertDialogRef().open();

        /** 太早設定會被clean */
        Util.syncDelay(1).then(() => {
            this.App()
                .getDionysusPaymentBriefStore()
                .setNotes(...notes);
        });
    }

    // ==========================================
    // 支付相關 (Payment)
    // ==========================================
    getNotsOfPayments(eros) {
        if (!eros) return [];
        const notes = [];

        if (eros.hasECPay) {
            notes.push({
                img: "https://www.ecpay.com.tw/Content/themes/WebStyle20131201/images/service/ecpay_fb.png",
                title: "綠界支付 (信用卡/ATM)"
            });
        }
        if (eros.hasLinePay) {
            notes.push({
                img: "https://play-lh.googleusercontent.com/WNcisToVJ5ANAxuxgzDIZQQUK_8YEQLD68onD1NtiPQiCso82iLSnME8KiBex7jUTdA",
                title: "LINE PAY支付"
            });
        }
        if (eros.hasDirectPay) {
            notes.push({
                img: "https://cdn-icons-png.flaticon.com/512/3233/3233814.png",
                title: "掃碼/轉帳付款"
            });
        }
        return notes;
    }

    onDionysusBacchusAreaOfPayDivClicked(param) {
        const eros = this.getStore().getErosPublic();
        this.openBriefDialogWithNotes(this.getNotsOfPayments(eros));
    }

    getInjectStyleOfDionysusBacchusAreaOfPayDiv(dionysusBacchus) {
        const eros = dionysusBacchus.getErosPublic();
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(eros) && _.size(this.getNotsOfPayments(eros)) > 0);
    }

    getNotsOfTransport(eros) {
        if (!eros) return [];
        const notes = [];

        if (eros.enableOfCOD) {
            notes.push({
                img: "https://cdn-icons-png.flaticon.com/512/2769/2769339.png",
                title: `「貨到付」滿 ${eros.thresholdOfFreeShipByCOD} 免運`
            });
        }
        if (eros.whetherShipByStorePickup) {
            notes.push({
                img: "https://cdn-icons-png.flaticon.com/512/862/862836.png",
                title: `「超取」滿 ${eros.thresholdOfFreeShipByStorePickup} 免運`
            });
        }
        if (eros.whetherHomeDelivery) {
            notes.push({
                img: "https://cdn-icons-png.flaticon.com/512/411/411763.png",
                title: `「宅配」滿 ${eros.thresholdOfFreeShipByHomeDelivery} 免運`
            });
        }
        if (eros.whetherShipByRapidly) {
            notes.push({
                img: "https://cdn-icons-png.flaticon.com/512/3859/3859412.png",
                title: `「當日到」滿 ${eros.thresholdOfFreeShipByRapidly} 免運`
            });
        }
        if (eros.whetherPickupByBuyerSelf) {
            notes.push({
                img: "https://cdn-icons-png.flaticon.com/512/756/756463.png",
                title: `提供自取服務`
            });
        }
        return notes;
    }

    onDionysusBacchusAreaOfShippingDivClicked(param) {
        const eros = this.getStore().getErosPublic();
        this.openBriefDialogWithNotes(this.getNotsOfTransport(eros));
    }

    getInjectStyleOfDionysusBacchusAreaOfShippingDiv(dionysusBacchus) {
        const eros = dionysusBacchus.getErosPublic();
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(eros) && _.size(this.getNotsOfTransport(eros)) > 0);
    }
}

export default ModularizedDionysusBacchusComponent;
