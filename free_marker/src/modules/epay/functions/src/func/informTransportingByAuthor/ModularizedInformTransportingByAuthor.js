const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Config from "../../config";
import Api from "../../api";

import BaseInformTransportingByAuthor from "./BaseInformTransportingByAuthor";

class ModularizedInformTransportingByAuthor extends BaseInformTransportingByAuthor {
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
                stateOfTransport: Config.StateOfTransport.Sending,
                isTransported: true,
                timeOfTransport: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
            };
        }, detailOfPreciseOrder.id);

        //todo:send email(已出貨)
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedInformTransportingByAuthor;
