const edit = true;

import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { utiller as Util } from "utiller";
import _ from "lodash";
import { action, makeObservable, observable } from "mobx";

export class SnackStore {
    @observable
    visible = false;

    @observable
    message = "";

    @observable
    type = "info"; // success, error, warning, info

    @observable
    duration = 3000;

    /** snackBar點擊後的事件觸發，例如某個snackView點擊後會導引頁面到HomePage() */
    taskOfTouched = null; // { name, task: async()=>{} }

    constructor() {
        makeObservable(this);
    }

    /**
     * 預設的 Extra 設定
     */
    defaultSnackConfigure() {
        return {
            type: "info",
            duration: 3000,
            func: {
                name: "default",
                task: async () => {
                    await Util.syncDelay();
                    console.log("default snack task message!");
                }
            }
        };
    }

    @action
    setVisible(visible) {
        this.visible = visible;
    }

    get visible() {
        return this.visible;
    }

    @action
    execution(message, type = "info", config = {}) {
        const self = this;
        const execute = () => {
            const modifyConfig = { type, ...config };
            const configuration = Util.merO(self.defaultSnackConfigure(), modifyConfig);
            // 設置數據
            this.message = message;
            this.type = configuration.type;
            this.duration = configuration.duration;
            this.taskOfTouched = configuration.func;
            this.visible = true;
        };

        // 如果當前已經是開啟狀態，先關閉稍微等待後再開啟
        if (this.visible) {
            this.visible = false;
            Util.syncDelay(10).then(() => {
                execute();
            });
        } else {
            execute();
        }
    }

    close = () => {
        // 重置為預設 task
        this.taskOfTouched = this.defaultSnackConfigure.func;
        this.visible = false;
    };
}

/**
 * UI Component (Class Version)
 */
class BaseSnackView extends React.Component {

    constructor(props) {
        super(props);
    }

    onSnackViewCloseClicked = (event, reason) => {
        if (reason === 'clickaway') return;
        this.props.store.close();
    };

    hasSnackBomb = () => {
        const { store } = this.props;
        return store.taskOfTouched && store.taskOfTouched.name !== "default";
    }

    renderSnackTaskBombView = () => {
        const { store, componentX } = this.props;
        if (this.hasSnackBomb()) {
            return (
                <Chip
                    style={{ color: "#FFF", marginLeft: "8px", marginTop:"3px" }}
                    size="small"
                    variant="outlined"
                    label={store.taskOfTouched.name}
                    onClick={() => {
                        if (Util.isAsyncP(store.taskOfTouched?.task)) componentX.exeAsyncT(store.taskOfTouched.task());
                        store.close();
                    }} />
            );
        }
        return null;
    };

    render() {
        const { store } = this.props;
        // 防呆：如果沒有傳入 store 則不渲染
        if (!store) return null;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
                open={store.visible}
                autoHideDuration={store.duration}
                onClose={this.onSnackViewCloseClicked}>
                <div>
                    <MuiAlert
                        elevation={6}
                        variant="filled"
                        severity={store.type}
                        onClose={this.onSnackViewCloseClicked}
                        action={this.renderSnackTaskBombView()}>
                        {store.message}
                    </MuiAlert>
                </div>
            </Snackbar>
        );
    }
}

export default BaseSnackView;
