const edit = true;
/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-28-15-15-13
 */
import {observer, inject} from "mobx-react";
import BaseNavigatorComponent from "./BaseNavigatorComponent";
import Router from '../../router';
import {utiller as Util} from "utiller";
import UserInfo from '../../base/BaseUserInfo';
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
} from '@mui/material';
import Collapse from '@mui/material/Collapse';
import _ from 'lodash';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import BaseUserInfo from "../../base/BaseUserInfo";


class ModularizedNavigatorComponent extends BaseNavigatorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
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
                        key={shortcut.getIdOfUniqueView()}
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
        this.disappearKeyboard()
        const selected = this.getStore().getSuggestKeywordDetail();

        if (!Util.isUndefinedNullEmpty(selected) && selected.data) {
            const data = _.cloneDeep(selected.data());
            this.onSearchPressed(data);
            this.getStore().clearKeywordDetail();
        } else {
            this.onSearchPressed(complete.getInput())
        }
    }

    /** content 可能是string | {suggestedObject}*/
    onSearchPressed(content) {
        Util.appendInfo("onSearchPressed not implemented");

    }

    onNavigatorToolBarCompleteAutocompleteChange(param) {
        const keyword = param.object;
        if (!Util.isUndefinedNullEmpty(keyword))
            this.getStore().getToolBar().getComplete().setInput(keyword.getValue());
    }

    getInjectStyleOfNavigatorToolBarAccountIconButton() {
        return Util.getVisibleOrNone(UserInfo.isLoginWithSucceed(),true);
    }

    getInjectStyleOfNavigatorToolBarLoginButton(toolBar) {
        return Util.getVisibleOrNone(!UserInfo.isLoginWithSucceed() && !UserInfo.isAuthProcessing() ,true);
    }

    getInjectStyleOfNavigatorToolBarTipOfLoadingCircularProgress(toolBar) {
        return Util.getVisibleOrNone(UserInfo.isAuthProcessing() ,true);
    }


    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorComponent
