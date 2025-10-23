const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import EpayPreciseOrderStore from "../epayPreciseOrder";
import BaseEpayFootprintStore from "./BaseEpayFootprintStore";
import Config from "../../config";

class ModularizedEpayFootprintStore extends BaseEpayFootprintStore {
    constructor(props) {
        super(props);
        this.api = new EpayPreciseOrderStore();
    }

    async onInitialFetchBeginning() {
        switch (this.getRoleOfPerspective()) {
            case "user":
                this.setTabs(..._.filter(this.getTabs(), (each) => each.getValue() < 10));
                break;
            case "author":
                this.setTabs(..._.filter(this.getTabs(), (each) => each.getValue() > 10));
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
        return _.isEqual(UserInfoRef.getUid(), order.idOfAuthor) && _.isEqual(this.getRoleOfPerspective(), "author");
    };

    /** 買家視角 */
    isRoleOfUser = (order) => {
        return _.isEqual(UserInfoRef.getUid(), order.idOfUser) && _.isEqual(this.getRoleOfPerspective(), "user");
    };

    conditionsOfBuyerDefault(state) {
        /** ↓---------------------等Enum做出來就要刪掉 ----------------------↓ */
        const rawText = `
        asking: 等待賣家允許付費(尚未設計); 1
        pending: 訂單已成立; 2
        waiting: 訂單已成立, 而且選擇了第三方平台, 等待付費(CVS,ATM); 3
        failure: 訂單已失效, 交易商品數量已atomic加回去; 4
        completed: 訂單已完成; 5`;

        // 建立 enum-like 映射物件
        const StateEnum = _(rawText.trim().split("\n"))
            .map((line) => {
                const [keyWithDesc, valueStr] = line.split(";").map((s) => s.trim());
                const [key] = keyWithDesc.split(":").map((s) => s.trim());
                return [key, Number(valueStr)];
            })
            .fromPairs()
            .value();

        // 查詢函式
        function getValueByState(stateName) {
            return _.get(StateEnum, stateName, null); // 若找不到則回傳 null
        }

        /** ↑---------------------等Enum做出來就要刪掉 ----------------------↑ */

        /** all的話就全拿 */
        const conditionOfDefault = { type: "where", params: ["idOfUser", "==", UserInfoRef.getUid()] };
        if (_.isEqual(state, "all")) {
            return [conditionOfDefault];
            /** 如果return undefined會拿不到資料 */
        }

        const states = _.isEqual(state, "pending") ? [2, 3] : [getValueByState(state)]; //2:pending", 3:waiting"
        return [{ type: "where", params: ["stateOfPayment", "in", states] }, conditionOfDefault];
    }

    fetch = async (view) => {
        const state = this.getParamOfTypeOfTabInPath();
        const ordersOfRemote = [];
        switch (state) {
            /** 買家看到的選項 */
            case "all":
            case "pending":
            case "completed":
            case "failure":
                await this.fetchAndPushOrders(view, this.conditionsOfBuyerDefault(state));
                break;
            /** 賣家看到的選項 */
            case "status":
            case "unpaid":
            case "unshipped":
            case "succeed":
            case "cancelled":
                await this.fetchAndPushOrders(view, this.conditionsOfSellerDefault(state));
                break;
        }
    };

    fetchAndPushOrders = async (view, conditions) => {
        const ordersOfRemote = [];
        if (_.size(this.getOrders()) > 0) {
            ordersOfRemote.push(...(await this.api.fetchNextPreciseOrders(view, this.getOrderOfLast().raw, ...conditions)));
        } else {
            ordersOfRemote.push(...(await this.api.fetchPreciseOrders(this.getComponent(), ...conditions)));
        }
        this.pushOrders(...ordersOfRemote.map((order) => this.normalizeOrder(order)));
        if (_.size(ordersOfRemote) === 0) {
            this.setHasNextPageBehavior(false);
        }
    };

    conditionsOfSellerDefault(type) {
        const conditionOfDefault = { type: "where", params: ["idOfAuthor", "==", UserInfoRef.getUid()] };
        const conditions = [];
        switch (type) {
            case "unpaid":
                conditions.push({ type: "where", params: ["stateOfPayment", "in", [2, 3]] });
                break;
            case "unshipped":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", 5] }); //5:completed
                conditions.push({ type: "where", params: ["stateOfTransport", "==", 2] }); //2:pending
                break;
            case "succeed":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", 5] }); //5:completed
                conditions.push({ type: "where", params: ["stateOfTransport", "in", [1, 3]] }); //1:needless 3:sending
                break;
            case "cancelled":
                conditions.push({ type: "where", params: ["stateOfPayment", "==", 4] }); //4:failure
                break;
            default:
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
            const split = _.split(order.procedureOfPayment, Util.getSeparatorOfUnique());
            const target = _.toLower(split.pop());
            return target;
        }

        function isATM() {
            return _.startsWith(getKeywordOfProcedure(), "atm");
        }

        function isWebATM() {
            return _.startsWith(getKeywordOfProcedure(), "webatm");
        }

        function isECPay() {
            return _.startsWith(getKeywordOfProcedure(), "ecpay");
        }

        function isCVS() {
            return _.startsWith(getKeywordOfProcedure(), "cvs");
        }

        function isCredit() {
            return _.startsWith(getKeywordOfProcedure(), "credit");
        }

        function isLinePay() {
            return _.startsWith(getKeywordOfProcedure(), "linepay");
        }

        function isAuthorForcePaid() {
            return _.startsWith(getKeywordOfProcedure(), "authorforcepaid");
        }

        /** 用戶下了訂單, 但沒有走到付款頁面 */
        function isUnknown() {
            return _.startsWith(getKeywordOfProcedure(), "unknown");
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
            } else {
                target = { error: map.error };
                // throw new ERROR(9999, `54564564371 不應該走到這裡`)
            }

            const value = Util.getObjectValue(target);
            if (_.isUndefined(value)) {
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
                error: `error`
            });
        }

