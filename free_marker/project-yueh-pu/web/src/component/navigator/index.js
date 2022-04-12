import {observer, inject} from "mobx-react";
import Router from '../../router';
import Config from '../../config';
import Cookie from '../../cookie';
import {withStyles} from '@material-ui/styles';
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
        if (_.isObject(content) && content.type) {
            switch (content.type) {
                case 11:
                    Router.gotoSheetDetailPage(this.getComponentInstance(), content.uid);
                    break;
                case 22:
                    throw new ERROR(999, `88745478 route to singer not implemented`)
                    /** route to singer page*/
                    break;
            }
        } else if (!Util.isUndefinedNullEmpty(content)) {
            // Cookie.setPortfolio({type: 'search', id: content})
            Router.gotoPortfolioPage(this, 'search', content);
        }

    }

}

export default withStyles(useStyles)
(
    NavigatorComponent
)
;
