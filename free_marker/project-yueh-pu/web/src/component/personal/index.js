import {inject} from "mobx-react";
import BasePersonalComponent from "./BasePersonalComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/core/Skeleton";
import {observer} from "mobx-react";
import Card from "@material-ui/core/Card";
import PersonalStore from "../../store/personal";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("personal")
@observer
class PersonalComponent extends BasePersonalComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onPersonalFavoritePuCardClicked(param) {
        const rhythm = param.object;
        Router.gotoSheetDetailPage(this, rhythm.getIdOfGuitarPu());
    }

    /** -------------------- async api -------------------- **/
}

export default PersonalComponent;
