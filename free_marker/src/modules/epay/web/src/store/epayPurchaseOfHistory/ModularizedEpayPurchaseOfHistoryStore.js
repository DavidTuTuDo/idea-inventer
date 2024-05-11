import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import EpayPreciseOrderStore from "../epayPreciseOrder";
import BaseEpayPurchaseOfHistoryStore from './BaseEpayPurchaseOfHistoryStore';
import {object} from "prop-types";

class ModularizedEpayPurchaseOfHistoryStore extends BaseEpayPurchaseOfHistoryStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.api = new EpayPreciseOrderStore();

    }

    conditionsOfDefault(state) {
        /** all的話就全拿 */
        const conditionOfDefault = {where: (stmt) => stmt.where('idOfUser', '==', UserInfoRef.getUid())}


        if (_.isEqual(state, 'all')) {
            this.clearFetchConditions();
            return [conditionOfDefault];
            /** 如果return undefined會拿不到資料 */
        }

        const states = _.isEqual(state, 'pending') ? ['pending', 'waiting'] : [state];

        return [
            {where: (stmt) => stmt.where('stateOfPayment', 'in', states)},
            conditionOfDefault
        ];
    }

    fetch = async (view) => {
        const state = this.getParamOfTypeOfTabInPath();
        const ordersOfRemote = []
        if (_.size(this.getOrders()) > 0) {
            ordersOfRemote.push(...await this.api.fetchNextPreciseOrders(view, this.getOrderOfLast().raw, ...this.conditionsOfDefault(state)))
        } else {
            ordersOfRemote.push(...await this.api.fetchPreciseOrders(this.getComponent(), ...this.conditionsOfDefault(state)));
        }
        this.pushOrders(...ordersOfRemote.map(order => this.normalizeOrder(order)));
        if (_.size(ordersOfRemote) === 0) {
            this.setHasPageItems(false);
        }
    }

    normalizeOrder(order) {

        function normalizeBriefFromOrderItem(item) {
            return {
                imageOfProductPhoto: item.imageUrlOfProduct,
                nameOfProduct: item.name,
                quantity: `x${item.quantity}`,
                price: `$${item.price}`,
            }
        }

        function getKeywordOfProcedure() {
            const split = _.split(order.procedureOfPayment, Util.getSeparatorOfUnique());
            const target = _.toLower(split.pop());
            return target;
        }

        function isATM() {
            return _.startsWith(getKeywordOfProcedure(), 'atm');
        }

        function isWebATM() {
            return _.startsWith(getKeywordOfProcedure(), 'webatm');
        }


        function isECPay() {
            return _.startsWith(getKeywordOfProcedure(), 'ecpay');
        }


        function isCVS() {
            return _.startsWith(getKeywordOfProcedure(), 'cvs');
        }

        function isCredit() {
            return _.startsWith(getKeywordOfProcedure(), 'credit');
        }

        function isLinePay() {
            return _.startsWith(getKeywordOfProcedure(), 'linepay');
        }

        /** 用戶下了訂單, 但沒有走到付款頁面 */
        function isUnknown() {
            return _.startsWith(getKeywordOfProcedure(), 'unknown');
        }

        function getByEachPaymentProcess(map) {
            let target = undefined;
            if (isATM()) {
                target = {atm: map.atm};
            } else if (isCVS()) {
                target = {cvs: map.cvs};
            } else if (isCredit()) {
                target = {credit: map.credit};
            } else if (isLinePay()) {
                target = {linepay: map.linepay};
            } else if (isWebATM()) {
                target = {webatm: map.webatm};
            } else if (isUnknown()) {
                target = {unknown: map.unknown};
            } else if (isECPay()) {
                target = {ecpay: map.ecpay};

            } else {
                target = {error: map.error};
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
                error: `未知的錯誤`,
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
                error: `error`,
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
                ecpay: ``,
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
                ecpay: ``,
            });
        }

        function getStringOfPaymentState() {
            switch (order.stateOfPayment) {
                case 'completed':
                    return `已完成`;
                case 'failure':
                    return `已失效`;
                case 'pending':
                case 'waiting':
                    return `待付款`;
                default:
                    return `未歸類`;
            }
        }

        function getStringOfSpecific() {
            return order.specific;
        }

        return {
            raw: order,
            processOfPayment: getStringOfPaymentProcess(),
            stateOfPayment: order.stateOfPayment,
            timeOfCreate: order.timeOfCreate,
            timeOfExpired: order.timeOfExpired,
            timeOfPayment: order.timeOfPayment,
            timeOfCancel: order.timeOfCancel,
            areaOfTop: {
                stringOfOrderIdentity: order.id,
                stateOfOrder: getStringOfPaymentState(),
            },
            briefs: order.items.map((item) => normalizeBriefFromOrderItem(item)),
            valueOfTotalPrice: `$${order.priceOfTotal}`,
            areaOfPaymentRule: {
                rule: getStringOfRule(),
            },
            areaOfPaymentDeadline: {
                deadline: Util.getECPayCurrentTimeFormat(this.normalizeTimestamp(order.timeOfExpired)),
            },
            areaOfInputMessage: {
                value: order.remark,
            },
            areaOfPaymentDetail: {
                domain: getStringOfDomain(),
                specificOfProduct: getStringOfSpecific(),
                sectionOfCode: {
                    code: getStringOfCode(),
                }
            },
            areaOfPaymentFailure: {
                reason: `${order.messageOfPayment}`,
            }
        }
    }

    async setCurrentTabByType(type) {
        const tab = _.find(this.getTabs(), (tab) => _.isEqual(tab.getType(), type));
        this.setValueOfSelectedTab(-1000);
        await Util.syncDelay(100);
        this.setValueOfSelectedTab(tab.getValue());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayPurchaseOfHistoryStore;
