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
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getWrapInjectStyleOfDionysusErosAreaOfBrandNameDiv(dionysusEros) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getWrapInjectStyleOfDionysusErosAreaOfTabCreatorDiv(dionysusEros) {
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

    onDionysusErosArrowOfPriceOfFreeShippingIconButtonClicked(param) {
        const object = param.object;
        this.getStore().setSelected("priceOfFreeShipping");
        const price = object.getDialogInputValueOfDionysusErosArrowOfPriceOfFreeShipping();
        this.getStore().submitPriceOfFreeShipping(price).then();
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

    onDionysusErosArrowOfEcpaySetIconButtonClicked(param) {
        this.getStore().setSelected("ecpay");
    }

    onDionysusErosAllowBoughtWithoutLoginInSwitchChange(param) {
        this.getStore().submitWhetherBoughtWithoutLogin().then();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusErosComponent;
