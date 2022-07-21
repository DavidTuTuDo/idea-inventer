import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseEpayPurchaseOfHistoryComponent from "./BaseEpayPurchaseOfHistoryComponent";

class ModularizedEpayPurchaseOfHistoryComponent extends BaseEpayPurchaseOfHistoryComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    isValidOfParamOfTypeOfTab(string) {
        return Util.containsBy(['completed', 'pending', 'failure'], string);
    }

    onEpayPurchaseOfHistoryTabTabClicked(param) {
        const tab = param.object;
        if (!_.isEqual(tab.getType(), this.paramOfTypeOfTab))
            Router.gotoEpayPurchaseOfHistoryPage(this, tab.getType());
    }

    componentDidMount() {
        super.componentDidMount();
        this.getStore().setCurrentTabByType(this.paramOfTypeOfTab)
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButton(areaOfTop) {
        const order = areaOfTop.getParentNode();
        return Util.getVisibleOrNone(_.isEqual(order.getStateOfPayment(), 'pending'));
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfPaymentDetailDiv(order) {
        return Util.getVisibleOrNone(Util.isOrEquals(order.getTypeOfPayment(), 'atm', 'cvs'));
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfFuncDiv(order) {
        return Util.getVisibleOrNone(Util.isOrEquals(order.getTypeOfPayment(), 'atm', 'cvs'));
    }

    onEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButtonDeleteOrderClicked(param) {
        return () => {
            console.log(`onEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButtonDeleteOrderClicked 被點擊了`)
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayPurchaseOfHistoryComponent;
