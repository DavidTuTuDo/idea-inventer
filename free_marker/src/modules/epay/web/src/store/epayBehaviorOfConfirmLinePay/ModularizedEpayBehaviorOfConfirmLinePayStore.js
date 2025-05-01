const edit = true;

import Router from "../../router";
import BaseEpayBehaviorOfConfirmLinePayStore from "./BaseEpayBehaviorOfConfirmLinePayStore";
import Functions from "../../functions";
import queryString from "query-string";

class ModularizedEpayBehaviorOfConfirmLinePayStore extends BaseEpayBehaviorOfConfirmLinePayStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const objectOfLinePayInfo = queryString.parse(this.getComponent().props.location.search); //console.log(params) { transactionId:2021062500677569710, orderId:Order2019101500001 };

        try {
            await Functions.httpOnCallConfirmedByLinePay(this.getComponent(), {
                idOfPreciseOrder: objectOfLinePayInfo.orderId,
                idOfTransaction: objectOfLinePayInfo.transactionId
            });
            Router.gotoEpayFootprintPage(this.getComponent(), "all");
        } catch (error) {
            this.getComponent().showErrorSnackMessage(error.message);
            Router.gotoEpayFootprintPage(this.getComponent(), "all");
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayBehaviorOfConfirmLinePayStore;
