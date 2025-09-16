const edit = true;
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseEpayFootprintComponent from "./BaseEpayFootprintComponent";
import Functions from "../../functions";

class ModularizedEpayFootprintComponent extends BaseEpayFootprintComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.registerScrollToBottomJob(this.getStore().fetch);
    }

    isValidOfParamOfTypeOfTab(string) {
        return Util.containsBy(["all", "completed", "pending", "failure"], string);
    }

    onEpayFootprintTabTabClicked(param) {
        const tab = param.object;
        if (!_.isEqual(tab.getType(), this.paramOfTypeOfTab)) {
            Router.gotoEpayFootprintPage(this, tab.getType());
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.getStore().setCurrentTabByType(this.paramOfTypeOfTab).then();
    }

    getInjectStyleOfEpayFootprintOrderExtraIconButton(order) {
        return Util.getVisibleOrNone(Util.isOrEquals(order.getStateOfPayment(), 2, 3)); //2:"pending", 3:"waiting"
    }

    getInjectStyleOfEpayFootprintOrderAreaOfPaymentDetailDiv(order) {
        return Util.getVisibleOrNone(Util.isOrEquals(order.getProcessOfPayment(), "atm", "cvs"), true);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfFuncDiv(order) {
        /**
         * 1. linepay 未付款
         * 2. 未選擇付款方式
         * */
        return Util.getVisibleOrNone(this.isWaitingPendingState(order) && Util.or(this.isUnknownOrder(order), this.isWaitingToLinePay(order)));
    }

    /** 沒有選擇付費方式的order(下完訂單就把頁面關掉)*/
    isUnknownOrder(order) {
        return _.isEqual(order.getTypeOfPayment(), "unknown");
    }

    /** 還沒付費的linepay order(走到Line-Pay,把付費頁面關掉) */
    isWaitingToLinePay(order) {
        return _.isEqual(order.getTypeOfPayment(), "linepay") && _.isEqual(order.getStateOfPayment(), 3); //3:"waiting"
    }

    isWaitingPendingState(order) {
        return _.isEqual(order.getStateOfPayment(), "pending") || _.isEqual(order.getStateOfPayment(), 3); //3:"waiting"
    }

    onEpayFootprintOrderExtraIconButtonDeleteOrderClicked(param) {
        return async () => {
            const order = param.object;
            await this.remoteCancelUnpaidPreciseOrderBehavior(order.raw.id);
        };
    }

    onEpayFootprintOrderExtraIconButtonUpdateRemarkClicked(param) {
        return async () => {
            const order = param.object.getParentNode();
            const latestRemarkOfOrder = order.getAreaOfInputMessage().getValue();
            await this.remoteUpdateOrderRemarkBehavior(order.raw.id, latestRemarkOfOrder);
        };
    }

    async remoteUpdateOrderRemarkBehavior(idOfPreciseOrder, remarkOfPreciseOrder) {
        const result = await Functions.httpOnCallUpdatePreciseOrderRemarkContent(this.getComponentInstance(), {
            idOfPreciseOrder,
            remarkOfPreciseOrder
        });
        this.showInfoSnackMessage(`更新${idOfPreciseOrder} 備註成功`);
    }

    async remoteCancelUnpaidPreciseOrderBehavior(id) {
        const result = await Functions.httpOnCallCancelPreciseOrder(this.getComponentInstance(), { idOfPreciseOrder: id });
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "failure");
    }

    getOrderDeadline(order) {
        switch (order.getStateOfPayment()) {
            case 2: //"pending":
                return order.getDeadline();
            case 3: //"waiting":
                return order.getDeadline();
            case 5: //"completed":
                return Util.getCurrentTimeFormatV2(order.getTimeOfPayment());
            case 4: //"failure":
                return Util.getCurrentTimeFormatV2(order.getTimeOfCreate());
            default:
                return "886出問題了";
        }
    }

    getOrderLabelOfDeadline(order) {
        switch (order.getStateOfPayment()) {
            case 2: //"pending":
            case 3: //"waiting":
                return "截止時間：";
            case 5: //"completed":
                return "完成時間：";
            case 4: //"failure":
                return "訂單時間：";
        }
        return order.getLabelOfDeadline();
    }

    getInjectStyleOfEpayFootprintOrderAreaOfChoosePaymentTypeDiv(order) {
        const condition1 = Util.isOrEquals(order.getStateOfPayment(), 2, 3); //2:"pending", 3:"waiting"
        const condition2 = !Util.isOrEquals(order.getProcessOfPayment(), "atm", "cvs");
        return Util.getVisibleOrNone(condition1 && condition2, true);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfPaymentFailureDiv(order) {
        return Util.getVisibleOrNone(_.isEqual(4, order.getStateOfPayment()), true); //4:"failure"
    }

    onEpayFootprintOrderCheckoutButtonClicked(param) {
        const order = param.object;
        if (this.isWaitingToLinePay(order)) {
            this.routeToLinePayCheckoutPage(order.getRaw().contentOfRender);
        }
    }

    onEpayFootprintOrderCopyIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(Util.getHeadStringSplitBy(order.raw.infoOfPayment));
    }

    onEpayFootprintOrderCopyIdIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(Util.getHeadStringSplitBy(order.raw.id));
    }

    getInjectPropsOfEpayFootprintOrderValueTextField(order) {
        return {
            InputProps: {
                readOnly: Util.isOrEquals(order.getStateOfPayment(), 5, 4) //5:"completed", 4:"failure"
            }
        };
    }
}

export default ModularizedEpayFootprintComponent;
