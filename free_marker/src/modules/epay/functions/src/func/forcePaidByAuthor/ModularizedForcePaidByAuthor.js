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

        if (Util.isUndefinedNullEmpty(idOfPreciseOrder)) {
            this.appendErrorLog(9999, `81123112 沒有訂單內容`);
        }

        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        this.validatePreciseOrder(detailOfPreciseOrder, true, "591232312");

        /** 確認身份為訂單的 idOfAuthor */
        await this.validateIsAuthorOfOrder(detailOfPreciseOrder, session, "454113456");

        /** update order的訂單的timeOfPayment, procedureOfPayment='authorForcePaid', update stateOfPayment=5(completed) */
        await Api.updatePreciseOrderItemAtomically((order, transaction) => {
            this.validatePreciseOrder(order, true, "59841541234");
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