        function getStringOfDomain() {
            return getByEachPaymentProcess({
                cvs: `全家、7-11、萊爾富`,
                atm: `分行代碼(${_.split(order.infoOfPayment, Util.getSeparatorOfUnique()).shift()})`,
                credit: ``,
                linepay: ``,
                webatm: ``,
                unknown: ``,
                error: ``,
                author: ``,
                ecpay: ``
            });
        }

        function getStringOfCode() {
            return getByEachPaymentProcess({
                cvs: _.split(order.infoOfPayment, Util.getSeparatorOfUnique()).shift(),
                atm: _.split(order.infoOfPayment, Util.getSeparatorOfUnique()).pop(),
                credit: ``,
                linepay: ``,
                webatm: ``,
                unknown: ``,
                error: ``,
                author: ``,
                ecpay: ``
            });
        }

        function getStringOfPaymentState() {
            const state = order.stateOfPayment;
            const transport = order.stateOfTransport;
            const Payment = Config.StateOfPayment;
            const Transport = Config.StateOfTransport;

            switch (true) {
                // User邏輯
                case self.isRoleOfUser(order) && state === Payment.Completed:
                    return "已完成";
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
            processOfPayment: getStringOfPaymentProcess(),
            stateOfPayment: order.stateOfPayment,
            stateOfTransport: order.stateOfTransport,
            timeOfCreate: order.timeOfCreate,
            timeOfExpired: order.timeOfExpired,
            timeOfPayment: order.timeOfPayment,
            timeOfCancel: order.timeOfCancel,
            timeOfShipped: order.timeOfCancel,
            remarkOfAuthor: order.remarkOfAuthor,
            photoOfAuthors: order.photoOfAuthors,
            isShipped: order.isShipped,
            stringOfOrderIdentity: order.id,
            stateOfOrder: getStringOfPaymentState(),
            briefs: order.items.map((item) => normalizeBriefFromOrderItem(item)),
            valueOfTotalPrice: `$${order.priceOfTotal}`,
            rule: getStringOfRule(),
            deadline: Util.getECPayCurrentTimeFormat(this.normalizeTimestamp(order.timeOfExpired)),
            remark: order.remark,
            domain: getStringOfDomain(),
            specificOfProduct: getStringOfSpecific(),
            code: getStringOfCode(),
            reason: `${order.messageOfPayment}`,
            idOfUser: order.idOfUser,
            idOfAuthor: order.idOfUser,
            typeOfTransport: order.typeOfTransport
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
        const Transport = Config.StateOfTransport;
        const state = order.stateOfPayment;
        const transport = order.stateOfTransport;

        return this.isRoleOfAuthor(order) && state === Payment.Completed && transport === Transport.Pending;
    };

    async setCurrentTabByType(type) {
        await Util.syncDelay(10);
        const tab = _.find(this.getTabs(), (tab) => _.isEqual(tab.getType(), type));
        this.setValueOfTabClickedTab(tab.getValue());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayFootprintStore;
