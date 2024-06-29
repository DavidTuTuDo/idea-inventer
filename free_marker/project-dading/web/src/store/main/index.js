const edit = true;
import BaseMainStore from "./BaseMainStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Order from "../mainOrder";
import Establish from '../establish';

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

    async updateOrder(orderOfLast) {
        const order = _.find(this.getOrders(), (order) => _.isEqual(order.id, orderOfLast.id));
        order.initial(orderOfLast);
    }

    async appendOrder() {
        const result = await this.apiOfOrder.submitOrderItem(this.getComponent(), {members: [{}], records: [{}]}, undefined);
        if (result.succeed)
            this.pushOrdersByIndex(-1, result.value);
    }

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        this.invalidate();
        return result
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


    invalidate() {
        const selected = this.getAreaOfFunc().getSelectedOrderBy();

        if(selected === 5) {
            /** 旅行社 */
            this.setOrders(_.orderBy(this.getOrders(),['selectedAgent','valueOfStartTravel'],['asc','asc']))
        }

        if(selected === 6) {
            /** 目的地 */
            this.setOrders(_.orderBy(this.getOrders(),['selectedDestination','valueOfStartTravel'],['asc','asc']))
        }
    }

    async handleOrderByCondition(force) {
        const current = _.cloneDeep(this.getAreaOfFunc().getSelectedOrderBy());
        const timestamp = _.cloneDeep(this.getAreaOfFunc().getBaseOn())
        if (force) Util.appendInfo(`base time updated`);
        else if (this.conditionOfOrderBy === current) return
        this.clean()
        switch (_.toNumber(current)) {
            case 1:
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('createTime', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('createTime', 'asc')}
                    ]
                )
                break;
            case 2:
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('createTime', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('createTime', 'desc')}
                    ]
                );
            case 3:
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('startOfTravel', 'asc')}
                    ]
                )
                break;
            case 4:
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('startOfTravel', 'desc')}
                    ]
                )
                break;
            case 5:
            case 6:
                this.setOrderConditions(
                    [
                        {where: (stmt) => stmt.where('startOfTravel', '>=', new Date(Util.getTodayTimeFormat(timestamp)))},
                        {orderBy: (stmt) => stmt.orderBy('startOfTravel', 'asc')}
                    ]
                )
                break;
        }
        await this.fetch(this.getComponent());
        this.setInitialFetchCompleted(true);
        this.conditionOfOrderBy = current;
        this.getAreaOfFunc().setSelectedOrderBy(current);
        this.getAreaOfFunc().setBaseOn(timestamp);


    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
