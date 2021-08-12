import React from "react";
import PropTypes from 'prop-types';
import {Dialog, DialogActions, Button, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {action, makeObservable, observable} from "mobx";
import {observer, inject} from "mobx-react";


class DialogStore {

    @observable
    visibility=false;

    constructor() {
        makeObservable(this);
    }

    getVisibility() {
        return this.visibility;
    }

    @action
    setVisibility(visibility) {
        this.visibility = visibility;
    }

}

@observer
class AlertDialog extends React.Component {

    constructor(props) {
        super(props);
        this.dialog = new DialogStore();
        this.onSubmitClick = props.onSubmitClick;
    }

    open= () => {
        this.getStore().setVisibility(true);
    }


    close = () => {
        this.getStore().setVisibility(false);
    }

    onSubmitClicked =() =>{
        const submitTask = this.props.submitTask;
        this.close();
        submitTask();
    }

    getStore() {
        return this.dialog;
    }

    render() {
        const self = this;
        const title = this.props.title;
        const content = this.props.content;

        return (
            <Dialog
                open={self.getStore().getVisibility()}
                onClose={self.close}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={self.close} color="primary">
                        取消
                    </Button>
                    <Button onClick={self.onSubmitClicked} color="primary" autoFocus>
                        確認
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

}

export default AlertDialog;
