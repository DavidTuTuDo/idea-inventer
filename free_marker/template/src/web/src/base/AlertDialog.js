import React from "react";
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    Button,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';
import {action, makeObservable, observable} from "mobx";
import {observer, inject} from "mobx-react";
import {utiller as Util, exceptioner as ERROR} from "utiller";
import _ from 'lodash';

class DialogStore {

    @observable
    visibility = false;

    @observable
    extraParamObject = {}

    constructor() {
        makeObservable(this);
    }

    getVisibility() {
        return this.visibility;
    }

    getExtraParamObject(){
        return this.extraParamObject;
    }

    @action
    setVisibility(visibility) {
        this.visibility = visibility;
    }

    @action
    setCustomViewParam(object) {
        this.extraParamObject = object;
    }

}

@observer
class AlertDialog extends React.Component {

    constructor(props) {
        super(props);
        this.dialog = new DialogStore();
        this.onSubmitClick = props.onSubmitClick;
    }

    /** object 是可以帶到customView裡面的變數 */
    open = (paramObject = {}) => {
        if(!_.isObject(paramObject)) {
            Util.appendError(`9831, paramObject should be object, not ${paramObject}`)
            return
        }
        if (paramObject !== undefined) {
            this.getStore().setCustomViewParam(paramObject);
        }
        this.getStore().setVisibility(true);

    }


    close = () => {
        this.getStore().setVisibility(false);
    }

    onSubmitClicked = () => {
        const submitTask = this.props.submitTask;
        const paramObject = this.props.paramObject;
        this.close();
        submitTask();
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

    renderContent() {
        const self = this;
        const content = this.props.content;
        if (_.isString(content) && !_.isEmpty(content)) {
            return <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
            </DialogContent>
        }
        const CustomView = this.props.customView;
        const paramObject = this.props.paramObject;
        const component = this.props.component;

        return <DialogContent
            className={'BaseAlertDialogContent'}>
            <CustomView
                component={component}
                paramObject={paramObject}
                dialog={this}
                {...this.getStore().getExtraParamObject()} />
        </DialogContent>
        return null;
    }

    hasCustomView() {
        return this.props.customView;
    }

    renderActionButton() {
        const self = this;
        const needActionButtons = this.props.needActionButtons;

        if (!needActionButtons) return null;

        return <DialogActions>
            <Button onClick={self.close} color="primary">
                取消
            </Button>
            <Button onClick={self.onSubmitClicked} color="primary" autoFocus>
                確認
            </Button>
        </DialogActions>
    }

}

export default AlertDialog;
