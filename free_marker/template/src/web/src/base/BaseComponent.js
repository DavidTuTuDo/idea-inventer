import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import Store from "./BaseStore";
import {
    Typography,
    LinearProgress,
    CircularProgress,
    Button,
    Paper,
    useScrollTrigger,
    Slide,
    Backdrop,
    Card,
    Snackbar,
    IconButton,
    List,
} from "@material-ui/core";
import MuiAlert from '@material-ui/core/Alert';
import {Application} from '../';
import Config from '../config';
import {observer} from "mobx-react";
import Countdown from "react-countdown";
import Router from "../router";
import {isMobile} from 'react-device-detect'
import ImageDialogView from './ImageDialogView';
import UserInfo from '../base/BaseUserInfo';
import EventBus from "./CommonEventBus";
import "../less";
import MuiComponent from './MUIComponent';
import ArrowBackIosRounded from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRounded from "@material-ui/icons/ArrowForwardIosRounded";
import AlertDialog from "./AlertDialog";
import AlertMenu from "./AlertMenu";

class BaseComponent extends MuiComponent {
    listOfFunctionOfUnsubscribe = [];
    style = {};
    componentStyle = {}
    jobsOfScrollToBottom = [];
    jobExecutorLock = false;
    loginDialogRef = React.createRef();

    /** true就表示 Asynctask正在執行中，不能再被觸發, false表示可以 */

    constructor(props) {
        super(props);
    }

    isDisposableComponent() {
        return false;
    }

    /** dialog不會透過Router,得在constructor裏面clean() */
    cleanDisposableDialogComponent() {
        if ((this.isDialogComponent() || this.isComponentView()) && this.isDisposableComponent()) {
            this.getStore().clean();

        }
    }

    isParamFromPathValid(param) {
        return !Util.isUndefinedNullEmpty(param);
    }

    isDetailPage() {
        return false;
    }

    arrowOfBackward() {
        return (<div
            className={"SlideIndicatorArrowDiv"}>
            <ArrowBackIosRounded/>
        </div>)
    }

    arrowOfForward() {
        return (<div
            className={"SlideIndicatorArrowDiv"}>
            <ArrowForwardIosRounded/>
        </div>)
    }

    isMobileDevice() {
        return isMobile;
    }

    getComponentName() {
        return `BaseComponent`;
    }

    appendScrollToBottomJob(...asyncTask) {
        this.jobsOfScrollToBottom.push(...asyncTask);
    }

    setScrollToBottomJobs(...asyncTask) {
        this.jobsOfScrollToBottom.length = 0;
        this.jobsOfScrollToBottom.push(...asyncTask)
    }

    clearScrollToBottomJobs() {
        this.jobsOfScrollToBottom.length = 0;
    }

    componentWillUnmount() {
        /** 執行unsubscribe */

        /** unmount 應該要把當前的toast 關掉, 才不會遺留錯誤資訊到下一個頁面 */
        this.setSnackViewVisibility(false);

        while (this.listOfFunctionOfUnsubscribe.length > 0) {
            const unSub = this.listOfFunctionOfUnsubscribe.shift();
            unSub();
        }
        if (this.isNotNavigatorNComponentView()) {
            window.removeEventListener('scroll', this.onScrollToBottomListener, true)
        }
    }

    /** 意指面畫面還沒產出捲軸效果，可以補花(例如item合計有30個，但fetch一次只拿5個，而產生捲軸效果的threshold是10個，那畫面就會再繼續自動fetch，直到產生捲軸效果)*/
    canVerticalScrollable() {
        return document.body.scrollHeight > window.innerHeight;
    }

    /**
     *
     * @param urlsOfLinePay : {app:'',web:''}
     */
    routeToLinePayCheckoutPage(stringOfRaw) {
        const urlsOfLinePay = JSON.parse(stringOfRaw);

        if (Util.isUndefinedNullEmpty(urlsOfLinePay)) {
            throw new ERROR(999, `446846132 urlsOfLinePay格式不正確`)
        }

        if (isMobile) {
            this.gotoExternalUrlDirectly(urlsOfLinePay.app);
        } else {
            this.gotoExternalUrlDirectly(urlsOfLinePay.web);
        }
    }

