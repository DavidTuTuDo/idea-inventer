const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import sendEmail from "../sendEmailOfReceipt";
import Config from "../../config";
import BaseForcePaidByAuthor from "./BaseForcePaidByAuthor";
import Api from "../../api";

class ModularizedForcePaidByAuthor extends BaseForcePaidByAuthor {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const idOfPreciseOrder = data.idOfPreciseOrder;

        await this.validateIdOfDocumentQualify(idOfPreciseOrder, "ForcePaidByAuthor");
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(detailOfPreciseOrder, idOfPreciseOrder, "ForcePaidByAuthor");

        /** 確認身份為訂單的 idOfAuthor */
        await this.validateIsAuthorOfOrder(detailOfPreciseOrder, session, "ForcePaidByAuthor");
        await this.validateOrderIsUnPaidWaiting(detailOfPreciseOrder, "ForcePaidByAuthor");

        /** update order的訂單的timeOfPayment, procedureOfPayment='authorForcePaid', update stateOfPayment=5(completed) */
        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            await this.validateOrderIsUnPaidWaiting(order, "ForcePaidByAuthor");
            return {
                procedureOfPayment: Config.EPayType.AuthorForcePaid,
                stateOfPayment: Config.StateOfPayment.Completed,
                timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
            };
        }, detailOfPreciseOrder.id);

        await sendEmail.handleHttpOnCall({ idOfPreciseOrder: data.idOfPreciseOrder }, session);
        return { message: `confirmed by ${Config.EPayType.LinePay} succeed` };
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedForcePaidByAuthor;
