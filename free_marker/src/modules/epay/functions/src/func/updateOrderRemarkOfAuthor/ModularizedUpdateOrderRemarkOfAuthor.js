const edit = true;

import BaseUpdateOrderRemarkOfAuthor from "./BaseUpdateOrderRemarkOfAuthor";
import { utiller as Util } from "utiller";
import Api from "../../api";

class ModularizedUpdateOrderRemarkOfAuthor extends BaseUpdateOrderRemarkOfAuthor {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        Util.validatePayloadObjectValid(data, ["idOfPreciseOrder", "remmarkOfAuthor"], "UpdateOrderRemarkOfAuthor");

        await this.validateIdOfDocumentQualify(data.idOfPreciseOrder);

        /** get precise order by id */
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(data.idOfPreciseOrder);

        await this.validatePreciseOrderIsExist(detailOfPreciseOrder, data.idOfPreciseOrder);

        /** 必須是買家才能更改備註 */
        await this.validateIsUserOfOrder(detailOfPreciseOrder, session);

        /** update order remark info*/
        await Api.updatePreciseOrderItem({ remark: data.remarkOfPreciseOrder }, detailOfPreciseOrder.id);
        return { message: "[賣家]成功更新備註內容" };
    }
}

export default ModularizedUpdateOrderRemarkOfAuthor;