    componentDidMount() {
        if (!this.isDialogComponent() && !this.isComponentView()) {
            Router.setCurrentComponent(this);
            Application.setLatestComponent(this);
        }
        this.cleanDisposableDialogComponent();
        this.viewInitial();
        if (this.isNotNavigatorNComponentView()) {
            window.removeEventListener('scroll', this.onScrollToBottomListener, true)
            window.addEventListener('scroll', this.onScrollToBottomListener, true);
        }
    }

    /**
     * 把component放在alertView裏面使用
     * 放在alert view 裏面使用 */
    isDialogComponent() {
        return this.props.dialog !== undefined;
    }

    /**
     如果Component被當作View使用..............
     <ExamQuestionView
     freeze={true}
     isComponentView={true}
     question={whoknowz.question}/>
     * */
    isComponentView = () => {
        return _.isEqual(this.props.isComponentView, true);
    }

    isNotNavigatorNComponentView() {
        return (!this.isNavigator() && !this.isComponentView());
    }

    viewInitial() {
        this.fileChooserInputRef = React.createRef();
        if ((!this.isNavigator()) && Config.isScrollingHide) {
            /** 這邊應該要監聽navigator發送的事件, 然後更改ViewHeight*/
            if (!this.isComponentView())
                this.getStore().setAppBarHeight(isMobile ? 60 : 60);
        }
        this.imageDialogRef = React.createRef();
    }

    reloadPage = () => {
        window.location.reload();
    }

