/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-29-20-43-56
 */
import {observer, inject} from "mobx-react";
import BaseLoginComponent from "./BaseLoginComponent";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebaser from '../../base/CommonFirebaseHelper';
import React from 'react';
import Cookie from '../../cookie';
import UserInfo from "../../store/navigatorUserInfo";
import Router from "../../router";

@observer
class LoginComponent extends BaseLoginComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    getFirebaseView() {
        const self = this;
        return (
            <StyledFirebaseAuth
                uiConfig={firebaser.getLoginConfig(this, Cookie.getPathBeforeLogin(),
                    async (userInfo) => {
                        await new UserInfo().submitUserInfo(this, userInfo.uid, userInfo);
                        Router.gotoMainPage(self);
                    }
                )}
                firebaseAuth={firebaser.auth()}/>
        );
    }

    getStore() {
        return this.getEmptyStore()
    }

    constructor(props) {
        super(props);
    }

    /** -------------------- async api -------------------- **/
}

export default LoginComponent;
