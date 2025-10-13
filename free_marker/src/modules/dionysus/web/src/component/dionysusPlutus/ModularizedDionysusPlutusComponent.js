const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfo from "../../base/BaseUserInfo";
import Router from "../../router";
import BaseDionysusPlutusComponent from "./BaseDionysusPlutusComponent";
import Functions from "../../functions";
import Config from "../../config";

class ModularizedDionysusPlutusComponent extends BaseDionysusPlutusComponent {
    constructor(props) {
        super(props);
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

    // getWrapInjectStyleOfDionysusPlutusEmailTextField(plutus) {
    //     return Util.getVisibleOrNone(!UserInfoRef.isLoginWithSucceed())
    // }

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

    onDionysusPlutusSubmitChipClicked(param) {
        const self = this;
        const typeOfTransport = UserInfo.getTypeOfTransport();
        const price = UserInfo.getTotalPriceOfCartie();
        if (typeOfTransport < 0 || price <= 0) {
            this.showWarningSnackMessage(`流程發生錯誤，請回到購物車流程`);
            return;
        }
        const containsPhysicalGood = UserInfo.containsPhysicalGoodOfCheckedItem();

        function isAddressNotValid() {
            if (containsPhysicalGood) {
                if (typeOfTransport === 3) return false; //todo enum:自行取貨
                return _.isEmpty(self.getStore().getAddress());
            }
            return false;
        }

        if (Util.or(isAddressNotValid(), _.isEmpty(this.getStore().getPhone()), _.isEmpty(this.getStore().getName()))) {
            this.showWarningSnackMessage(`資料尚未完整填寫，請再度確認欄位內容`);
            return;
        }

        this.showInfoSnackMessage(`進入付款流程`);
        this.execute().then(() => {
            UserInfo.deleteCheckedCartieItemBehavior();
        });
        /**  發信的功能
         this.getStore()
         .submitSavior(this)
         .then((result) => {
         self.showInfoSnackMessage(`已完成訂購，請收信信件確認`);
         UserInfo.deleteCheckedCartieItemBehavior();
         Util.syncDelay(2500).then((result) => {
         Router.gotoHomePage(this);
         });
         });
         */
    }

    execute = async () => {
        const idOfPreciseOrder = await this.performEPayCreateOrderBehavior();
        Util.appendInfo(`idOfPreciseOrder ==> `, idOfPreciseOrder);
        if (!UserInfo.isLoginWithSucceed()) {
            Router.gotoHomePage(this);
            return this.showSuccessSnackMessage(`已成功購買，請檢查您的信箱`);
        }

        switch (UserInfo.getTypeOfTransport()) {
            case 1:
            case 2:
                await this.performCheckoutByLinePayBehavior(idOfPreciseOrder);
                return;
            case 3:
            case 6:
                await this.performCheckoutByECPayBehavior(idOfPreciseOrder);
                return;
            case 9:
            default:
                return Router.gotoEpayFootprintPage(this, "user", "all");
        }
    };

    performEPayCreateOrderBehavior = async () => {
        const self = this;
        const items = UserInfo.getCheckedCartieItems();
        const containsPhysicalGood = UserInfo.containsPhysicalGoodOfCheckedItem();
        Util.mutateRemoveKeys(items, ["checked", "idOfCookieUsage"]);
        const result = await Functions.httpOnCallCreateEPayPreciseOrder(this, {
            items,
            remark: self.getStore().getRemark(),
            address: self.getStore().getPreciselyAddress(),
            phone: self.getStore().getPhone(),
            name: self.getStore().getName(),
            email: self.getStore().getEmail(),
            transport: containsPhysicalGood
                ? self.getStore().getWhetherPickupByMySelf()
                    ? Config.TransportMethod.SelfPickup
                    : Config.TransportMethod.Freight
                : Config.TransportMethod.SelfPickup //寫成enum
        });
        return result.idOfPreciseOrder;
    };

    performEPayCancelOrderBehavior = async (id) => {
        await Functions.httpOnCallCancelPreciseOrder(this, { idOfPreciseOrder: id });
        this.showInfoSnackMessage(`已成功cancel ${this.getIdOfCurrentPreciseOrder()}`);
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
