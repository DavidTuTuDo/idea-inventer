const edit = true;
import { inject } from "mobx-react";
import BaseAdditionComponent from "./BaseAdditionComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Button from "@mui/material/Button";
import Accessibility from "@mui/icons-material/Accessibility";
import CheckBox from "@mui/material/CheckBox";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import TextField from "@mui/material/TextField";
import { observer } from "mobx-react";
import Card from "@mui/material/Card";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("addition")
@observer
class AdditionComponent extends BaseAdditionComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onAdditionMemberSubmitButtonClicked(param) {
      const member = param.object;
      member.joinMember2Order().then();
  }

  onAdditionMemberCancelButtonClicked(param) {
      this.dismiss();
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionComponent;
