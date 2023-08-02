import { observer } from "mobx-react";
import { inject } from "mobx-react";
import ModularizedEpayMethodOfPaymentComponent from "./ModularizedEpayMethodOfPaymentComponent";
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
import BaseEpayMethodOfPaymentComponent from "./BaseEpayMethodOfPaymentComponent";

@inject("epayMethodOfPayment")
@observer
class EpayMethodOfPaymentComponent extends ModularizedEpayMethodOfPaymentComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default EpayMethodOfPaymentComponent;
