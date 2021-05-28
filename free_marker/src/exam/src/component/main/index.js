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
import {utiller as Util} from 'utiller';

@inject("userInfo")
@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    constructor(prop) {
        super(prop);
        this.props.main.setState('stable');
    }

    onSocialButtonClicked(param) {
        Router.gotoExamPage(this);
    }

    onHighButtonClicked(param) {
        const userInfo = this.props.userInfo;
        userInfo.fetch(userInfo.uid).then((result) => console.log(result));
    }

    onJuniorButtonClicked(param) {
        const userInfo = this.props.userInfo;
        userInfo.post(userInfo.uid).then();
    }

    /** -------------------- functions -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default MainComponent;
