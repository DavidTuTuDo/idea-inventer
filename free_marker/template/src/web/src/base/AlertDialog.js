const edit = true;

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { action, makeObservable, observable } from "mobx";
import { utiller as Util } from "utiller";
import _ from "lodash";
import MuiComponent from "./MUIComponent";
import BaseComponent from "./BaseComponent";
import Chip from "@mui/material/Chip";
import { inject, observer } from "mobx-react";
import { isDesktop } from "react-device-detect";

class DialogStore {
    @observable
    visibility = false;

    @observable
    propsOfCustomView = {};

    constructor() {
        makeObservable(this);
    }

    getVisibility() {
        return this.visibility;
    }

    getPropsOfCustomView() {
        return this.propsOfCustomView;
    }

    @action
    setVisibility(visibility) {
        this.visibility = visibility;
    }

    @action
    setPropsOfCustomView(object) {
        this.propsOfCustomView = object;
    }
}

/**
 * 通用警告/確認視窗組件
 * 整合了 CustomView (客製化內容)、TextInput (文字輸入)、Disposable Store (用完即丟的 Store 清理) 等邏輯。
 * @props {string} title - [可選] 視窗標題
 * @props {string} content - [可選] 視窗純文字內容 (若有 customView 則忽略此項)
 * @props {function} task - [可選] 按下「確認」鍵後的異步任務 (通常是 API 呼叫)
 * @props {boolean} needActionButtons - [默認 false] 是否顯示底部的「取消/確認」按鈕
 * @props {boolean} enableCancel - [默認 true] 是否啟用「取消」按鈕
 * @props {boolean} useCustomCancel - [默認 false] 是否使用 CustomView 內部的取消機制 (會隱藏預設的關閉 Chip)
 * @props {React.Component} customView - [可選] 客製化的 React Component 內容
 * @props {object} paramObject - [可選] 傳遞給 submitAsyncTask 或 CustomView 的參數物件
 * @props {object} textInput - [可選] 文字輸入框設定 { enable: boolean, label: string, value: any, type: string, onTextFieldChange: func }
 * @props {object} component - [必填] 呼叫此 Dialog 的 Parent Component (通常傳入 `this`)，用於錯誤處理或 Context 獲取
 * @props {boolean} fullWidth - [默認 false] 是否將寬度撐滿
 * @props {boolean} strict - [默認 false] 嚴格模式：點擊背景或 ESC 不會關閉視窗，強制使用者操作按鈕
 * @props {string} storeX - [可選] 指定要 inject 給 CustomView 的 MobX Store 名稱
 * @props {boolean} disposablePage - [默認 false] 是否為一次性頁面 (開啟時會自動清理對應 Store 的資料)
 * @props {function} callback - [可選] 通用回調函數，傳遞給 CustomView 使用
 */
/**
 * 通用警告/確認視窗組件
 * 整合了 CustomView (客製化內容)、TextInput (文字輸入)、Disposable Store (用完即丟的 Store 清理) 等邏輯。
 * @props {string} title - [可選] 視窗標題
 * @props {string} content - [可選] 視窗純文字內容 (若有 customView 則忽略此項)
 * @props {function} task - [可選] 按下「確認」鍵後的異步任務 (通常是 API 呼叫)
 * @props {boolean} needActionButtons - [默認 false] 是否顯示底部的「取消/確認」按鈕
 * @props {boolean} enableCancel - [默認 true] 是否啟用「取消」按鈕
 * @props {boolean} useCustomCancel - [默認 false] 是否使用 CustomView 內部的取消機制 (會隱藏預設的關閉 Chip)
 * @props {React.Component} customView - [可選] 客製化的 React Component 內容
 * @props {object} paramObject - [可選] 傳遞給 submitAsyncTask 或 CustomView 的參數物件
 * @props {object} textInput - [可選] 文字輸入框設定 { enable: boolean, label: string, value: any, type: string, onTextFieldChange: func }
 * @props {object} component - [必填] 呼叫此 Dialog 的 Parent Component (通常傳入 `this`)，用於錯誤處理或 Context 獲取
 * @props {boolean} fullWidth - [默認 false] 是否將寬度撐滿
 * @props {boolean} strict - [默認 false] 嚴格模式：點擊背景或 ESC 不會關閉視窗，強制使用者操作按鈕
 * @props {string} storeX - [可選] 指定要 inject 給 CustomView 的 MobX Store 名稱
 * @props {boolean} disposablePage - [默認 false] 是否為一次性頁面 (開啟時會自動清理對應 Store 的資料)
 * @props {function} callback - [可選] 通用回調函數，傳遞給 CustomView 使用
 */
