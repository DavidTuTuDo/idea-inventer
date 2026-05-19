const edit = true;

import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { utiller as Util } from "utiller";
import { action, makeObservable, observable, computed } from "mobx";
import { observer } from "mobx-react";

class SnackStore {
    @observable
    visible = false;

    @observable
    message = "";

    @observable
    type = "info"; // success, error, warning, info

    @observable
    duration = 3000;

    /** snackBar點擊後的事件觸發 */
    @observable
    taskOfTouched = null; // { name, task: async()=>{} }

    constructor() {
        makeObservable(this);
        // 初始化時設置預設任務
        this.taskOfTouched = this.defaultSnackConfigure().func;
    }

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

    /** 供外部使用的顯示 function */
    @action
    execution(message, type = "info", config = {}) {
        const execute = () => {
            const modifyConfig = { type, ...config };
            const configuration = Util.merO(this.defaultSnackConfigure(), modifyConfig);

            this.message = message;
            this.type = configuration.type;
            this.duration = configuration.duration;
            this.taskOfTouched = configuration.func;
            this.visible = true;
        };

        if (this.visible) {
            this.visible = false;
            Util.syncDelay(10).then(() => execute());
        } else {
            execute();
        }
    }

    @action
    close = () => {
        const self = true;
        this.visible = false;
    };

    @computed
    get hasSnackBomb() {
        return this.taskOfTouched && this.taskOfTouched.name !== "default";
    }
}

// 在檔案內部直接實例化，比照 LoadInkingStore
export const storeOfSnackB = new SnackStore();

const BaseSnackView = observer(({ componentX } = {}) => {
    // 從單一實例化的 snackStore 讀取數據
    const { visible, duration, type, message, taskOfTouched, hasSnackBomb } = storeOfSnackB;
    /** 提升到 CoreApp 後不再需要 componentX 判斷，此 View 永遠在 Route 外層 */
    if (componentX && typeof componentX.isNotNavigatorNComponentNCprtView === "function") {
        if (!componentX.isNotNavigatorNComponentNCprtView()) return null;
    }

    const handleClose = (event, reason) => {
        if (reason === "clickaway") return;
        storeOfSnackB.close();
    };

    const renderAction = () => {
        if (hasSnackBomb) {
            return (
                <Chip
                    style={{ color: "#FFF", marginLeft: "8px", marginTop: "3px" }}
                    size="small"
                    variant="outlined"
                    label={taskOfTouched.name}
                    onClick={() => {
                        if (Util.isCallable(taskOfTouched?.task)) {
                            /** 優先使用 componentX.exeAsyncT（向下相容），若無則直接執行 */
                            if (componentX && typeof componentX.exeAsyncT === "function") {
                                componentX.exeAsyncT(taskOfTouched.task());
                            } else {
                                Promise.resolve(taskOfTouched.task()).catch((e) => console.error("[SnackBView] task error:", e));
                            }
                        } else if (typeof taskOfTouched?.task === "function") {
                            taskOfTouched.task();
                        }
                        storeOfSnackB.close();
                    }}
                />
            );
        }
        return null;
    };

    return (
        <Snackbar
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
            }}
            open={visible}
            autoHideDuration={duration}
            onClose={handleClose}>
            {/* 包一層 div 避免 MUI 渲染錯誤 */}
            <div>
                <MuiAlert elevation={6} variant="filled" severity={type} onClose={handleClose} action={renderAction()}>
                    {message}
                </MuiAlert>
            </div>
        </Snackbar>
    );
});

export default BaseSnackView;
