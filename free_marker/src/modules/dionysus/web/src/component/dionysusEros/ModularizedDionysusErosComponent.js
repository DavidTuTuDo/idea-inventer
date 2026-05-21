const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import UserInfoRef from "../../base/BaseUserInfo";
import BaseDionysusErosComponent from "./BaseDionysusErosComponent";

class ModularizedDionysusErosComponent extends BaseDionysusErosComponent {
    constructor(props) {
        super(props);
    }

    getInjectStyleOfDionysusErosAdminDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    onDionysusErosArrowOfLinepaySetIconButtonClicked(param) {
        this.getStore().setSelected("linepay");
    }

    onDionysusErosArrowOfTabCreatorIconButtonClicked(param) {
        this.getStore().setSelected("tab");
    }

    onDionysusErosArrowOfPreviewDirectPayIconButtonClicked(param) {
        this.getStore().setSelected("direct");
    }

    onDionysusErosArrowOfHrefOfDirectPayIconButtonClicked(param) {
        this.getStore().setSelected("direct");
    }

    onDionysusErosArrowOfBrandNameIconButtonClicked(param) {
        this.getStore().setSelected("name");
    }

    onDionysusErosArrowOfNumOfWorkerIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("numOfWorker");
        const num = object.getDialogInputValueOfDionysusErosArrowOfNumOfWorker();
        this.exeAsyncT(this.getStore().submitNumOfWorker(num));
    }

    onDionysusErosArrowOfThresholdOfFreeShipByCodIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByCod");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByCod();
        this.exeAsyncT(this.getStore().submitThresholdOFreeShipByCod(price));
    }

    onDionysusErosArrowOfThresholdOfCheckoutByCreditIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfCheckoutByCredit");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByCredit();
        this.exeAsyncT(this.getStore().submitThresholdOfCheckoutByCredit(price));
    }

    onDionysusErosArrowOfThresholdOfFreeShipByRapidlyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByRapidly");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByRapidly();
        this.exeAsyncT(this.getStore().submitThresholdOfFreeShipByRapidly(price));
    }

    onDionysusErosArrowOfThresholdOfFreeShipByHomeDeliveryIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByHomeDelivery");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByHomeDelivery();
        this.exeAsyncT(this.getStore().submitThresholdOfFreeShipByHomeDelivery(price));
    }

    onDionysusErosArrowOfThresholdOfCheckoutByLinePayIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfCheckoutByLinePay");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByLinePay();
        this.exeAsyncT(this.getStore().submitThresholdOfCheckoutByLinePay(price));
    }

    onDionysusErosArrowOfThresholdOfFreeShipByStorePickupIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByStorePickup");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByStorePickup();
        this.exeAsyncT(this.getStore().submitThresholdOfFreeShipByStorePickup(price));
    }

    onDionysusErosArrowOfPercentageOfDiscountIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("percentageOfDiscount");
        const percent = object.getDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount();
        this.exeAsyncT(this.getStore().submitPercentageOfDiscount(percent));
    }

    onDionysusErosArrowOfPercentageFeeOfCodIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("percentageFeeOfCOD");
        const percent = object.getDialogInputValueOfDionysusErosArrowOfPercentageFeeOfCod();
        this.exeAsyncT(this.getStore().submitPercentageFeeOfCOD(percent));
    }

    onDionysusErosArrowOfAmountOfAllowAnonymousBuyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("allowAnonymousBuy");
        const amount = object.getDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy();
        this.exeAsyncT(this.getStore().submitAmountOfAllowAnonymousBuy(amount));
    }

    onDionysusErosArrowOfAmountOfMaximumBuyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("amountOfMaximum");
        const amount = object.getDialogInputValueOfDionysusErosArrowOfAmountOfMaximumBuy();
        this.exeAsyncT(this.getStore().submitAmountOfMaximumBuy(amount));
    }

    onDionysusErosArrowOfEcPaySetIconButtonClicked(param) {
        this.getStore().setSelected("ecpay");
    }

    onDionysusErosEnableOfEnableOfCodSwitchChange(param) {
        this.exeAsyncT(this.getStore().submitEnableOfCOD());
    }

    onDionysusErosEnableOfBoughtWithoutLoginInSwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherBoughtWithoutLogin());
    }

    onDionysusErosEnableOfWhetherDisplaySpecificSwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherDisplaySpecific());
    }

    onDionysusErosEnableOfLinepaySwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherEnableOfLinePay());
    }

    onDionysusErosEnableOfEcPaySwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherEnableOfEcPay());
    }

    onDionysusErosEnableOfDirectPaySwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherEnableOfDirectPay());
    }

    onDionysusErosEnableOfWhetherHomeDeliverySwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherHomeDelivery());
    }

    onDionysusErosEnableOfWhetherShipByRapidlySwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherShipByRapidly());
    }

    onDionysusErosEnableOfWhetherShipByStorePickupSwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherShipByStorePickup());
    }

    onDionysusErosArrowOfFeeOfHomeDeliveryIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("feeOfHomeDelivery");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfHomeDelivery();
        this.exeAsyncT(this.getStore().submitFeeOfHomeDelivery(fee));
    }

    onDionysusErosArrowOfFeeOfInStorePickupIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("feeOfInStorePickup");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfInStorePickup();
        this.exeAsyncT(this.getStore().submitFeeOfInStorePickup(fee));
    }

    onDionysusErosArrowOfFeeOfShipByCodIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("feeOfShipByCod");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfShipByCod();
        this.exeAsyncT(this.getStore().submitFeeOfShipByCOD(fee));
    }

    onDionysusErosArrowOfFeeOfRapidOnDeliveryIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("rapidOnDelivery");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery();
        this.exeAsyncT(this.getStore().submitFeeOfRapidOnDelivery(fee));
    }

    onDionysusErosArrowOfThresholdOfAllowSelfPickupIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfAllowSelfPickup");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfAllowSelfPickup();
        this.exeAsyncT(this.getStore().submitThresholdOfAllowSelfPickup(fee));
    }

    onDionysusErosEnableOfWhetherPickupByBuyerSelfSwitchChange(param) {
        this.exeAsyncT(this.getStore().submitWhetherPickupByBuyerSelf());
    }

    onDionysusErosArrowOfMaximumOfUniqueItemsIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("maximumOfUniqueItems");
        const count = object.getDialogInputValueOfDionysusErosArrowOfMaximumOfUniqueItems();
        this.exeAsyncT(this.getStore().submitMaximumOfUniqueItems(count));
    }

    onDionysusErosArrowOfTtlOfPaymentIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("ttlOfPayment");
        const min = object.getDialogInputValueOfDionysusErosArrowOfTtlOfPayment();
        this.exeAsyncT(this.getStore().submitTTLOfPayment(min));
    }

    onDionysusErosArrowOfTtlOfAnonymousIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("ttlOfAnonymous");
        const min = object.getDialogInputValueOfDionysusErosArrowOfTtlOfAnonymous();
        this.exeAsyncT(this.getStore().submitTTLOfAnonymous(min));
    }

    // YouTube 頻道/帳號
    onDionysusErosArrowOfYtOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("yt");
        const value = object.getDialogInputValueOfDionysusErosArrowOfYtO();
        this.exeAsyncT(this.getStore().submitYTQ(value));
    }

    // Instagram 帳號
    onDionysusErosArrowOfIgOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("ig");
        const value = object.getDialogInputValueOfDionysusErosArrowOfIgO();
        this.exeAsyncT(this.getStore().submitIGO(value));
    }

    // TikTok 帳號
    onDionysusErosArrowOfTiktokOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("tiktokO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfTiktokO();
        this.exeAsyncT(this.getStore().submitTikTokO(value));
    }

    // Facebook 帳號/專頁
    onDionysusErosArrowOfFbOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("fbO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfFbO();
        this.exeAsyncT(this.getStore().submitFBO(value));
    }

    // 電話號碼
    onDionysusErosArrowOfPhoneOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("phoneO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfPhoneO();
        this.exeAsyncT(this.getStore().submitPhoneO(value));
    }

    // UnifiedB (假設是某種統一業務 ID)
    onDionysusErosArrowOfUnifiedBIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("unifiedB");
        const value = object.getDialogInputValueOfDionysusErosArrowOfUnifiedB();
        this.exeAsyncT(this.getStore().submitUnifiedB(value));
    }

    // 公司名稱
    onDionysusErosArrowOfCompanyOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("companyO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfCompanyO();
        this.exeAsyncT(this.getStore().submitCompanyO(value));
    }

    onDionysusErosArrowOfAddressOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("addressO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfAddressO();
        this.exeAsyncT(this.getStore().submitAddressO(value));
    }

    onDionysusErosArrowOfEmailOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("emailO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfEmailO();
        this.exeAsyncT(this.getStore().submitEmailO(value));
    }

    onDionysusErosArrowOfLineOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("lineO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfLineO();
        this.exeAsyncT(this.getStore().submitLineO(value));
    }

    onDionysusErosArrowOfNameOfDirectPayIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("nameOfDirectPay");
        const value = object.getDialogInputValueOfDionysusErosArrowOfNameOfDirectPay();
        this.exeAsyncT(this.getStore().submitNameOfDirectPay(value));
    }

    onDionysusErosArrowOfCautionOfDirectPayIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("cautionOfDirectPay");
        const value = object.getDialogInputValueOfDionysusErosArrowOfCautionOfDirectPay();
        this.exeAsyncT(this.getStore().submitCautionOfDirectPay(value));
    }

    getPresetObjOfIreneQrcode() {
        return {
            main: "LINE",
            sub: "PAY",
            title: this.getStore().getCupidPublic().getNameOfDirectPay(),
            href: this.getStore().getCupidPublic().getHrefOfDirectPay(),
            caution: this.getStore().getCupidPublic().getCautionOfDirectPay(),
            content: `NT$ 999 元`,
            color: `#06a748`
        };
    }
}

export default ModularizedDionysusErosComponent;
