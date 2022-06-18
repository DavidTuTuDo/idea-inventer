import {inject} from "mobx-react";
import BaseEpayTestComponent from "./BaseEpayTestComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import Button from "@material-ui/core/Button";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";
import Functions from '../../functions';



@inject("epayTest")
@observer
class EpayTestComponent extends BaseEpayTestComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEpayTestCreatePreciseOrderButtonClicked(param) {
       this.getStore().performEPayBehavior().then();
    }


    /** -------------------- async api -------------------- **/
}

export default EpayTestComponent;
