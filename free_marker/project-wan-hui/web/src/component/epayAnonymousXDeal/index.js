const edit = true;

import ModularizedEpayAnonymousXDealComponent from "./ModularizedEpayAnonymousXDealComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseEpayAnonymousXDealComponent from "./BaseEpayAnonymousXDealComponent";

class EpayAnonymousXDealComponent extends ModularizedEpayAnonymousXDealComponent {
    constructor(props) {
        super(props);
    }

    getPresetObjOfIreneQrcode() {
        return {
            useRemit: true,
            main: "芄食品",
            sub: "匯款資料",
            title: this.getStore().getPayNow()?.title,
            content: `NT$ ${this.getStore().getPayNow()?.price} 元`,
            caution: `（完成轉帳後，致電04-2222-5111）`,
            color: `#a0a19d`
        };
    }
}

export default EpayAnonymousXDealComponent;
