const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
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
        return Util.containsBy(["all", "completed", "pending", "failure", "status", "unpaid", "unshipped", "succeed", "cancelled"], string);
    }

    isValidOfParamOfAuthor(author) {
        return Util.containsBy(["author", "user"], author);
    }

    onEpayFootprintTabTabClicked(param) {
        const tab = param.object;
        if (!_.isEqual(tab.getType(), this.paramOfTypeOfTab)) Router.gotoEpayFootprintPage(this, this.paramOfAuthor, tab.getType());
    }

    componentDidMount() {
        super.componentDidMount();
        this.getStore().setCurrentTabByType(this.paramOfTypeOfTab).then();
    }

    getInjectStyleOfEpayFootprintOrderOptionOfPendingIconButton(order) {
        return Util.getVisibleOrNone(this.getStore().isStateOfPending(order), true);
    }

    getInjectStyleOfEpayFootprintOrderOptionOfShippedIconButton(order) {
        return Util.getVisibleOrNone(this.getStore().isStateOfUnShipped(order), true);
    }

    getInjectStyleOfEpayFootprintOrderOptionOfUnpaidIconButton(order) {
        return Util.getVisibleOrNone(this.getStore().isStateOfUnpaid(order), true);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfPaymentDetailDiv(order) {
        return Util.getVisibleOrNone(Util.isOrEquals(order.getProcessOfPayment(), "atm", "cvs"), true);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfFuncDiv(order) {
        /** 1. linepay 未付款
         *  2. 未選擇付款方式
         * */
        return Util.getVisibleOrNone(this.isWaitingPendingState(order) && Util.or(this.isUnknownOrder(order), this.isWaitingToLinePay(order)));
    }

    /** 沒有選擇付費方式的order(下完訂單就把頁面關掉)*/
    isUnknownOrder(order) {
        return _.isEqual(order.getTypeOfPayment(), "unknown");
    }

    /** 還沒付費的linepay order(走到Line-Pay,把付費頁面關掉) */
    isWaitingToLinePay(order) {
        return _.isEqual(order.getTypeOfPayment(), "linepay") && _.isEqual(order.getStateOfPayment(), Config.StateOfPayment.Waiting);
    }

    isWaitingPendingState(order) {
        return _.isEqual(order.getStateOfPayment(), "pending") || _.isEqual(order.getStateOfPayment(), Config.StateOfPayment.Waiting);
    }

    onEpayFootprintOrderOptionOfUnpaidIconButtonAuthorCancelOrderClicked(param) {
        super.onEpayFootprintOrderOptionOfUnpaidIconButtonAuthorCancelOrderClicked(param);
    }

    onEpayFootprintOrderOptionOfUnpaidIconButtonAuthorForcePaidClicked(param) {
        super.onEpayFootprintOrderOptionOfUnpaidIconButtonAuthorForcePaidClicked(param);
    }

    onEpayFootprintOrderOptionOfShippedIconButtonAuthorFormShippedClicked(param) {
        super.onEpayFootprintOrderOptionOfShippedIconButtonAuthorFormShippedClicked(param);
    }

    onEpayFootprintOrderOptionOfPendingIconButtonDeleteOrderClicked(param) {
        return async () => {
            const order = param.object;
            await this.remoteCancelUnpaidPreciseOrderBehavior(order.raw.id);
        };
    }

    onEpayFootprintOrderOptionOfPendingIconButtonUpdateRemarkClicked(param) {
        return async () => {
            const order = param.object.getParentNode();
            const latestRemarkOfOrder = order().getRemark();
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
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "user", "failure");
    }

    getOrderDeadline(order) {
        switch (order.getStateOfPayment()) {
            case Config.StateOfPayment.Pending:
                return order.getDeadline();
            case Config.StateOfPayment.Waiting:
                return order.getDeadline();
            case Config.StateOfPayment.Failure:
                return Util.getCurrentTimeFormatV2(order.getTimeOfCreate());
            case Config.StateOfPayment.Completed:
                return Util.getCurrentTimeFormatV2(order.getTimeOfPayment());
            default:
                return "886出問題了";
        }
    }

    getOrderLabelOfDeadline(order) {
        switch (order.getStateOfPayment()) {
            case Config.StateOfPayment.Pending:
            case Config.StateOfPayment.Waiting:
                return "截止時間：";
            case Config.StateOfPayment.Completed:
                return "完成時間：";
            case Config.StateOfPayment.Failure:
                return "訂單時間：";
        }
        return order.getLabelOfDeadline();
    }

    getInjectStyleOfEpayFootprintOrderAreaOfChoosePaymentTypeDiv(order) {
        const condition1 = Util.isOrEquals(order.getStateOfPayment(), Config.StateOfPayment.Pending, Config.StateOfPayment.Waiting);
        const condition2 = !Util.isOrEquals(order.getProcessOfPayment(), "atm", "cvs");
        return Util.getVisibleOrNone(condition1 && condition2, true);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfPaymentFailureDiv(order) {
        return Util.getVisibleOrNone(_.isEqual(Config.StateOfPayment.Failure, order.getStateOfPayment()), true);
    }

    onEpayFootprintOrderCheckoutButtonClicked(param) {
        const order = param.object;
        if (this.isWaitingToLinePay(order)) {
            this.routeToLinePayCheckoutPage(order.getRaw().contentOfRender);
        }
    }

    getWrapInjectStyleOfEpayFootprintOrderRemarkOfAuthorTextField(order) {
        return Util.getVisibleOrNone(this.getStore().isRoleOfAuthor(order), true);
    }

    /** 複製*/
    onEpayFootprintOrderCopyIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(Util.getTailStringSplitBy(order.raw.infoOfPayment));
    }

    onEpayFootprintOrderCopyIdIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(Util.getHeadStringSplitBy(order.raw.id));
    }

    getInjectPropsOfEpayFootprintOrderRemarkTextField(order) {
        return {
            InputProps: {
                readOnly: Util.isOrEquals(order.getStateOfPayment(), Config.StateOfPayment.Completed, Config.StateOfPayment.Failure)
            }
        };
    }

    getInjectPropsOfEpayFootprintOrderRemarkOfAuthorTextField(order) {
        return {
            InputProps: {
                readOnly: Util.isOrEquals(order.getStateOfPayment(), Config.StateOfPayment.Failure)
            }
        };
    }
}

export default ModularizedEpayFootprintComponent;
