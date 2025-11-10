const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfo from "../../base/BaseUserInfo";
import Router from "../../router";
import BaseDionysusPlutusComponent from "./BaseDionysusPlutusComponent";
import Functions from "../../functions";
import Config from "../../config";
import { toJS } from "mobx";
import { Application } from "../../index";

class ModularizedDionysusPlutusComponent extends BaseDionysusPlutusComponent {
    constructor(props) {
        super(props);
    }

    onDionysusPlutusCvsTextFieldEndSearchClicked(param) {
        const transport = this.getStore().getTypeOfTransport();
        switch (transport) {
            case Config.TransportMethod.Store711:
                const tempVar = Util.getRandomHashV2(20);
                this.getStore().waitResultOfCVS(tempVar).then();
                const url = `${Config.urlOfSelectorOfCVS}&TempVar=${tempVar}`;
                return this.gotoUrlWithNewTabDirectly(`https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&url=${url}`);
            case Config.TransportMethod.StoreFamily:
                return this.gotoUrlWithNewTabDirectly(`https://mfme.map.com.tw`);
        }
    }

    onDionysusPlutusFindIconButtonClicked(param) {
        const self = this;
        if (!_.isEmpty(this.getStore().getAddress())) {
            const address = this.getStore().getPreciselyAddress();
            Functions.httpOnCallGetDistanceOfSpecificAddress(this, { address }).then((result) => {
                this.getStore().setDistanceOfSasha(`距離倉庫 ${result}`);
            });
        } else this.showWarningSnackMessage(`未輸入地址`);
    }

    getWrapInjectStyleOfDionysusPlutusWholeCheckbox(plutus) {
        return Util.getVisibleOrHidden(false);
    }

    onCitySelectedChange(value, param) {
        const self = this;
        Util.syncDelay(1).then(() => {
            self.getStore().validateDistrictByCity();
        });
    }

    onDionysusPlutusWhetherPickupByMySelfCheckboxChange(param) {
        const self = this;
        self.getStore().whetherPickupByMySelfValidate().then();
    }

    getInjectStyleOfDionysusPlutusFourthDiv(plutus) {
        return Util.getVisibleOrNone(false, true);
    }

    getWrapInjectStyleOfDionysusPlutusCvsTextField(dionysusPlutus) {
        return Util.getVisibleOrNone(dionysusPlutus.getNeedCVS());
    }

    onDionysusPlutusSubmitChipClicked(param) {
        this.execute().then(() => UserInfo.deleteCheckedCartieItemBehavior());
    }

    execute = async () => {
        const self = this;
        const eros = await Application.getDionysusCartieStore().modifyErosInfoOfAuthor();

        const selectedOfTransport = this.getStore().getTypeOfTransport();
        const selectedOfTransaction = this.getStore().getTypeOfTransaction();
        const price = this.getStore().getFeeOfPayment();
        if (selectedOfTransaction < 0 || selectedOfTransport < 0 || price <= 0) return this.showWarningSnackMessage(`流程發生錯誤，請回到購物車流程`);

        function isAddressShouldFormed() {
            if (
                Util.isOrEquals(
                    selectedOfTransport,
                    Config.TransportMethod.Needless,
                    Config.TransportMethod.SelfPickup,
                    Config.TransportMethod.Store711,
                    Config.TransportMethod.StoreFamily
                )
            )
                return false;
            return _.isEmpty(self.getStore().getAddress());
        }

        if (Util.or(isAddressShouldFormed(), _.isEmpty(this.getStore().getEmail()), _.isEmpty(this.getStore().getPhone()), _.isEmpty(this.getStore().getName())))
            return this.showWarningSnackMessage(`資料尚未完整填寫，請再度確認欄位內容`);

        if (Util.isOrEquals(selectedOfTransport, Config.TransportMethod.StoreFamily, Config.TransportMethod.Store711) && _.size(this.getStore().getCvs()) < 3)
            return this.showWarningSnackMessage(`需填入收店代碼`);

        if (UserInfo.isLoginWithSucceed() && !eros.enableOfBoughtWithoutLoginIn) return this.showErrorSnackMessage("請先登入，才能完成結帳程序");
        if (!UserInfo.isLoginWithSucceed() && eros.enableOfBoughtWithoutLoginIn && self.getStore().getFeeOfPayment() > eros.amountOfAllowAnonymousBuy)
            return this.showErrorSnackMessage(`未登入購物上限 ${eros.amountOfAllowAnonymousBuy} 元內`);
        if (UserInfo.isLoginWithSucceed() && self.getStore().getFeeOfPayment() > eros.amountOfMaximumBuy)
            return this.showErrorSnackMessage(`購物金額上限 ${eros.amountOfMaximumBuy} 元內`);

        const idOfPreciseOrder = await this.performEPayCreateOrderBehavior();
        Util.appendInfo(`idOfPreciseOrder ==> `, idOfPreciseOrder);
        this.showInfoSnackMessage(`進入付款流程`);
        switch (selectedOfTransaction) {
            case Config.TransactionMethod.LinePay:
                const validate1 = eros.enableOfLinePay && eros.hasLinePay;
                return validate1 ? await this.performCheckoutByLinePayBehavior(idOfPreciseOrder) : Router.gotoEpayFootprintPage(this, "user", "all");
            case Config.TransactionMethod.ECPay:
                const validate2 = eros.enableOfECPay && eros.hasECPay;
                return validate2 ? await this.performCheckoutByECPayBehavior(idOfPreciseOrder) : Router.gotoEpayFootprintPage(this, "user", "all");
            case Config.TransactionMethod.DirectPay:
                if (eros.enableOfDirectPay && eros.hasDirectPay) this.gotoUrlWithNewTabDirectly(eros.payOfDirect);
                return Router.gotoEpayFootprintPage(this, "user", "all");
            default:
                return Router.gotoEpayFootprintPage(this, "user", "all");
        }
    };

