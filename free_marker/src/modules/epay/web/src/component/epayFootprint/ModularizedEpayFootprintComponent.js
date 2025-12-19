const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Config from "../../config";
import Router from "../../router";
import BaseEpayFootprintComponent from "./BaseEpayFootprintComponent";
import Functions from "../../functions";

class ModularizedEpayFootprintComponent extends BaseEpayFootprintComponent {
    order = {};

    constructor(props) {
        super(props);
        this.registerScrollToBottomJob(this.getStore().fetch);
    }

    isValidOfParamOfTypeOfTab(string) {
        return Util.containsBy(["anonymousX", "all", "completed", "pending", "failure", "status", "unpaid", "unshipped", "succeed", "cancelled"], string);
    }

    isValidOfParamOfAuthor(author) {
        return Util.containsBy(["author", "user", "userX"], author);
    }

    onEpayFootprintTabTabClicked(param) {
        const tab = param.object;
        if (!_.isEqual(tab.getType(), this.paramOfTypeOfTab)) Router.gotoEpayFootprintPage(this, this.paramOfAuthor, tab.getType());
    }

    /** 匿名購物者，使用同樣的UI，所以來這蹭 */
    isAnonymousXUsage = () => {
        return _.isEqual(this.paramOfTypeOfTab, "anonymousX");
    };

    componentDidMount() {
        super.componentDidMount();
        this.getStore().setCurrentTabByType(this.paramOfTypeOfTab).then();
    }

    getInjectStyleOfEpayFootprintOrderOptionOfPendingIconButton(order) {
        return Util.getVisibleOrNone(!this.isAnonymousXUsage() && this.getStore().isStateOfPending(order), true);
    }

    getInjectStyleOfEpayFootprintOrderOptionOfTransportIconButton(order) {
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
         *  2. 未選擇付款方式 */
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

    /** 賣家取消訂單 */
    onEpayFootprintOrderOptionOfUnpaidIconButtonAuthorCancelOrderClicked(param) {
        const order = param.object;
        return async () => await this.remoteAuthorCancelUnpaidPreciseOrderBehavior(order.raw.id);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfSerialDiv(order) {
        const conditionA = Util.isOrEquals(order.getTypeOfTransport(), Config.TransportMethod.StoreFamily, Config.TransportMethod.Store711);
        const conditionB = _.isEqual(order.getStateOfPayment(), Config.StateOfPayment.Completed);
        return Util.getVisibleOrNone(conditionA && conditionB);
    }

    getInjectStyleOfEpayFootprintOrderAreaOfCvsDiv(order) {
        const conditionA = Util.isOrEquals(order.getTypeOfTransport(), Config.TransportMethod.StoreFamily, Config.TransportMethod.Store711);
        const conditionB = !_.isEqual(order.getStateOfPayment(), Config.StateOfPayment.Failure);
        return Util.getVisibleOrNone(conditionA && conditionB);
    }

    /** 賣家可能斯已卻認付款，幫賣家完成訂單 */
    onEpayFootprintOrderOptionOfUnpaidIconButtonAuthorForcePaidClicked(param) {
        const order = param.object;
        return async () => await this.remoteForceAuthor2PaidBehavior(order);
    }

    /** 賣家填寫運單(id, remarkOfAuthor) */
    onEpayFootprintOrderOptionOfTransportIconButtonAuthorFormedClicked(param) {
        const self = this;
        return async () => {
            self.order = param.object;
            await Util.syncDelay(10);
            this.getTransNotifyDivAlertDialogRef().open();
        };
    }

    onEpayFootprintTransNotifyDivClicked(param) {
        const serial = this.getStore().getDialogInputValueOfEpayFootprintTransNotify();
        if (_.size(serial) < 2) return this.showErrorSnackMessage(`物流編號填寫不正確`);
        this.remoteAuthorFormTransport(this.order, serial).then();
    }

    /** 賣家更新備註 */
    onEpayFootprintOrderRemarkOfAuthorTextFieldChange(param) {
        super.onEpayFootprintOrderRemarkOfAuthorTextFieldChange(param);
    }

    /** 買家主動刪除訂單 */
    onEpayFootprintOrderOptionOfPendingIconButtonDeleteOrderClicked(param) {
        const order = param.object;
        return async () => await this.remoteCancelUnpaidPreciseOrderBehavior(order.raw.id);
    }

    /** 買家更新備註 */
    onEpayFootprintOrderOptionOfPendingIconButtonUpdateRemarkClicked(param) {
        const self = this;
        const order = param.object;
        return async () => {
            if (self.isAnonymousXUsage()) this.showInfoSnackMessage(`未登入購物無法修改備註內容！`);
            await this.remoteUpdateOrderRemarkBehavior(order.raw.id, order().getRemark());
        };
    }

    remoteUpdateOrderRemarkBehavior = async (idOfPreciseOrder, remarkOfPreciseOrder) => {
        await Functions.httpOnCallUpdatePreciseOrderRemarkContent(this.getComponentInstance(), {
            idOfPreciseOrder,
            remarkOfPreciseOrder
        });
        this.showInfoSnackMessage(`更新${idOfPreciseOrder} 備註成功`);
    };

    remoteForceAuthor2PaidBehavior = async (order) => {
        const stateOfTransport = order.stateOfTransport;
        await Functions.httpOnCallForcePaidByAuthor(this.getComponentInstance(), { idOfPreciseOrder: order.raw.id });
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "author", stateOfTransport === Config.StateOfTransport.Needless ? "succeed" : "unshipped");
    };

    remoteAuthorCancelUnpaidPreciseOrderBehavior = async (id) => {
        await Functions.httpOnCallCancelPreciseOrder(this.getComponentInstance(), { idOfPreciseOrder: id });
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "author", "cancelled");
    };

    remoteAuthorFormTransport = async (order, serialOfTransport) => {
        await Functions.httpOnCallInformTransportingByAuthor(this.getComponentInstance(), {
            idOfPreciseOrder: order.raw.id,
            serialOfTransport,
            remarkOfAuthor: order.getRemarkOfAuthor()
        });
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "author", "succeed");
    };

    remoteCancelUnpaidPreciseOrderBehavior = async (id) => {
        await Functions.httpOnCallCancelPreciseOrder(this.getComponentInstance(), { idOfPreciseOrder: id });
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "user", "failure");
    };

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
        const condition3 = !_.isEqual(this.paramOfAuthor, "author");
        return Util.getVisibleOrNone(condition1 && condition2 && condition3, true);
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

    getInjectStyleOfEpayFootprintOrderAreaOfTransportDiv(order) {
        const type = order.getTypeOfTransport();
        const enable = type > 0 && type !== Config.TransportMethod.Needless;
        return Util.getVisibleOrNone(enable);
    }

    getOrderTransportBy(order) {
        return Config.LabelOfTransportMethod(order.getTypeOfTransport());
    }

    getPresetObjOfIreneQrcode() {
        return {
            main: "LINE",
            sub: "PAY",
            title: this.getStore().getPayNow()?.title,
            href: this.getStore().getPayNow()?.href,
            content: `NT$ ${this.getStore().getPayNow()?.price} 元`,
            caution: `(完成支付後，截圖給小編)`,
            color: `#06a748`
        };
    }

    getListInjectStyleOfEpayFootprintTabTab(epayFootprint) {
        return Util.getVisibleOrNone(!this.isAnonymousXUsage(), false);
    }
}

export default ModularizedEpayFootprintComponent;
