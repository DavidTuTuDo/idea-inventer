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
import BaseUserInfo from "../../base/BaseUserInfo";


class ModularizedNavigatorComponent extends BaseNavigatorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
        this.getStore().forceToStable();
    }

    onNavigatorToolBarTitleTypographyClicked(param) {
        Router.gotoMainPage(this.getComponentInstance());
    }

    onNavigatorToolBarLoginButtonClicked(param) {
        BaseUserInfo.performLoginBehavior(this.getComponentInstance()).then();
    }

    onDrawerClosed() {
        this.setDrawerOpenState(false);
    }

    setDrawerOpenState(open = false) {
        this.getStore().setDrawerOpenStatus(open);
    }

    onNavigatorToolBarMenuIconButtonClicked(param) {
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

    onNavigatorToolBarCompleteInputTextFieldSearchPressed(input, complete) {
        /** 先判斷autoComplete 有沒有selectedItem()
         *
         * 沒有的話再用 getInput() 去搜尋
         * */
        this.disapearKeyboard()
        const selected = this.getStore().getSuggestKeywordDetail();
        if (!Util.isUndefinedNullEmpty(selected)) {
            this.onSearchPressed(selected.data());
            this.getStore().clearKeywordDetail();
        } else {
            this.onSearchPressed(complete.getInput())
        }
    }

    /** content 可能是string | {suggestedObject}*/
    onSearchPressed(content) {
        Util.appendInfo("onSearchPressed not implemented");
    }

    onNavigatorToolBarCompleteInputTextFieldChange(param) {
        const complete = param.object;
        this.getStore().invalidateSuggestion(complete.getInput()).then();
    }

    onNavigatorToolBarCompleteAutocompleteChange(param) {
        const keyword = param.object;
        if (!Util.isUndefinedNullEmpty(keyword))
            this.getStore().getToolBar().getComplete().setInput(keyword.getValue());
    }

    getInjectStyleOfNavigatorToolBarAccountIconButton() {
        return Util.getVisibleOrNone(UserInfo.isLoginWithSucceed());
    }

    getInjectStyleOfNavigatorToolBarLoginButton(toolBar) {
        return Util.getVisibleOrNone(!UserInfo.isLoginWithSucceed());
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorComponent
