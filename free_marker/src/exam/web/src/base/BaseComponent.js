import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import Store from "./BaseStore";
import AlertDialog from './AlertDialog';
import {
    Typography,
    LinearProgress,
    CircularProgress,
    Button,
    Paper,
    useScrollTrigger,
    Slide,
    Backdrop,
    Snackbar,
    IconButton,
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import MuiAlert from '@material-ui/lab/Alert';
import {Application} from '../index.js';
import Config from '../config';


class BaseComponent extends React.Component {
    listOfFunctionOfUnsubscribe = [];
    style = {};
    componentStyle = {}

    constructor(props) {
        super(props);
        this.fileChooserInputRef = React.createRef();
        if (!this.isNavigationView() && Config.isScrollingHide) {
            /** 這邊應該要監聽navigator發送的事件, 然後更改ViewHeight*/
            this.getStore().setAppBarHeight(64);
        }
    }

    componentDidMount() {
    }

    getEmptyStore() {
        return new Store();
    }

    /** 每個Component 自己要實作 */
    renderView() {
        return <div/>
    }

    renderLoadingView() {
        if (this.getStore().state === 'loading') {
            return (
                <div className={'BaseLoadingViewDiv'}>
                    <LinearProgress
                        className={`BaseLoadingLinearProgress`}/>
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
        return this.getEmptyStore();
    }

    appendStyle(style) {
        this.style = {...this.style, ...style};
    }

    appendComponentStyle(style) {
        this.componentStyle = {...this.componentStyle, ...style};
    }

    render() {
        const self = this;
        return (
            <div className={'RootViewDiv'}
                 style={{...this.style, marginTop: self.getStore().getAppBarHeight()}}>

                {self.renderGlobalLoadingView()}

                <div className={'ComponentViewDiv'}
                     style={{...this.componentStyle}}>
                    {self.renderViewByStatus()}
                </div>

                {self.renderLoadingView()}

                {self.renderSelectorView()}

                {self.renderSnackView()}

            </div>)
    }

    renderSelectorView = () => {
        const self = this;
        const params = this.getStore().getSelectorParam();
        return <input
            multiple={params.multiple}
            type={params.type}
            accept={params.accept}
            ref={self.fileChooserInputRef}
            style={{display: 'none'}}
            onChange={this.onFilesSelectedEventReceived.bind(self)}/>

    }

    onFilesSelectedEventReceived = (event) => {
        const self = this;
        event.stopPropagation();
        event.preventDefault()
        const files = event.target.files;
        const array = [];
        for (const index in files) {
            const file = files[index];
            if (file instanceof File)
                /** 因為files 是 fileList 物件, 是一個object object object,可能遇到不是file的值*/
                array.push({index: index, blob: file, url: URL.createObjectURL(file)})
        }
        this.onFilesSelected(array);
    }

    /** 給子類別繼承用的 */
    onFilesSelected(files) {
        Util.appendError(`onFileSelected() is not implemented()`)
    }

    enableFileSelectView = (accept = 'file', multiple = 'false', type = 'file') => {
        this.getStore().setSelectorParam({accept, multiple, type});
        Util.syncDelay('10').then(() => this.fileChooserInputRef.current.click())
    }

    enableImageSelectView(multiple = false) {
        const accepts = `image/*`;
        this.enableFileSelectView(accepts, multiple)
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

        return (
            <Backdrop
                open={this.getStore().getGlobalLoadingState()}
                className={'BaseComponentGlobalLoadingRootBackdrop'}>
                <div className={'BaseComponentGlobalLoadingDiv'}>
                    <CircularProgress/>

                    <Typography
                        className={'BaseComponentGlobalLoadingTypography'}>{this.getStore().getGlobalLoadingTip()}</Typography>
                </div>
            </Backdrop>);
    }

    HideOnScroll(props) {
        const {children, window} = props;
        // Note that you normally won't need to set the window ref as useScrollTrigger
        // will default to window.
        // This is only being set here because the demo is in an iframe.
        const trigger = useScrollTrigger({target: window ? window() : undefined});

        return (
            <Slide appear={false} direction="down" in={!trigger}>
                {children}
            </Slide>
        );
    }


    getApplication() {
        return Application;
    }

    isNavigator() {
        return false;
    }

    setGlobalLoadingViewVisibility(visibility = true, loadingStringTip = '正在載入中') {
        this.getStore().setGlobalLoading(visibility, visibility ? loadingStringTip : ``);
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

    /** ↓↓↓===== SnackView 用到的field,遲早要搬運成獨立的 class =====↓↓↓ */
    durationOfSnackVisible = 3000;
    snackExtraTaskFunction = undefined;
    snackMessageType = 'info';
    snackMessage = 'default message';

    defaultSnackExtra() {
        return {
            type: `info`, /** error,warning,success, info */
            duration: 3000,
            func: {
                name: 'default',
                task: async () => {
                    await Util.syncDelay();
                    Util.appendInfo('default snack task message!')
                }
            }
        }
    }

    renderSnackView() {
        const self = this;


        function Alert(props) {
            return <MuiAlert elevation={6} variant="filled" {...props} />;
        }

        function hasSnackExtraFunction() {
            return self.snackExtraTaskFunction && self.snackExtraTaskFunction.name !== 'default'
        }

        function onSnackViewCloseClicked() {
            self.getStore().setSnackVisibility(false);
            self.snackExtraTaskFunction = self.defaultSnackExtra();
        }

        function renderSnackExtraFunctionView() {
            if (hasSnackExtraFunction()) {
                return (<Button
                    className={'BaseSnackFuncButton'}
                    color="secondary"
                    size="large"
                    onClick={() => {
                        self.snackExtraTaskFunction.task().then();
                        onSnackViewCloseClicked();
                    }}>
                    {self.snackExtraTaskFunction.name}
                </Button>)
            }
            return
        }

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.getStore().getSnackVisibility()}
                autoHideDuration={self.durationOfSnackVisible}
                onClose={onSnackViewCloseClicked} >
                <React.Fragment>
                    <Alert
                        className={'BaseSnackAlert'}
                        onClose={onSnackViewCloseClicked} severity={self.snackMessageType}>
                        {self.snackMessage}
                    </Alert>
                    {renderSnackExtraFunctionView()}
                </React.Fragment>
            </Snackbar>
        );
    }

    /**
     * extra.type: |'error','success','info','warning' |
     * extra.func.tack 只能放 async task */
    setSnackViewVisibility(visible, message, extra = this.defaultSnackExtra()) {
        const self = this;

        if(visible && this.getStore().getSnackVisibility()){
            self.getStore().setSnackVisibility(false);
            Util.syncDelay(10).then(() => {
                sync();
            })
        } else {
            sync()
        }

        function sync() {
            extra = Util.mergeObject(self.defaultSnackExtra(), extra);
            self.durationOfSnackVisible = extra.duration;
            self.snackExtraTaskFunction = extra.func;
            self.snackMessage = message;
            self.snackMessageType = extra.type;
            self.getStore().setSnackVisibility(visible);
        }


    }

    /** ↑↑↑===== SnackView 用到的field,遲早要搬運成獨立的 class =====↑↑↑ */


}

export default BaseComponent;

