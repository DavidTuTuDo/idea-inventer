const edit = true;
import React from "react";
import {
    Dialog,
    DialogActions,
    Button,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material';
import {action, makeObservable, observable} from "mobx";
import {observer, inject} from "mobx-react";
import {utiller as Util} from "utiller";
import _ from 'lodash';
import MuiComponent from "./MUIComponent";
import BaseComponent from './BaseComponent';
import Chip from "@mui/material/Chip";


class DialogStore {

    @observable
    visibility = false;

    @observable
    propsOfCustomView = {}

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
    }

    /** object 是可以帶到customView裡面的變數 */
    open = (paramObject = {}) => {
        if (!_.isObject(paramObject)) {
            Util.appendError(`9831, paramObject should be object, not ${paramObject}`)
            return
        }
        if (paramObject !== undefined) {
            this.getStore().setPropsOfCustomView(paramObject);
        }
        this.getStore().setVisibility(true);

    }

    /** 按下esc也會產生close的行為 */
    close = () => {
        if (!this.strict)
            this.getStore().setVisibility(false);
        else
            this.component instanceof BaseComponent ? this.component.showErrorSnackMessage(`避免資料遺失，請點擊視窗關閉的提示鍵`) : '';

    }

    dismiss = () => {
        this.getStore().setVisibility(false);
    }

    onSubmitClicked = async () => {
        const submitAsyncTask = this.props.submitAsyncTask;
        const paramObject = this.props.paramObject;
        this.dismiss();
        await submitAsyncTask();
    }

    getStore() {
        return this.dialog;
    }

    render() {
        const self = this;
        return (
            <Dialog
                className={"BaseAlertDialog"}
                {...this.injectPaperProps()}
                scroll={'paper'}
                fullWidth={!!self.fullWidth}
                fullScreen={self.hasCustomView() ? true : false}
                maxWidth={false}
                onClick={(event) => {
                    event.stopPropagation();
                }}
                open={self.getStore().getVisibility()}
                onClose={self.close}>

                {this.renderTitle()}

                {this.renderContent()}

                {this.renderActionButton()}

            </Dialog>
        )
    }

    injectPaperProps() {
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
            }
        }
    }

    renderTitle() {
        const self = this;
        const title = this.props.title;
        if (!_.isEmpty(title)) {
            return <DialogTitle>{title}</DialogTitle>
        }
        return null;
    }


    renderTextField() {
        const textInput = this.props.textInput;

        if (textInput && textInput.enable) {
            return <TextField
                autoFocus
                required
                margin="dense"
                value={textInput.value}
                label={textInput.label}
                type={textInput.type}
                fullWidth
                variant="standard"
                onChange={(event) => {
                    textInput.onTextFieldChange(event);
                }}
            />
        } else
            return null;
    }

    renderContent = () => {
        const CustomView = this.props.customView;
        const paramObject = this.props.paramObject;
        const component = this.props.component;
        const content = this.props.content;

        if (this.hasCustomView())
            return <DialogContent
                className={'BaseAlertDialogContent'}>

                <div
                    className={'BaseAlertDialogCustomView'}>
                    <CustomView
                        component={component}
                        paramObject={paramObject}
                        dialog={this}
                        {...this.getStore().getPropsOfCustomView()} />


                    {this.renderCustomCancelChip()}

                </div>
            </DialogContent>


        return <DialogContent>
            <DialogContentText
                whiteSpace={'pre-line'}>
                {content}
            </DialogContentText>
            {this.renderTextField()}
        </DialogContent>
    }

    renderCustomCancelChip = () => {
        if (this.useCustomCancel) {
            return null
        }

        return <div className={'BaseAlertDialogDismissView'}>
            <Chip
                className={`BaseAlertDialogDismissChip`}
                label={`關閉視窗`}
                variant={`outlined`}
                onClick={(event) => {
                    event.stopPropagation();
                    this.dismiss();}
                }/>
        </div>

    }

    hasCustomView() {
        return this.props.customView;
    }

    renderActionButton() {
        const self = this;
        const needActionButtons = this.props.needActionButtons;

        if (!needActionButtons) return null;

        return <DialogActions>

            {this.renderCancelButton()}

            <Button
                onClick={async () => await self.onSubmitClicked()}
                color="primary" autoFocus>
                確認
            </Button>
        </DialogActions>
    }

    renderCancelButton = () => {

        if (!this.enableCancel)
            return null
        return (<Button onClick={this.dismiss} color="primary">
            取消
        </Button>)

    }

}

export default AlertDialog;
