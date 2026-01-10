const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import sendEmail from "../sendEmailOfReceipt";
import Config from "../../config";
import BaseForcePaidByAuthor from "./BaseForcePaidByAuthor";
import Api from "../../api";

class ModularizedForcePaidByAuthor extends BaseForcePaidByAuthor {
    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const idOfPreciseOrder = data.idOfPreciseOrder;

        await this.validateIdOfDocumentQualify(idOfPreciseOrder);
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(detailOfPreciseOrder, idOfPreciseOrder);

        /** 確認身份為訂單的 idOfAuthor */
        await this.validateIsAuthorOfOrder(detailOfPreciseOrder, session);
        await this.validateOrderIsUnPaidWaiting(detailOfPreciseOrder);

        /** update order的訂單的timeOfPayment, procedureOfPayment='authorForcePaid', update stateOfPayment=5(completed) */
        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            await this.validateOrderIsUnPaidWaiting(order);
            return {
                typeOfTransaction: Config.TransactionMethod.AuthorForcePaid,
                procedureOfPayment: Config.LangOfEPayType.AuthorForcePaid,
                stateOfPayment: Config.StateOfPayment.Completed,
                timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
            };
        }, detailOfPreciseOrder.id);

        await Api.updateHadeItemAtomically(
            (item, transaction) => {
                return {
                    typeOfTransaction: Config.TransactionMethod.AuthorForcePaid,
                    procedureOfPayment: `${Config.LabelOfTransactionMethod(Config.TransactionMethod.AuthorForcePaid)}`,
                    paid: true,
                    timeOfPayment: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
                };
            },
            detailOfPreciseOrder.id,
            detailOfPreciseOrder.idOfAuthor
        );

        Util.exeAsyncT(sendEmail.handleHttpOnCall({ idOfPreciseOrder: data.idOfPreciseOrder }, session));
        return { message: `confirmed by ${Config.EPayType.LinePay} succeed` };
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedForcePaidByAuthor;
