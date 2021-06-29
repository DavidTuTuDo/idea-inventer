import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import Store from "./BaseStore";
import {DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle, Button} from '@material-ui/core';
import AlertDialog from './AlertDialog';

class BaseComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    renderLoadingView() {
        return <div>正在收集資料當中...</div>
    }

    renderErrorView(message) {
        return <div>出事了!阿伯...請聯絡管理員ＱＱ ${message}</div>
    }

    gotoPage(path) {
        const {history} = this.props;
        history.push(path);
    }

    getStore() {
        return new Store();
    }

    render() {
        switch (this.getStore().state) {
            case "loading":
                return this.renderLoadingView();
            case "stable":
                return this.renderView();
            case "error":
                return this.renderErrorView(this.getStore().getErrorMsg());
            default:
                return this.renderView();
        }
    }

    componentWillUnmount() {
        this.getStore().clear();
    }


    renderAlertDialog(ref, title, content, task) {
        return (<AlertDialog
            title={title}
            content={content}
            submitTask={task}
            ref={ref}/>)
    }


}

export default BaseComponent;

