const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseCancelPreciseOrder from "./BaseCancelPreciseOrder";
import Api from "../../api";
import Config from "../../config";

class ModularizedCancelPreciseOrder extends BaseCancelPreciseOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        Util.appendInfo(`ModularizedCancelPreciseOrder帶進來的資訊:`, data);
        const idOfPreciseOrder = data.idOfPreciseOrder;
        /** 訂單編號 */
        await this.validateIdOfDocumentQualify(idOfPreciseOrder, "CancelPreciseOrder");
        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(itemOfPreciseOrder, idOfPreciseOrder, "CancelPreciseOrder");
        await this.validateIsAuthorOrUserOfOrder(itemOfPreciseOrder, session, "CancelPreciseOrder");
        await this.validateOrderIsUnPaidWaiting(itemOfPreciseOrder, "CancelPreciseOrder");

        /** 更新order的狀態為failure, messageOfPayment要寫'XXX取消了訂單 賣家取消了訂單', 把所有的數量atomic累加回去 */
        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            await this.validateOrderIsUnPaidWaiting(order, "CancelPreciseOrder");
            return Api.normalizePreciseOrder(
                {
                    stateOfPayment: Config.StateOfPayment.Failure,
                    timeOfCancel: Util.getCurrentTimeStamp(),
                    messageOfPayment: `${await this.getLoginUserInfo(itemOfPreciseOrder, session)}取消訂單 `
                },
                true
            );
        }, itemOfPreciseOrder.id);
        await Api.deleteHadeItem(itemOfPreciseOrder.id, itemOfPreciseOrder.idOfAuthor);
        await this.incrementProductCountsAtomically(itemOfPreciseOrder);
    }

    customizeBehaviorOfFailureTrade() {
        this.appendErrorLog(9999, `45612321321 ORDER被CANCEL之後，每個專案實作各自的record update(例專案:月薪) 要把不可預約的 改成可預約`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCancelPreciseOrder;
