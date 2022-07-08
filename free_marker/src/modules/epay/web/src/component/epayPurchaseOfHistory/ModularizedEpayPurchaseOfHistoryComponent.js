import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseEpayPurchaseOfHistoryComponent from "./BaseEpayPurchaseOfHistoryComponent";

class ModularizedEpayPurchaseOfHistoryComponent extends BaseEpayPurchaseOfHistoryComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    isValidOfParamOfTypeOfTab(string) {
        return Util.containsBy(['completed', 'pending', 'canceled', 'refund'], string);
    }


    /** -------------------- async api -------------------- **/
}

export default ModularizedEpayPurchaseOfHistoryComponent;
