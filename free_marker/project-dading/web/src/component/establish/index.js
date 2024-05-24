const edit = true;
import { inject } from "mobx-react";
import BaseEstablishComponent from "./BaseEstablishComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Button from "@mui/material/Button";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { observer } from "mobx-react";
import Paper from "@mui/material/Paper";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("establish")
@observer
class EstablishComponent extends BaseEstablishComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onEstablishCancelButtonClicked(param) {
    this.dismiss();
  }

  onEstablishClearButtonClicked(param) {
    this.getStore().clean()
  }

  onEstablishSubmitButtonClicked(param) {
    this.getStore().submitOrder().then((result) => this.showInfoSnackMessage(`新增訂單成功`))
  }

  onEstablishUpdateButtonClicked(param) {
    this.getStore().updateOrder().then((result) => this.showInfoSnackMessage(`更新訂單成功`))
  }

  getInjectStyleOfEstablishSubmitButton(establish) {
    return Util.getVisibleOrNone(_.isEmpty(establish.getId()),true);
  }

  getInjectStyleOfEstablishUpdateButton(establish) {
    return Util.getVisibleOrNone(!_.isEmpty(establish.getId()),true);
  }

  getWrapInjectStyleOfEstablishIdTypography(establish) {
    return Util.getVisibleOrNone(!_.isEmpty(establish.getId()),true);
  }

  onEstablishBtnOfIdIconButtonClicked(param) {
    const order = param.object;
    this.copyTextToClipboard(order.getId(),`已複製訂單編號至剪貼簿`)
  }


  /** -------------------- async api -------------------- **/
}

export default EstablishComponent;
