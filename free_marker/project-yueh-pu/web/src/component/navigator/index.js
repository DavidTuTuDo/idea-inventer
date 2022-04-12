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
import {withStyles} from '@material-ui/styles';
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
} from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import * as MUIcon from '@material-ui/icons';
import _ from 'lodash';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import CommonFirebaseHelper from "../../base/CommonFirebaseHelper";
import {isMobile} from 'react-device-detect'
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";

const useStyles = theme => ({
  paper: {
    marginTop: "50px",
    width: isMobile? '55%': '40%',
    backgroundColor: '#000000',
  },
});

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {

    onNavigatorToolBarCompleteInputTextFieldSearchPressed(input, complete) {
      /** 先判斷autoComplete 有沒有selectedItem()
       *
       * 沒有的話再用 getInput() 去搜尋
       * */

      console.log(`detail ==> `,this.getStore().getSuggestKeywordDetail());
      console.log(complete.getInput());

    }
}

export default withStyles(useStyles)
(
    NavigatorComponent
)
;
