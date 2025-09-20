const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Config from "../../config";
import Api from "../../api";

import BaseInformDeliveringByAuthor from "./BaseInformDeliveringByAuthor";

class ModularizedInformDeliveringByAuthor extends BaseInformDeliveringByAuthor {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const idOfPreciseOrder = data.idOfPreciseOrder;

        if (Util.isUndefinedNullEmpty(idOfPreciseOrder)) this.appendErrorLog(9999, `81142343212 沒有訂單內容`);

        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        this.validatePreciseOrder(detailOfPreciseOrder, true, "154654123");

        /** 確認身份為訂單的 idOfAuthor */
        await this.validateIsAuthorOfOrder(detailOfPreciseOrder, session, "45411345612");
        await this.validateOrderIsCompleted(detailOfPreciseOrder);
        await Api.updatePreciseOrderItemAtomically((order, transaction) => {
            this.validatePreciseOrder(order, true, "1551414851");
            return {
                stateOfDeliver: Config.StateOfDeliver.Sending,
                timeOfDelivered: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
            };
        }, detailOfPreciseOrder.id);

        //todo:send email
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedInformDeliveringByAuthor;
