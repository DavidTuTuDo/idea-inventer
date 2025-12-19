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

@observer
class AlertDialog extends MuiComponent {
    constructor(props) {
        super(props);
        this.dialog = new DialogStore();
        this.onSubmitClick = props.onSubmitClick;
        this.enableCancel = props.enableCancel ?? true;
        this.fullWidth = props.fullWidth;
        this.strict = props.strict;
        this.useCustomCancel = props.useCustomCancel ?? false;
        this.component = props.component;
        this.useTextInput = props.textInput && props.textInput.enable;
        this.textInput = props.textInput;
    }

    /** object 是可以帶到customView裡面的變數 */
    open = (paramObject = {}) => {
        if (!_.isObject(paramObject)) {
            Util.appendError(`9831, paramObject should be object, not ${paramObject}`);
            return;
        }
        if (paramObject !== undefined) {
            this.getStore().setPropsOfCustomView(paramObject);
        }
        this.getStore().setVisibility(true);
    };

    /** 按下esc也會產生close的行為 */
    close = () => {
        if (!this.strict) this.getStore().setVisibility(false);
        else this.component instanceof BaseComponent ? this.component.showErrorSnackMessage(`避免資料遺失，請點擊視窗關閉的提示鍵`) : "";
    };

    dismiss = () => {
        this.getStore().setVisibility(false);
    };

    onSubmitClicked = async () => {
        const submitAsyncTask = this.props.submitAsyncTask;
        const paramObject = this.props.paramObject;
        this.dismiss();
        await submitAsyncTask();
    };

    /** 如果base component已經是dialog(account -> append reader)，而當前的view又使用遇到text input(鍵盤會跳出來)的view，iphone會resize，導致整個view被unmount */
    mightCauseResizeUnmount = () => {
        return this.component.isDialogComponent() && this.useTextInput && !isDesktop;
    };

    getStore() {
        return this.dialog;
    }

    render() {
        const self = this;
        return (
            <Dialog
                className={"BaseAlertDialog"}
                {...this.injectPaperProps()}
                scroll={"paper"}
                fullWidth={!!self.fullWidth}
                fullScreen={self.hasCustomView() ? true : false}
                maxWidth={true}
                onClick={(event, reason) => {
                    event.stopPropagation();
                }}
                sx={
                    this.mightCauseResizeUnmount()
                        ? {
                              "& .MuiDialog-container": {
                                  display: "block", // 禁用 flex，防止動態置中計算
                                  textAlign: "center", // 讓內部的 Paper 水平置中
                                  height: "100%",
                                  overflowY: "auto"
                              }
                          }
                        : {}
                }
                disablePortal={this.mightCauseResizeUnmount()}
                disableScrollLock={this.mightCauseResizeUnmount()}
                disableEnforceFocus={this.mightCauseResizeUnmount()}
                open={self.getStore().getVisibility()}
                onClose={self.close}>
                {this.renderTitle()}

                {this.renderContent()}

                {this.renderActionButton()}
            </Dialog>
        );
    }

    injectPaperProps = () => {
        if (this.hasCustomView()) {
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
        } else if (this.mightCauseResizeUnmount()) {
            return {
                PaperProps: {
                    style: {
                        display: "inline-block", // 搭配 textAlign: center 達成水平置中
                        boxShadow: "none",
                        verticalAlign: "middle", // 垂直基準線
                        margin: "70px auto", // 與頂部保持距離，水平自動
                        position: "relative", // 脫離 fixed 置中邏輯
                        transform: "none", // 禁用 MUI 的 transform 位移
                        left: "0",
                        right: "0"
                    }
                }
            };
        }
    };

    renderTitle() {
        const self = this;
        const title = this.props.title;
        if (!_.isEmpty(title)) {
            return <DialogTitle>{title}</DialogTitle>;
        }
        return null;
    }

    renderTextField = () => {
        if (this.useTextInput) {
            return (
                <TextField
                    autoFocus={true}
                    required
                    margin="dense"
                    value={this.textInput.value}
                    label={this.textInput.label}
                    type={this.textInput.type}
                    fullWidth
                    variant="standard"
                    onChange={(event) => {
                        this.textInput.onTextFieldChange(event);
                    }}
                />
            );
        } else return null;
    };

    renderContent = () => {
        const self = this;
        const CustomView = this.props.customView;
        const paramObject = this.props.paramObject;
        const component = this.props.component;
        const content = this.props.content;
        const callback = this.props.callback;
        const storeX = this.props.storeX;

        if (!self.getStore().getVisibility()) return null;

        if (this.hasCustomView()) {
            if (Util.isUndefinedNullEmpty(storeX))
                /** ImageDialogView 這種不需要inject store的component走這裡！ */
                return (
                    <DialogContent className={"BaseAlertDialogContent"}>
                        <div className={"BaseAlertDialogCustomView"}>
                            <CustomView component={component} callback={callback} paramObject={paramObject} dialog={self} {...self.getStore().getPropsOfCustomView()} />

                            {this.renderCustomCancelChip()}
                        </div>
                    </DialogContent>
                );
            const { Application } = require("../");
            const ObservedCustomView = Application.safeObserver(CustomView);
            const CustomViewWrapper = inject(storeX)((props) => {
                const all = { ...props, ...self.getStore().getPropsOfCustomView() };
                return <ObservedCustomView component={component} callback={callback} paramObject={paramObject} dialog={self} {...all} />;
            });

            return (
                <DialogContent className={"BaseAlertDialogContent"}>
                    <div className={"BaseAlertDialogCustomView"}>
                        <CustomViewWrapper />

                        {this.renderCustomCancelChip()}
                    </div>
                </DialogContent>
            );
        }
        return (
            <DialogContent>
                <DialogContentText className={"BaseAlertDialogContent"} whiteSpace={"pre-line"}>
                    {content}
                </DialogContentText>
                {this.renderTextField()}
            </DialogContent>
        );
    };

    renderCustomCancelChip = () => {
        if (this.useCustomCancel) {
            return null;
        }

        return (
            <div className={"BaseAlertDialogDismissView"}>
                <Chip
                    className={`BaseAlertDialogDismissChip`}
                    label={`關閉視窗`}
                    variant={`outlined`}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.dismiss();
                    }}
                />
            </div>
        );
    };

    hasCustomView() {
        return this.props.customView;
    }

    renderActionButton() {
        const self = this;
        const needActionButtons = this.props.needActionButtons;

        if (!needActionButtons) return null;

        return (
            <DialogActions>
                {this.renderCancelButton()}

                <Button onClick={async () => await self.onSubmitClicked()} color="primary" autoFocus>
                    確認
                </Button>
            </DialogActions>
        );
    }

    renderCancelButton = () => {
        if (!this.enableCancel) return null;
        return (
            <Button onClick={this.dismiss} color="primary">
                取消
            </Button>
        );
    };
}

export default AlertDialog;
