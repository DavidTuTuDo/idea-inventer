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


    close = () => {
        this.getStore().setVisibility(false);
    }

    onSubmitClicked = async () => {
        const submitAsyncTask = this.props.submitAsyncTask;
        const paramObject = this.props.paramObject;
        this.close();
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
                fullWidth={true}
                maxWidth={false}
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
                        boxShadow: "none"
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

    renderContent() {
        const CustomView = this.props.customView;
        const paramObject = this.props.paramObject;
        const component = this.props.component;
        const content = this.props.content;

        if (this.hasCustomView())
            return <DialogContent
                className={'BaseAlertDialogContent'}>
                <CustomView
                    component={component}
                    paramObject={paramObject}
                    dialog={this}
                    {...this.getStore().getPropsOfCustomView()} />
            </DialogContent>


        return <DialogContent>
            <DialogContentText
                whiteSpace={'pre-line'}>
                {content}
            </DialogContentText>
            {this.renderTextField()}
        </DialogContent>
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

            <Button onClick={async () => await self.onSubmitClicked()} color="primary" autoFocus>
                確認
            </Button>
        </DialogActions>
    }

    renderCancelButton = () => {
        if (!this.enableCancel)
            return null
        return (<Button onClick={self.close} color="primary">
            取消
        </Button>)

    }

}

export default AlertDialog;
