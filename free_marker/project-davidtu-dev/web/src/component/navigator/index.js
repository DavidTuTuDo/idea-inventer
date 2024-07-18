/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-28-15-15-13
 */
import {observer, inject} from "mobx-react";
import Router from '../../router';
import Config from '../../config';
import Cookie from '../../cookie';
import {utiller as Util} from "utiller";
import {withStyles} from '@mui/styles';
import Style from "../../style";
import React from "react";
import {
  List,
  ListItemText,
  IconButton,
  ListItemIcon,
  ListItem,
  Typography,
  ListSubheader,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import * as MUIcon from '@mui/icons-material';
import _ from 'lodash';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import CommonFirebaseHelper from "../../base/FirebaseHelper";
import {isMobile} from 'react-device-detect'
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";

const useStyles = theme => ({
  paper: {
    marginTop: "50px",
    width: isMobile? '55%': '40%',
    backgroundColor: '#000000'
  }
});

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

}

export default withStyles(useStyles)
(
    NavigatorComponent
)
;
