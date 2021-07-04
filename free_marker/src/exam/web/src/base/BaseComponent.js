import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import Store from "./BaseStore";
import AlertDialog from './AlertDialog';
import {Typography, LinearProgress, Button, Paper} from "@material-ui/core";
import Application from '../index.js';

class BaseComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    renderView() {
        return <div/>
    }

    renderLoadingView() {
        return <LinearProgress/>
    }

    isNavigationView() {
        return false;
    }

    renderViewByStatus() {
        switch (this.getStore().state) {
            case "loading":
                return this.renderLoadingView();
            case "stable":
                return this.renderView();
            case "error":
                return this.renderErrorView();
            default:
                return this.renderView();
        }
    }

    renderErrorView() {
        const errorMsg = this.getStore().getErrorMsg();
        return (
            <Paper
                className={'BaseComponentErrorViewPaper'}>

                <Typography
                    className={'BaseComponentErrorViewTitleTypography'}>
                    發生錯誤
                </Typography>

                <Typography
                    className={'BaseComponentErrorViewContentTypography'}
                >{errorMsg}
                </Typography>

                <Button
                    variant={'outlined'}
                    color={'primary'}
                    className={'BaseComponentErrorViewRetryButton'}>重試</Button>
            </Paper>
        )
    }

    gotoPage(path) {
        const {history} = this.props;
        history.push(path);
    }

    getStore() {
        return new Store();
    }

    render() {
        return <div className={'RootViewDiv'}>
            {this.renderViewByStatus()}
        </div>
    }

    componentWillUnmount() {
        this.getStore().clear();
    }

    getApplication() {
        return Application;
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

