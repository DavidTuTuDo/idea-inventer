const edit = true;

import { observer, inject } from "mobx-react";
import BaseNavigatorComponent from "./BaseNavigatorComponent";
import Router from "../../router";
import { utiller as Util } from "utiller";
import UserInfo from "../../base/BaseUserInfo";
import React from "react";
import Config from "../../config";
import { List, ListItemText, IconButton, ListItemIcon, ListItem, Typography, Avatar } from "@mui/material";
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
                    <Avatar className={"BaseShortcutItemAvatarView"}>
                        {" "}
                        <MUIconView name={muIcon} />{" "}
                    </Avatar>
                );
                break;
            default:
                content = (
                    <Avatar className={"BaseShortcutItemAvatarView"}>
                        {" "}
                        <MUIconView />{" "}
                    </Avatar>
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
        const MUIconView = self.MUIconView;
        if (!shortcut.hasSubItems()) return null;
        return (
            <ListItemSecondaryAction>
                <IconButton className={"BaseShortcutItemIconView"} edge="end" aria-label="delete">
                    {shortcut.isSubOpen() ? <MUIconView name={`ExpandLess`} /> : <MUIconView name={"ExpandMore"} />}
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
        /** 先判斷autoComplete 有沒有selectedItem()
         *
         * 沒有的話再用 getInput() 去搜尋
         * */
        this.disappearKeyboard();
        const selected = this.getStore().getSuggestKeywordDetail();

        if (!Util.isUndefinedNullEmpty(selected) && selected.data) {
            const data = _.cloneDeep(selected.data());
            this.onSearchPressed(data);
            this.getStore().clearKeywordDetail();
        } else {
            this.onSearchPressed(navigator.getComplete());
        }
    }

    /** content 可能是string | {suggestedObject}*/
    onSearchPressed(content) {
        Util.appendInfo("onSearchPressed not implemented");
    }

    getInjectStyleOfNavigatorAccountIconButton() {
        return Util.getVisibleOrNone(UserInfo.isLoginWithSucceed(), true);
    }

    getInjectStyleOfNavigatorLoginIconButton(navigator) {
        return Util.getVisibleOrNone(!UserInfo.isLoginWithSucceed() && !UserInfo.isAuthProcessing(), true);
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
