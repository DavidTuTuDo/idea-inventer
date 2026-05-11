const edit = true;

import _ from "lodash";
import React from "react";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Config from "../config";
import Router from "../router";
import { isMobile } from "react-device-detect";
import ImageDialogView from "./ImageDialogView";
import EventBus from "./CommonEventBus";
import MuiComponent from "./MUIComponent";
import DialogX from "./DialogX";
import AlertMenu from "./AlertMenu";
import SnackBView, { storeOfSnackB } from "./BaseSnackView";
import LoadInkingView, { storeOfloadInking } from "./BaseLoadInkingView";
import ProcessingGuardView, { storeOfProcessingGuard } from "./BaseProcessingGuardView";
import AppLoadingView, { storeOfAppLoading } from "./AppLoadingView";
import SplashX from "./SplashX";
import RulesSnack from "./RulesSnack";
import AppMessageQueueView, { storeOfAppMessageQueue } from "./AppMessageQueueView";

class BaseComponent extends MuiComponent {
    listOfFunctionOfUnsubscribe = [];
    style = {};
    componentStyle = {};
    jobsOfScrollToBottom = [];
    jobExecutorLock = false;
    propsOfMobX;

    // [新增] 補花重試計數器與防呆上限，避免無止盡自動 fetch 造成死迴圈
    autoFillRetryCount = 0;
    MAX_AUTO_FILL_RETRIES = 5;

    constructor(props) {
        super(props);
        this.propsOfMobX = props;
        this.imgDialogRef = React.createRef();
        this.generalDialogRef = React.createRef();
        this.fileChooserInputRef = React.createRef();
    }

    /** 瘋掉，不知道為什麼task.then()會讓函式執行到一半，然後異常死掉後(沒執行到最後一行)，導致loading bar跑不完，只好正規的做好以下任務
     * @param task 要執行的非同步事件[promise | async func()]
     * @param thenDo 如果有行為要在then之後執行，必須是function|promise
     * @param catchDo 如果有行為要在catch之後執行，必須是function|promise
     * @param finallyDo 如果有行為要在catch之後執行，必須是function|promise
     * @param ignore 發生錯誤時，而且沒有代入catchDo時要不要顯示錯誤
     **/
    exeAsyncT = (task, { thenDo, catchDo, finallyDo, ignore } = {}) => {
        console.log(`🌱 ${this?.getComponentName()} 執行 exeAsyncT()`);

        if (!Util.isP(task)) throw new Error(`[exeAsyncT]: Task is not a Promise. Received: ${typeof task}`);

        // 2. 封裝處理邏輯，使其支援鏈接 (Chaining)
        // 這裡回傳 Promise 確保外部也可以 await 它
        return task
            .then(async (result) => {
                if (Util.isCallable(thenDo)) {
                    // 使用 await 確保不管是 Async 還是普通 Function 回傳 Promise 都能被等待
                    await thenDo(result);
                }
            })
            .catch(async (error) => {
                if (Util.isCallable(catchDo)) await catchDo(error);
                else if (!ignore) {
                    console.trace(error);
                    this.getComponentInstance().showErrorSnackMessage(error.message);
                } else console.error(error.message);
            })
            .finally(async () => {
                if (Util.isCallable(finallyDo)) await finallyDo();
                else {
                    this.getComponentInstance().enableAppLoading(false);
                    this.getComponentInstance().invalidateProcessingGuard(false);
                    this.getComponentInstance().invalidateLoadInking(false);
                }
            });
    };

