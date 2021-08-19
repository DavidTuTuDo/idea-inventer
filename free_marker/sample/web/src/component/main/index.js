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
import UserInfoStore from '../../store/navigatorUserInfo';
import CommonFirebaseHelper from "../../base/CommonFirebaseHelper";
import Countdown from "react-countdown";
import {Typography} from "@material-ui/core";

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    constructor(prop) {
        super(prop);
        this.props.main.setState('stable');
        this.userInfoStore = new UserInfoStore();
    }

    onEnterPointPaperClicked(param) {
        const enterPoint = param.object;
        this.handleCustomRouter(enterPoint.route);
    }


    renderCountdownView(){
        const CountdownView = this.CountdownView;
        return <CountdownView
            title={'距離學測'}
            date={'2022-01-22'}/>
    }


    /** -------------------- functions -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default MainComponent;