    centerInParent(direction) {
        return {
            flexDirection: direction,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }

    registerScrollToBottomJob = (...functionOfAsyncTasks) => {
        for (const func of functionOfAsyncTasks) {
            if (typeof func !== 'function') {
                throw new ERROR(4002, `registerScrollToBottomJob `);
            }
        }
        this.jobsOfScrollToBottom.push(...functionOfAsyncTasks);
    }

    getThresholdOfScrollToBottom() {
        return 5;
    }

    disappearKeyboard() {
        document.activeElement.blur();
    }

    isValidOfScrollToBottom = () => {
        let documentHeight = document.body.scrollHeight;
        let currentScroll = window.scrollY + window.innerHeight;
        let isScrollDown = window.scrollY > 0;
        /** 應該要記錄scrollY, 然後判斷偏移量 */
        let modifier = 1;
        let isScrollToEnd = currentScroll + modifier > documentHeight
        return isScrollDown && isScrollToEnd;
    }

    onScrollToBottomListener = (event) => {
        const self = this;

        /** modifier 距離底部的threshold */
        if (this.isValidOfScrollToBottom()) {
            /** Scroll達底部了 */
            // console.log(`window.scrollY:${window.scrollY}, currentScroll:${currentScroll}, documentHeight:${documentHeight}`);
            if (!this.getStore().isInitialFetchCompleted()) {
                Util.appendInfo(`初始任務尚未完成，不能執行後續工作。`);
                return;
            }

            if (this.getStore().isErrorState()) {
                Util.appendInfo(`發生異常錯誤，不能執行後續工作。`);
                return;
            }

            if (!self.jobExecutorLock) {
                if (!this.hasScrollToBottomTask()) {
                    Util.appendInfo(`當前沒有觸底任務。`);
                    return;
                }

                if (!this.getStore().hasNextPage()) {
                    Util.appendInfo(`已沒有下一頁的資料。`);
                    return;
                }

                this.jobExecutor().then();
            } else {
                Util.appendInfo(`當前任務還沒執行完畢, 忽略此次呼叫。`);
            }
        }
    }

    hasScrollToBottomTask() {
        return this.jobsOfScrollToBottom.length > 0;
    }

    jobExecutor = async () => {
        const self = this;
        if (self.jobExecutorLock) {
            Util.appendError(`894165 self.jobExecutorLock是true,不能跑進來才對...`);
            return;
        }

        Util.appendInfo(`觸底任務執行中`);
        try {
            self.jobExecutorLock = true;
            for (const job of this.jobsOfScrollToBottom)
                await job(self);
            /**self 就是 component本身,因為client第一個參數都是view, 方便呼叫loading */
        } catch (error) {
            Util.appendError(`8841 jobExecutor() 掉進 catch裡面`, error)
            self.getStore().setHasPageItems(false);
        } finally {
            self.jobExecutorLock = false
            await this.invalidateNextPageBehavior();
        }
    }

    /** 要是沒有產生出捲軸效果(), 但是有next page設計的話, canVerticalScrollable() 一定要實作hasNextPage的邏輯 */
    invalidateNextPageBehavior = async () => {
        await Util.syncDelay(50);
        if (
            !this.getStore().isErrorState() &&
            this.getStore().hasNextPage() &&
            this.hasScrollToBottomTask() &&
            !this.canVerticalScrollable()
        ) {
            Util.appendInfo(`補花功能啟動`)
            await Util.syncDelay(50);
            await this.jobExecutor()
        }
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

    async executeAsyncTaskWithLoading(task) {
        try {
            this.setLoadingViewVisibility()
            await task();
        } finally {
            this.setLoadingViewVisibility(false)
        }
    }

    isNavigationView() {
        return false;
    }

    getCurrentWebSiteLink = () => {
        return window.location.href;
    }

    gotoUrlWithNewTab = (url) => {
        const task = async () => this.gotoUrlWithNewTabDirectly(url);
        this.enableExternalLinkDialog(url, task);
    }

    gotoExternalUrl = (url = '') => {
        const task = async () => this.gotoExternalUrlDirectly(url);
        this.enableExternalLinkDialog(url, task);
    }

    enableExternalLinkDialog = (url, task) => {
        this.getStore().setGlobalDialogContent({
            title: "是否開啟新頁面",
            content: `即將前往外部網站\n\n${url}`,
            task: task,
        });
        this.getLoginDialogRef().open();
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
        Router.routeToHomePage(this);
    }

    renderErrorView = () => {
        const errorMsg = this.getStore().getErrorMsg();
        return (
            <Paper
                className={'BaseComponentErrorViewPaper'}>

                <Typography
                    className={'BaseComponentErrorViewTitleTypography'}>
                    發生技術問題
                </Typography>

                <Typography
                    className={'BaseComponentErrorViewContentTypography'}
                >{errorMsg}
                </Typography>

                <Button
                    variant={'outlined'}
                    color={'primary'}
                    onClick={(viewParam) => this.onRetryClicked(viewParam)}
                    className={'BaseComponentErrorViewRetryButton'}>返回首頁</Button>
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

                {self.renderImageDialog()}

                {self.renderSnackView()}

                {self.renderGlobalDialogView()}

            </div>)
    }

    shouldDisplayLoadingArea(items = []) {
        return !this.getStore().isInitialFetchCompleted() && _.size(items) < 1
    }

    renderListEmptyView = (items = [], hasPath) => {
        const ListEmptyView = this.ListEmptyView;
        return (<ListEmptyView
            size={_.size(items)}
            isGlobalLoading={this.getStore().isGlobalLoading()}
            component={this}
            hasPath={hasPath}/>)
    }

    ListEmptyView = observer(({hasPath, component, isGlobalLoading, size}) => {
        if (isGlobalLoading || size > 0) {
            return null
        }

        function renderRetryButton() {
            if (hasPath) {
                return <Button
                    onClick={
                        async () => {
                            if (component instanceof BaseComponent) {
                                const store = component.getStore();
                                await store.fetch(component);
                            }
                        }
                    }
                    variant={'outlined'}
                    className={`BaseListEmptyRetryButton`}>重試</Button>
            }
            return null;
        }

        return (
            <div className={`BaseListEmptyDiv`}>
                <Typography
                    className={`BaseListEmptyTypography`}>非常抱歉!目前沒有資料</Typography>
                {renderRetryButton()}
            </div>
        )
    })

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
                array.push({
                    name: file.name,
                    index: index,
                    blob: file,
                    url: URL.createObjectURL(file)
                })
        }
        if (_.size(array) > 0)
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

    enableVoiceSelectView(multiple = false) {
        const accepts = `audio/*`;
        this.enableFileSelectView(accepts, multiple)
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


    renderImageDialog = () => {
        const self = this;
        const params = this.getStore().getImageDialogParam();
        return this.renderAlertDialog({
                ref: this.imageDialogRef,
                paramObject: params,
                customView: ImageDialogView,
                needActionButtons: false,
                component: self
            }
        )
    }

    openImageDialog(imgUrl) {
        this.imageDialogRef.current.open({href: imgUrl});
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
            duration: 5000,
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
                onClose={onSnackViewCloseClicked}>
                <div>
                    <Alert
                        className={'BaseSnackAlert'}
                        onClose={onSnackViewCloseClicked} severity={self.snackMessageType}>
                        {self.snackMessage}
                    </Alert>
                    {renderSnackExtraFunctionView()}
                </div>
            </Snackbar>
        );
    }

    showWarningSnackMessage(message) {
        this.setSnackViewVisibility(true, message, {type: `warning`})
    }

    showInfoSnackMessage(message) {
        this.setSnackViewVisibility(true, message, {type: `info`})
    }

    showErrorSnackMessage(message) {
        this.setSnackViewVisibility(true, message, {type: `error`})
    }

    /**
     * extra.type: |'error','success','info','warning' |
     * extra.func.tack 只能放 async task */
    setSnackViewVisibility(visible, message, extra = this.defaultSnackExtra()) {
        const self = this.getComponentInstance();

        if (visible && self.getStore().getSnackVisibility()) {
            self.getStore().setSnackVisibility(false);
            Util.syncDelay(1).then(() => {
                /** 為了等待響應mobx的行為 ,syncDelay會把行為放在下一個stack */
                sync().then();
            })
        } else {
            sync().then()
        }

        async function sync() {
            extra = Util.mergeObject(self.defaultSnackExtra(), extra);
            self.durationOfSnackVisible = extra.duration;
            self.snackExtraTaskFunction = extra.func;
            self.snackMessage = message;
            self.snackMessageType = extra.type;
            await Util.syncDelay(1);
            /** 因為snackMessage set之後會響應mobx的行為,syncDelay會把setVisible放在下一個stack */
            self.getStore().setSnackVisibility(visible);
        }
    }

    /** ↑↑↑===== SnackView 用到的field,遲早要搬運成獨立的 class =====↑↑↑ */

    CountdownView = observer(({date, title}) => {
        const TimeDisplayView = ({days, hours, minutes, seconds, completed}) => {
            const UnitView = (({count, unit}) => {
                return (
                    <Card
                        className={"BaseCountdownCountCard"}>
                        <Typography className={"BaseCountdownCountTypography"}>
                            {count}</Typography>
                        <Typography className={"BaseCountdownUnitTypography"}>
                            {unit}</Typography>
                    </Card>
                )
            });

            if (completed) {
                /** Render a completed state */
                return null;
            } else {
                const times = [{unit: '天', count: days},
                    {unit: '小時', count: hours},
                    {unit: '分鐘', count: minutes},
                    {unit: '秒', count: seconds}]
                return (
                    <div
                        className={"BaseCountdownCountDiv"}>
                        <Typography
                            className={"BaseCountdownTitleTypography"}>
                            {title}</Typography>
                        <div/>
                        <div
                            className={"ListBaseCountdownCountDiv"}>
                            {times.map((each) =>
                                <UnitView
                                    key={each.unit}
                                    count={each.count}
                                    unit={each.unit}/>)}
                        </div>
                    </div>)
            }
        };

        return <Countdown
            renderer={TimeDisplayView}
            date={Util.getCurrentTimeStamp() + Util.getDurationOfMillionSec(date)}/>
    })

    /** 通常呼叫這個method, 是要呼叫loading狀態, 例如dialog要拿到自己的component instance, 要forceSelf = true */
    getComponentInstance = (forceSelf = false) => {
        if (forceSelf)
            return this;

        if (this.isDialogComponent() || this.isComponentView()) {
            return this.props.component;
        } else {
            return this;
        }
    }

    dismiss() {
        if (this.isDialogComponent()) {
            this.props.dialog.close();
        }
    }

    /** path:'https://' or route:'pageName:...params'*/
    handleCustomRouter = (routeString = '') => {
        const words = routeString.split(':')
        const type = words.shift();
        switch (type) {
            case 'path':
                const path = words.join(':');
                this.gotoExternalUrl(path);
                break;
            case 'route':
                const page = words.shift();
                const functionName = `goto${_.upperFirst(page)}Page`;
                const functionOfGotoPage = Router[functionName];
                if (_.isFunction(functionOfGotoPage)) {
                    functionOfGotoPage(this.getComponentInstance(), ...words);
                } else {
                    this.setSnackViewVisibility(true, `4097 can't handle ${page}`, {type: 'error'})
                }
                break;
            default:
                if (_.isEmpty(routeString)) {
                    /** doing nothing */
                } else {
                    this.setSnackViewVisibility(true, `can't handle ${routeString}`, {type: 'error'})
                }
                break;
        }
    }

    async handleRestFulResult(restfulResult, succeedBehavior) {
        if (restfulResult === undefined) return;
        if (restfulResult.status === 'succeed') {
            await succeedBehavior(restfulResult.data);
        } else if (restfulResult.status === 'fail') {
            this.setSnackViewVisibility(true, restfulResult.message, {type: 'warning'})
        } else {
            throw new ERROR(7007, `status ===> ${restfulResult.status}`)
        }
    }

    copyCurrentLinkToClipboard(message = `已複製當前的連結`) {
        navigator.clipboard.writeText(this.getCurrentWebSiteLink())
        this.getComponentInstance().showInfoSnackMessage(message);
    }

    copyTextToClipboard(text, message = `已將內容新增至剪貼簿`) {
        navigator.clipboard.writeText(text);
        this.getComponentInstance().showInfoSnackMessage(message);
    }

    copyToClipboard(textToCopy) {
        // navigator clipboard api needs a secure context (https)
        if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard api method'
            return new Promise((res, rej) => {
                // here the magic happens
                navigator.clipboard.writeText(textToCopy);
            });
        } else {
            // text area method
            let textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            // make the textarea out of viewport
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((res, rej) => {
                // here the magic happens
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        }
    }

    renderGlobalDialogView = () => {
        const self = this;
        const dialog = self.getStore().getGlobalDialogContent();
        return this.renderAlertDialog({
            ref: self.loginDialogRef,
            title: dialog.title,
            content: dialog.content,
            component: this,
            needActionButtons: true,
            task: dialog.task,
        })
    }

    getLoginDialogRef = () => {
        return this.loginDialogRef.current;
    }

    enableLoginConfirmDialog = () => {
        const self = this;
        this.getStore().setGlobalDialogContent({
            title: "此功能必須登入",
            content: "此功能必須登入,點擊確認後將喚起登入頁面",
            task: async () => await self.invokeLoginBehavior()
        })
        Util.performActionWithoutTimingIssue(() => self.getLoginDialogRef().open());
    }

    enableAlertDialog = (title = '標題', content = '內容', task = async () => true) => {
        const self = this;
        this.getStore().setGlobalDialogContent({
            title,
            content,
            task
        })
        Util.performActionWithoutTimingIssue(() => self.getLoginDialogRef().open());
    }

    async invokeLoginBehavior() {
        await Util.syncDelay(10);
        if (!UserInfo.isLoginWithSucceed())
            Application.getNavigatorRef().onNavigatorToolBarLoginButtonClicked()
    }

    openLineChatAccountWithMessage(id = '', message = '') {
        if (!isMobile) {
            this.showInfoSnackMessage(`抱歉,此功能僅提供在移動設備上(手機,平板)`);
            return;
        }

        this.gotoUrlWithNewTabDirectly(`https://line.me/R/oaMessage/${id}/?${message}`)
    }

    getKeywords() {
        return Application.getNavigatorStore().getKeywords();
    }

    constraintOfParam(param, ...allows) {
        let isValid = true;

        if (Util.isUndefinedNullEmpty(param))
            isValid = false;

        if (Util.isOrEquals(param, ...allows))
            isValid = true;

        return isValid;
    }

    renderAlertDialog({ref, title, content, task, customView, paramObject, needActionButtons, component}) {
        return (<AlertDialog
            title={title}
            content={content}
            submitAsyncTask={task}
            needActionButtons={needActionButtons}
            customView={customView}
            paramObject={paramObject}
            component={component}
            ref={ref}/>)
    }

    isWrapByDialog() {
        const dialog = this.props.dialog;
        return dialog instanceof AlertDialog;
    }

    renderAlertMenu({ref, items, component}) {
        return (
            <AlertMenu
                component={component}
                items={items}
                ref={ref}
            />
        )
    }

}

export default BaseComponent;

