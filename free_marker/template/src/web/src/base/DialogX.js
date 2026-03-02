const edit = true;

import React, { useMemo, useImperativeHandle, forwardRef } from "react";
import { observable, action, makeObservable } from "mobx";
import { observer } from "mobx-react";
import AlertDialog from "./AlertDialog";
import { utiller as Util } from "utiller";

/**
 * DialogXStore 類別
 * 負責管理單個 Dialog 的狀態、開啟邏輯以及圖片特定參數
 */
class DialogXStore {
    @observable
    dialogInfo = {
        task: async () => {
            await Util.syncDelay(10);
        },
        title: "標題",
        content: "內容"
    };

    @observable.ref
    refDialogX = null;

    @observable
    imageParams = this.getDefaultImageParam();

    constructor() {
        makeObservable(this);
    }

    @action.bound
    setInfo(info) {
        // 更新基本資訊 (title, content, task)
        this.dialogInfo = { ...this.dialogInfo, ...info };

        // 如果 info 中帶有 href 或 image 相關參數，同步更新 imageParams
        if (info && info.href !== undefined) {
            this.setImageParam(info);
        }
    }

    @action.bound
    setRef(ref) {
        this.refDialogX = ref;
    }

    @action.bound
    setImageParam(params) {
        // 使用你的 Util.merO 進行物件合併
        this.imageParams = Util.merO(this.getDefaultImageParam(), params);
    }

    getDefaultImageParam() {
        return {
            pager: false,
            href: ""
        };
    }

    // 執行開啟動作
    @action.bound
    activate(info) {
        if (info) this.setInfo(info);

        if (this.refDialogX) {
            // 解決 React 時序問題，確保在 Next Tick 執行 open
            Util.performActionWithoutTimingIssue(() => this.refDialogX?.open?.());
        } else {
            console.warn("DialogX: refDialogX is not ready.");
        }
    }
}

/**
 * DialogX 組件
 */
const DialogX = observer(
    forwardRef((props, ref) => {
        const { componentX, customView, viewX, needActionButtons = true } = props;

        // 建立每個實例唯一的 Store
        const localStore = useMemo(() => new DialogXStore(), []);

        // 暴露方法給父層的 ref.current
        useImperativeHandle(ref, () => ({
            activate: (info) => localStore.activate(info),
            setInfo: (info) => localStore.setInfo(info),
            setImageParam: (params) => localStore.setImageParam(params),
            get info() {
                return localStore.dialogInfo;
            },
            get imageParams() {
                return localStore.imageParams;
            }
        }));

        return (
            <AlertDialog
                ref={(node) => localStore.setRef(node)}
                title={localStore.dialogInfo.title}
                content={localStore.dialogInfo.content}
                needActionButtons={needActionButtons}
                task={localStore.dialogInfo.task}
                component={componentX}
                {...(customView && { customView })}
                paramObject={localStore.imageParams}
                viewX={viewX}
            />
        );
    })
);

export default DialogX;
