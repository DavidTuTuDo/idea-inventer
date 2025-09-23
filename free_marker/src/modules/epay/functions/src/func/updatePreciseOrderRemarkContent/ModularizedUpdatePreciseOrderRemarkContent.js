const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
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
        Util.validatePayloadObjectValid(data, ["idOfPreciseOrder", "remarkOfPreciseOrder"], "UpdatePreciseOrderRemarkContent");

        await this.validateIdOfDocumentQualify(data.idOfPreciseOrder, "UpdateOrderRemarkOfAuthor");

        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(data.idOfPreciseOrder);

        await this.validatePreciseOrderIsExist(detailOfPreciseOrder, data.idOfPreciseOrder, "UpdatePreciseOrderRemarkContent");

        /** 必須是買家才能更改備註 */
        await this.validateIsUserOfOrder(detailOfPreciseOrder, session, "UpdatePreciseOrderRemarkContent");

        /** update order remark info*/
        await Api.updatePreciseOrderItem({ remark: data.remarkOfPreciseOrder }, detailOfPreciseOrder.id);
        return { message: "[買家]成功更新備註內容" };
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedUpdatePreciseOrderRemarkContent;
