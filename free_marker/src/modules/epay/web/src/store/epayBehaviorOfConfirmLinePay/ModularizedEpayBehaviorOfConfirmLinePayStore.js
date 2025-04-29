const edit = true;
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction } from "mobx";
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
            Router.gotoEpayPurchaseOfHistoryPage(this.getComponent(), "all");
        } catch (error) {
            this.getComponent().showErrorSnackMessage(error.message);
            Router.gotoEpayPurchaseOfHistoryPage(this.getComponent(), "all");
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayBehaviorOfConfirmLinePayStore;
