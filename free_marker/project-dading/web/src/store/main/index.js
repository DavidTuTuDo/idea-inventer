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
    }

    async deleteOrder(order) {
        await order.deleteOrderItem(this.getComponent());
    }

    async updateOrder(orderOfLast) {
        const order = _.find(this.getOrders(), (order) => _.isEqual(order.id, orderOfLast.id));
        order.initial(orderOfLast);
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
                    self.getComponent().showInfoSnackMessage(`已更新「${order.getName()}」訂單`)
                }, 1500, "ID_OF_ASYNC_UPDATE_ORDER")
        }
    }

    /** -------------------- async api -------------------- **/
}

export default MainStore;