const AlertDialog = observer(
    React.forwardRef((props, ref) => {
        // 初始化 DialogStore，保證只建立一次
        const [dialogStore] = React.useState(() => new DialogStore());

        /** 獲取 App 實例 (用於獲取 Store) */
        const getApp = () => {
            if (props.component && props.component.App) {
                return props.component.App();
            }
            // Fallback: 嘗試使用舊有的 require 方式
            try {
                const { Application } = require("../");
                return Application;
            } catch (e) {
                console.warn("AlertDialog: Cannot find Application instance.");
                return null;
            }
        };

        /** 輔助：清理 Store */
        const cleanDisposableStore = (nameOfComponent) => {
            const app = getApp();
            if (app && app.getStoreObject()) {
                const store = app.getStoreObject()[`${nameOfComponent}`];
                if (store && typeof store.clean === "function") {
                    store.clean();
                }
            }
        };

        /**
         * 開啟視窗
         * @param {object} paramObject - 動態傳入的參數，會覆蓋 props 中的 paramObject
         */
        const open = (paramObject = {}) => {
            // 1. 參數驗證
            if (!Util.isObject(paramObject)) {
                Util.appendError(`AlertDialog: paramObject should be object, not ${typeof paramObject}`);
                return;
            }

            // 2. 處理一次性頁面的 Store 清理邏輯
            if (props.disposablePage && props.customView?.nameOfComponent) {
                cleanDisposableStore(props.customView.nameOfComponent);
            }

            // 3. 設定 Custom View 參數
            const finalParamObject = !Util.isEmpty(paramObject) ? paramObject : props.paramObject || {};
            dialogStore.setPropsOfCustomView(finalParamObject);

            // 4. 顯示視窗
            dialogStore.setVisibility(true);
        };

        /** 強制關閉 */
        const dismiss = () => {
            dialogStore.setVisibility(false);
        };

        /**
         * 關閉視窗
         */
        const close = () => {
            const strict = props.strict || false;
            if (!strict) {
                dismiss();
            } else {
                props.component instanceof BaseComponent
                    ? props.component.showErrorSnackMessage(`避免資料遺失，請點擊視窗關閉的提示鍵`)
                    : console.warn("Strict mode: Cannot close dialog via backdrop click.");
            }
        };

        /** 確認按鈕點擊處理 */
        const onSubmitClicked = async () => {
            const { task } = props;
            dismiss();
            if (task) {
                await task();
            }
        };

        /** 檢測是否可能導致 Resize Unmount 的問題 */
        const mightCauseResizeUnmount = () => {
            const useTextInput = props.textInput && props.textInput.enable;
            if (!props.component) return false;

            const isDialog = typeof props.component.isDialogComponent === "function" && props.component.isDialogComponent();
            return isDialog && useTextInput && !isDesktop;
        };

        // 將方法暴露給 Parent Component (透過 ref 調用)
        React.useImperativeHandle(ref, () => ({
            open,
            close,
            dismiss,
            getStore: () => dialogStore
        }));

        const hasCustomView = () => {
            return !!props.customView;
        };

        const injectPaperProps = () => {
            if (hasCustomView()) {
                return {
                    PaperProps: {
                        style: {
                            backgroundColor: "transparent",
                            boxShadow: "none",
                            margin: "auto",
                            position: "relative"
                        }
                    }
                };
            } else if (mightCauseResizeUnmount()) {
                return {
                    PaperProps: {
                        style: {
                            display: "inline-block",
                            boxShadow: "none",
                            verticalAlign: "middle",
                            margin: "70px auto",
                            position: "relative",
                            transform: "none",
                            left: "0",
                            right: "0"
                        }
                    }
                };
            }
            return {};
        };

        const renderTitle = () => {
            const { title } = props;
            return !Util.isEmpty(title) ? <DialogTitle>{title}</DialogTitle> : null;
        };

        const renderTextField = () => {
            const { textInput } = props;
            const useTextInput = textInput && textInput.enable;

            if (useTextInput) {
                return (
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        value={textInput.value || ""}
                        label={textInput.label}
                        type={textInput.type || "text"}
                        fullWidth
                        variant="standard"
                        onChange={(event) => {
                            if (textInput.onTextFieldChange) {
                                textInput.onTextFieldChange(event);
                            }
                        }}
                    />
                );
            }
            return null;
        };

        /**
         * 手動注入 Store，避免在 Render 中使用 inject HOC 導致 Crash
         */
        const getInjectedProps = (storeX) => {
            if (!storeX) return {};

            const app = getApp();
            if (app && app.getStoreObject()) {
                const targetStore = app.getStoreObject()[storeX];
                if (targetStore) {
                    return { [storeX]: targetStore };
                }
            }
            return {};
        };

        const renderCustomCancelChip = () => {
            const { useCustomCancel } = props;
            if (useCustomCancel) return null;

            return (
                <div className={"BaseAlertDialogDismissView"}>
                    <Chip
                        className={`BaseAlertDialogDismissChip`}
                        label={`關閉視窗`}
                        variant={`outlined`}
                        onClick={(event) => {
                            event.stopPropagation();
                            dismiss();
                        }}
                    />
                </div>
            );
        };

        const renderContent = () => {
            const { customView: CustomView, component, content, callback, storeX, paramObject: propsParamObject } = props;

            const dynamicParams = dialogStore.getPropsOfCustomView();

            if (hasCustomView()) {
                const dismissButton = renderCustomCancelChip();

                // 這裡不再使用 inject HOC，而是直接手動查找 store 並當作 props 傳入
                // 這樣可以保持 Component 結構穩定，解決 Concurrent Rendering Error

                // 1. 準備 Store (如果有的話)
                const injectedStoreProps = !Util.isUndefinedNullEmpty(storeX) ? getInjectedProps(storeX) : {};

                // 2. 準備 CustomView (加上 Observer 確保內部更新)
                // 注意：require 放在 render 裡雖然不佳，但為了相容舊邏輯先保留，但移除了 inject
                let FinalCustomView = CustomView;
                if (!Util.isUndefinedNullEmpty(storeX)) {
                    const { Application } = require("../");
                    // 注意：在 Functional Component 中動態產生 Component 可能會導致 Remount，
                    // 但為了維持原 Class 行為這裡保留原樣。
                    FinalCustomView = Application.safeObserver(CustomView);
                }

                // 3. 組合所有 Props
                const allProps = {
                    component: component,
                    callback: callback,
                    paramObject: propsParamObject,
                    dialog: { open, close, dismiss, getStore: () => dialogStore }, // 模擬原本傳入的 this
                    ...injectedStoreProps, // 注入的 store (e.g. { epayMethodOfPayment: storeInstance })
                    ...dynamicParams // open() 傳入的參數
                };

                return (
                    <DialogContent className={"BaseAlertDialogContent"}>
                        <div className={"BaseAlertDialogCustomView"}>
                            <FinalCustomView {...allProps} />
                            {dismissButton}
                        </div>
                    </DialogContent>
                );
            }

            return (
                <DialogContent>
                    <DialogContentText className={"BaseAlertDialogContent"} whiteSpace={"pre-line"}>
                        {content}
                    </DialogContentText>
                    {renderTextField()}
                </DialogContent>
            );
        };

        const renderCancelButton = () => {
            const enableCancel = props.enableCancel ?? true;
            if (!enableCancel) return null;
            return (
                <Button onClick={dismiss} color="primary">
                    取消
                </Button>
            );
        };

        const renderActionButton = () => {
            const { needActionButtons } = props;
            if (!needActionButtons) return null;

            return (
                <DialogActions>
                    {renderCancelButton()}
                    <Button onClick={onSubmitClicked} color="primary" autoFocus>
                        確認
                    </Button>
                </DialogActions>
            );
        };

        const visible = dialogStore.getVisibility();

        if (!visible) return null;

        return (
            <Dialog
                className={"BaseAlertDialog"}
                {...injectPaperProps()}
                scroll={"paper"}
                fullWidth={!!props.fullWidth}
                fullScreen={hasCustomView()}
                maxWidth={true}
                onClick={(e) => e.stopPropagation()}
                sx={
                    mightCauseResizeUnmount()
                        ? {
                              "& .MuiDialog-container": {
                                  display: "block",
                                  textAlign: "center",
                                  height: "100%",
                                  overflowY: "auto"
                              }
                          }
                        : {}
                }
                disablePortal={mightCauseResizeUnmount()}
                disableScrollLock={mightCauseResizeUnmount()}
                disableEnforceFocus={mightCauseResizeUnmount()}
                open={visible}
                onClose={close}>
                {renderTitle()}
                {renderContent()}
                {renderActionButton()}
            </Dialog>
        );
    })
);

export default AlertDialog;
