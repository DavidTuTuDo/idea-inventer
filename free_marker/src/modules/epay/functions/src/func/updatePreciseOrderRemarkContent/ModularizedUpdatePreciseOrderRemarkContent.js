import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseUpdatePreciseOrderRemarkContent from "./BaseUpdatePreciseOrderRemarkContent";
import Api from "../../api";

class ModularizedUpdatePreciseOrderRemarkContent extends BaseUpdatePreciseOrderRemarkContent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        Util.validatePayloadObjectValid(data, ['idOfPreciseOrder', 'remarkOfPreciseOrder'], 4874546145454);
        /** get precise order by id */
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(data.idOfPreciseOrder);

        /** 判斷狀態必須為pending才可以更改 */
        this.validatePreciseOrder(detailOfPreciseOrder, false, 77485448618);

        /** 判斷user id === buyer id 才可以更改*/
        const identify = await this.getLoginUserInfo(detailOfPreciseOrder, session);
        const valildOfUpdate = identify.allowUpdate;
        if (!valildOfUpdate) {
            throw new ERROR(9999, `4562313168546 身份為${identify.typeOfUser}，無法呼叫此功能`);
        }
        /** update order remark info*/
        await Api.updatePreciseOrderItem({remark: data.remarkOfPreciseOrder}, detailOfPreciseOrder.id);
        return {message: '成功更新備註內容'}
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedUpdatePreciseOrderRemarkContent;
