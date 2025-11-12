const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
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
        this.getStore().submitNumOfWorker(num).then();
    }

    onDionysusErosArrowOfThresholdOfFreeShipByCodIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByCod");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByCod();
        this.getStore().submitThresholdOFreeShipByCod(price).then();
    }

    onDionysusErosArrowOfThresholdOfCheckoutByCreditIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfCheckoutByCredit");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByCredit();
        this.getStore().submitThresholdOfCheckoutByCredit(price).then();
    }

    onDionysusErosArrowOfThresholdOfFreeShipByRapidlyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByRapidly");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByRapidly();
        this.getStore().submitThresholdOfFreeShipByRapidly(price).then();
    }

    onDionysusErosArrowOfThresholdOfFreeShipByHomeDeliveryIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByHomeDelivery");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByHomeDelivery();
        this.getStore().submitThresholdOfFreeShipByHomeDelivery(price).then();
    }

    onDionysusErosArrowOfThresholdOfCheckoutByLinePayIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfCheckoutByLinePay");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByLinePay();
        this.getStore().submitThresholdOfCheckoutByLinePay(price).then();
    }

    onDionysusErosArrowOfThresholdOfFreeShipByStorePickupIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfFreeShipByStorePickup");
        const price = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByStorePickup();
        this.getStore().submitThresholdOfFreeShipByStorePickup(price).then();
    }

    onDionysusErosArrowOfPercentageOfDiscountIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("percentageOfDiscount");
        const percent = object.getDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount();
        this.getStore().submitPercentageOfDiscount(percent).then();
    }

    onDionysusErosArrowOfPercentageFeeOfCodIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("percentageFeeOfCOD");
        const percent = object.getDialogInputValueOfDionysusErosArrowOfPercentageFeeOfCod();
        this.getStore().submitPercentageFeeOfCOD(percent).then();
    }

    onDionysusErosArrowOfAmountOfAllowAnonymousBuyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("allowAnonymousBuy");
        const amount = object.getDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy();
        this.getStore().submitAmountOfAllowAnonymousBuy(amount).then();
    }

    onDionysusErosArrowOfAmountOfMaximumBuyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("amountOfMaximum");
        const amount = object.getDialogInputValueOfDionysusErosArrowOfAmountOfMaximumBuy();
        this.getStore().submitAmountOfMaximumBuy(amount).then();
    }

    onDionysusErosArrowOfEcPaySetIconButtonClicked(param) {
        this.getStore().setSelected("ecpay");
    }

    onDionysusErosEnableOfEnableOfCodSwitchChange(param) {
        this.getStore().submitEnableOfCOD().then();
    }

    onDionysusErosEnableOfBoughtWithoutLoginInSwitchChange(param) {
        this.getStore().submitWhetherBoughtWithoutLogin().then();
    }

    onDionysusErosEnableOfLinepaySwitchChange(param) {
        this.getStore().submitWhetherEnableOfLinePay().then();
    }

    onDionysusErosEnableOfEcPaySwitchChange(param) {
        this.getStore().submitWhetherEnableOfEcPay().then();
    }

    onDionysusErosEnableOfDirectPaySwitchChange(param) {
        this.getStore().submitWhetherEnableOfDirectPay().then();
    }

    onDionysusErosEnableOfWhetherHomeDeliverySwitchChange(param) {
        this.getStore().submitWhetherHomeDelivery().then();
    }

    onDionysusErosEnableOfWhetherShipByRapidlySwitchChange(param) {
        this.getStore().submitWhetherShipByRapidly().then();
    }

    onDionysusErosEnableOfWhetherShipByStorePickupSwitchChange(param) {
        this.getStore().submitWhetherShipByStorePickup().then();
    }

    onDionysusErosArrowOfFeeOfHomeDeliveryIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("feeOfHomeDelivery");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfHomeDelivery();
        this.getStore().submitFeeOfHomeDelivery(fee).then();
    }

    onDionysusErosArrowOfFeeOfInStorePickupIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("feeOfInStorePickup");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfInStorePickup();
        this.getStore().submitFeeOfInStorePickup(fee).then();
    }

    onDionysusErosArrowOfFeeOfShipByCodIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("feeOfShipByCod");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfShipByCod();
        this.getStore().submitFeeOfShipByCOD(fee).then();
    }

    onDionysusErosArrowOfFeeOfRapidOnDeliveryIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("rapidOnDelivery");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery();
        this.getStore().submitFeeOfRapidOnDelivery(fee).then();
    }

    onDionysusErosArrowOfThresholdOfAllowSelfPickupIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("thresholdOfAllowSelfPickup");
        const fee = object.getDialogInputValueOfDionysusErosArrowOfThresholdOfAllowSelfPickup();
        this.getStore().submitThresholdOfAllowSelfPickup(fee).then();
    }

    onDionysusErosEnableOfWhetherPickupByBuyerSelfSwitchChange(param) {
        this.getStore().submitWhetherPickupByBuyerSelf().then();
    }

    onDionysusErosArrowOfMaximumOfUniqueItemsIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("maximumOfUniqueItems");
        const count = object.getDialogInputValueOfDionysusErosArrowOfMaximumOfUniqueItems();
        this.getStore().submitMaximumOfUniqueItems(count).then();
    }

    onDionysusErosArrowOfTtlOfPaymentIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("ttlOfPayment");
        const min = object.getDialogInputValueOfDionysusErosArrowOfTtlOfPayment();
        this.getStore().submitTTLOfPayment(min).then();
    }

    onDionysusErosArrowOfTtlOfAnonymousIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("ttlOfAnonymous");
        const min = object.getDialogInputValueOfDionysusErosArrowOfTtlOfAnonymous();
        this.getStore().submitTTLOfAnonymous(min).then();
    }

    // YouTube 頻道/帳號
    onDionysusErosArrowOfYtOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("yt");
        const value = object.getDialogInputValueOfDionysusErosArrowOfYtO();
        this.getStore().submitYTQ(value).then();
    }

    // Instagram 帳號
    onDionysusErosArrowOfIgOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("ig");
        const value = object.getDialogInputValueOfDionysusErosArrowOfIgO();
        this.getStore().submitIGO(value).then();
    }

    // TikTok 帳號
    onDionysusErosArrowOfTiktokOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("tiktokO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfTiktokO();
        this.getStore().submitTikTokO(value).then();
    }

    // Facebook 帳號/專頁
    onDionysusErosArrowOfFbOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("fbO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfFbO();
        this.getStore().submitFBO(value).then();
    }

    // 電話號碼
    onDionysusErosArrowOfPhoneOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("phoneO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfPhoneO();
        this.getStore().submitPhoneO(value).then();
    }

    // UnifiedB (假設是某種統一業務 ID)
    onDionysusErosArrowOfUnifiedBIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("unifiedB");
        const value = object.getDialogInputValueOfDionysusErosArrowOfUnifiedB();
        this.getStore().submitUnifiedB(value).then();
    }

    // 公司名稱
    onDionysusErosArrowOfCompanyIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("company");
        const value = object.getDialogInputValueOfDionysusErosArrowOfCompany();
        this.getStore().submitCompany(value).then();
    }

    onDionysusErosArrowOfAddressOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("addressO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfAddressO();
        this.getStore().submitAddressO(value).then();
    }

    onDionysusErosArrowOfEmailOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("emailO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfEmailO();
        this.getStore().submitEmailO(value).then();
    }

    onDionysusErosArrowOfLineOIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("lineO");
        const value = object.getDialogInputValueOfDionysusErosArrowOfLineO();
        this.getStore().submitLineO(value).then();
    }

    onDionysusErosArrowOfNameOfDirectPayIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("nameOfDirectPay");
        const value = object.getDialogInputValueOfDionysusErosArrowOfNameOfDirectPay();
        this.getStore().submitNameOfDirectPay(value).then();
    }

    onDionysusErosArrowOfCautionOfDirectPayIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("cautionOfDirectPay");
        const value = object.getDialogInputValueOfDionysusErosArrowOfCautionOfDirectPay();
        this.getStore().submitCautionOfDirectPay(value).then();
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