    performEPayCreateOrderBehavior = async () => {
        const self = this;
        const items = toJS(this.getStore().getItemsOfChecked());
        const typeOfTransport = toJS(this.getStore().getTypeOfTransport());
        const typeOfTransaction = toJS(this.getStore().getTypeOfTransaction());
        console.log(items, " typeOfTransport=>", typeOfTransport, " typeOfTransaction=>", typeOfTransaction);
        const isCVS = Util.isOrEquals(typeOfTransport, Config.TransportMethod.Store711, Config.TransportMethod.StoreFamily);
        Util.mutateRemoveKeys(items, ["checked", "idOfCookieUsage"]);
        // nameOfBooze,idOfVariant:'商品的id',quantity:4
        const result = await Functions.httpOnCallCreateEPayPreciseOrder(this, {
            items: items.map((i) => ({ idOfBooze: i.idOfBooze, idOfVariant: i.idOfVariant, quantity: i.countOfSubmit })),
            remark: self.getStore().getRemark(),
            address: self.getStore().getPreciselyAddress(),
            phone: self.getStore().getPhone(),
            name: self.getStore().getName(),
            email: self.getStore().getEmail(),
            typeOfTransport,
            typeOfTransaction,
            needAddress: self.getStore().getNeedAddress(),
            priceOfTotal4Client: self.getStore().getFeeOfPayment(),
            cvs: isCVS ? { storeid: this.getStore().getCvs(), storeaddress: this.getStore().getHelperTextOfCvs(), storename: this.getStore().getLabelOfCvsSticky() } : {}
        });
        return result.idOfPreciseOrder;
    };

    performCheckoutByLinePayBehavior = async (id) => {
        const result = await Functions.httpOnCallCheckoutByLinePay(this, { idOfPreciseOrder: id });
        this.routeToLinePayCheckoutPage(JSON.stringify(result));
    };

    performCheckoutByECPayBehavior = async (id) => {
        const result = await Functions.httpOnCallCheckoutByECPay(this, { idOfPreciseOrder: id });
        this.renderHtmlOfDocument(result.textOfRender);
    };

    /** 計算兩地相差的距離 */
    getInjectStyleOfDionysusPlutusSeventhDiv(dionysusPlutus) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfDionysusPlutusLocationDiv(dionysusPlutus) {
        return Util.getVisibleOrNone(dionysusPlutus.getNeedAddress());
    }

    getInjectStyleOfDionysusPlutusTakenDiv(dionysusPlutus) {
        return Util.getVisibleOrNone(dionysusPlutus.getNeedSelfPickingChoice());
    }

    getInjectStyleOfDionysusPlutusMainDiv(dionysusPlutus) {
        return Util.getVisibleOrNone(!dionysusPlutus.getWhetherPickupByMySelf(), true);
    }
}

export default ModularizedDionysusPlutusComponent;
