/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-23-17-02-38
 */
import {observer, inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {Redirect} from 'react-router-dom';
import React from 'react';
import Router from '../../router';
import path from 'path';
import Cookies from "../../cookie";
import UserInfo from '../../userInfo';
import {utiller as Util} from 'utiller';
import UserInfoStore from '../../store/userInfo';

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    constructor(prop) {
        super(prop);
        this.props.main.setState('stable');
        this.userInfoStore = new UserInfoStore();
    }

    onSocialButtonClicked(param) {
        Router.gotoExamPage(this);
    }

    onHighButtonClicked(param) {
        this.userInfoStore.fetch(UserInfo.getUid()).then((result) => Util.appendInfo(result));
    }

    onJuniorButtonClicked(param) {
        this.userInfoStore.submitUserInfoObject(UserInfo.getUid(), UserInfo.getCurrentUser()).then();
    }

    onPurchaseButtonClicked(param) {
        // super.onPurchaseButtonClicked(param);
        Router.gotoPurchasePage(this);
    }

    /** -------------------- functions -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default MainComponent;
