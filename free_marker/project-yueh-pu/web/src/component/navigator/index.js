const edit = true;
import {observer, inject} from "mobx-react";
import Router from '../../router';
import Config from '../../config';
import Cookie from '../../cookie';
import {withStyles} from '@mui/styles';
import Style from "../../style";
import React from "react";
import _ from 'lodash';
import CommonFirebaseHelper from "../../base/CommonFirebaseHelper";
import {isMobile} from 'react-device-detect'
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import UserInfoRef from "../../base/BaseUserInfo";

const useStyles = theme => ({
    paper: {
        marginTop: "50px",
        width: isMobile ? '55%' : '40%',
        backgroundColor: '#000000',
    },
});

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {

    onSearchPressed(content) {
        if(!UserInfoRef.isLoginWithSucceed()) {
            this.showWarningSnackMessage(`請IG詢問 明悅 如何開通搜尋功能`);
            return;
        }

        if (_.isObject(content) && content.type) {
            switch (content.type) {
                case 11:
                    Router.gotoSheetDetailPage(this.getComponentInstance(), content.uid);
                    break;
                case 12:
                    Router.gotoPortfolioPage(this, 'list', content.uid);
                    /** route to singer page*/
                    break;
                default:
                    throw new ERROR(999, `88745478 ${content.type} not handed`)
            }
        } else if (!Util.isUndefinedNullEmpty(content)) {
            Router.gotoPortfolioPage(this, 'search', content);
        }
    }
}

export default withStyles(useStyles)
(
    NavigatorComponent
)
;
