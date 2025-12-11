const edit = true;

import { observer, inject } from "mobx-react";
import BaseNavigatorComponent from "./BaseNavigatorComponent";
import Router from "../../router";
import { utiller as Util } from "utiller";
import UserInfo from "../../base/BaseUserInfo";
import React from "react";
import Config from "../../config";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import Collapse from "@mui/material/Collapse";
import _ from "lodash";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import BaseUserInfo from "../../base/BaseUserInfo";

class ModularizedNavigatorComponent extends BaseNavigatorComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
    }

    getInjectStyleOfNavigatorMenuIconButton() {
        return Util.getVisibleOrNone(_.size(this.getStore().getShortcuts()) > 0, true);
    }

    onNavigatorTitleTypographyClicked(param) {
        Router.gotoHomePage(this);
    }

    onNavigatorLoginIconButtonClicked(param) {
        BaseUserInfo.performLoginBehavior(this.getComponentInstance()).then();
    }

    onDrawerClosed() {
        this.setDrawerOpenState(false);
    }

    setDrawerOpenState(open = false) {
        this.getStore().setDrawerOpenStatus(open);
    }

    onNavigatorMenuIconButtonClicked(param) {
        this.setDrawerOpenState(true);
    }

    getDrawerOpenStatus() {
        return this.getStore().getDrawerOpenStatus();
    }

    NavigatorDrawerShortcutView = observer(({ shortcut }) => {
        const self = this;
        const DrawerShortcutCollapseView = self.DrawerShortcutCollapseView;
        const ListItemTailIconView = self.ListItemTailIconView;
        const ListItemIconView = self.ListItemIconView;
        return (
            <React.Fragment>
                <ListItem className={"BaseShortcutItemView"} button={true} onClick={() => self.handleShortcutClicked(shortcut)}>
                    <ListItemIconView img={shortcut.icon} />
                    <ListItemText disableTypography primary={<Typography className={"BaseShortcutItemTextView"}>{shortcut.getTitle()}</Typography>} />
                    <ListItemTailIconView shortcut={shortcut} />
                </ListItem>

                <DrawerShortcutCollapseView shortcut={shortcut} />
            </React.Fragment>
        );
    });

    ListItemIconView = observer(({ img = "" }) => {
        const self = this;
        const words = img.split(":");
        const type = _.head(words).trim();
        const MUIconView = self.MUIconView;
        let content = null;
        switch (type) {
            case "path":
                const iconPath = _.last(words);
                content = <Avatar className={"BaseShortcutItemAvatarView"} src={iconPath} />;
                break;
            case "muIcon":
                const muIcon = _.last(words);
                content = (
                    <IconButton className={"BaseShortcutItemNavView"}>
                        <MUIconView name={muIcon} />
                    </IconButton>
                );
                break;
            default:
                content = (
                    <IconButton className={"BaseShortcutItemNavView"}>
                        <MUIconView />
                    </IconButton>
                );
                break;
        }
        return <ListItemIcon className={"BaseShortcutItemIconView"}>{content} </ListItemIcon>;
    });

    DrawerShortcutCollapseView = observer(({ shortcut }) => {
        const self = this;
        const DrawerShortcutView = self.NavigatorDrawerShortcutView;
        const subs = shortcut.getSubs();
        if (!shortcut.hasSubItems()) return null;
        return (
            <Collapse className={"BaseShortcutCollapseView"} in={shortcut.isSubOpen()} timeout="auto" unmountOnExit>
                <List className={"BaseShortcutNestedListView"} component="div" disablePadding>
                    {subs.map((shortcut) => (
                        <DrawerShortcutView key={shortcut.getIdOfUniqueView()} shortcut={shortcut} />
                    ))}
                </List>
            </Collapse>
        );
    });

    ListItemTailIconView = observer(({ shortcut }) => {
        const self = this;
        if (!shortcut.hasSubItems())
            return (
                <IconButton className={"BaseShortcutItemNavView"} edge="end" aria-label="delete">
                    <NavigateNext />
                </IconButton>
            );
        return (
            <ListItemSecondaryAction>
                <IconButton className={"BaseShortcutItemIconView"} edge="end" aria-label="delete">
                    {shortcut.isSubOpen() ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </ListItemSecondaryAction>
        );
    });

    handleShortcutClicked = (shortcut) => {
        if (shortcut.hasSubItems()) {
            shortcut.setSubOpen(!shortcut.isSubOpen());
        } else {
            /** route to page or doing something */
            this.setDrawerOpenState(false);
            this.handleCustomRouter(shortcut.getRoute());
        }
    };

    onNavigatorInputOfCompleteTextFieldSearchPressed(input, navigator) {
        this.disappearKeyboard();
        this.onSearchPressed(navigator.getComplete()?.label ? navigator.getComplete() : navigator.getInputOfComplete());
    }

    /** content 可能是string | {suggestedObject} */
    onSearchPressed(content) {
        if (_.isObject(content) && content.uid) {
            /** 處理整理過的關鍵字們{參考悅譜} */
        } else if (Config.TransactionMethod && _.size(content) > 1) Router.gotoDionysusPage(this, content);
        else this.showWarningSnackMessage(`搜尋條件至少2個字元`);
    }

    getInjectStyleOfNavigatorAccountIconButton() {
        return Util.getVisibleOrNone(UserInfo.isLoginWithSucceed(), true);
    }

    getInjectStyleOfNavigatorLoginIconButton(navigator) {
        return Util.getVisibleOrNone(!UserInfo.isLoginWithSucceed() && !UserInfo.isAuthProcessing(), true);
    }

    getInjectStyleOfNavigatorCompleteAutocomplete(navigator) {
        return Util.getVisibleOrHidden(!navigator.getWhetherKeywordWasFetching());
    }

    getInjectStyleOfNavigatorTipOfLoadingCircularProgress(navigator) {
        return Util.getVisibleOrNone(navigator.getWhetherKeywordWasFetching() || UserInfo.isAuthProcessing(), true);
    }

    onNavigatorCartieIconButtonClicked(param) {
        Router.gotoCartiePage(this);
    }

    getInjectStyleOfNavigatorCartieIconButton(navigator) {
        return Util.getVisibleOrNone(Config.useCartie && navigator.getBadgeOfCartie() > 0, true);
    }
}

export default ModularizedNavigatorComponent;
