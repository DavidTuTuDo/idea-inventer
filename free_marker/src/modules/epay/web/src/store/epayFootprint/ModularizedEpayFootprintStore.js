const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { filter, find, isUndefined, size, split, startsWith, toLower } from "lodash-es";
import UserInfoRef from "../../base/BaseUserInfo";
import EpayPreciseOrderStore from "../epayPreciseOrder";
import BaseEpayFootprintStore from "./BaseEpayFootprintStore";
import Config from "../../config";
import { toJS } from "mobx";

class ModularizedEpayFootprintStore extends BaseEpayFootprintStore {
    constructor(props) {
        super(props);
        this.api = new EpayPreciseOrderStore();
    }

    async onInitialFetchBeginning() {
        const payNow = Util.cloneDeep(toJS(this.getPayNow()));
        this.setInitialFetchCompleted(false);
        this.clean();
        this.setPayNow(payNow);

        switch (this.getRoleOfPerspective()) {
            case "user":
                this.setTabs(...filter(this.getTabs(), (each) => each.getValue() < 10));
                break;
            case "author":
                this.setTabs(...filter(this.getTabs(), (each) => each.getValue() > 10));
                break;
        }
    }

    getRoleOfPerspective = () => {
        switch (this.getParamOfAuthorInPath()) {
            case "author":
                return "author";
            case "user":
                return "user";
            default:
                return "user";
        }
    };

    /** 賣家視角*/
    isRoleOfAuthor = (order) => {
        return Util.isEqual(UserInfoRef.getUid(), order.idOfAuthor) && Util.isEqual(this.getRoleOfPerspective(), "author");
    };

    /** 買家視角 */
    isRoleOfUser = (order) => {
        return Util.isEqual(order.anonymous, true) || (Util.isEqual(UserInfoRef.getUid(), order.idOfUser) && Util.isEqual(this.getRoleOfPerspective(), "user"));
    };

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        console.log("onInitialFetchCompleted !!!!! ", this.getPayNow());

        if (this.getPayNow()?.price > 0) {
            console.log("必須進來");
            this.getComponent().getPayNowDivAlertDialogRef().open();
        }
    }

    conditionsOfBuyerDefault(state) {
        /** admin 可以看到所有訂單 */
        const conditionOfDefault = UserInfoRef.isAdmin() ? {} : { type: "where", params: ["idOfUser", "==", UserInfoRef.getUid()] };
        const conditions = [];
        switch (state) {
            case "pending":
                conditions.push({ type: "where", params: ["stateOfPayment", "in", [Config.StateOfPayment.Pending, Config.StateOfPayment.Waiting]] });
                break;
            case "processing":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", Config.StateOfPayment.Completed] }); //5:completed
                conditions.push({ type: "where", params: ["stateOfTransport", "==", Config.StateOfTransport.Pending] }); //2:pending
                break;
            case "completed":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", Config.StateOfPayment.Completed] }); //5:completed
                conditions.push({ type: "where", params: ["stateOfTransport", "in", [Config.StateOfTransport.Needless, Config.StateOfTransport.Sending]] }); //1:needless 3:sending
                break;
            case "failure":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", Config.StateOfPayment.Failure] }); //4:failure
                break;
        }
        return [conditionOfDefault, ...conditions];
    }

    /** 如果不用 => function 補花會失敗，this.getParamOfTypeOfTabInPath() 會找不到*/
    fetch = async (view) => {
        const state = this.getParamOfTypeOfTabInPath();
        const ordersOfRemote = [];
        switch (state) {
            /** 買家看到的選項 */
            case "all":
            case "pending":
            case "completed":
            case "processing":
            case "failure":
                return await this.fetchAndPushOrders(view, this.conditionsOfBuyerDefault(state));
            /** 賣家看到的選項 */
            case "status":
            case "unpaid":
            case "unshipped":
            case "succeed":
            case "cancelled":
                return await this.fetchAndPushOrders(view, this.conditionsOfSellerDefault(state));
            case "anonymousX":
                console.log(`被anonymousXDeal當作ref，忽略這次fetch()`);
                break;
            default:
                throw new Error(`fetch() state => ${state}`);
        }
    };

    fetchAndPushOrders = async (view, conditions) => {
        const ordersOfRemote = [];
        const isInitialFetch = size(this.getOrders()) === 0;

        if (isInitialFetch) {
            // 先讓 Tab 的點擊漣漪與切換動畫流暢地播放完畢
            await Util.syncDelay(250);
        }

        this.setState("loading");
        try {
            if (!isInitialFetch) {
                ordersOfRemote.push(...(await this.api.fetchNextPreciseOrders(undefined, this.getOrderOfLast().raw, ...conditions)));
            } else {
                ordersOfRemote.push(...(await this.api.fetchPreciseOrders(undefined, ...conditions)));
            }
            this.pushOrders(...ordersOfRemote);
            if (size(ordersOfRemote) === 0) {
                this.setHasNextPageBehavior(false);
            }
        } catch (error) {
            this.getComponent()?.showErrorSnackMessage(error.message);
            throw error;
        } finally {
            this.setState("stable");
        }
    };

    ruleOfPreviouslySort(orders) {
        return orders.map((order) => this.normalizeOrder(order));
    }

    conditionsOfSellerDefault(type) {
        const conditionOfDefault = { type: "where", params: ["idOfAuthor", "==", UserInfoRef.getUid()] };
        const conditions = [];

        switch (type) {
            case "unpaid":
                conditions.push({ type: "where", params: ["stateOfPayment", "in", [Config.StateOfPayment.Pending, Config.StateOfPayment.Waiting]] });
                break;
            case "unshipped":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", Config.StateOfPayment.Completed] }); //5:completed
                conditions.push({ type: "where", params: ["stateOfTransport", "==", Config.StateOfTransport.Pending] }); //2:pending
                break;
            case "succeed":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", Config.StateOfPayment.Completed] }); //5:completed
                conditions.push({ type: "where", params: ["stateOfTransport", "in", [Config.StateOfTransport.Needless, Config.StateOfTransport.Sending]] }); //1:needless 3:sending
                break;
            case "cancelled":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", Config.StateOfPayment.Failure] }); //4:failure
                break;
        }
        return [conditionOfDefault, ...conditions];
    }

    normalizeOrder = (order) => {
        const self = this;

        function normalizeBriefFromOrderItem(item) {
            return {
                imageOfProductPhoto: item.imageUrlOfProduct,
                nameOfProduct: item.name,
                specificOfProduct: item.specific,
                quantity: `x${item.quantity}`,
                price: `$${item.price}`
            };
        }

        function getKeywordOfProcedure() {
            const procedureParts = split(order.procedureOfPayment, Util.getSeparatorOfUnique());
            const target = toLower(procedureParts.pop());
            return target;
        }

        function isATM() {
            return startsWith(getKeywordOfProcedure(), "atm");
        }

        function isWebATM() {
            return startsWith(getKeywordOfProcedure(), "webatm");
        }

        function isECPay() {
            return startsWith(getKeywordOfProcedure(), "ecpay");
        }

        function isCVS() {
            return startsWith(getKeywordOfProcedure(), "cvs");
        }

        function isCredit() {
            return startsWith(getKeywordOfProcedure(), "credit");
        }

        function isLinePay() {
            return startsWith(getKeywordOfProcedure(), "linepay");
        }

        function isIPassMoney() {
            return startsWith(getKeywordOfProcedure(), "digitalpayment_ipass");
        }

        function isAuthorForcePaid() {
            return startsWith(getKeywordOfProcedure(), "authorforcepaid");
        }

        /** 用戶下了訂單, 但沒有走到付款頁面 */
        function isUnknown() {
            return startsWith(getKeywordOfProcedure(), "unknown");
        }

        function getByEachPaymentProcess(map) {
            let target = undefined;
            if (isATM()) {
                target = { atm: map.atm };
            } else if (isCVS()) {
                target = { cvs: map.cvs };
            } else if (isCredit()) {
                target = { credit: map.credit };
            } else if (isLinePay()) {
                target = { linepay: map.linepay };
            } else if (isWebATM()) {
                target = { webatm: map.webatm };
            } else if (isUnknown()) {
                target = { unknown: map.unknown };
            } else if (isECPay()) {
                target = { ecpay: map.ecpay };
            } else if (isAuthorForcePaid()) {
                target = { author: map.author };
            } else if (isIPassMoney()) {
                target = { iPASSMoney: map.iPASSMoney };
            } else {
                target = { error: map.error };
                // throw new ERROR(9999, `54564564371 不應該走到這裡`)
            }

            const value = Util.getObjectValue(target);
            if (isUndefined(value)) {
                throw new ERROR(9999, `545645643456 ${Util.getObjectKey(target)} 沒有定義`);
            }
            return value;
        }

        function getStringOfRule() {
            return getByEachPaymentProcess({
                cvs: `超商代碼`,
                credit: `信用卡支付`,
                linepay: `LINE-PAY線上支付`,
                atm: `銀行轉帳`,
                webatm: `網銀付款`,
                unknown: `尚未選擇`,
                ecpay: `綠界支付`,
                author: `賣家自行確認`,
                iPASSMoney: `iPASS MONEY`,
                error: `未知的錯誤`
            });
        }

        function getStringOfPaymentProcess() {
            return getByEachPaymentProcess({
                cvs: `cvs`,
                credit: `credit`,
                linepay: `linepay`,
                atm: `atm`,
                webatm: `webatm`,
                unknown: `unknown`,
                ecpay: `ecpay`,
                author: `author`,
                iPASSMoney: `iPASSMoney`,

                error: `error`
            });
        }

        function getStringOfDomain() {
            return getByEachPaymentProcess({
                cvs: `全家、7-11、萊爾富`,
                atm: `分行代碼(${split(order.infoOfPayment, Util.getSeparatorOfUnique()).shift()})`,
                credit: ``,
                linepay: ``,
                webatm: ``,
                unknown: ``,
                error: ``,
                author: ``,
                iPASSMoney: ``,
                ecpay: ``
            });
        }

        function getStringOfCode() {
            return getByEachPaymentProcess({
                cvs: split(order.infoOfPayment, Util.getSeparatorOfUnique()).shift(),
                atm: split(order.infoOfPayment, Util.getSeparatorOfUnique()).pop(),
                credit: ``,
                linepay: ``,
                webatm: ``,
                unknown: ``,
                error: ``,
                author: ``,
                ecpay: ``,
                iPASSMoney: ``
            });
        }

        function getStringOfPaymentState() {
            const state = order.stateOfPayment;
            const transport = order.stateOfTransport;
            const Payment = Config.StateOfPayment;
            const Transport = Config.StateOfTransport;

            switch (true) {
                // User邏輯
                case self.isRoleOfUser(order) && state === Payment.Completed && Util.isOrEquals(transport, Transport.Needless, Transport.Sending):
                    return "已完成";
                case self.isRoleOfUser(order) && state === Payment.Completed && transport === Transport.Pending:
                    return "待出貨";
                case self.isRoleOfUser(order) && state === Payment.Failure:
                    return "已失效";
                case self.isStateOfPending(order):
                    return "待付款";
                // Author邏輯
                case self.isStateOfUnpaid(order):
                    return "未付款";
                case self.isStateOfUnShipped(order):
                    return "未出貨";
                case self.isRoleOfAuthor(order) && state === Payment.Completed && Util.isOrEquals(transport, Transport.Needless, Transport.Sending):
                    return "已成立";
                case self.isRoleOfAuthor(order) && state === Payment.Failure:
                    return "已作廢";
                default:
                    return "未歸類";
            }
        }

        function getStringOfSpecific() {
            return order.specific;
        }

        return {
            raw: order,
            name: order.name,
            phoneNumber: order.phoneNumber,
            needAddress: order.needAddress,
            address: order.address,
            remarkDisabled: order.anonymous,
            anonymous: order.anonymous,
            processOfPayment: getStringOfPaymentProcess(),
            stateOfPayment: order.stateOfPayment,
            stateOfTransport: order.stateOfTransport,
            timeOfCreate: order.timeOfCreate,
            timeOfExpired: order.timeOfExpired,
            timeOfPayment: order.timeOfPayment,
            timeOfCancel: order.timeOfCancel,
            timeOfShipped: order.timeOfShipped,
            remarkOfAuthor: order.remarkOfAuthor,
            photoOfAuthors: order.photoOfAuthors,
            isShipped: order.isShipped,
            cvs: order.cvs,
            stringOfOrderIdentity: order.id,
            stateOfOrder: getStringOfPaymentState(),
            briefs: order.items.map((item) => normalizeBriefFromOrderItem(item)),
            valueOfTotalPrice: `$${order.priceOfTotal}`,
            rule: getStringOfRule(),
            deadline: Util.getECPayCurrentTimeFormat(this.normalizeTimestamp(order.timeOfExpired)),
            remark: order.remark,
            pickUpCVS: order.cvs?.storeid ? `${order.cvs.storeid}（${order.cvs.storename ?? "未提供"}）` : `待提供`,
            domain: getStringOfDomain(),
            specificOfProduct: getStringOfSpecific(),
            code: getStringOfCode(),
            reason: `${order.messageOfPayment}`,
            idOfUser: order.idOfUser,
            idOfAuthor: order.idOfAuthor,
            typeOfTransport: order.typeOfTransport,
            serialOfTransport: order.serialOfTransport
        };
    };

    /** (買家看的畫面) 待付款 */
    isStateOfPending = (order) => {
        const Payment = Config.StateOfPayment;
        const state = order.stateOfPayment;
        return this.isRoleOfUser(order) && (state === Payment.Pending || state === Payment.Waiting);
    };

    /**  (賣家看的畫面) 未付款 */
    isStateOfUnpaid = (order) => {
        const Payment = Config.StateOfPayment;
        const state = order.stateOfPayment;
        return this.isRoleOfAuthor(order) && (state === Payment.Pending || state === Payment.Waiting);
    };

    /**  (賣家看的畫面) 未出貨：未付款就不會出現在未出貨 */
    isStateOfUnShipped = (order) => {
        const Payment = Config.StateOfPayment;
        const Deliver = Config.StateOfTransport;
        const state = order.stateOfPayment;
        const transport = order.stateOfTransport;
        return this.isRoleOfAuthor(order) && state === Payment.Completed && transport === Deliver.Pending;
    };

    async setCurrentTabByType(type) {
        await Util.syncDelay(10);
        const tab = find(this.getTabs(), (tab) => Util.isEqual(tab.getType(), type));
        this.setValueOfTabClickedTab(tab?.value);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayFootprintStore;
