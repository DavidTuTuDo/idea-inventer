const edit = true;

import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import UserInfoRef from "./BaseUserInfo";
import _ from "lodash";
import MuiComponent from "./MUIComponent";

class MenuStore {
    @observable
    visibility = false;

    @observable
    anchorEl = null;

    @action
    setVisibility(visible) {
        this.visibility = visible;
    }

    @action
    setAnchor(anchor) {
        this.anchorEl = anchor;
    }

    constructor() {
        makeObservable(this);
    }
}

@observer
class AlertMenu extends MuiComponent {
    constructor(props) {
        super(props);
        this.store = new MenuStore();
        this.items = props.items;
        /** [...{ icon:textOfMuIcon, label:string, onClick:function, notice:{title:'',content:''}, loginOnly:boolean } ] */
        this.component = props.component;
    }

    setAnchor(anchor) {
        this.store.setAnchor(anchor);
    }

    open = () => {
        this.store.setVisibility(true);
    };

    close = () => {
        this.store.setVisibility(false);
    };

    handleClick = async ({ onClick, loginOnly = false, notice = { title: "", content: "" } }, event) => {
        function hasNoticeDialog() {
            return _.size(notice.title) > 0;
        }

        event.stopPropagation();
        /** 避免 item view 的點擊事件被觸發,例如一個list view 的每個 item 有作triple dot, 點擊triple dot不應該讓整個item點擊事件被觸發 */

        if (loginOnly && !UserInfoRef.isLoginWithSucceed()) {
            this.component.enableLoginConfirmDialog();
            return;
        }

        if (hasNoticeDialog()) {
            this.component.enableAlertDialog(notice.title, notice.content, onClick);
        } else if (_.isFunction(onClick)) await onClick(event);

        this.close();
    };

    handleOnClose = (event) => {
        event.stopPropagation();
        this.store.setAnchor(null);
        this.close();
    };

    render() {
        const self = this;
        return (
            <Menu className={"BaseAlertMenu"} open={self.store.visibility} onClose={self.handleOnClose} anchorEl={self.store.anchorEl}>
                {self.items.map((item) => {
                    const Custom = item.icon;
                    return (<MenuItem className={"BaseAlertMenuItem"} key={`index${_.indexOf(self.items, item)}`} onClick={async (event) => await self.handleClick(item, event)}>
                        <ListItemIcon>
                            <Custom />
                        </ListItemIcon>
                        {item.label}
                    </MenuItem>);
                })}
            </Menu>
        );
    }
}

export default AlertMenu;
