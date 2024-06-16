const edit = true;
import BaseEstablishStore from "./BaseEstablishStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS, override} from "mobx";
import OrderStore from '../mainOrder';

class EstablishStore extends BaseEstablishStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfOrder = new OrderStore();
    }

    /** 團員的額外折扣(小孩不用床) */
    @computed
    get getComputedDiscountOfMember() {
        const totalOfMemberDiscount = _.sum(this.getMembers().map(member => member.getDiscount()))
        return totalOfMemberDiscount > 0 ? totalOfMemberDiscount : 0;
    }

    /** 信用卡手續費總和 */
    @computed
    get getComputedFeeOfCreditProcedure() {
        const totalOfCreditProcedure = _.sum(this.getRecords().map(record => record.getFeeOfProcedure()))
        return totalOfCreditProcedure > 0 ? totalOfCreditProcedure : 0;
    }

    @computed
    get getComputedBalance() {
        const expense = _.multiply(this.getCountOfPeople(), _.subtract(this.getPriceOfAgent(), this.getPriceOfDiscount())) /** 旅行社成本 */
        const discount = _.sum(this.getMembers().map(member => member.getDiscount())) /** 成員的折扣 */
        const feeOfReceive = _.sum(this.records.map((record) => record.getFeeOfPaid())) /** 已實收 */
        const feeOfProcedure = _.sum(this.records.map((record) => record.getFeeOfProcedure())) /** 信用卡手續費 */
        return _.subtract(feeOfReceive, _.sum([expense,discount,feeOfProcedure]));
    }

    /** 成本 =  旅行社報價 - 折扣 x 人數*/
    @computed
    get getExpenseOfProject() {
        const expense = _.multiply(this.getCountOfPeople(), _.subtract(this.getPriceOfAgent(), this.getPriceOfDiscount())) /** 旅行社成本 */
        const discount = _.sum(this.getMembers().map(member => member.getDiscount())) /** 成員的折扣 */
        const result = _.subtract(expense, discount);
        return result > 0 ? result : 0;
    }

    /** 甲方預估能收到的錢 */
    @computed
    get getComputedPriceOfTotal() {
        let thePriceOfSelected = 0;
        switch (this.getSelectedPayMethod()) {
            case '2':
                thePriceOfSelected = this.getPriceOfCredit();
                break;
            default:
                thePriceOfSelected = this.getPriceOfCash();
                break;
        }

        const price = _.multiply(this.getCountOfPeople(), thePriceOfSelected); /** 甲方開的價格 */
        const discount = _.sum(this.getMembers().map(member => member.getDiscount())) /** 成員的額外總折扣 */
        const result = _.subtract(price , discount);
        this.setPriceOfTotal(result);
        return result;
    }

    /** 已收費用(不含手續費)*/
    @computed
    get getComputedPriceHasPaid() {
        const feeOfReceive = _.sum(this.records.map((record) => record.getFeeOfPaid())) /** 已實收 */
        const feeOfProcedure = _.sum(this.records.map((record) => record.getFeeOfProcedure())) /** 信用卡手續費 */
        const result = _.subtract(feeOfReceive,feeOfProcedure);
        this.setPriceHasPaid(result);
        return result;
    }

    @action
    pushSingleMember(item = {}) {
        this.pushMember(item)
        this.pushPerson(item);
    }

    @action
    updateSingleMember(item = {}) {
        const member = this.getMemberById(item.id);
        const person = this.getPersonById(item.id);
        this.removeMembers(member);
        this.removePersons(person);

        this.pushSingleMember(item);
    }

    @action
    setBatchMember(...members) {
        this.setMembers(...members);
        this.setPersons(...members);
    }

    @action
    deleteMemberById = (id) => {
        this.removeMembers(this.getMemberById(id));
        this.removePersons(this.getPersonById(id));
    }

    @action
    pushSingleRecord(item = {}) {
        this.pushRecord(item)
        this.pushIncome(item);
    }

    @action
    updateSingleRecord(item = {}) {
        const record = this.getRecordById(item.id);
        const income = this.getIncomeById(item.id);
        this.removeRecords(record);
        this.removeIncomes(income);

        this.pushSingleRecord(item);
    }

    @action
    setBatchRecord(...members) {
        this.setMembers(...members);
        this.setPersons(...members);
    }

    @action
    deleteRecordById = (id) => {
        this.removeRecords(this.getRecordById(id));
        this.removeIncomes(this.getIncomeById(id));
    }

    getMemberById = (id) => {
        return _.find(this.getMembers(),
            (member) => _.isEqual(id, member.id));
    }

    getPersonById = (id) => {
        return _.find(this.getPersons(),
            (person) => _.isEqual(id, person.id));
    }

    getRecordById = (id) => {
        return _.find(this.getRecords(),
            (record) => _.isEqual(id, record.id));
    }

    getIncomeById = (id) => {
        return _.find(this.getIncomes(),
            (income) => _.isEqual(id, income.id));
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        this.setBalanceDisabled(true);
        this.setPriceHasPaidDisabled(true);
        this.setPriceOfTotalDisabled(true);
        this.initialDestinationSuggestBehavior(Config.COUNTRY_OF_TRAVEL);
    }

    result = () => {
        const submit = this.columnData();
        submit.destination = _.isObject(submit.destination) ? submit.destination.value : '0';
        submit.idOfOrder = UserInfoRef.getUid()
        return submit;
    }

    async submitOrder() {
        const result = await this.apiOfOrder.submitOrderItem(this.getComponent(), this.result());
        Application.getMainStore().pushOrdersByIndex(-1, result.value);
        this.setId(result.value.id);
    }

    async updateOrder() {
        const bean = this.result();
        await this.apiOfOrder.updateOrderItem(this.getComponent(), bean, bean.id);
        Application.getMainStore().updateOrder(bean);
    }

    decorate(result) {
        const origin = super.decorate(result);
        const numberOfDestination = _.toNumber(origin.destination);
        origin.destination = numberOfDestination > 0 ? _.find(Config.COUNTRY_OF_TRAVEL, ['value', `${numberOfDestination}`]) : undefined;
        return origin;
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishStore;
