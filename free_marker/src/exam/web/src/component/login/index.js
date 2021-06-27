/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-29-20-43-56
 */
import {observer, inject} from "mobx-react";
import BaseLoginComponent from "./BaseLoginComponent";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebaser from '../../base/CommonFirebaseHelper';
import core from 'firebase';
import React from 'react';

@inject("login")
@inject("navigator")
@observer
class LoginComponent extends BaseLoginComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    getFirebaseView() {
        return (
            <StyledFirebaseAuth
                uiConfig={firebaser.getLoginConfig(this, this.props.navigator.getPathOfBeforeLogin())}
                firebaseAuth={firebaser.auth()}/>
        );
    }

    constructor(props) {
        super(props);
    }

    /** -------------------- async api -------------------- **/
}

export default LoginComponent;
