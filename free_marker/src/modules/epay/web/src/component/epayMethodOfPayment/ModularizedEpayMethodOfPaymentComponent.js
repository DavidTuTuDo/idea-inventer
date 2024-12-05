const edit = true;
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
import Functions from "../../functions";
import ChooseTypeRef from "../../store/epayFootprintOrderAreaOfChoosePaymentTypeSectionOfChooseType"
import BaseEpayMethodOfPaymentComponent from "./BaseEpayMethodOfPaymentComponent";

class ModularizedEpayMethodOfPaymentComponent extends BaseEpayMethodOfPaymentComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onEpayMethodOfPaymentOptionCardClicked(param) {
    const prop = this.props.paramObject;
    const typeOfPayment = param.object;


    const order = prop instanceof ChooseTypeRef ? prop.getParentNode().getParentNode() : undefined;

    switch (typeOfPayment.idOfUnique) {
      case 'linepay':
        this.performCheckoutByLinePayBehavior(order.raw.id).then();
        break;
      case 'ecpay':
        this.performCheckoutByECPayBehavior(order.raw.id).then();
        break;
    }
    // console.log(prop);
    // console.log(order);
    // console.log(typeOfPayment);

  }

  async performCheckoutByLinePayBehavior(idOfPreciseOrder) {
    const result = await Functions.httpOnCallCheckoutByLinePay(this.getComponentInstance(), {idOfPreciseOrder});
    this.getComponentInstance().routeToLinePayCheckoutPage(JSON.stringify(result));
  }

  async performCheckoutByECPayBehavior(idOfPreciseOrder) {
    const result = await Functions.httpOnCallCheckoutByECPay(this.getComponentInstance(), {idOfPreciseOrder});
    this.getComponentInstance().renderHtmlOfDocument(result.textOfRender);
  }

  /** -------------------- async api -------------------- **/
}
export default ModularizedEpayMethodOfPaymentComponent;
