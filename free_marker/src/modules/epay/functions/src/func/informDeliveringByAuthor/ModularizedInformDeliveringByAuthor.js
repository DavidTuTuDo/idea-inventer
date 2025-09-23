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

        await this.validateIdOfDocumentQualify(idOfPreciseOrder, "DeliveringByAuthor");
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(detailOfPreciseOrder, idOfPreciseOrder, "DeliveringByAuthor");
        /** 確認身份為訂單的 idOfAuthor */
        await this.validateIsAuthorOfOrder(detailOfPreciseOrder, session, "DeliveringByAuthor");
        await this.validateOrderIsCompletedPayment(detailOfPreciseOrder);
        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            await this.validateOrderIsCompletedPayment(order, "DeliveringByAuthor");
            return {
                stateOfDeliver: Config.StateOfDeliver.Sending,
                isDelivered: true,
                timeOfDelivered: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
            };
        }, detailOfPreciseOrder.id);

        //todo:send email(已出貨)
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedInformDeliveringByAuthor;
