const edit = true;

import Router from "../../router";
import BaseEpayBehaviorOfConfirmLinePayStore from "./BaseEpayBehaviorOfConfirmLinePayStore";
import Functions from "../../functions";
import queryString from "query-string";
import UserInfo from "../../base/BaseUserInfo";
import { cloneDeep } from "lodash-es";

class ModularizedEpayBehaviorOfConfirmLinePayStore extends BaseEpayBehaviorOfConfirmLinePayStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const objectOfLinePayInfo = queryString.parse(this.getComponent().props.location.search); //console.log(params) { transactionId:2021062500677569710, orderId:Order2019101500001 };
        const idOfPreciseOrder = cloneDeep(objectOfLinePayInfo.orderId);
        this.getComponent().invalidateProcessingGuard(true, { variant: "success", textOfTip: "交易中，請勿關閉" });
        try {
            await Functions.httpOnCallConfirmedByLinePay(this.getComponent(), {
                idOfPreciseOrder,
                idOfTransaction: objectOfLinePayInfo.transactionId
            });
        } catch (error) {
            this.getComponent().showErrorSnackMessage(error.message);
        } finally {
            this.getComponent().invalidateProcessingGuard(false);
            this.routeToPage(idOfPreciseOrder);
        }
    }

    routeToPage = (id) => {
        if (UserInfo.isLoginWithSucceed()) Router.gotoEpayFootprintPage(this.getComponent(), "user", "all");
        else Router.gotoAnonymousXDealPage(this.getComponent(), id);
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayBehaviorOfConfirmLinePayStore;
