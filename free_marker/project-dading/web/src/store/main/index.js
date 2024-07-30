const edit = true;
import BaseMainStore from "./BaseMainStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Order from "../mainOrder";
import Establish from '../establish';
import moment from "moment";

class MainStore extends BaseMainStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.establish = new Establish();
        this.apiOfOrder = new Order();
        this.setOrderConditions(
            [
                {type: 'orderBy', params: ['createTime', 'desc']}
            ]
        )
    }

    conditionOfOrderBy = -1;

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        /** test-case Of listenDocument,listenDocuments
         this.getComponent().subscribe(this.apiOfOrder.listenOrderItem(`jfk6ALWdhyoAi7f9LyJv`, this.handleOrderItemValidate));
         this.getComponent().subscribe(this.apiOfOrder.listenOrders(this.handleOrdersValidate)); */
        return result;
    }

    handleOrderItemValidate = (status, data, error)=> {
        Util.appendInfo(`4121321 handleOrderItemUpdate STATUS:`, status, ` DATA:`, data);
        if(_.isEqual('server', status))
            this.updateSpecificOrders(data);

    }

    handleOrdersValidate = (status, changes, error) => {
        Util.appendInfo(`4121321 handleOrderUpdate STATUS:`, status, ` changes:`, changes);
    }

    async deleteOrder(order) {
        await order.deleteOrderItem(this.getComponent());
    }

    fetchOrderById = async (id) => {
        return await this.apiOfOrder.fetchOrderItem(this.getComponent(), id);
    }

    async updateOrder(orderOfLast) {
        const order = _.find(this.getOrders(), (order) => _.isEqual(order.id, orderOfLast.id));
        order.initial(orderOfLast);
    }

    async appendOrder() {
        this.getOrders().forEach((order) => order.setIsHotCreate(false));
        const result = await this.apiOfOrder.submitOrderItem(this.getComponent(), {isHotCreate: true, members: [{}], records: [{}]}, undefined);
        if (result.succeed)
            this.pushOrdersByIndex(-1, {...result.value, isHotCreate: true});
    }


    invalidateOfRemote = (order) => {
        const self = this;
        if (order instanceof Order) {
            Util.executeTimeoutTask(
                async () => {
                    await self.apiOfOrder.updateOrderItem(self.getComponent(), {
                        startOfTravel: order.getStartOfTravel(),
                        host: order.getHost(),
                        contact: order.getContact(),
                        comment: order.getComment(),
                        priceOfDeposit: order.getPriceOfDeposit(),
                        countOfPeople: order.getCountOfPeople(),
                        selectedDestination: order.getSelectedDestination(),
                        selectedAgent: order.getSelectedAgent()
                    }, order.getId())
                    self.getComponent().showInfoSnackMessage(`已更新「${order.getHost()}」訂單`)
                }, 1800, "ID_OF_ASYNC_UPDATE_ORDER")
        }
    }

    async handleCustomFilter(filter) {
        const timestamp = this.normalizeTimestamp(filter.baseOn);
        this.clean();
        this.getFilter().setSelectedType(filter.selectedType);
        this.getFilter().setSelectedDestTo(filter.selectedDestTo)
        this.getFilter().setSelectedAgentTo(filter.selectedAgentTo)
        this.getFilter().setBaseOn(moment(timestamp))
        switch (filter.selectedType) {
            case 1:
                /** 訂購人 */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['host', '==', _.trim(filter.host)]},
                        {type: 'orderBy', params: ['createTime', 'desc']}
                    ]
                )
                break;
            case 2:
                /** 聯絡電話 */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['contact', '==', _.trim(filter.contact)]},
                        {type: 'orderBy', params: ['createTime', 'desc']}
                    ]
                )
                break;
            case 3:
                /** 目的地 */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['selectedDestination', '==', filter.selectedDestTo]},
                        {type: 'where', params: ['startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                    ]
                )
                break;
            case 4:
                /** 旅行社 */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['selectedAgent', '==', filter.selectedAgentTo]},
                        {type: 'where', params: ['startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                    ]
                )
                break;
        }
        await this.fetchOrders(this.getComponent());
        await this.onInitialFetchCompleted(this.data());

    }


    /** clean()之後，另外一個filter就會被初始化 */
    invalidate() {
        const selected = this.getAreaOfFunc().getSelectedOrderBy();
        const selectedOfCustom = this.getFilter().getSelectedType();
        if (selected === 5 || selectedOfCustom === 4) {
            /** 旅行社 */
            this.setOrders(..._.orderBy(this.getOrders(), ['selectedAgent', 'valueOfStartTravel'], ['asc', 'asc']))
        }

        if (selected === 6 || selectedOfCustom === 3) {
            /** 目的地 */
            this.setOrders(..._.orderBy(this.getOrders(), ['selectedDestination', 'valueOfStartTravel'], ['asc', 'asc']))
        }
    }

    async handleOrderByCondition(force) {
        const current = _.cloneDeep(this.getAreaOfFunc().getSelectedOrderBy());
        const timestamp = _.cloneDeep(this.getAreaOfFunc().getBaseOn())
        if (force) Util.appendInfo(`base time updated`);
        else if (this.conditionOfOrderBy === current) return
        this.clean();
        this.getAreaOfFunc().setSelectedOrderBy(current);
        this.getAreaOfFunc().setBaseOn(timestamp);
        switch (_.toNumber(current)) {
            case 1:
                /** 建單時間(遞增) */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['createTime', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                        {type: 'orderBy', params: ['createTime', 'asc']}
                    ]
                )
                break;
            case 2:
                /** 建單時間(遞減) */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['createTime', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                        {type: 'orderBy', params: ['createTime', 'desc']}
                    ]
                );
                break;
            case 3:
                /** 出發時間(遞增) */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                        {type: 'orderBy', params: ['startOfTravel', 'asc']}
                    ]
                )
                break;
            case 4:
                /** 建單時間(遞減) */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                        {type: 'orderBy', params: ['startOfTravel', 'desc']}
                    ]
                )
                break;
            case 5:/** 旅行社 */
            case 6:
                /** 目的地 */
                this.setOrderConditions(
                    [
                        {type: 'where', params: ['startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp))]},
                        {type: 'orderBy', params: ['startOfTravel', 'asc']}
                    ]
                )
                break;
        }
        await this.fetchOrders(this.getComponent());
        await this.onInitialFetchCompleted(this.data())
        this.conditionOfOrderBy = current;
    }

    /** 驗證firebase api 用*/
    async appendsOrder(counts = 5) {
        const orders = _.range(1, counts).map(each => {
            return {isHotCreate: true, members: [{}], records: [{}]}
        })
        const items = await this.apiOfOrder.submitOrders(this.component, orders);
        this.pushOrdersByIndex(-1, ...items);
    }

    /** 驗證firebase api 用*/
    async updateOrdersConditions() {
        const type = 1 // [1,2];
        switch (type) {
            case 1:
                await this.apiOfOrder.updateOrders(this.getComponent(),
                    [{host: 'DavTu'}], {type: 'where', params: ['countOfPeople', '>=', 20]});
                /** 要寫一個針對id去update 屬性的function, updateCurrentOrders() */
                break;
            case 2:
                await this.apiOfOrder.updateOrders(this.getComponent(),
                    [{id: 'cWkE2imBNzpWTc3nm0eK', contact: `48771123`}, {id: 'XGGE3MFhVI2dRXoH6wYt', contact: '999456'}])
                break;
        }
    }

    /** 驗證firebase api 用*/
    transactionPeople = async () => {
        const task = new InfinitePool(2);
        const self = this;
        const tasks = _.range(0, 20).map((each) => async () => {
            const key = `kjm47HARHx3g6nP8LzbB`;
            /** stupid doing
             const order = await this.fetchOrderById(key)
             const updateContent = {countOfPeople: order.countOfPeople + 1};
             await this.apiOfOrder.updateOrderItem(self.getComponent(), updateContent, key)
             **/
            await Util.syncDelayRandom(1000, 3000);
            await this.apiOfOrder.updateOrderItemAtomically(self.getComponent(), async (latestOfItem, transaction, ref) => {
                return {countOfPeople: latestOfItem.countOfPeople + 1};
            }, key);

        })
        Util.appendInfo('task的長度 ==> ', _.size(tasks));
        await task.runByEachTask(tasks);
    }

    deleteSpecific = async () => {
        await this.apiOfOrder.deleteOrders(this.getComponent(), false, {type: 'where', params: ['countOfPeople', '>', 99]})
    }

    /** 直接對document->array 增加item, 不用整個array重寫 */
    appendOrderMember = async () => {
        return await this.appendAttrOfArrayItem('orders', 'members', {name: '明天'}, 'OHvWFHEsQQ5MEIU1nQya')
    }

    deleteOrderMember = async () => {
        return await this.deleteAttrOfArrayItem('orders', 'members', {name: '明天'}, 'OHvWFHEsQQ5MEIU1nQya')
    }

    incrementPeople = async () => {
        return await this.apiOfOrder.updateIncrementCountOfPeople(this.getComponent(),`OHvWFHEsQQ5MEIU1nQya`);
    }

    lengthOfOrder = async () => {
        const count = await this.apiOfOrder.fetchSizeOfOrders(this.getComponent());
        this.getComponent().showInfoSnackMessage(`總共有:${count} 個 ORDER`);
    }

    testOfFetchCount = async () => {
        const count =  await this.fetchCountOfSpecificCondition(`orders`, {type: 'where', params: ['startOfTravel', '>', new Date(Util.getTodayTimeFormat())]});
        this.getComponent().showInfoSnackMessage(`總共有:${count} 個出發時間 > ${Util.getTodayTimeFormat()}`);
    }

    testOfFetchSum = async () => {
        const count =  await this.fetchSumOfSpecificAttribute(`orders`, 'countOfPeople', {type: 'where', params: ['startOfTravel', '>', new Date(Util.getTodayTimeFormat())]});
        this.getComponent().showInfoSnackMessage(`合計有:${count} 人數，出發時間 > ${Util.getTodayTimeFormat()}`);
    }

    testOfFetchAverage = async () => {
        const count =  await this.fetchAverageOfSpecificAttribute(`orders`, 'countOfPeople', {type: 'where', params: ['startOfTravel', '>', new Date(Util.getTodayTimeFormat())]});
        this.getComponent().showInfoSnackMessage(`平均有:${count} 個人 出發時間 > ${Util.getTodayTimeFormat()}`);
    }

    //multi = [...{name: 'name', type: 'sum', attribute: 'attr'}]
    testOfFetchFetchMulti = async () => {
        const result = await this.apiOfOrder.fetchMultiResultOfSpecific('orders',[{name:'countOf',type:'count',attribute:'countOfPeople'},
            {name:'sumOf',type:'sum',attribute:'countOfPeople'}],{type:'where',params:['startOfTravel', '>', new Date(Util.getTodayTimeFormat())]});
        this.getComponent().showInfoSnackMessage(`回傳值:${JSON.stringify(result)}`);
    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
