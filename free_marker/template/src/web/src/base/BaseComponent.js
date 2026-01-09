const edit = true;

import _ from "lodash";
import React from "react";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Config from "../config";
import { observer } from "mobx-react";
import Countdown from "react-countdown";
import Router from "../router";
import { isMobile } from "react-device-detect";
import ImageDialogView from "./ImageDialogView";
import UserInfo from "../base/BaseUserInfo";
import EventBus from "./CommonEventBus";
import MuiComponent from "./MUIComponent";
import AlertDialog from "./AlertDialog";
import AlertMenu from "./AlertMenu";
import copy from "copy-to-clipboard";
import functions from "../functions";
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";
import BaseSnackView, { SnackStore } from "./BaseSnackView";
import LoadInkingView, { loadInkingStore } from './BaseLoadInkingView';
class BaseComponent extends MuiComponent {
    listOfFunctionOfUnsubscribe = [];
    style = {};
    componentStyle = {};
    jobsOfScrollToBottom = [];
    jobExecutorLock = false;
    loginDialogRef = React.createRef();
    propsOfMobX;
    /** true就表示 AsyncTask正在執行中，不能再被觸發, false表示可以 */
    storeOfSBar;

    constructor(props) {
        super(props);
        this.propsOfMobX = props;
        this.storeOfSBar = new SnackStore();
    }

    /** 瘋掉，不知道為什麼task.then()會讓函式執行到一半，然後異常死掉後，導致loading bar跑不完，只好正規的做好以下任務
     * @param task 要執行的非同步事件
     * @param thenDo 如果有行為要在then之後執行，必須是function(同步)
     * @param catahDo 如果有行為要在catch之後執行，必須是function(同步)
     * */
    exeAsyncT = (task, { thenDo, catchDo } = {}) => {
        task.then((msg) => {
            if (Util.isAsyncP(thenDo)) this.exeAsyncT(thenDo);
            else if (_.isFunction(thenDo)) thenDo(msg);
            else {
                /** default behavior => 尚未想到 */
            }
        })
            .catch((error) => {
                if (Util.isAsyncP(catchDo)) this.exeAsyncT(catchDo);
                if (_.isFunction(catchDo)) thenDo(error);
                else this.showErrorSnackMessage(error.message);
            })
            .finally(() => this.setLoadingViewVisibility(false));
    };

    setPageFullTitle = (title) => {
        const userInfo = require("./BaseUserInfo").default;
        const brand = userInfo.getNameOfBrand();
        document.title = `[${brand}]${title}`;
    };

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

    invalidateLoadInking = (show, { processed = 1, totalFiles = 1, progress = 0, disabled = false } = {}) => {
        if (show) loadInkingStore.updateLoadInkingState(processed, totalFiles, progress);
        else loadInkingStore.finish();
    }

    /**
     * @param stringOfRaw : { app:'universal link(app內可以跳轉到linepay的url=>app:linepay)',web:'網頁版的應用'}
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
        return this.propsOfMobX.dialog !== undefined;
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

    render() {
        const ObservableSnackView = observer(({ ...props }) => {
            if (this.isDialogComponent()) return null;
            return <BaseSnackView {...props} />
        });

        const self = this;
        console.log(`655456213 ${this.getComponentName()}-BaseComponent的render() 來惹!`)
        return (
            <div className={"RootViewDiv"} style={{ ...this.style, paddingTop: (self.getStore().hasAppBar() ? 8 : 0) + self.getStore().getAppBarHeight() }}>

                <div className={"ComponentViewDiv"} style={{ ...this.componentStyle }}>
                    {self.renderViewByStatus()}
                </div>

                {self.renderLoadingView()}

                {self.renderSelectorView()}

                {self.renderImageDialog()}

                <ObservableSnackView
                    componentX={this}
                    open={this.storeOfSBar.visible}
                    store={this.storeOfSBar} />

                <LoadInkingView
                    componentX={this} />

                {self.renderGlobalDialogView()}
            </div>
        );
    }

    getSelectedSuggest(value, suggests) {
        if (_.isArray(suggests) && value) return _.find(suggests, (suggest) => _.isEqual(_.toString(suggest.value), _.toString(value)));
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

}

export default BaseComponent;
