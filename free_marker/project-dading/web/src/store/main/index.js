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
                {orderBy: (stmt) => stmt.orderBy('createTime', 'desc')}
            ]
        )
    }

    conditionOfOrderBy = -1;

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
                }, 1500, "ID_OF_ASYNC_UPDATE_ORDER")
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
                        {where: (stmt) => stmt.where('host', '==', _.trim(filter.host))},
                        {orderBy: (stmt) => stmt.orderBy('createTime', 'desc')}
                    ]
                )
                break;
            case 2:
                /** 聯絡電話 */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('contact', '==', _.trim(filter.contact))},
                        {orderBy: (stmt) => stmt.orderBy('createTime', 'desc')}
                    ]
                )
                break;
            case 3:
                /** 目的地 */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('selectedDestination', '==', filter.selectedDestTo)},
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                    ]
                )
                break;
            case 4:
                /** 旅行社 */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('selectedAgent', '==', filter.selectedAgentTo)},
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
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
                        {where: (stmt) => stmt.where('createTime', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('createTime', 'asc')}
                    ]
                )
                break;
            case 2:
                /** 建單時間(遞減) */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('createTime', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('createTime', 'desc')}
                    ]
                );
                break;
            case 3:
                /** 出發時間(遞增) */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('startOfTravel', 'asc')}
                    ]
                )
                break;
            case 4:
                /** 建單時間(遞減) */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('startOfTravel', 'desc')}
                    ]
                )
                break;
            case 5:/** 旅行社 */
            case 6:
                /** 目的地 */
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('startOfTravel', 'asc')}
                    ]
                )
                break;
        }
        await this.fetchOrders(this.getComponent());
        await this.onInitialFetchCompleted(this.data())
        this.conditionOfOrderBy = current;


    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
