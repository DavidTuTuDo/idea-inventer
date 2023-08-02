import { observer } from "mobx-react";
import { inject } from "mobx-react";
import ModularizedEpayPurchaseOfHistoryComponent from "./ModularizedEpayPurchaseOfHistoryComponent";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseEpayPurchaseOfHistoryComponent from "./BaseEpayPurchaseOfHistoryComponent";

@inject("epayPurchaseOfHistory")
@observer
class EpayPurchaseOfHistoryComponent extends ModularizedEpayPurchaseOfHistoryComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default EpayPurchaseOfHistoryComponent;
