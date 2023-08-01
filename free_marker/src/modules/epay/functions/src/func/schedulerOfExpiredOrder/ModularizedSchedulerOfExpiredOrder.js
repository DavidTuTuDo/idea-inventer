import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Api from '../../api';
import BaseSchedulerOfExpiredOrder from "./BaseSchedulerOfExpiredOrder";

class ModularizedSchedulerOfExpiredOrder extends BaseSchedulerOfExpiredOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleSchedule(context) {
        /** 找出 waiting|pending 的使用者 */
        console.log('執行 SchedulerOfExpiredOrder 腳本');
        const orders = await Api.fetchPreciseOrdersOfLimitation('in', 'stateOfPayment', 'pending', 'waiting');
        /** 比對當前時間是否 > expired time，如果過期了 1.把狀態改成failure, 還有增加失效原因 */
        const currentTimeStamp = Util.getCurrentTimeStamp()
        const results = _.filter(orders, (order) => {
            return currentTimeStamp >  this.normalizeTimestamp(order.timeOfExpired);
        })
        const expired = _.map(results, result => {
            return {
                ...result,
                messageOfPayment: `已超過付費期限 ${Util.getCurrentTimeFormatYMDHM(this.normalizeTimestamp(result.timeOfExpired))}`,
                stateOfPayment: `failure`,
            }
        })

        await Api.updatePreciseOrders(expired);

        for(const order of orders) {
            await this.incrementProductCountsAtomically(order);
        }

    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedSchedulerOfExpiredOrder;
