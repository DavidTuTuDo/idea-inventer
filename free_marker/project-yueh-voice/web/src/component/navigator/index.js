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

    }

}

export default withStyles(useStyles)(
    NavigatorComponent
)
;
