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
import {withStyles} from '@material-ui/styles';
import UserInfo from '../../base/BaseUserInfo';
import Style from "../../style";
import React from "react";
import {
    List,
    ListItemText,
    IconButton,
    ListItemIcon,
    ListItem,
    Typography,
    ListSubheader,
    ListItemAvatar,
    Avatar
} from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import * as MUIcon from '@material-ui/icons';
import _ from 'lodash';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import CommonFirebaseHelper from "../../base/CommonFirebaseHelper";
import {isMobile} from 'react-device-detect'

const useStyles = theme => ({
    paper: {
        marginTop: "50px",
        width: isMobile ? '55%' : '40%',
        backgroundColor: '#000000'
    }
});

class ModularizedNavigatorComponent extends BaseNavigatorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectStyleOfNavigatorAppBarToolBarToEditModeButton(toolBar) {
        if (isMobile) return Util.getVisibleOrNone(false);
        const result = Util.getVisibleOrHidden(UserInfo.isAdmin());
        return result;
    }

    componentDidMount() {
        super.componentDidMount();
        this.getStore().forceToStable();
    }

    onNavigatorAppBarToolBarToEditModeButtonClicked(param) {
        Router.gotoEditPage(this);
    }

    onAuthStateChangedReceive = (user) => {
        const store = this.getStore();
        if (UserInfo.isLoginInSucceed()) {
            Util.appendInfo('登入成功, 所以寫入資料', user)
            /** 應該在login 以及 signInByCredential 就會把 credential 存到 cache */
            const credential = Cookie.getCredential();
            Cookie.setUser(user);
            store.setUserInfo(user);
            store.setCredential(credential);
        }
        Util.appendInfo('Navigator收到登入狀態改變的事件', user)
        store.updateLoginButtonStatus();
        store.updateEditButtonStatus();
    }

    onNavigatorAppBarToolBarTitleTypographyClicked(param) {
        Router.gotoMainPage(this);
    }

    onNavigatorAppBarToolBarLoginButtonClicked(param) {
        const self = this;
        if (UserInfo.isLoginInSucceed()) {
            this.getStore().logout().then();
            self.reloadPage()
        } else {
            const asyncTask = async (authResult) => {
                Cookie.setCredential(authResult.credential);
                const userInfo = authResult.user;
                await this.getStore().setUserInfo(userInfo);
                await this.getStore().getUserInfo().submitUserInfo(self, userInfo.uid, userInfo);
                self.reloadPage();
            }
            CommonFirebaseHelper.signInWithGoogle(asyncTask).then();
        }
    }

    onDrawerClosed() {
        this.setDrawerOpenState(false);
    }

    setDrawerOpenState(open = false) {
        this.getStore().setDrawerOpenStatus(open);
    }

    onNavigatorAppBarToolBarMenuIconButtonClicked(param) {
        this.setDrawerOpenState(true)
    }

    getDrawerOpenStatus() {
        return this.getStore().getDrawerOpenStatus();
    }

    NavigatorDrawerShortcutView = observer(({shortcut}) => {
        const classes = this.props.classes;
        const self = this;
        const DrawerShortcutCollapseView = self.DrawerShortcutCollapseView;
        const ListItemTailIconView = self.ListItemTailIconView;
        const ListItemIconView = self.ListItemIconView;
        return (
            <React.Fragment>
                <ListItem
                    className={'BaseShortcutItemView'}
                    button={true}
                    onClick={() => self.handleShortcutClicked(shortcut)}>
                    <ListItemIconView img={shortcut.icon}/>
                    <ListItemText
                        disableTypography
                        primary={<Typography
                            className={'BaseShortcutItemTextView'}>{shortcut.getTitle()}</Typography>}/>
                    <ListItemTailIconView shortcut={shortcut}/>
                </ListItem>

                <DrawerShortcutCollapseView shortcut={shortcut}/>
            </React.Fragment>
        );
    });

    ListItemIconView = observer(({img = ''}) => {
        const self = this;
        const words = img.split(':');
        const type = _.head(words).trim();
        const MUIconView = self.MUIconView;
        let content = null;
        switch (type) {
            case'path':
                const iconPath = _.last(words);
                content = <Avatar
                    className={'BaseShortcutItemAvatarView'}
                    src={iconPath}/>
                break;
            case 'muIcon':
                const muIcon = _.last(words);
                content = <Avatar className={'BaseShortcutItemAvatarView'}> <MUIconView name={muIcon}/> </Avatar>
                break;
            default:
                content = <Avatar className={'BaseShortcutItemAvatarView'}> <MUIconView/> </Avatar>
                break;
        }
        return (<ListItemIcon
            className={'BaseShortcutItemIconView'}>
            {content} </ListItemIcon>)
    })

    MUIconView = observer(({name}) => {

            const CustomView = MUIcon[name];
            if (CustomView !== undefined)
                return <CustomView className={'BaseShortcutMUIconView'}/>
            else {
                const Random = _.sample(MUIcon);
                return <Random className={'BaseShortcutMUIconView'}/>
            }
        }
    )

    DrawerShortcutCollapseView = observer(({shortcut}) => {
        const classes = this.props.classes;
        const self = this;
        const DrawerShortcutView = self.NavigatorDrawerShortcutView;
        const subs = shortcut.getSubs();
        if (!shortcut.hasSubItems()) return null;
        return (
            <Collapse
                className={'BaseShortcutCollapseView'}
                in={shortcut.isSubOpen()} timeout="auto" unmountOnExit>
                <List
                    className={'BaseShortcutNestedListView'}
                    component="div" disablePadding>
                    {subs.map(shortcut => <DrawerShortcutView
                        key={`key${_.indexOf(subs, shortcut)}`}
                        shortcut={shortcut}/>)}
                </List>
            </Collapse>

        );
    });

    ListItemTailIconView = observer(({shortcut}) => {
        const self = this;
        const MUIconView = self.MUIconView;
        if (!shortcut.hasSubItems()) return null;
        return (
            <ListItemSecondaryAction>
                <IconButton
                    className={'BaseShortcutItemIconView'}
                    edge="end" aria-label="delete">
                    {shortcut.isSubOpen() ? <MUIconView name={`ExpandLess`}/> : <MUIconView name={'ExpandMore'}/>}
                </IconButton>
            </ListItemSecondaryAction>)
    })

    handleShortcutClicked = (shortcut) => {
        if (shortcut.hasSubItems()) {
            shortcut.setSubOpen(!shortcut.isSubOpen())
        } else {
            /** route to page or doing something */
            this.setDrawerOpenState(false);
            this.handleCustomRouter(shortcut.getRoute());
        }
    }

    onNavigatorAppBarToolBarCompleteInputTextFieldChange(param) {
        const complete = param.object;
        this.getStore().invalidateSuggestion(complete.getInput()).then();
    }

    onNavigatorAppBarToolBarCompleteAutocompleteChange(param) {
        const keyword = param.object;
        if (!Util.isUndefinedNullEmpty(keyword))
            this.getStore().getAppBar().getToolBar().getComplete().setInput(keyword.getValue());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorComponent
