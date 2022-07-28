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
        return Util.getVisibleOrNone(Util.isOrEquals(order.getStateOfPayment(), 'waiting', 'pending'));
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfPaymentDetailDiv(order) {
        return Util.getVisibleOrNone(Util.isOrEquals(order.getTypeOfPayment(), 'atm', 'cvs'));
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfFuncDiv(order) {
        /**
         * 1. linepay 未付款
         * 2. 未選擇付款方式
         * */
        return Util.getVisibleOrNone(
            Util.or(
                this.isUnknownOrder(order),
                this.isWaitingToLinePay(order)
            )
        );
    }

    /** 沒有選擇付費方式的order(下完訂單就把頁面關掉)*/
    isUnknownOrder(order) {
        return _.isEqual(order.getTypeOfPayment(), 'unknown');
    }

    /** 還沒付費的linepay order(走到Line-Pay,把付費頁面關掉) */
    isWaitingToLinePay(order) {
        return _.isEqual(order.getTypeOfPayment(), 'linepay') && _.isEqual(order.getStateOfPayment(), 'waiting')
    }

    onEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButtonDeleteOrderClicked(param) {
        return () => {
            console.log(`onEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButtonDeleteOrderClicked 被點擊了`)
        }
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfPaymentFailureDiv(order) {
        return Util.getVisibleOrNone(_.isEqual('failure', order.getStateOfPayment()));
    }

    getInjectStyleOfEpayPurchaseOfHistoryOrderAreaOfPaymentDeadlineDiv(order) {
        return Util.getVisibleOrNone(!_.isEqual('completed', order.getStateOfPayment()));
    }

    onEpayPurchaseOfHistoryOrderAreaOfFuncCheckoutButtonClicked(param) {
        const funcOfArea = param.object;
        const order = funcOfArea.getParentNode();
        if (this.isWaitingToLinePay(order)) {
            this.routeToLinePayCheckoutPage(order.getRaw().contentOfRender);
        }
    }

}

export default ModularizedEpayPurchaseOfHistoryComponent;
