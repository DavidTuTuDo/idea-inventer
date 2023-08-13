import { inject } from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Typography from "@material-ui/core/Typography";
import { observer } from "mobx-react";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";
@inject("main")
@observer
class MainComponent extends BaseMainComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onMainTestEpayTestButtonClicked(param) {
    Router.gotoEpayTestPage(this.getComponentInstance());
  }

  onMainTestGotoHistoryButtonClicked(param) {
    Router.gotoEpayPurchaseOfHistoryPage(this.getComponentInstance(),'pending');
  }

  // onMainBannerSwiperSlideClicked(param) {
  //   const item = param.object;
  //   console.log(item);
  // }

  onMainBannerImageImgClicked(param) {
    console.log(param.object);
    this.getComponentInstance().showInfoSnackMessage(param.object.route);
  }

  /** -------------------- async api -------------------- **/
}
export default MainComponent;
