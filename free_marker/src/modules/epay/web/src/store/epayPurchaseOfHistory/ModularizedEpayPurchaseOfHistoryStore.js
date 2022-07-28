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
        const states = _.isEqual(state, 'pending') ? ['pending', 'waiting'] : [state];

        return [
            {where: (stmt) => stmt.where('stateOfPayment', 'in', states)}
        ];
    }

    async fetch(view) {
        const state = this.getParamOfTypeOfTabInPath();
        const orders = await this.api.fetchPreciseOrders(this.getComponent(),
            ...this.conditionsOfDefault(state)
        );
        this.pushOrders(...orders.map(order => this.normalizeOrder(order)));
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
            return _.toLower(split.pop());
        }

        function isATM() {
            return _.startsWith(getKeywordOfProcedure(), 'atm');
        }

        function isWebATM() {
            return _.startsWith(getKeywordOfProcedure(), 'webatm');
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

        function getByEachPaymentType(map) {
            let target = undefined;
            if (isATM()) {
                target = {atm: map.atm};
            } else if (isCVS()) {
                target = {cvs: map.cvs};
            } else if (isCredit()) {
                target = {credit: map.cvs};
            } else if (isLinePay()) {
                target = {linepay: map.linepay};
            } else if (isWebATM()) {
                target = {webatm: map.webatm};
            } else if (isUnknown()) {
                target = {unknown: map.unknown};
            } else {
                throw new ERROR(9999, `54564564371 不應該走到這裡`)
            }


            const value = Util.getObjectValue(target);
            if (_.isUndefined(value)) {
                throw new ERROR(9999, `545645643456 ${Util.getObjectKey(target)} 沒有定義`);
            }
            return value;
        }

        function getStringOfRule() {
            return getByEachPaymentType({
                cvs: `超商代碼`,
                credit: `信用卡支付`,
                linepay: `LINE-PAY線上支付`,
                atm: `銀行轉帳`,
                webatm: `網銀付款`,
                unknown: `尚未選擇`,
            });
        }

        function getStringOfPaymentType() {
            return getByEachPaymentType({
                cvs: `cvs`,
                credit: `credit`,
                linepay: `linepay`,
                atm: `atm`,
                webatm: `webatm`,
                unknown: `unknown`,
            });
        }

        function getStringOfDomain() {
            return getByEachPaymentType({
                cvs: `全家、7-11、萊爾富`,
                atm: `分行代碼(${_.split(order.infoOfPayment, Util.getSeparatorOfUnique()).shift()})`,
                credit: ``,
                linepay: ``,
                webatm: ``,
                unknown: ``,
            });
        }

        function getStringOfCode() {
            return getByEachPaymentType({
                cvs: _.split(order.infoOfPayment, Util.getSeparatorOfUnique()).shift(),
                atm: _.split(order.infoOfPayment, Util.getSeparatorOfUnique()).pop(),
                credit: ``,
                linepay: ``,
                webatm: ``,
                unknown: ``,
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
            typeOfPayment: getStringOfPaymentType(),
            stateOfPayment: order.stateOfPayment,
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
            areaOfPaymentDetail: {
                domain: getStringOfDomain(),
                specificOfProduct: getStringOfSpecific(),
                sectionOfCode: {
                    code: getStringOfCode(),
                }
            },
        }
    }

    setCurrentTabByType(type) {
        const tab = _.find(this.getTabs(), (tab) => _.isEqual(tab.getType(), type));
        this.setValueOfSelectedTab(tab.getValue());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayPurchaseOfHistoryStore;
