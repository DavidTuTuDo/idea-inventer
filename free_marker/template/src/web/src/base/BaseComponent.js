const edit = true;

import _ from "lodash";
import React from "react";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Backdrop from "@mui/material/Backdrop";
import Card from "@mui/material/Card";
import Snackbar from "@mui/material/Snackbar";
import Chip from "@mui/material/Chip";
import MuiAlert from "@mui/material/Alert";
import Config from "../config";
import { observer } from "mobx-react";
import Countdown from "react-countdown";
import Router from "../router";
import { isMobile } from "react-device-detect";
import ImageDialogView from "./ImageDialogView";
import UserInfo from "../base/BaseUserInfo";
import EventBus from "./CommonEventBus";
import MuiComponent from "./MUIComponent";
import ArrowBackIosRounded from "@mui/icons-material/ArrowBackIosRounded";
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import AlertDialog from "./AlertDialog";
import AlertMenu from "./AlertMenu";
import copy from "copy-to-clipboard";
import functions from "../functions";
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";

class BaseComponent extends MuiComponent {
    listOfFunctionOfUnsubscribe = [];
    style = {};
    componentStyle = {};
    jobsOfScrollToBottom = [];
    jobExecutorLock = false;
    loginDialogRef = React.createRef();
    propsOfMobX;

    /** true就表示 Asynctask正在執行中，不能再被觸發, false表示可以 */

    constructor(props) {
        super(props);
        this.propsOfMobX = props;
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
        return (
            <div className={"SlideIndicatorArrowDiv"}>
                <ArrowBackIosRounded />
            </div>
        );
    }

    arrowOfForward() {
        return (
            <div className={"SlideIndicatorArrowDiv"}>
                <ArrowForwardIosRounded />
            </div>
        );
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
        this.jobsOfScrollToBottom.push(...asyncTask);
    }

    clearScrollToBottomJobs() {
        this.jobsOfScrollToBottom.length = 0;
    }

    toPreciseNumber = (input, regEx) => {
        // 核心邏輯 B：處理負號：確保負號 (-) 只在開頭，並只出現一次
        let numericValue = input.replace(regEx, "");
        const negativeMatch = numericValue.match(/-/g);
        if (negativeMatch && negativeMatch.length > 1) {
            // 如果有多個負號，只保留第一個（開頭的）
            numericValue = numericValue.substring(0, numericValue.indexOf("-") + 1) + numericValue.substring(numericValue.indexOf("-") + 1).replace(/-/g, "");
        } else if (negativeMatch && numericValue.indexOf("-") > 0) {
            // 如果負號不在開頭，將其移除
            numericValue = numericValue.replace(/-/g, "");
        }

        // 核心邏輯 C：處理小數點：確保小數點 (.) 只出現一次
        const decimalMatch = numericValue.match(/\./g);
        if (decimalMatch && decimalMatch.length > 1) {
            // 如果有多個小數點，只保留第一個
            numericValue = numericValue.substring(0, numericValue.indexOf(".") + 1) + numericValue.substring(numericValue.indexOf(".") + 1).replace(/\./g, "");
        }
        return _.toNumber(numericValue) ?? "";
    };

    componentWillUnmount() {
        /** 執行unsubscribe */

        /** unmount 應該要把當前的toast 關掉, 才不會遺留錯誤資訊到下一個頁面 */
        this.setSnackViewVisibility(false);

        while (this.listOfFunctionOfUnsubscribe.length > 0) {
            const unSub = this.listOfFunctionOfUnsubscribe.shift();
            unSub();
        }
        if (this.isNotNavigatorNComponentNCprtView()) {
            window.removeEventListener("scroll", this.onScrollToBottomListener, true);
        }

        this.getStore()?.onComponentUnmount();

        Util.appendInfo(`❌ ${this.getComponentName()} goto componentWillUnmount()`);
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
            throw new ERROR(999, `446846132 urlsOfLinePay格式不正確`);
        }

