const edit = true;

import Router from "../../router";
import BaseEpayBehaviorOfConfirmLinePayStore from "./BaseEpayBehaviorOfConfirmLinePayStore";
import Functions from "../../functions";
import queryString from "query-string";
import UserInfo from "../../base/BaseUserInfo";

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
        } catch (error) {
            this.getComponent().showErrorSnackMessage(error.message);
        } finally {
            this.routeToPage(objectOfLinePayInfo.orderId);
        }
    }

    routeToPage = (id) => {
        if (UserInfo.isLoginWithSucceed()) Router.gotoEpayFootprintPage(this.getComponent(), "user", "all");
        else Router.gotoAnonymousXDealPage(this, id);
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayBehaviorOfConfirmLinePayStore;
