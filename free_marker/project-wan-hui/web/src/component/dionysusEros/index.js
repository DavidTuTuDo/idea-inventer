const edit = true;

import ModularizedDionysusErosComponent from "./ModularizedDionysusErosComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseDionysusErosComponent from "./BaseDionysusErosComponent";

class DionysusErosComponent extends ModularizedDionysusErosComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getPresetObjOfIreneQrcode() {
        return {
            useRemit: true,
            main: "芄食品",
            sub: "匯款資料",
            title: this.getStore().getCupidPublic().getNameOfDirectPay(),
            caution: `（完成轉帳後，致電04-2222-5111）`,
            content: `NT$ 999 元`,
            color: `#a0a19d`
        };
    }

    /** -------------------- async api -------------------- **/
}

export default DionysusErosComponent;
