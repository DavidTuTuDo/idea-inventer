/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-28-15-15-13
 */
import {observer, inject} from "mobx-react";
import BaseNavigatorComponent from "./BaseNavigatorComponent";
import Router from '../../router';
import config from '../../config';
import cookie from '../../cookie';

@inject("navigator")
@observer
class NavigatorComponent extends BaseNavigatorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.getStore().reAuthByCredential().then();
    }

    onHomeAreaAvatarClicked(param) {
        Router.gotoMainPage(this);
    }

    onLoginButtonClicked(param) {
        if (!this.getStore().isLoginInSucceed()) {
            console.log(window.location.href);
            this.getStore().setPathOfBeforeLogin(window.location.href);
            Router.gotoLoginPage(this);
        } else
            this.getStore().logout().then();

    }

    /** -------------------- async api -------------------- **/
}

export default NavigatorComponent;
