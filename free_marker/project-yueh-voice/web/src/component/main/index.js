const edit = true;

import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";

class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectPropOfParamOfIdOfEpisode() {
        return 'david.tu.guitar';
    }

    /** -------------------- async api -------------------- **/
}

export default MainComponent;
