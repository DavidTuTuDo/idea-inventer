/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-23-17-02-38
 */
import {observer, inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {Redirect} from 'react-router-dom';
import React from 'react';

@inject( "main" )
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    constructor(prop) {
        super( prop );
        this.props.main.setState( 'stable' );
    }

    onSocialButtonClicked(param) {
        const { history } = this.props;
        history.push('/exam/');
    }

    /** -------------------- functions -------------------- **/
    /** -------------------- async api -------------------- **/
}

export default MainComponent;
