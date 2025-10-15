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

    getWrapInjectStyleOfDionysusErosAreaOfBrandNameDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getWrapInjectStyleOfDionysusErosAreaOfTabCreatorDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getWrapInjectStyleOfDionysusErosAreaOfTtlOfAnonymousDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getWrapInjectStyleOfDionysusErosAreaOfTtlOfPaymentDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getWrapInjectStyleOfDionysusErosAreaOfMaximumOfUniqueItemsDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    onDionysusErosArrowOfLinepaySetIconButtonClicked(param) {
        this.getStore().setSelected("linepay");
    }

    onDionysusErosArrowOfTabCreatorIconButtonClicked(param) {
        this.getStore().setSelected("tab");
    }

    onDionysusErosArrowOfPayOfDirectIconButtonClicked(param) {
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
        this.getStore().submitAmountOfAllowMaximumBuy(amount).then();
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

    onDionysusErosEnableOfDirectSwitchChange(param) {
        this.getStore().submitWhetherEnableOfDirect().then();
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
}

export default ModularizedDionysusErosComponent;
