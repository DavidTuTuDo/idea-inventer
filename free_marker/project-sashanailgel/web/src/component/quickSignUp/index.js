const edit = true;
import { inject } from "mobx-react";
import BaseQuickSignUpComponent from "./BaseQuickSignUpComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import IconButton from "@mui/material/IconButton";
import ShareRounded from "@mui/icons-material/ShareRounded";
import ChevronRight from "@mui/icons-material/ChevronRight";
import SchoolRounded from "@mui/icons-material/SchoolRounded";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import { observer } from "mobx-react";
import Card from "@mui/material/Card";
import Style from "../../style";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("quickSignUp")
@observer
class QuickSignUpComponent extends BaseQuickSignUpComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onQuickSignUpClazzSubmitChipClicked(param) {
    const clazz = param.object;
    const idOfClazz = clazz.getId();
    Router.gotoEstablishPage(this.getComponentInstance(), idOfClazz);
  }

  onQuickSignUpClazzGotoPortfolioChipClicked(param) {
    const clazz = param.object;
    this.gotoUrlWithNewTabDirectly(clazz.getLinkOfPortfolio())
  }

  onQuickSignUpClazzShareIconButtonClicked(param) {
    const clazz = param.object;
    this.showErrorSnackMessage(`設計課程分享連結[未完成]`);
  }

  onQuickSignUpClazzMoreChipClicked(param) {
    this.showWarningSnackMessage(`請美術設計海報`);
  }

  /** -------------------- async api -------------------- **/
}

export default QuickSignUpComponent;
