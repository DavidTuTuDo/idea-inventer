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
        if (booze) Router.gotoGaiaPage(this, booze.id, booze);
        else this.showWarningSnackMessage(`發生錯誤，請稍後再試`);
    }

    onDionysusBacchusAreaOfPayDivClicked(param) {
        const self = this;
        const eros = this.getStore().getErosPublic();
        const ec = true; //eros.hasECPay; /** 綠界付款 */
        const line = true; // eros.hasLinePay; /** LinePay付款 */
        const directPay = true; // eros.hasDirectPay; /** 掃碼付款 */
        const payments = [];
        if (ec) {
            payments.push({
                img: "https://www.ecpay.com.tw/Content/themes/WebStyle20131201/images/service/ecpay_fb.png", // 使用綠界的 logo 圖片範例
                title: "綠界金流 (信用卡/ATM/超商)"
            });
        }
        if (line) {
            payments.push({
                img: "https://play-lh.googleusercontent.com/WNcisToVJ5ANAxuxgzDIZQQUK_8YEQLD68onD1NtiPQiCso82iLSnME8KiBex7jUTdA", // LinePay 官方圖檔網址
                title: "LINE Pay"
            });
        }
        if (directPay) {
            payments.push({
                img: "https://cdn-icons-png.flaticon.com/512/3233/3233814.png", // 代表掃碼或銀行轉帳的通用圖片
                title: "掃碼 / 銀行轉帳付款"
            });
        }
        console.log(payments);

        this.getPretendDivAlertDialogRef().open();

        /** 太早設定會被clean */
        Util.syncDelay(1).then(() => {
            self.App()
                .getDionysusPaymentBriefStore()
                .setPayments(...payments);
        });
    }

    getInjectStyleOfDionysusBacchusAreaOfPayDiv(dionysusBacchus) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(dionysusBacchus.getErosPublic()));
    }

    getInjectStyleOfDionysusBacchusAreaOfShippingDiv(dionysusBacchus) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(dionysusBacchus.getErosPublic()));
    }
}

export default ModularizedDionysusBacchusComponent;
