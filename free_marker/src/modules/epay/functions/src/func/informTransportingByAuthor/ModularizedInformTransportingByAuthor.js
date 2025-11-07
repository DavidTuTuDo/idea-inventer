const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Config from "../../config";
import Api from "../../api";
import sendEmail from "../sendEmailOfReceipt";

import BaseInformTransportingByAuthor from "./BaseInformTransportingByAuthor";

class ModularizedInformTransportingByAuthor extends BaseInformTransportingByAuthor {
    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const { serialOfTransport, idOfPreciseOrder } = data;
        if (_.size(serialOfTransport) < 2) this.appendErrorLog(9999, "物流編號填寫錯誤");
        await this.validateIdOfDocumentQualify(idOfPreciseOrder, "informTransportingByAuthor");
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(detailOfPreciseOrder, idOfPreciseOrder, "informTransportingByAuthor");
        /** 確認身份為訂單的 idOfAuthor */
        await this.validateIsAuthorOfOrder(detailOfPreciseOrder, session, "informTransportingByAuthor");
        await this.validateOrderIsCompletedPayment(detailOfPreciseOrder, "informTransportingByAuthor");
        await this.validateOrderIsNotSendingYet(detailOfPreciseOrder, "informTransportingByAuthor");
        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            await this.validateOrderIsCompletedPayment(order, "informTransportingByAuthor");
            return {
                serialOfTransport: serialOfTransport,
                stateOfTransport: Config.StateOfTransport.Sending,
                isTransported: true,
                timeOfTransport: this.toFireBaseTimestampObject(Util.getCurrentTimeStamp())
            };
        }, detailOfPreciseOrder.id);
        await sendEmail.handleHttpOnCall({ idOfPreciseOrder: data.idOfPreciseOrder, isTransportCompleted: true }, session);
    }
}

export default ModularizedInformTransportingByAuthor;
