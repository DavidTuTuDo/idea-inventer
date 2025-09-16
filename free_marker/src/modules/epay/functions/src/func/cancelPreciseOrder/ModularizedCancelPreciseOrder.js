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
        this.validateIdOfDocument(idOfPreciseOrder, 81451454611, `購買訂單`);
        this.validateIsLoginUser(session, 453546846516);

        /** 檢查沒有訂單內容,completed以外的狀態才能取消訂單 */
        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        this.validatePreciseOrder(itemOfPreciseOrder, false, 1354654321);

        const user = await this.getLoginUserInfo(itemOfPreciseOrder, session);
        if (!user.allowUpdate) {
            /** 檢查訂單idOfUser = loginUser || loginUser = admin || idOfSeller = loginUser */
            throw new ERROR(9999, `456514515 權限不足，無法呼叫此功能`);
        }

        /** 更新order的狀態為failure, messageOfPayment要寫'XXX取消了訂單 賣家取消了訂單', 把所有的數量atomic累加回去 */
        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            this.validatePreciseOrder(order, false, 151259521453);
            return Api.normalizePreciseOrder(
                {
                    stateOfPayment: 4, //"failure",
                    timeOfCancel: Util.getCurrentTimeStamp(),
                    messageOfPayment: `${user.typeOfUser}取消訂單 `
                },
                true
            );
        }, itemOfPreciseOrder.id);
        await Api.deleteHadeItem(itemOfPreciseOrder.id, itemOfPreciseOrder.idOfAuthor);
        await this.incrementProductCountsAtomically(itemOfPreciseOrder);
    }

    customizeBehaviorOfFailureTrade() {
        this.appendErrorLog(9999, `45612321321 ORDER被CANCEL之後, 每個專案實作各自的record update(例專案:月薪) 要把不可預約的 改成可預約`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCancelPreciseOrder;
