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
        return Util.getVisibleOrNone(Util.isOrEquals(order.getStateOfPayment(), "waiting", "pending"));
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
        return _.isEqual(order.getTypeOfPayment(), "linepay") && _.isEqual(order.getStateOfPayment(), "waiting");
    }

    isWaitingPendingState(order) {
        return _.isEqual(order.getStateOfPayment(), "pending") || _.isEqual(order.getStateOfPayment(), "waiting");
    }

    onEpayFootprintOrderExtraIconButtonDeleteOrderClicked(param) {
        return async () => {
            const order = param.object.getParentNode();
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

    async remoteCancelUnpaidPreciseOrderBehavior(idOfPreciseOrder) {
        const result = await Functions.httpOnCallCancelPreciseOrder(this.getComponentInstance(), { idOfPreciseOrder });
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "failure");
    }

    getOrderDeadline(order) {
        switch (order.getStateOfPayment()) {
            case "pending":
                return order.getDeadline();
            case "waiting":
                return order.getDeadline();
            case "completed":
                return Util.getCurrentTimeFormatV2(order.getTimeOfPayment());
            case "failure":
                return Util.getCurrentTimeFormatV2(order.getTimeOfCreate());
        }
        return areaOfPaymentDeadline.getDeadline();
    }

    getOrderLabelOfDeadline(order) {
        switch (order.getStateOfPayment()) {
            case "pending":
            case "waiting":
                return "截止時間：";
            case "completed":
                return "完成時間：";
            case "failure":
                return "訂單時間：";
        }
        return order.getLabelOfDeadline();
    }

    getInjectStyleOfEpayFootprintOrderAreaOfChoosePaymentTypeDiv(order) {
        const condition1 = Util.isOrEquals(order.getStateOfPayment(), "pending", "waiting");
        const condition2 = !Util.isOrEquals(order.getProcessOfPayment(), "atm", "cvs");
        return Util.getVisibleOrNone(condition1 && condition2, true);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfPaymentFailureDiv(order) {
        return Util.getVisibleOrNone(_.isEqual("failure", order.getStateOfPayment()), true);
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
                readOnly: Util.isOrEquals(order.getStateOfPayment(), "completed", "failure")
            }
        };
    }
}

export default ModularizedEpayFootprintComponent;
