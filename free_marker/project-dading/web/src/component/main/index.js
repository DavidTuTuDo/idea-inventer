const edit = true;

import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import CopyAll from "@mui/icons-material/CopyAll";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import establish from "../establish";
import {observer} from "mobx-react";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
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

    onMainOrderExtraIconButtonDeleteClicked(param) {
        return () => {
          this.getStore().deleteOrder(param.object).then(() => this.showInfoSnackMessage(`訂單已刪除`)
          )
        }
    }

    onMainAreaOfFuncHistoryOfOrderButtonClicked(param) {
        this.showInfoSnackMessage(`開發中，請稍待`);
    }

    onMainAreaOfFuncSearchOfOrderButtonClicked(param) {
        this.getStore().toggleIsFilterOfSearchOrderVisible();
    }

    onMainOrderExtraIconButtonContractClicked(param) {
        return () => {
           this.showInfoSnackMessage(`開發中，請稍待`)
        }
    }

    onMainOrderExtraIconButtonEditClicked(param) {
        const order = param.object;
        return () => {
            const data = order.data();
            Application.getEstablishStore().clean()
            Application.getEstablishStore().initial(data);
            this.refOfCreateOfOrder.current.click();
        }
    }

    onMainOrderBtnOfIdIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(order.getId(),`已複製訂單編號至剪貼簿`)
    }

    onMainOrderBtnOfPhoneIconButtonClicked(param) {
        const order = param.object;
        this.invokePhoneBehavior(order.getPhone());
    }

    onMainFilterOfSearchOrderCancelButtonClicked(param) {
        this.getStore().toggleIsFilterOfSearchOrderVisible();
    }

    onMainFilterOfSearchOrderSubmitButtonClicked(param) {
        this.showInfoSnackMessage(`施工中，請稍待`);
        console.log(this.getStore().getFilterOfSearchOrder().data());
    }



    /** -------------------- async api -------------------- **/
}

export default MainComponent;
