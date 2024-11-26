const edit = true;
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseNavigatorComponent from "./BaseNavigatorComponent";
import {isMobile} from 'react-device-detect'
import {withStyles} from '@mui/styles';


const useStyles = theme => ({
  paper: {
    marginTop: "50px",
    width: isMobile ? '55%' : '40%',
    backgroundColor: '#000000',
  },
});

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onNavigatorToolBarMenuIconButtonClicked(param) {
    Router.gotoMainPage(this);
  }

  /** -------------------- async api -------------------- **/
}

export default withStyles(useStyles)
(
    NavigatorComponent
);
