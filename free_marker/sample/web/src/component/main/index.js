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
import CommonFirebaseHelper from "../../base/CommonFirebaseHelper";
import Countdown from "react-countdown";
import {Popover,Typography} from "@material-ui/core";

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    constructor(prop) {
        super(prop);
        this.props.main.setState('stable');
    }

    renderCountdownView(){
        const CountdownView = this.CountdownView;
        return <CountdownView
            title={'距離學測'}
            date={'2022-01-22'}/>
    }

    componentDidMount() {
        super.componentDidMount();
    }

    onViewPagerDivClicked(param) {
        console.log(param.object.image);
        this.openImageDialog(param.object.image);
    }


    /** -------------------- functions -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default MainComponent;