        if (isMobile) {
            this.gotoExternalUrlDirectly(urlsOfLinePay.app);
        } else {
            this.gotoExternalUrlDirectly(urlsOfLinePay.web);
        }
    }

    componentDidMount() {
        if (!this.isDialogComponent() && !this.isComponentView()) {
            const { Application } = require("../");
            Router.setCurrentComponent(this);
            Application.setLatestComponent(this);
        }
        this.cleanDisposableDialogComponent();
        this.viewInitial();
        if (this.isNotNavigatorNComponentNCprtView()) {
            window.removeEventListener("scroll", this.onScrollToBottomListener, true);
            window.addEventListener("scroll", this.onScrollToBottomListener, true);
        }
        Util.appendInfo(`✅️  ${this.getComponentName()} goto componentDidMount()`);
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
        return _.isEqual(this.propsOfMobX.isComponentView, true);
    };

    isNotNavigatorNComponentNCprtView() {
        return !this.isNavigator() && !this.isComponentView() && !this.isCPRT();
    }

    viewInitial() {
        this.fileChooserInputRef = React.createRef();
        if (!this.isNavigator() && Config.isScrollingHide) {
            /** 這邊應該要監聽navigator發送的事件, 然後更改ViewHeight*/
            if (!this.isComponentView()) this.getStore().setAppBarHeight(isMobile ? 60 : 55);
        }
        this.imageDialogRef = React.createRef();
    }

    reloadPage = () => {
        window.location.reload();
    };

    centerInParent(direction) {
        return {
            flexDirection: direction,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        };
    }

    registerScrollToBottomJob = (...functionOfAsyncTasks) => {
        for (const func of functionOfAsyncTasks) {
            if (typeof func !== "function") {
                throw new ERROR(4002, `registerScrollToBottomJob `);
            }
        }
        this.jobsOfScrollToBottom.push(...functionOfAsyncTasks);
    };

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
        let isScrollToEnd = currentScroll + modifier > documentHeight;
        return isScrollDown && isScrollToEnd;
    };

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
    };

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
            for (const job of this.jobsOfScrollToBottom) await job(self);
            /**self 就是 component本身,因為client第一個參數都是view, 方便呼叫loading */
        } catch (error) {
            Util.appendError(`8841 jobExecutor() 掉進 catch裡面`, error);
            self.getStore().setHasNextPageBehavior(false);
        } finally {
            self.jobExecutorLock = false;
            await this.invalidateNextPageBehavior();
        }
    };

    /** 要是沒有產生出捲軸效果(), 但是有next page設計的話, canVerticalScrollable() 一定要實作hasNextPage的邏輯 */
    invalidateNextPageBehavior = async () => {
        await Util.syncDelay(50);
        if (!this.getStore().isErrorState() && this.getStore().hasNextPage() && this.hasScrollToBottomTask() && !this.canVerticalScrollable()) {
            Util.appendInfo(`補花功能啟動`);
            await Util.syncDelay(50);
            await this.jobExecutor();
        }
    };

    /** 每個Component 自己要實作 */
    renderView() {
        return <div />;
    }

    renderLoadingView() {
        if (this.isDialogComponent()) return null;
        if (this.getStore().isGlobalLoading()) {
            return (
                <div className={"BaseLoadingViewDiv"}>
                    <LinearProgress className={`BaseLoadingLinearProgress`} />
                </div>
            );
        }
    }

    setLoadingViewVisibility(show = true) {
        // console.trace(`setLoadingViewVisibility 呼叫追蹤: show = ${show}`);
        this.getStore().setState(show ? "loading" : "stable");
    }

    async executeAsyncTaskWithLoading(task) {
        try {
            this.setLoadingViewVisibility();
            await task();
        } finally {
            this.setLoadingViewVisibility(false);
        }
    }

    isNavigationView() {
        return false;
    }

    getCurrentWebSiteLink = () => {
        return window.location.href;
    };

    gotoUrlWithNewTab = (url) => {
        const task = async () => this.gotoUrlWithNewTabDirectly(url);
        this.enableExternalLinkDialog(url, task);
    };

    gotoExternalUrl = (url = "") => {
        const task = async () => this.gotoExternalUrlDirectly(url);
        this.enableExternalLinkDialog(url, task);
    };

    enableExternalLinkDialog = (url, task) => {
        this.getStore().setGlobalDialogContent({
            title: "是否開啟新頁面",
            content: `即將前往外部網站\n\n${url}`,
            task: task
        });
        this.getLoginDialogRef().open();
    };

    renderViewByStatus = () => {
        switch (this.getStore().getState()) {
            case "stable":
                return this.renderView();
            case "error":
                return this.renderErrorView();
            default:
                return this.renderView();
        }
    };

    onGoHomeClicked = (viewParam) => {
        Router.routeToHomePage(this.getComponentInstance());
    };

    scrollToTop() {
        window.scrollTo(0, 0);
    }

    renderErrorView = () => {
        const errorMsg = this.getStore().getErrorMsg();
        return (
            <Paper className={"BaseComponentErrorViewPaper"}>
                <Typography className={"BaseComponentErrorViewTitleTypography"}>發生技術問題</Typography>

                <Typography className={"BaseComponentErrorViewContentTypography"}>{errorMsg}</Typography>

                <Button variant={"outlined"} color={"primary"} onClick={(viewParam) => this.onGoHomeClicked(viewParam)} className={"BaseComponentErrorViewRetryButton"}>
                    返回首頁
                </Button>
            </Paper>
        );
    };

    gotoPage(path) {
        const { history } = this.props;
        history.push(path);
    }

    /**
     * 抽象方法：獲取 Store 實例。
     * 子類別必須覆寫此方法，返回一個繼承自 BaseStore 的 Store 實例。
     */
    getEmptyStore() {
        throw new Error(
            `[BaseComponent Error] 'getEmptyStore()' must be implemented by subclass. ` + `Please override this method in your component (e.g., return new MyStore(this.props)).`
        );
    }

    /** getStore() 依賴於 props.store（MobX 注入的）或 getEmptyStore() */
    getStore() {
        // MobX 傳統模式下，Store 應該通過 Props 傳入。
        return this.propsOfMobX.store || this.getEmptyStore();
    }

    appendStyle(style) {
        this.style = { ...this.style, ...style };
    }

    appendComponentStyle(style) {
        this.componentStyle = { ...this.componentStyle, ...style };
    }

    /** auto completed 有suggest的概念{label,value,uid,popularLevel }*/
    getNumberOfSelected(suggest) {
        if (suggest !== null) {
            return suggest.value ? _.toNumber(suggest.value) : -1;
        }
        return 0;
    }

    render() {
        const self = this;
        return (
            <div className={"RootViewDiv"} style={{ ...this.style, paddingTop: (self.getStore().hasAppBar() ? 8 : 0) + self.getStore().getAppBarHeight() }}>
                {self.renderOverallLoadingView()}

                <div className={"ComponentViewDiv"} style={{ ...this.componentStyle }}>
                    {self.renderViewByStatus()}
                </div>

                {self.renderLoadingView()}

                {self.renderSelectorView()}

                {self.renderImageDialog()}

                {self.renderSnackView()}

                {self.renderGlobalDialogView()}
            </div>
        );
    }

    shouldDisplayLoadingArea(items = []) {
        return !this.getStore().isInitialFetchCompleted() && _.size(items) < 1;
    }

    renderListEmptyView = (items = [], hasPath) => {
        const ListEmptyView = this.ListEmptyView;
        return <ListEmptyView size={_.size(items)} isGlobalLoading={this.getStore().isGlobalLoading()} component={this} hasPath={hasPath} />;
    };

    App = () => {
        return require("../").Application;
    };

    ListEmptyView = observer(({ hasPath, component, isGlobalLoading, size }) => {
        if (isGlobalLoading || size > 0) {
            return null;
        }

        function renderRetryButton() {
            if (hasPath) {
                return (
                    <Chip
                        onClick={async () => {
                            if (component instanceof BaseComponent) {
                                const store = component.getStore();
                                await store.fetch(component);
                            }
                        }}
                        icon={<RestartAltOutlined />}
                        label={"重試"}
                        color={"primary"}
                        variant={"outlined"}
                        className={`BaseListEmptyRetryButton`}></Chip>
                );
            }
            return null;
        }

        return (
            <div className={`BaseListEmptyDiv`}>
                <Typography className={`BaseListEmptyTypography`}>{this.getStore().getMessageOfListIsEmpty()}</Typography>
                {renderRetryButton()}
            </div>
        );
    });

    getCurrentLocation = async () => {
        const self = this;
        if (!navigator.geolocation) {
            this.showWarningSnackMessage("您的瀏覽器不支援地理定位");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log({ latitude, longitude });
                try {
                    const fetchedAddress = await functions.httpOnCallGetCurrentAddress(self, { latitude, longitude });
                    Util.appendInfo(fetchedAddress);
                    return fetchedAddress;
                } catch (error) {
                    this.showWarningSnackMessage("無法獲取地址，請手動輸入地址");
                }
            },
            (error) => {
                this.showWarningSnackMessage("無法獲取地理位置，請檢查您的定位服務是否開啟");
            }
        );
    };

    renderSelectorView = () => {
        const self = this;
        const params = this.getStore().getSelectorParam();
        return (
            <input
                multiple={params.multiple}
                type={params.type}
                accept={params.accept}
                ref={self.fileChooserInputRef}
                style={{ display: "none" }}
                onChange={this.onFilesSelectedEventReceived.bind(self)}
            />
        );
    };

    onFilesSelectedEventReceived = (event) => {
        const self = this;
        event.stopPropagation();
        event.preventDefault();
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
                });
        }
        if (_.size(array) > 0) this.onFilesSelected(array);
    };

    /** 給子類別繼承用的 */
    onFilesSelected(files) {
        Util.appendError(`onFileSelected() is not implemented()`);
    }

    enableFileSelectView = (accept = "*.*", multiple = false, type = "file") => {
        this.getStore().setSelectorParam({ accept, multiple, type });
        Util.syncDelay("10").then(() => this.fileChooserInputRef.current.click());
    };

    enableImageSelectView(multiple = false) {
        const accepts = `image/*`;
        this.enableFileSelectView(accepts, multiple);
    }

    enableVoiceSelectView(multiple = false) {
        const accepts = `audio/*`;
        this.enableFileSelectView(accepts, multiple);
    }

    renderOverallLoadingView() {
        if (this.isNavigator()) {
            return undefined;
        }

        return (
            <Backdrop open={this.getStore().isOverallLoading()} className={"BaseComponentGlobalLoadingRootBackdrop"}>
                <div className={"BaseComponentGlobalLoadingDiv"}>
                    <CircularProgress />

                    <Typography className={"BaseComponentGlobalLoadingTypography"}>{this.getStore().getTipOfOverallLoading()}</Typography>
                </div>
            </Backdrop>
        );
    }

    /**
     * Custom hook to trigger the visibility based on scroll direction.
     * 只有在向上滑動 (Scrolled Up) 時才返回 true。
     * * [修正項目]
     * 1. 緩衝 (Debounce): **移除向上滑動 (顯示) 的緩衝**，改為即時顯示，解決向上滑動延遲問題。
     * 2. 置頂檢查: 確保捲動位置為 0 時 Bar 必定顯示，解決頂部隱藏和導頁問題。
     * 3. 優化顯示/隱藏: 向下捲動 (Hide) 時移除緩衝，實現即時隱藏。
     * 4. 內容加載修正: **移除複雜的 prevScrollY 更新邏輯**，改為始終更新，依賴 scrollThreshold 避免抖動。
     *
     * @param {object} targetWindow - 包含 window 參考的屬性。
     * @returns {boolean} - 是否應該顯示元件 (true = 顯示)。
     */
    useScrollDirection(targetWindow) {
        const [shouldShow, setShouldShow] = React.useState(true);
        const prevScrollY = React.useRef(0);
        // 移除 timeoutRef，因為向上顯示不再需要緩衝

        React.useEffect(() => {
            const target = targetWindow.document ? targetWindow : window;
            // 移除 DEBOUNCE_DELAY 常數

            const handleScroll = () => {
                const currentScrollY = target.pageYOffset || target.scrollY || target.document.documentElement.scrollTop;

                // [FIX 3] 捲動到頂部時 (currentScrollY === 0)，強制顯示 Bar
                if (currentScrollY === 0) {
                    // 如果 Bar 已經顯示，則不需要做任何事
                    if (!shouldShow) {
                        setShouldShow(true);
                    }
                    prevScrollY.current = currentScrollY;
                    return;
                }

                // 1. 判斷捲動方向
                const scrollingUp = currentScrollY < prevScrollY.current;
                const scrollingDown = currentScrollY > prevScrollY.current;

                // 避免在捲動位置很小時（抖動）影響判斷
                const scrollThreshold = 10;
                const isSignificantScroll = Math.abs(currentScrollY - prevScrollY.current) > scrollThreshold;

                if (isSignificantScroll) {
                    const newShouldShow = scrollingUp; // 向上為 true (顯示), 向下為 false (隱藏)

                    if (newShouldShow !== shouldShow) {
                        if (newShouldShow === false) {
                            // **向下捲動 (Scrolled Down) - 應該隱藏 (Hide)**
                            // 立即隱藏
                            setShouldShow(false);
                        } else {
                            // **向上捲動 (Scrolled Up) - 應該顯示 (Show)**
                            // 立即顯示 (解決向上滑動不會顯示的問題)
                            setShouldShow(true);
                        }
                    }
                }

                // 3. 更新上次的捲動位置
                // 移除 [FIX 4] 的複雜條件，始終更新 prevScrollY.current，確保能夠在向上捲動時正確觸發顯示。
                prevScrollY.current = currentScrollY;
            };

            const targetEl = targetWindow.document ? targetWindow : window;
            targetEl.addEventListener("scroll", handleScroll);

            return () => {
                targetEl.removeEventListener("scroll", handleScroll);
            };
        }, [targetWindow, shouldShow]);

        return shouldShow;
    }

    /**
     * 實現向上滑動時顯示，向下滑動時隱藏的 MUI Slide 元件。
     * @param {object} props - 傳遞給 Slide 元件的屬性。
     * @param {React.ReactNode} props.children - 要隱藏/顯示的內容 (通常是 AppBar)。
     * @param {function} [props.window] - 窗口物件的引用，用於自定義捲動目標 (例如在 iframe 中)。
     * @param {boolean} [props.hidden=false] - 是否強制隱藏 Bar，忽略捲動狀態。 (新增)
     */
    HideOnScroll = (props) => {
        const { children, window, hidden = false } = props; // 接受 hidden 屬性

        // 獲取實際的目標窗口物件
        const targetWindow = window ? window() : globalThis.window;

        // 使用自定義 Hook 取得是否應該顯示的狀態
        const triggerShow = this.useScrollDirection(targetWindow);

        // 決定最終的顯示狀態：
        // 如果 hidden=true，in 永遠為 false (隱藏)。
        // 如果 hidden=false，in 跟隨 triggerShow (捲動邏輯)。
        const finalInState = hidden ? false : triggerShow;

        return (
            // [FIX 5] 加入 unmountOnExit 確保子元件在隱藏後從 DOM 中移除，解決 AutoComplete 邊框殘留問題。
            <Slide appear={false} direction="down" in={finalInState} unmountOnExit>
                {children}
            </Slide>
        );
    };

    isNavigator() {
        return false;
    }

    isCPRT() {
        return false;
    }

    setGlobalLoadingViewVisibility(visibility = true, loadingStringTip = "正在載入中") {
        this.getStore().setOverallLoadingStatus(visibility, visibility ? loadingStringTip : ``);
    }

    renderImageDialog = () => {
        if (this.isDialogComponent()) return null;
        const self = this;
        const params = this.getStore().getImageDialogParam();
        return this.renderAlertDialog({
            ref: this.imageDialogRef,
            paramObject: params,
            customView: ImageDialogView,
            needActionButtons: false,
            component: self
        });
    };

    /** imageDialogRef只會實作在 '非dialog的' component */
    openImageDialog = (imgUrl) => {
        const component = this.getComponentInstance();
        component?.imageDialogRef?.current?.open({ href: imgUrl });
    };

    /** 如果頁面有聽callback, 統一用這個method */
    subscribe(subscribeFunction) {
        this.listOfFunctionOfUnsubscribe.push(subscribeFunction);
    }

    /** ↓↓↓===== SnackView 用到的field,遲早要搬運成獨立的 class =====↓↓↓ */
    durationOfSnackVisible = 3000;
    snackExtraTaskFunction = undefined;
    snackMessageType = "info";
    snackMessage = "default message";

    defaultSnackExtra() {
        return {
            type: `info` /** error,warning,success, info */,
            duration: 5000,
            func: {
                name: "default",
                task: async () => {
                    await Util.syncDelay();
                    Util.appendInfo("default snack task message!");
                }
            }
        };
    }

    getSelectedSuggest(value, suggests) {
        if (_.isArray(suggests) && value) return _.find(suggests, (suggest) => _.isEqual(_.toString(suggest.value), _.toString(value)));
    }

    renderSnackView() {
        if (this.isDialogComponent()) return null;
        const self = this;

        function Alert(props) {
            return <MuiAlert elevation={6} variant="filled" {...props} />;
        }

        function hasSnackExtraFunction() {
            return self.snackExtraTaskFunction && self.snackExtraTaskFunction.name !== "default";
        }

        function onSnackViewCloseClicked() {
            self.getStore().setSnackVisibility(false);
            self.snackExtraTaskFunction = self.defaultSnackExtra();
        }

        function renderSnackExtraFunctionView() {
            if (hasSnackExtraFunction()) {
                return (
                    <Button
                        className={"BaseSnackFuncButton"}
                        color="secondary"
                        size="large"
                        onClick={() => {
                            self.snackExtraTaskFunction.task().then();
                            onSnackViewCloseClicked();
                        }}>
                        {self.snackExtraTaskFunction.name}
                    </Button>
                );
            }
            return null;
        }

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
                open={this.getStore().getSnackVisibility()}
                autoHideDuration={self.durationOfSnackVisible}
                onClose={onSnackViewCloseClicked}>
                <div>
                    <Alert className={"BaseSnackAlert"} onClose={onSnackViewCloseClicked} severity={self.snackMessageType}>
                        {self.snackMessage}
                    </Alert>
                    {renderSnackExtraFunctionView()}
                </div>
            </Snackbar>
        );
    }

    showWarningSnackMessage(message) {
        this.setSnackViewVisibility(true, message, { type: `warning` });
    }

    showInfoSnackMessage(message) {
        this.setSnackViewVisibility(true, message, { type: `info` });
    }

    showErrorSnackMessage(message) {
        this.setSnackViewVisibility(true, message, { type: `error` });
    }

    showSuccessSnackMessage(message) {
        this.setSnackViewVisibility(true, message, { type: `success` });
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
            });
        } else {
            sync().then();
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

    CountdownView = observer(({ date, title }) => {
        const TimeDisplayView = ({ days, hours, minutes, seconds, completed }) => {
            const UnitView = ({ count, unit }) => {
                return (
                    <Card className={"BaseCountdownCountCard"}>
                        <Typography className={"BaseCountdownCountTypography"}>{count}</Typography>
                        <Typography className={"BaseCountdownUnitTypography"}>{unit}</Typography>
                    </Card>
                );
            };

            if (completed) {
                /** Render a completed state */
                return null;
            } else {
                const times = [
                    { unit: "天", count: days },
                    { unit: "小時", count: hours },
                    { unit: "分鐘", count: minutes },
                    { unit: "秒", count: seconds }
                ];
                return (
                    <div className={"BaseCountdownCountDiv"}>
                        <Typography className={"BaseCountdownTitleTypography"}>{title}</Typography>
                        <div />
                        <div className={"ListBaseCountdownCountDiv"}>
                            {times.map((each) => (
                                <UnitView key={each.unit} count={each.count} unit={each.unit} />
                            ))}
                        </div>
                    </div>
                );
            }
        };

        return <Countdown renderer={TimeDisplayView} date={Util.getCurrentTimeStamp() + Util.getDurationOfMillionSec(date)} />;
    });

    /** 通常呼叫這個method, 是要呼叫loading狀態, 例如dialog要拿到自己的component instance, 要forceSelf = true */
    getComponentInstance = (forceSelf = false) => {
        if (forceSelf) return this;

        if (this.isDialogComponent() || this.isComponentView()) {
            return this.propsOfMobX.component;
        } else {
            return this;
        }
    };

    dismiss() {
        if (this.isDialogComponent()) {
            this.propsOfMobX.dialog.dismiss();
        }
    }

    /** path:'https://' or route:'pageName:...params'*/
    handleCustomRouter = (routeString = "") => {
        const words = routeString.split(":");
        const type = words.shift();
        switch (type) {
            case "path":
                const path = words.join(":");
                this.gotoExternalUrl(path);
                break;
            case "route":
                const page = words.shift();
                const functionName = `goto${_.upperFirst(page)}Page`;
                const functionOfGotoPage = Router[functionName];
                if (_.isFunction(functionOfGotoPage)) {
                    functionOfGotoPage(this.getComponentInstance(), ...words);
                } else {
                    this.setSnackViewVisibility(true, `4097 can't handle ${page}`, { type: "error" });
                }
                break;
            default:
                if (_.isEmpty(routeString)) {
                    /** doing nothing */
                } else {
                    this.setSnackViewVisibility(true, `can't handle ${routeString}`, { type: "error" });
                }
                break;
        }
    };

    async handleRestFulResult(restfulResult, succeedBehavior) {
        if (restfulResult === undefined) return;
        if (restfulResult.status === "succeed") {
            await succeedBehavior(restfulResult.data);
        } else if (restfulResult.status === "fail") {
            this.setSnackViewVisibility(true, restfulResult.message, { type: "warning" });
        } else {
            throw new ERROR(7007, `status ===> ${restfulResult.status}`);
        }
    }

    copyCurrentLinkToClipboard(message = `已複製當前的連結`) {
        copy(this.getCurrentWebSiteLink());
        this.getComponentInstance().showInfoSnackMessage(message);
    }

    copyTextToClipboard(text, message = `已將內容新增至剪貼簿`) {
        copy(text);
        this.getComponentInstance().showInfoSnackMessage(message);
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
            task: dialog.task
        });
    };

    getLoginDialogRef = () => {
        return this.loginDialogRef.current;
    };

    enableLoginConfirmDialog = () => {
        const self = this;
        this.getStore().setGlobalDialogContent({
            title: "此功能必須登入",
            content: "此功能必須登入,點擊確認後將喚起登入頁面",
            task: async () => await self.invokeLoginBehavior()
        });
        Util.performActionWithoutTimingIssue(() => self.getLoginDialogRef().open());
    };

    enableAlertDialog = (title = "標題", content = "內容", task = async () => true) => {
        const self = this;
        this.getStore().setGlobalDialogContent({
            title,
            content,
            task
        });
        Util.performActionWithoutTimingIssue(() => self.getLoginDialogRef().open());
    };

    invokeLoginBehavior = async () => {
        await Util.syncDelay(10);
        if (!UserInfo.isLoginWithSucceed()) this.App().getNavigatorRef().onNavigatorLoginIconButtonClicked();
    };

    openLineChatAccountWithMessage(id = "", message = "") {
        if (!isMobile) {
            this.showInfoSnackMessage(`抱歉,此功能僅提供在移動設備上(手機,平板)`);
            return;
        }
        this.gotoUrlWithNewTabDirectly(`https://line.me/R/oaMessage/${id}/?${message}`);
    }

    getKeywordSuggests = () => {
        return this.App().getNavigatorStore().getCompleteSuggests();
    };

    onInitialErrorHappened(error) {
        Util.appendError(error.message);
    }

    constraintOfParam(param, ...allows) {
        let isValid = true;

        if (Util.isUndefinedNullEmpty(param)) isValid = false;

        if (Util.isOrEquals(param, ...allows)) isValid = true;

        return isValid;
    }

    renderAlertDialog = ({
        ref,
        title,
        content,
        task,
        customView,
        paramObject,
        needActionButtons,
        textInput,
        component,
        enableCancel,
        callback,
        storeX,
        useCustomCancel = false,
        disposablePage = false,
        fullWidth = false,
        strict = false
    }) => {
        if (disposablePage && this.App().getStoreObject()) {
            const nameOfComponent = customView.nameOfComponent;
            const store = this.App().getStoreObject()[`${nameOfComponent}`];
            if (store) store.clean();
        }

        return (
            <AlertDialog
                title={title}
                content={content}
                callback={callback}
                submitAsyncTask={task}
                needActionButtons={needActionButtons}
                enableCancel={enableCancel}
                useCustomCancel={useCustomCancel}
                customView={customView}
                paramObject={paramObject}
                textInput={textInput}
                component={component}
                fullWidth={fullWidth}
                strict={strict}
                storeX={storeX}
                ref={ref}
            />
        );
    };

    isWrapByDialog() {
        const dialog = this.propsOfMobX.dialog;
        return dialog instanceof AlertDialog;
    }

    funcOfDialogCallback() {
        return this.propsMobX().callback;
    }

    renderAlertMenu({ ref, items, component }) {
        return <AlertMenu component={component} items={items} ref={ref} />;
    }

    propsMobX() {
        return this.propsOfMobX;
    }

    invokeEMailBehavior(email, subject = "", body = "", children = "") {
        if (!Util.isUndefinedNullEmpty(email)) {
            this.copyTextToClipboard(email);
            let params = subject || body ? "?" : "";
            if (subject) params += `subject=${encodeURIComponent(subject)}`;
            if (body) params += `${subject ? "&" : ""}body=${encodeURIComponent(body)}`;
            const link = document.createElement(`a`);
            link.target = `_blank`;
            link.rel = `noopener noreferrer`;
            link.href = `mailto:${email}${params}`;
            link.text = children;
            link.click();
        }
    }

    invokePhoneBehavior(phone) {
        if (!Util.isUndefinedNullEmpty(phone)) {
            this.copyTextToClipboard(phone);
            const link = document.createElement(`a`);
            link.target = `_blank`;
            link.rel = `noopener noreferrer`;
            link.href = `tel:${phone}`;
            link.click();
        }
    }

    invokeInstagramApp = (website) => {
        const forceToWebsite = true;

        const username = Util.getTailStringSplitBy(website, "/");
        if (isMobile && !forceToWebsite) {
            window.open(`instagram://user?username=${username}`, "_blank");
        } else {
            this.copyTextToClipboard(website, `已複製網址至剪貼簿`);
            this.gotoUrlWithNewTab(website);
        }
    };

    invokeFacebookApp = (website) => {
        const forceToWebsite = true;
        const idOfPage = Util.getTailStringSplitBy(website, "/");
        if (isMobile && !forceToWebsite) {
            window.open(`fb://page/${idOfPage}`, "_blank");
        } else {
            this.copyTextToClipboard(website, `已複製網址至剪貼簿`);
            this.gotoUrlWithNewTab(website);
        }
    };

    invokeLineApp = (idOfLine, message) => {
        this.gotoExternalUrlDirectly(`https://line.me/ti/p/~${idOfLine}`);
    };

    download(path) {
        const link = document.createElement(`a`);
        link.href = `${path}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default BaseComponent;
