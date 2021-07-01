/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-28-15-15-13
 */
import {observer, inject} from "mobx-react";
import BaseNavigatorComponent from "./BaseNavigatorComponent";
import Router from '../../router';
import Config from '../../config';
import Cookie from '../../cookie';
import {utiller as Util} from "utiller";
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
    paper: {
        marginTop: "50px",
        backgroundColor: '#ff000000'
    }
});
@inject("navigator")
@observer
class NavigatorComponent extends BaseNavigatorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    onHomeAreaAvatarClicked(param) {

    }

    onTitleTypographyClicked(param) {
        super.onTitleTypographyClicked(param);
        Router.gotoMainPage(this);
    }

    onLoginButtonClicked(param) {
        if (!this.getStore().isLoginInSucceed()) {
            Util.appendInfo(window.location.href);
            this.getStore().setPathOfBeforeLogin(window.location.href);
            Router.gotoLoginPage(this);
        } else
            this.getStore().logout().then();
    }

    onDrawerClosed() {
        this.getStore().setDrawerOpenStatus(false);
    }

    onMenuIconButtonClicked(param) {
        this.getStore().setDrawerOpenStatus(true);
    }

    getDrawerOpenStatus() {
        return this.getStore().getDrawerOpenStatus();
    }


    /** -------------------- async api -------------------- **/
}

export default withStyles(useStyles)(NavigatorComponent);
