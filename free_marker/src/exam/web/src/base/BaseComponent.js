import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import Store from "./BaseStore";
import AlertDialog from './AlertDialog';
import {Typography, LinearProgress, CircularProgress, Button, Paper} from "@material-ui/core";
import {Application} from '../index.js';

class BaseComponent extends React.Component {

    constructor(props) {
        super(props);
        this.listOfFunctionOfUnsubscribe = [];
    }

    componentDidMount() {

    }

    /** 每個Component 自己要實作 */
    renderView() {
        return <div/>
    }

    renderLoadingView() {
        if (this.getStore().state === 'loading') {
            return (
                <div className={'ErrorViewDiv'}>
                    <LinearProgress/>
                </div>
            )
        }
    }

    setLoadingViewVisibility(show = true) {
        this.getStore().setState(show ? 'loading' : 'stable');
    }

    isNavigationView() {
        return false;
    }

    renderViewByStatus() {
        switch (this.getStore().state) {
            case "stable":
                return this.renderView();
            case "error":
                return this.renderErrorView();
            default:
                return this.renderView();
        }
    }

    onRetryClicked(viewParam) {
        this.componentDidMount();
    }

    renderErrorView = () => {
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
                    onClick={(viewParam) => this.onRetryClicked(viewParam)}
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
        return (
            <div className={'RootViewDiv'}>

                {this.renderGlobalLoadingView()}

                <div className={'ComponentViewDiv'}>
                    {this.renderViewByStatus()}
                </div>

                {this.renderLoadingView()}

            </div>)
    }

    componentWillUnmount() {
        this.getStore().clear();

        /** 執行unsubscribe */
        while (this.listOfFunctionOfUnsubscribe.length > 0) {
            const unSub = this.listOfFunctionOfUnsubscribe.shift();
            unSub();
        }
    }


    renderGlobalLoadingView() {
        if (this.isNavigator()) {
            return undefined;
        }

        if (this.getStore().getGlobalLoadingState()) {
            return (
                <div className={'BaseComponentGlobalLoadingRootDiv'}>
                    <div className={'BaseComponentGlobalLoadingDiv'}>
                        <CircularProgress/>

                        <Typography
                            className={'BaseComponentGlobalLoadingTypography'}>{this.getStore().getGlobalLoadingTip()}</Typography>
                    </div>
                </div>);
        }

        return undefined;
    }


    getApplication() {
        return Application;
    }

    isNavigator() {
        return false;
    }

    setGlobalLoadingViewVisibility(visibility = true, loadingStringTip = '正在載入中') {
        this.getStore().setGlobalLoading(visibility, loadingStringTip);
    }


    renderAlertDialog(ref, title, content, task) {
        return (<AlertDialog
            title={title}
            content={content}
            submitTask={task}
            ref={ref}/>)
    }


    /** 如果頁面有聽callback, 統一用這個method */
    subscribe(subscribeFunction) {
        this.listOfFunctionOfUnsubscribe.push(subscribeFunction);
    }


}

export default BaseComponent;