    /**
     * ProcessingGuard，通用於交易/前端必須atomic行為時，阻擋不必要點擊的保護層
     * @param enable 是否顯示
     * @param textOfTip 字樣
     * @param secondsOfP 停留秒數
     * @param variant [warn|error|success|info]色系（例如：交易相關應該用success）
     */
    invalidateProcessingGuard(enable, { textOfTip = "請勿關閉", secondsOfP, variant = "info" } = {}) {
        if (enable) storeOfProcessingGuard.show(textOfTip, secondsOfP, variant);
        else storeOfProcessingGuard.hide();
    }

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
        this.updateSnackStatus(false);

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
        if (show) storeOfloadInking.updateLoadInkingState(processed, totalFiles, progress);
        else storeOfloadInking.finish();
    };

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
        const self = this;
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
        // Util.syncDelay(5000).then(() => {
        //     self.runMessageQueueTest()
        // })
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

    viewInitial = () => {
        if (!this.isNavigator() && Config.isScrollingHide) {
            /** 這邊應該要監聽navigator發送的事件, 然後更改ViewHeight*/
            if (!this.isComponentView()) this.getStore().setAppBarHeight(isMobile ? 60 : 55);
        }
    };

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
        // [修改] 建議拉大至 100 提早預載，讓使用者體驗更無縫
        return 100;
    }

    disappearKeyboard() {
        document.activeElement.blur();
    }

    isValidOfScrollToBottom = () => {
        let documentHeight = document.body.scrollHeight;
        // [修改] 加上 Math.ceil 避免部分瀏覽器或 Retina 螢幕產生小數點造成的誤差
        let currentScroll = Math.ceil(window.scrollY + window.innerHeight);
        let isScrollDown = window.scrollY > 0;
        /** 應該要記錄scrollY, 然後判斷偏移量 */
        // [修改] 使用設定的 Threshold 取代寫死的 modifier = 1
        let modifier = this.getThresholdOfScrollToBottom() || 100;
        // [修改] 改為 >= 確保在設定的 Threshold 範圍內都能精準觸發
        let isScrollToEnd = currentScroll + modifier >= documentHeight;
        return isScrollDown && isScrollToEnd;
    };

    // [修改] 使用 lodash.throttle 包裝，限制每 300ms 最多觸發一次，避免滑動時頻繁計算造成效能瓶頸
    onScrollToBottomListener = _.throttle((event) => {
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

                self.exeAsyncT(this.jobExecutor());
            } else {
                Util.appendInfo(`當前任務還沒執行完畢, 忽略此次呼叫。`);
            }
        }
    }, 300);

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
        // [修改] 延長等待時間至 150ms，確保 React 渲染和瀏覽器 Paint 確實完成，避免 canVerticalScrollable 誤判
        await Util.syncDelay(150);
        if (!this.getStore().isErrorState() && this.getStore().hasNextPage() && this.hasScrollToBottomTask() && !this.canVerticalScrollable()) {
            // [新增] 補花防呆機制：若重試次數達上限則強制停止，防止 API 異常或 CSS 樣式問題導致的無限迴圈
            if (this.autoFillRetryCount >= this.MAX_AUTO_FILL_RETRIES) {
                Util.appendError(`補花功能已達到上限 (${this.MAX_AUTO_FILL_RETRIES}次)，強制停止。請檢查 API 回傳或頁面高度設定。`);
                this.autoFillRetryCount = 0; // 重置計數器
                return;
            }

            // [修改] 將原本單純的 Log 加入紀錄次數，方便 Debug
            Util.appendInfo(`補花功能啟動 (第 ${this.autoFillRetryCount + 1} 次)`);
            this.autoFillRetryCount++;

            await Util.syncDelay(50);
            await this.jobExecutor();
        } else {
            // [新增] 如果畫面已產生捲軸效果，或沒有下一頁，則歸零計數器
            this.autoFillRetryCount = 0;
        }
    };

    /** 每個Component 自己要實作 */
    renderView() {
        return <div />;
    }

    enableAppLoading(enable = true) {
        this.getStore().setState(enable ? "loading" : "stable");
        storeOfAppLoading.setVisible(enable);
    }

    /** 會計算 呼叫數 和 取消數 一致才能消失的 loading機制 */
    enableAppLastingLoading(enable = true) {
        return storeOfAppLoading.enableLasting();
    }

    isAppStillLoading() {
        return storeOfAppLoading.visible;
    }

    async executeAsyncTaskWithLoading(task) {
        try {
            this.enableAppLoading();
            await task();
        } finally {
            this.enableAppLoading(false);
        }
    }

    /**
     * 微透明的訊息佇列
     * @param {string} content 訊息內容
     * @param {string} type 顏色類型: info(時尚灰), warn(警告橘), error(錯誤紅), super(驚喜金)
     * @param {Function} onClick 點擊事件 (如導頁)
     * @param {number} duration 持續時間 (ms)
     */
    showAppMessageQueue(content, type = "info", onClick = null, duration = 5000) {
        storeOfAppMessageQueue.addMessage({ content, type, onClick, duration });
    }

    isNavigationView() {
        return false;
    }

    getCurrentWebSiteLink = () => {
        return window.location.href;
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

    /**
     * 控制 SnackBar 顯示與隱藏的核心方法 (已重構為對接 SnackStore)
     * @param {boolean} visible - true: 顯示, false: 隱藏
     * @param {string} message - 要顯示的訊息內容
     * @param {object} config - 額外設定參數 (相容舊有邏輯)
     * @param {string} [config.type='info'] - 訊息類型: 'info' | 'success' | 'warning' | 'error'
     * @param {number} [config.duration=3000] - 顯示時間(毫秒)
     * @param {object} [config.func] - 額外按鈕設定 { name: '按鈕名稱', task: async function }
     * @returns {boolean} - 總是回傳 true (維持舊有 API 行為)
     */
    updateSnackStatus(visible, message, config = {}) {
        if (visible) storeOfSnackB.execution(message, config.type, config);
        else storeOfSnackB.close();
        return true;
    }

    renderViewByStatus = () => {
        if (this.getStore().allowed) return this.renderView();
        else this.renderErrorView();
    };

    render() {
        const self = this;
        console.log(`⚠️⚠️⚠️ 事發地：【${this.getComponentName()}】 注意！APP 全域 re-render()。`);
        return (
            <div className={"RootViewDiv"} style={{ ...this.style, paddingTop: (self.getStore().hasAppBar() ? 8 : 0) + self.getStore().getAppBarHeight() }}>
                <SplashX componentX={self} />

                <RulesSnack componentX={self} />

                <AppMessageQueueView componentX={self} />

                <div className={"ComponentViewDiv"} style={{ ...this.componentStyle }}>
                    {self.renderViewByStatus()}
                </div>

                <AppLoadingView componentX={self} />

                {self.renderSelectorView()}

                <SnackBView componentX={self} />

                <LoadInkingView componentX={self} />

                <ProcessingGuardView componentX={self} />

                <DialogX ref={this.imgDialogRef} viewX={"ImageDialogView"} customView={ImageDialogView} needActionButtons={false} componentX={self} />

                <DialogX ref={this.generalDialogRef} viewX={"GlobalDialogView"} componentX={self} />
            </div>
        );
    }

    getImageDialogRef() {
        return this.imgDialogRef;
    }

    getGeneralDialogRef = () => {
        return this.generalDialogRef;
    };

    getSelectedSuggest(value, suggests) {
        if (_.isArray(suggests) && value) return _.find(suggests, (suggest) => _.isEqual(_.toString(suggest.value), _.toString(value)));
    }

    shouldDisplayLoadingArea(items = []) {
        return !this.getStore().isInitialFetchCompleted() && _.size(items) < 1;
    }

    App = () => require("../").Application;

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

        /** 將事件內選到檔案清空，不然選到同一個檔案將無法觸發onChange */
        event.target.value = "";
    };

    /** 給子類別繼承用的 */
    onFilesSelected(files) {
        Util.appendError(`onFileSelected() is not implemented()`);
    }

    enableFileSelectView = (accept = "*.*", multiple = false, type = "file") => {
        this.getStore().setSelectorParam({ accept, multiple, type });
        Util.syncDelay("10").then(() => this.fileChooserInputRef.current.click());
    };

    /** file chooser選擇完會呼叫 onFilesSelected */
    enableImageSelectView(multiple = false) {
        const accepts = `image/*`;
        this.enableFileSelectView(accepts, multiple);
    }

    /** file chooser選擇完會呼叫 onFilesSelected */
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

    /** 如果頁面有聽callback, 統一用這個method */
    subscribe(subscribeFunction) {
        this.listOfFunctionOfUnsubscribe.push(subscribeFunction);
    }

    /** 通常呼叫這個method, 是要呼叫loading狀態, 例如dialog要拿到自己的component instance, 要forceSelf = true */
    getComponentInstance = (forceSelf = false) => {
        if (forceSelf) return this;

        if (this.isDialogComponent() || this.isComponentView()) {
            return this.propsOfMobX?.component ?? this;
        } else {
            return this;
        }
    };

    dismiss() {
        if (this.isDialogComponent()) this.propsOfMobX?.dialog?.dismiss?.();
    }

    getLoginDialogRef = () => {
        return this.loginDialogRef.current;
    };

    getImgDialogRef = () => {
        return this.imgDialogRef.current;
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

    funcOfDialogCallback() {
        return this.propsMobX().callback;
    }

    renderAlertMenu({ ref, items, component }) {
        return <AlertMenu component={component} items={items} ref={ref} />;
    }

    propsMobX() {
        return this.propsOfMobX;
    }

    /**
     * 測試：製造 20 個範例，每個 message 隨機間隔 2~5 秒
     */
    runMessageQueueTest = () => {
        const examples = [
            { type: "info", text: "系統已完成背景同步作業" },
            { type: "warn", text: "⚠️ 警告：目前連線可能不穩定" },
            { type: "error", text: "❌ 發生嚴重錯誤：找不到指定資源" },
            { type: "super", text: "✨ 太棒了！您獲得了專屬白金會員資格" },
            { type: "info", text: "提示：您可以點擊此處前往設定頁面" },
            { type: "warn", text: "請注意！即將在 5 分鐘後進行系統維護" },
            { type: "error", text: "網路請求失敗，API 回傳 Timeout" },
            { type: "super", text: "🎉 恭喜發財！獲得隱藏版新年紅包" },
            { type: "warn", text: "目前記憶體使用量過高，請關閉部分應用" },
            { type: "error", text: "無法讀取使用者設定檔 (Error 500)" },
            { type: "super", text: "🎁 驚喜掉落！限時免費領取" },
            { type: "info", text: "您的密碼即將在 3 天後過期，請盡快修改" },
            { type: "info", text: "已為您自動儲存草稿" },
            { type: "error", text: "拒絕存取：您沒有權限執行此操作" },
            { type: "super", text: "🏆 達成目標：連續登入 30 天" },
            { type: "warn", text: "有 3 筆未處理的訂單，請前往後台確認" },
            { type: "error", text: "偵測到異常的登入活動，已自動鎖定" },
            { type: "warn", text: "API 呼叫頻率已達上限，請稍後再試" },
            { type: "super", text: "🌟 恭喜抽中 SSR 級珍貴道具！" },
            { type: "info", text: "最後一則訊息：提醒您今天還有未完成的待辦事項" }
        ];

        let count = 0;

        const sendNext = () => {
            if (count >= 20) {
                console.log("✅ 20 個測試訊息已全數發送完畢！");
                return;
            }

            const currentMsg = examples[count];

            // 隨機附上可點擊的事件來測試 Pointer Event 與 Hover 效果
            const onClick = Math.random() > 0.5 ? () => console.log(`👉 你點擊了第 ${count + 1} 則訊息: ${currentMsg.text}`) : null;

            // 呼叫我們剛剛建立在 BaseComponent 的函式
            this.showAppMessageQueue(currentMsg.text, currentMsg.type, onClick);

            count++;

            // 隨機產生 2000ms ~ 5000ms 的間隔時間 (2~5秒)
            const nextDelay = Math.floor(Math.random() * 3001) + 2000;

            // 排程下一個訊息
            setTimeout(sendNext, nextDelay);
        };

        // 立刻啟動第一則測試
        sendNext();
    };
}

export default BaseComponent;
