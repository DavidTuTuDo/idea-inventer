import { utiller as Util } from '../index.js';
import { configerer } from "configerer";
import _ from 'lodash';

/** author:明悅
 * create time:Sun Oct 13 2024 02:27:45 GMT+0800 (Taipei Standard Time)


 * ======================================================================
 * 知識點：
 * .$eval = evaluate :取得element元素底下的資料
 * $ 是拿到 reference
 * $$ 是拿到 element list
 * sample  const items = await page.$$eval('#gl-container > *', elements => {
 * sample  const titles = await page.$$eval('#gl-container .gl-title', elements => {
 * '#'=>代表id | '.'=>代表class | <tag不用加前綴  #id > .className > tag
 * innerText => <tag class='class' >{innerText}<tag>
 * ========================================================================
 * 知識點：
 * 用 > 表示「直接子元素」例如 page.$$('#navbar > #header> .computer_nav > .header_logo');
 * 不用 > 可以「跳過中間階級」page.$$('#navbar .header_logo');
 * ========================================================================
 * 知識點：
 * class="three-dimension-menu qk-dropdown_menu qk-bg--nav_menu_bg qk-pos--abs qk-display--flex"
 * 方法1:
 * const rows = await page.$$('.three-dimension-menu');
 * 方法2:
 * const rows = await page.$$('.three-dimension-menu.qk-dropdown_menu');
 * 方法3:
 * const rows = await page.$$('[class="three-dimension-menu qk-dropdown_menu qk-bg--nav_menu_bg qk-pos--abs qk-display--flex"]');
 *
 *
 * ========================================================================
 *   等待元素加载，确保页面中的 #dg-detail > #add-to-list 存在
 *   await page.waitForSelector('#dg-detail > #add-to-list');
 * ======================================================================== locator是最新推薦的做法
 * 知識點：
 * import puppeteer from 'puppeteer';
 * Or import puppeteer from 'puppeteer-core';
 *
 * Launch the browser and open a new blank page
 * const browser = await puppeteer.launch();
 * const page = await browser.newPage();
 *
 * Navigate the page to a URL.
 * await page.goto('https://developer.chrome.com/');
 *
 * Set screen size.
 * await page.setViewport({width: 1080, height: 1024});
 *
 * Type into search box.
 * await page.locator('.devsite-search-field').fill('automate beyond recorder');
 *
 * Wait and click on first result.
 * await page.locator('.devsite-result-item-link').click();
 *
 * Locate the full title with a unique string.
 * const textSelector = await page
 *   .locator('text/Customize and automate')
 *   .waitHandle();
 * const fullTitle = await textSelector?.evaluate(el => el.textContent);
 *
 * Print the full title.
 * console.log('The title of this blog post is "%s".', fullTitle);
 *
 * await browser.close();
 * ======================================================================== locator的doc
 * 知識點：
 * https://pptr.dev/api/puppeteer.locator/
 * https://pptr.dev/guides/page-interactions#locators
 * networkidle 和 dom render的時間點不一樣，要確保dom上可以抓到要記得locator().wait()
 *
 * ======================================================================== 完美的解釋
 * 知識點：
 * Sometimes you know that the elements are already on the page. In that case, Puppeteer offers multiple ways to find an element or multiple elements matching a selector. These methods exist on Page, Frame and ElementHandle instances.
 * page.$() returns a single element matching a selector.
 * page.$$() returns all elements matching a selector.
 * page.$eval() returns the result of running a JavaScript function on the first element matching a selector.
 * page.$$eval() returns the result of running a JavaScript function on each element matching a selector.
 *
 * ======================================================================== 完美的解釋
 * browser:
 * puppeteer.launch()之後預設的瀏覽器，可以newPage() 可以 createBrowserContext()
 * context：
 * 像是一個像是虛擬browser，它可以繼續newPage()，｜不和browser共享session、cookie...｜
 * 就像為開啟無恆模(都有自己獨立的cookie,session...)，不關掉前context[await context.close()]，由context.newPager將共用context裡的...session cookie
 * page:
 * 導航與等待:
 * page.goto(url, options)導航到指定的 URL，是使用頻率最高的函式之一。
 * page.waitForSelector(selector, options)等待指定的 CSS 選擇器出現在 DOM 中，是確保網頁加載完成的關鍵。
 * page.waitForNavigation(options)等待頁面完成一次完整的導航（例如點擊按鈕後）。
 * page.waitForTimeout(milliseconds)暫停執行特定毫秒數（不推薦用於等待元素，但可用於除錯）。
 * page.waitForFunction(pageFunction, options)等待頁面內的 JavaScript 函數返回 true，用於等待複雜的非同步條件。
 * 互動與輸入
 * page.click(selector, options)",點擊指定的元素。
 * page.type(selector, text, options)",在指定的輸入框或元素中輸入文字。
 * page.keyboard.press(key),"模擬按下單一按鍵 (例如 Enter, Tab)。"
 * page.focus(selector),將焦點設置在指定的元素上。
 * page.select(selector, ...values)",選擇 <select> 下拉式選單中的一個或多個選項。
 * 數據抓取與程式碼執
 * page.evaluate(pageFunction, ...args)",在瀏覽器的環境中執行 JavaScript 函數。您可以用它來獲取頁面內的變數、計算結果或操作 DOM。
 * page.$(selector),類似於 document.querySelector()，返回找到的第一個元素句柄。
 * page.$$(selector),類似於 document.querySelectorAll()，返回所有找到的元素句柄陣列。
 * page.$eval(selector, pageFunction, ...args)",常用於數據抓取。 尋找元素並將該元素傳入函數執行（例如獲取元素的 textContent）。
 * page.content(),返回整個頁面的 HTML 內容 (字串)。
 * 調試與文件輸出
 * page.screenshot(options),截取頁面畫面的圖片 (PNG/JPEG)。
 * page.pdf(options),將頁面內容輸出為 PDF 文件。
 * page.emulate(options),模擬特定設備（例如 iPhone X）的 User Agent 和 Viewport。
 * 頁面配置
 * page.setViewport(options),設定頁面的寬度和高度（您已提及）。
 * page.setUserAgent(userAgent),設置頁面發送的 User-Agent 字串。
 * page.setExtraHTTPHeaders(headers),設置該頁面發送的額外 HTTP 請求頭 (Headers)。
 * ======================================================================
 * 知識點：(puppeteer對於selector概念)
 * 例如：<div class='page sidebar' id='mainBody' /div>
 *
 * '#'  =>用在id        表示法 #mainBody
 * '.'   =>用在class   表示法 .page.sidebar
 * ''    =>用在tag      表示法 div
 *
 * selector 的範例(string) '#main .content div'
 * 進階用法(nth-child語法) =>'table.product-list tbody tr:nth-child(1) a'
 * 想要指到某個element => await page.$('${selector}')
 * (1個$)
 * 想要拿到到某個elements(陣列) await page.$$('${selector} > *') =>['<p />','<a />']
 * (2個$，然後 '${selector} > *')
 *
 * 有fetchAttributesOfEl 去拿到 <tag id='123' data-name='shit' data-id='1' />innerText  </tag>
 * 也可以自己用await element.eval(el, attrMap = {id:123,data-name:shit}) => el.getAttribute()
 * ======================================================================
 * 知識點：關於 page.$$('#main .sub > *|div')
 * 例如：<div class:'dddd'><a href='123' />
 * 如果是'... > *'    => selector: 'a'
 * 如果是'... > div'  => selector: '.dddd > a'
 * 注意再拿子元素做事時的小細節！
 *
 * selector選項裡：
 * ======================================================================
 * 以下是一些在 Puppeteer 中常用的、且功能強大的選擇器類型：
 *
 * ## ✨ 基礎選擇器 (Basic Selectors)
 *
 * 這些是最常見和最簡單的選擇器。
 *
 * * **類型 (Type) 選擇器:** 選擇所有指定 **標籤名稱** 的元素。
 *     * 範例：`a` (選擇所有 `<a>` 標籤)
 * * **類別 (Class) 選擇器:** 選擇具有特定 **CSS class** 的元素。
 *     * 範例：`.button-primary` (選擇所有 class 包含 `button-primary` 的元素)
 * * **ID 選擇器:** 選擇具有特定 **ID** 的元素 (ID 在一個頁面中應是唯一的)。
 *     * 範例：`#login-form` (選擇 ID 為 `login-form` 的元素)
 * * **通用 (Universal) 選擇器:** 選擇所有元素。
 *     * 範例：`*`
 *
 * ---
 *
 * ## 🔗 組合器 (Combinators)
 *
 * 組合器用於描述兩個選擇器之間的**關係**，讓您能根據元素在 DOM 樹中的位置來選擇目標。
 *
 * * **後代 (Descendant) 選擇器 (空格):** 選擇作為另一個元素 **後代** 的所有元素 (可以隔代)。
 *     * 範例：`#menu a` (選擇在 ID 為 `menu` 的元素內的所有 `<a>` 標籤)
 * * **子元素 (Child) 選擇器 (`>`):** 選擇作為另一個元素 **直接子元素** 的所有元素 (不能隔代)。
 *     * 範例：`ul > li` (選擇作為 `<ul>` 直接子元素的 `<li>` 標籤)
 * * **相鄰同級 (Adjacent Sibling) 選擇器 (`+`):** 選擇緊接在另一個元素**後面**的同級元素。
 *     * 範例：`h2 + p` (選擇緊接在 `<h2>` 後面的第一個 `<p>` 標籤)
 * * **通用同級 (General Sibling) 選擇器 (`~`):** 選擇跟在另一個元素**後面**的**所有**同級元素。
 *     * 範例：`h2 ~ p` (選擇跟在 `<h2>` 後面的所有 `<p>` 標籤)
 *
 * ---
 *
 * ## 📐 屬性選擇器 (Attribute Selectors)
 *
 * 根據 HTML 元素的 **屬性** 及其 **值** 來選擇元素。
 *
 * * **精確匹配:** 選擇具有特定屬性且其值**完全等於**指定值的元素。
 *     * 範例：`[target="_blank"]` (選擇 `target` 屬性值為 `_blank` 的元素)
 * * **包含子字串 (`*=`):** 選擇屬性值**包含**指定子字串的元素。
 *     * 範例：`[class*="icon-"]` (選擇 class 中包含 `icon-` 的元素)
 * * **開頭匹配 (`^=`):** 選擇屬性值**以**指定子字串**開頭**的元素。
 *     * 範例：`[href^="/user/"]` (選擇 `href` 以 `/user/` 開頭的連結)
 * * **結尾匹配 (`$=`):** 選擇屬性值**以**指定子字串**結尾**的元素。
 *     * 範例：`[src$=".png"]` (選擇 `src` 以 `.png` 結尾的圖片)
 * * **具有屬性:** 選擇**具有**特定屬性的元素，不論其值為何。
 *     * 範例：`a[disabled]` (選擇具有 `disabled` 屬性的 `<a>` 標籤)
 *
 * ---
 *
 * ## 🏷️ 偽類 (Pseudo-classes)
 *
 * 偽類用於根據元素在頁面中的**狀態**、**位置**或**其他非結構性特徵**來選擇元素。
 *
 * * **表單狀態相關:**
 *     * `:checked` (選擇被選中的複選框或單選按鈕)
 *     * `:disabled` (選擇被禁用的表單元素)
 *     * `:enabled` (選擇可用的表單元素)
 * * **連結/使用者行為相關:**
 *     * `:hover`, `:active`, `:focus` (Puppeteer 較少用於選擇，常用於模擬行為)
 * * **結構性偽類 (類似 $`:nth-child`$ 和 $`:nth-of-type`$):**
 *     * `:first-child` (選擇父元素的第一個子元素)
 *     * `:last-child` (選擇父元素的最後一個子元素)
 *     * `:first-of-type` (選擇父元素中該類型標籤的第一個)
 *     * `:last-of-type` (選擇父元素中該類型標籤的最後一個)
 *     * `:only-child` (選擇是父元素**唯一**子元素的元素)
 *     * `:not(selector)` (選擇**不匹配**括號內選擇器的元素 - 非常有用!)
 *         * 範例：`div:not(.hidden)` (選擇 class 不包含 `hidden` 的 `<div>`)
 *
 * ---
 *
 * ## 🌐 Puppeteer 專有的 XPath 選擇器
 *
 * 雖然 Puppeteer 主要使用 CSS 選擇器，但它也提供了專門的方法來使用 **XPath** (XML Path Language)，這在某些情況下，尤其是當您需要根據**文本內容**或更複雜的 DOM 結構關係來選擇元素時，會非常有用。
 *
 * * `page.waitForXPath(xpath)`
 * * `page.$x(xpath)`
 *
 * **XPath 範例:**
 * * `//button[text()='Submit']` (選擇文本內容為 `Submit` 的所有 `<button>`)
 * * `//div[contains(@class, 'card')]` (選擇 class 中包含 `card` 的所有 `<div>`)
 *
 * XPath 的選擇能力比 CSS 選擇器更強大，建議在 CSS 選擇器無法滿足需求時使用。
 *
 * 您主要需要熟練掌握的是 **ID**、**Class**、**組合器** (空格和 $`>`$)、**屬性選擇器**和 **`:not()`** 偽類，這足以應對絕大多數的網頁抓取任務。
 *
 * ---
 *
 * **❓ 您是否有特定的元素或網頁結構想要定位，我可以幫您設計一個選擇器嗎？**
 *
 *
 */
class Spider {

    browser = null;

    puppeteer;

    visible = true;

    /** 需要puppeteer的專案要自己在package.json 加上dependencies: "puppeteer":  */
    constructor(puppeteer, { visible = false, host = '' }) {
        this.puppeteer = puppeteer;
        this.visible = visible;
        this.host = host;
    }



    establishBrowserCore = async () => {
        const browser = await this.puppeteer.launch({
            headless: !this.visible
        });
        for (const page of await browser.pages()) await page.close();
        return browser;
    };

    getCurrentBrowser = () => this.browser;

    /**
     * 啟動puppeteer的必備必備！
     * @returns {Promise<void>}
     */
    initial = async () => {
        this.browser = await this.establishBrowserCore();
    };

    /** 取得桌機開啟時的網頁RWD狀態
     * @param browser 原則上使用puppeteer.lunch() 出來的預設瀏覽器，除非有特殊需求
     * @param href 就是page預設打開網址 例如：'https://google.com'
     * @param type=['desktop','mobile','tablet'] 為蛇設定viewport
     * @param timeout page讀取頁面的timeout時間，太久就會報錯
     * @param incognito 是否啟用無痕模式
     * @param cookies=[] 開啟頁面預載入一個cookie(很多社群都把token/session auth放在cookies)
     * @returns page
     * */
    getPuTeerPage = async ({ browser = this.browser, type = 'desktop', incognito = false, href = '', timeout = 0, cookies }) => {
        let page = undefined;
        if (incognito) {
            const context = await browser.createBrowserContext();
            page = await context.newPage();
        } else {
            page = await browser.newPage();
        }

        await this.randomViewport({ page, type });

        /** inject cookies 到 page裡面*/
        if (!Util.isUndefinedNullEmpty(href) && _.size(cookies) > 0) {
            await page.goto(href, { waitUntil: 'domcontentloaded' });
            await page.setCookie(...cookies);
        }

        if (!Util.isUndefinedNullEmpty(href)) await page.goto(href, { waitUntil: 'networkidle2', timeout });
        return page;
    };

    /**
     *  fingerprint機制 會記取裝置的長寬高，所以要隨機設定
     *  @param page puppeteer browser|context.newPage的page
     * @param type=['desktop','mobile','tablet'] 為蛇設定viewport
     */
    randomViewport = async ({ page, type = 'desktop' }) => {
        const width = Util.getRandomValue(1080, 1920);
        const height = Util.getRandomValue(1680, 1920);
        await page.setViewport({ width, height });
    };

    /** 取得乾淨的無載入href的page
     * @returns page
     * */
    getPageOfSilent = async ({ browser = this.browser, type = 'desktop', timeout = 0 , cookies = []}) => {
        return this.getPuTeerPage({ browser, type, timeout, cookies });
    };

    /** 取得一個新的 page,context,記得要用this.close(instance)
     * @param browser 原則上使用puppeteer.lunch() 出來的預設瀏覽器，除非有特殊需求
     * @param href 就是page預設打開網址 例如：'https://google.com'
     * @param type=['desktop','mobile','tablet'] 為蛇設定viewport
     * @param timeout page讀取頁面的timeout時間，太久就會報錯
     * @param incognito 是否啟用無痕模式
     * @param cookies=[] 開啟頁面預載入一個cookie(很多社群都把token/session auth放在cookies)
     * @returns page */
    activatePage4Load = async ({ browser = this.browser, href = '', type = 'desktop', timeout = 0, incognito = false, cookies = [] }) => {
        return this.getPuTeerPage({ browser, href, type, timeout, incognito, cookies });
    };

    /**
     * 啟動一個定時器，週期性地讓 Puppeteer 頁面 (page) 取得焦點。
     * @param {import('puppeteer').Page} page - 要操作的 Puppeteer 頁面物件。
     * @param {number} interval - 獲取焦點的時間間隔（毫秒）。
     * @param {string} href - 頁面網址 (用於日誌記錄)。
     * @returns {NodeJS.Timeout|null} - 返回定時器的 ID，如果未啟用則返回 null。
     */
    startPageFocusTimer = (page, interval, href) => {
        if (!page || interval <= 0) {
            return null;
        }

        const focusTimer = setInterval(() => {
            // 檢查頁面是否仍然開啟 (防止操作已關閉的頁面)
            if (!page.isClosed()) {
                page.bringToFront().catch(error => {
                    // 如果在 bringToFront 時出錯，通常表示頁面正在關閉或連線中斷
                    if (!page.isClosed()) {
                        console.error(`[Focus Error]: 無法將 ${href} 帶到前景: ${error.message}`);
                    }
                    // 出錯後主動停止定時器，避免記憶體洩漏
                    if (focusTimer) {
                        clearInterval(focusTimer);
                        console.log(`[Focus]: ${href} 發生錯誤，定時器已停止。`);
                    }
                });
            } else {
                // 如果頁面已經關閉，清除定時器 (避免記憶體洩漏)
                clearInterval(focusTimer);
                console.log(`[Focus]: ${href} 已關閉，定時器已清除。`);
            }
        }, interval);

        console.log(`[Focus]: ${href} 已啟動每 ${interval}ms 獲取焦點定時器。`);
        return focusTimer;
    };

    /** 取得一個新的 {page,context} 並且執行fetcher
     * @param browser 原則上使用puppeteer.lunch() 出來的預設瀏覽器，除非有特殊需求
     * @param href 就是page預設打開網址 例如：'https://google.com'
     * @param type=['desktop','mobile','tablet'] 為蛇設定viewport
     * @param timeout page讀取頁面的timeout時間，太久就會報錯
     * @param incognito 是否啟用無痕模式
     * @param fetcher=async(page) 直接把task包進來頁面處理，免得每次都要newPage(),page.close()/context.close()
     * @param cookies=[] 開啟頁面預載入一個cookie
     * @param taskTimeoutMs=300000 (新增) 任務最大執行時間（毫秒）。預設 5 分鐘 (300000ms)。
     * @param enableTaskTimeout=false (新增) 是否啟用任務執行時間限制。
     * @returns {page}|page */
    activatePage4Task = async ({
                                   browser = this.browser,
                                   href = '',
                                   type = 'desktop',
                                   timeout = 0,
                                   fetcher = async (page) => true,
                                   incognito = false,
                                   cookies = [],
                                   taskTimeoutMs = 300000, // 5 分鐘
                                   enableTaskTimeout = false // 預設關閉
                               }) => {
        const page = await this.activatePage4Load({ browser, href, type, timeout, incognito, cookies });

        let execution = undefined;
        let focusTimer = null;
        let timeoutTimer = null;

        // 啟動定時獲取焦點功能 (保留原有邏輯)
        focusTimer = this.startPageFocusTimer(page, Util.getRandomValue(5000, 10000), href);

        // 啟動任務逾時定時器 (新邏輯)
        let timeoutPromise = null;
        if (enableTaskTimeout && taskTimeoutMs > 0) {
            const timeoutResult = this.startTaskTimeoutTimer(taskTimeoutMs, href);
            timeoutPromise = timeoutResult.timeoutPromise;
            timeoutTimer = timeoutResult.timerId;
        }

        try {
            /** 執行網頁要執行的task */
            const fetcherPromise = fetcher(page);

            if (timeoutPromise) {
                // 使用 Promise.race 讓 fetcher 任務與逾時 Promise 競賽
                execution = await Promise.race([fetcherPromise, timeoutPromise]);
            } else {
                // 未啟用逾時，直接等待 fetcher 任務完成
                execution = await fetcherPromise;
            }

        } catch (error) {
            // 如果是 fetcher 拋出錯誤，或 timeoutPromise 逾時拒絕，都會進入此處
            console.error(`${href} 4T抓取失敗: ${error.message}`);

        } finally {
            // 確保所有定時器被清除 (避免記憶體洩漏)
            if (focusTimer) {
                clearInterval(focusTimer);
            }
            if (timeoutTimer) {
                clearTimeout(timeoutTimer);
                console.log(`[Timeout]: ${href} 的任務逾時定時器已清除。`);
            }

            await this.close(page);
        }
        return execution;
    };

    /**
     * 啟動一個定時器，用於限制任務的總執行時間。
     * 當時間超過 ms 後，會拒絕 (Reject) 返回的 Promise，中斷 Promise.race。
     * @param {number} ms - 任務逾時時間（毫秒）。
     * @param {string} href - 頁面網址 (用於日誌記錄)。
     * @returns {{timeoutPromise: Promise<never>, timerId: NodeJS.Timeout}} - 包含逾時 Promise 和定時器 ID。
     */
    startTaskTimeoutTimer = (ms, href) => {
        let timerId;
        const timeoutPromise = new Promise((_, reject) => {
            timerId = setTimeout(() => {
                console.error(`[Timeout]: ${href} 任務執行時間超過 ${ms}ms，強制中斷。`);
                // 拋出錯誤，讓 Promise.race 進入 catch 區塊
                reject(new Error(`Task execution timed out after ${ms}ms.`));
            }, ms);
        });

        return { timeoutPromise, timerId };
    };

    /** 呼叫多可能自行帶入page，延續使用page的行為，若沒有則建立一組context page
     * @page 客端帶上來的page(puppeteer Page)
     * @returns page
     * */
    auto = async ({ page, incognito = false, href, timeout = 0 }) => {
        if (this.isPuTeerPage(page)) {
            if (!Util.isUndefinedNullEmpty(href)) await page.goto(href, { waitUntil: 'networkidle2', timeout });
            await this.randomViewport(page);
            return page;
        }
        return this.activatePage4Load({ incognito, timeout, href });
    };

    isPuTeerPage = (page) => page?.focus;

    /**
     * 專門處理那種點擊下一頁的網頁設計
     * @param page - Puppeteer 的元素句柄（ElementHandle）如果有帶入page，就會沿用page所有的行為
     * @param href - 包含下一頁的那種網頁(91譜歌手)
     * @param fetcher - 如何解析出每一頁的elements
     * @param selectorOfPagingN -  [上一頁,1,2,3,4,5,6,7,8,9,10,下一頁] 的選擇器描述 例如 '.rlist #page > *'
     * @param signOfPagingN - 每種網頁的'下一頁'字串都不一樣
     * @param incognito 是否啟用無痕模式
     * @param timeout page讀取的逾時 million-seconds
     * @returns {Promise<*[]>} 所有頁面(1~20)跑完之後的[...elements]
     */
    async fetchElementsTilPageEnd({ page = undefined, href = '', fetcher = async (page) => [], selectorOfPagingN, signOfPagingN = '»', incognito = false, timeout = 0 }) {
        const p = await this.auto({ page, incognito, href, timeout });
        /**
         * do...while 循環說明
         *
         * 執行順序：
         * ┌─ 進入循環
         * │
         * ├─ do { ... } 區塊
         * │  ├─ 第一步：fetchProducts() → 取得當前頁面的產品 ✅
         * │  └─ 第二步：allProducts.concat() → 將產品加入總列表 ✅
         * │
         * └─ while (條件判斷)
         *    ├─ clickNextPage() → 點擊下一頁按鈕
         *    │  └─ 返回 true：有下一頁 → 回到 do 重新執行
         *    │  └─ 返回 false：沒有下一頁 → 停止循環
         *    └─ Util.syncDelay(10) → 延遲 10ms，避免頁面加載過快
         *
         * 特點：
         * - do 區塊一定會執行至少一次（所以第一頁不會被跳過）
         * - while 判斷是否繼續（根據是否有下一頁）
         * - 適合「先做一次，再判斷是否重複」的場景
         */
        let elements = [];
        try {
            do {
                await Util.syncDelay(10);
                // ✅ 第一步：取得當前頁面的所有產品
                const items = await fetcher(p);
                // ✅ 第二步：將當前頁的產品加入總列表
                elements = elements.concat(items);
                // ⬇️ while 條件判斷
                // - clickNextPage(page) 會點擊「下一頁」按鈕
                // - 如果成功點擊且有下一頁，返回 true，do 區塊會重新執行
                // - 如果沒有下一頁，返回 false，循環停止
                // - Util.syncDelay(10) 延遲 10ms，讓頁面有時間加載
            } while (await this.clickNextPageTilEnd({ page: p, selector: selectorOfPagingN, sign: signOfPagingN, timeout }));
        } catch (error) {
            console.error(`${href} tilPE抓取失敗: ${error.message}`);
            return [];
        } finally {
            // ✅ 關鍵：確保頁面被關閉
            await this.close(p);
        }
        return elements;
    }

    /**
     * 尋找到選擇器(selector)指定的陣列->點擊[下一頁=>${sign}]按鈕
     * @param {Page} page - Puppeteer Page 實例
     * @param {string} selector - 頁面按鈕容器選擇器
     * @param {string} sign 判定下一頁的標誌，每個網頁表示下一頁的字符表示 ex:'下一頁','next'
     * @returns {Promise<boolean>} 成功返回 true，失敗返回 false
     * @example
     * const success = await this.clickNextPage(page);
     */
    clickNextPageTilEnd = async ({ page, selector = `.pagination-container .pagination > *`, sign = '»' }) => {
        try {
            // ==================== 第一步：取得所有頁面按鈕 ====================
            const paginationItems = await page.$$(selector);

            if (!paginationItems || paginationItems.length === 0) {
                console.log(`⚠️ 找不到頁面按鈕們`);
                return false;
            }
            console.log(`📍 找到 ${paginationItems.length} 個頁面按鈕`);
            // ==================== 第二步：從右到左尋找下一頁按鈕（${sign}） ====================
            let nextPageButton = null;
            for (const item of [...paginationItems].reverse()) {
                const buttonText = await this.fetchAttributeOfEl(item, (await this.isElementTagBy(item, 'a')) ? '' : 'a', 'innerText');

                if (buttonText === sign) {
                    nextPageButton = item;
                    break;
                }
            }
            if (!nextPageButton) {
                console.log(`⚠️ 找不到下一頁按鈕 (${sign})`);
                return false;
            }

            console.log(`✅ 找到下一頁按鈕`);

            // ==================== 第三步：檢查下一頁按鈕是否禁用 ====================
            const isDisabled = await nextPageButton.evaluate(el => el.disabled || el.classList.contains('disabled'));

            if (isDisabled) {
                console.log(`⚠️ 下一頁按鈕已禁用 (已是最後一頁)`);
                return false;
            }

            // ==================== 第四步：點擊下一頁按鈕 ====================
            console.log(`🖱️ 點擊下一頁按鈕...`);
            await this.clickNextAndWait4Page(page, nextPageButton, { selectorOfAnchor: selector });

            console.log(`✅ 成功翻到下一頁`);
            return true;

        } catch (error) {
            console.log(`❌ 點擊下一頁出錯: ${error.message}`);
            return false;
        }
    };

    /**
     * 獲取元素快照：獲取元素的 outerHTML 作為其通用指紋
     * @param {import('puppeteer').Page} page
     * @param {string} selector
     * @returns {Promise<string|null>} 元素的 outerHTML 或 null
     */
    getElementSnapshot = async (page, selector) => {
        try {
            // 先等待元素出現，避免快照失敗
            const element = await page.waitForSelector(selector, { timeout: 1000 });
            return await page.evaluate(el => el.outerHTML, element);
        } catch (e) {
            // 元素不存在或超時，返回 null
            return null;
        }
    };

    /**
     * 點擊元素並智能等待。（通用版本：同時競賽 API 響應、導航和 DOM 變化）
     *
     * @param {import('puppeteer').Page} page - Puppeteer Page 物件
     * @param {import('puppeteer').ElementHandle} element - 點擊的 ElementHandle
     * @param {object} options - 選項物件
     * @param {string} [options.selectorOfAnchor=null] - 用於偵測內容是否變化的 DOM 錨點選擇器 (如表格的第一行或數據容器)。若為 null 或空，則不進行 DOM 變化競賽。
     * @param {number} [options.timeoutOfApiWatcher=500] - 網路監聽的超時時間（ms）。超過此時間未偵測到 API 即停止監聽。
     * @param {number} [options.timeoutOfNavigation=30000] - 長等待（page.waitForResponse/Navigation/Function）的超時時間（ms）。
     * @param {boolean} [options.specificity=false] - 是否使用更廣泛的網路資源類型來偵測 API。
     */
    clickNextAndWait4Page = async (
        page,
        element, {
            selectorOfAnchor = null, // 移入 options
            timeoutOfApiWatcher = 500,
            timeoutOfNavigation = 30000,
            specificity = false
        } = {}
    ) => {
        let apiDetected = false;
        let detectedApiUrl = null;
        let oldSnapshot = null; // 儲存點擊前的 DOM 快照
        const NO_CHANGE_ERROR = '[已到最後一頁]後並未re-render頁面列表(例：...18 -> 19[current]...)';
        const DOM_UPDATE_DELAY_MS = 365; // 快速跳出延遲時間

        // API 資源類型定義
        const API_RESOURCES = ['xhr', 'fetch'];
        const EXPANDED_API_RESOURCES = ['xhr', 'fetch', 'websocket', 'eventsource', 'other'];
        const API = specificity ? EXPANDED_API_RESOURCES : API_RESOURCES;

        // 定義 Request 監聽函數
        const requestListener = request => {
            if (API.includes(request.resourceType())) {
                if (!apiDetected) { // 只記錄第一個 API
                    apiDetected = true;
                    detectedApiUrl = request.url();
                    page.off('request', requestListener);
                    console.log(`📡 偵測到 API 請求 (${request.resourceType()}): ${detectedApiUrl}`);
                }
            }
        };

        console.log(`🖱️ 執行點擊...`);

        // ==================== 步驟 1: 獲取快照 ====================
        if (selectorOfAnchor) {
            oldSnapshot = await this.getElementSnapshot(page, selectorOfAnchor);
            if (oldSnapshot) {
                console.log(`📸 成功獲取錨點快照 (${selectorOfAnchor}，長度: ${oldSnapshot.length})`);
            } else {
                console.log(`⚠️ 無法獲取錨點快照，DOM 變化偵測將被忽略。`);
            }
        }

        await element.click();

        // ==================== 步驟 2 & 3：監聽 API (由 timeoutOfApiWatcher 控制超時) ====================
        page.on('request', requestListener);

        try {
            await Promise.race([
                // 競賽條件：API 偵測和 timeoutOfApiWatcher
                new Promise(resolve => {
                    let checkInterval;
                    const timeoutId = setTimeout(() => {
                        clearInterval(checkInterval);
                        if (!apiDetected) resolve('TIMEOUT_NO_API');
                    }, timeoutOfApiWatcher);

                    checkInterval = setInterval(() => {
                        if (apiDetected) {
                            clearTimeout(timeoutId);
                            clearInterval(checkInterval);
                            resolve('API_FIRED');
                        }
                    }, 50);
                })
            ]);

        } catch (e) {
            console.warn('Race 過程中發生錯誤:', e.message);
        }

        // 確保在函數結束前停止所有剩餘的 request 監聽
        page.off('request', requestListener);

        // ==================== 步驟 4：長等待邏輯 (兼容 AJAX 和 非 AJAX 導航) ====================

        if (apiDetected && detectedApiUrl) {
            // 偵測到 API 請求，切換到同時等待 Response, Navigation, 和 DOM 變化
            console.log(`✅ 偵測到 API，切換至長等待 (兼容 AJAX/導航/DOM，${timeoutOfNavigation}ms)...`);

            const raceConditions = [
                // 條件 A: 等待特定的 API 響應完成 (處理 AJAX 更新)
                page.waitForResponse(response =>
                        response.url() === detectedApiUrl && response.status() >= 200 && response.status() < 300,
                    { timeout: timeoutOfNavigation }
                ),

                // 條件 B: 等待頁面導航完成 (處理非 AJAX 導航)
                page.waitForNavigation({
                    waitUntil: 'networkidle2',
                    timeout: timeoutOfNavigation
                }).catch(() => {
                    return 'NAVIGATION_TIMEOUT';
                })
            ];

            // 條件 C: 只有在成功獲取快照時，才加入 DOM 變化競賽
            if (oldSnapshot) {
                raceConditions.push(
                    page.waitForFunction(
                        (selector, oldSnap) => {
                            const el = document.querySelector(selector);
                            // 判斷條件：元素不存在、或存在但 outerHTML 不等於舊快照
                            return !el || el.outerHTML !== oldSnap;
                        },
                        // 使用與其他條件相同的長超時，讓最快的條件獲勝
                        { timeout: timeoutOfNavigation },
                        selectorOfAnchor,
                        oldSnapshot
                    ).catch(e => {
                        // 如果 DOM 變化檢查超時，我們不拋出錯誤，讓 API/導航繼續競爭
                        if (e.name === 'TimeoutError') return 'DOM_CHANGE_TIMEOUT';
                        throw e; // 拋出其他非超時錯誤
                    })
                );
            }

            try {
                await Promise.race(raceConditions);
                console.log(`✅ 等待條件滿足（API 響應、頁面導航或 DOM 變化已完成）。`);

            } catch (e) {
                if (e.name === 'TimeoutError') {
                    console.log(`⚠️ 長等待超時，API/導航可能發生錯誤或頁面載入極慢。`);
                } else {
                    throw e;
                }
            }

        } else {
            // 沒有偵測到 API (timeoutOfApiWatcher 結束)

            // 只有在提供了錨點快照時，我們才進行最終檢查，並拋出 NO_CHANGE_ERROR
            if (oldSnapshot) {
                const newSnapshot = await this.getElementSnapshot(page, selectorOfAnchor);

                if (newSnapshot === oldSnapshot) {
                    // 如果沒有 API/導航，且快照沒有改變，則視為已是最後一頁
                    console.log(`✅ 未偵測到 API/導航，且 DOM 錨點無變化。拋出未變化錯誤。`);
                    throw new Error(NO_CHANGE_ERROR);
                }
                // 即使沒有 API，但 DOM 變了，我們給予 DOM 延遲等待
                console.log(`✅ 未偵測到 API，但 DOM 錨點有變化，等待 DOM 穩定。`);

            } else {
                // 沒有 API，也沒有快照資訊，純粹等待延遲時間
                console.log(`✅ ${timeoutOfApiWatcher}ms 內未偵測到 API，無快照比對，等待 DOM 穩定。`);
            }

            // 執行 DOM 延遲等待
            await Util.syncDelay(DOM_UPDATE_DELAY_MS);
        }
    };

    wait4Until = async (page, { timeout = 0 } = {}) => {
        await page.waitForNavigation({
            waitUntil: 'networkidle2', timeout
        }).catch(() => {
            // 忽略超時錯誤
        });
    };


    /** 向下載入的情況頁面，應該要往下滑到完全都載入完畢後，一次拿elements
     * @return [...object] 透過fetcher和page可以拿到的制式化捲軸資料
     * */
    fetchElementsTilPageScrollEnd = async ({
                                               page, href = '', fetcher = async (page) => {
        }, stringOfLoadingSelector, incognito = false, timeout
                                           }) => {

        const p = await this.auto({ page, incognito, href, timeout });
        let execution = undefined;
        try {
            await fetcher(p);
            await this.scrollToBottomAndCheck(p, { stringOfLoadingSelector, fetcher });
            /** 完成載入到底部 */
            execution = await fetcher(p);
        } catch (error) {
            console.error(`${href} tilSE抓取失敗: ${error.message}`);
        } finally {
            await this.close(p);
        }
        return execution;
    };


    /**
     * 通用函數：從元素或其子元素上批量提取指定的屬性（支持自定義硬編碼值和物件合併）
     *
     * 此方法支援四種模式：
     * 1. 當 selector 為空時，直接從 element 本身批量獲取屬性
     * 2. 當 selector 有值時，先查找子元素，再從子元素批量獲取屬性
     * 3. 當 attrMap 的 value 以特殊前綴開頭時，使用硬編碼值而非從元素提取
     * 4. 當 attrMap 的 value 是物件時，直接合併到結果中
     *
     * 特殊前綴規則：
     * - `$$$` 開頭：數字類型的硬編碼值（例如：`$$$123` → 123）
     * - `###` 開頭：字符串類型的硬編碼值（例如：`###hello` → 'hello'）
     * - `@@@` 開頭：布林類型的硬編碼值（例如：`@@@true` → true）
     * - `{...}` 物件：直接合併到結果中（例如：`{ href: '123', id: '3' }` → 展開合併）
     *
     * 屬性查找優先級（非硬編碼值）：
     * - 優先查找 DOM 屬性（如 innerText、textContent、value、href 等）
     * - 若 DOM 屬性不存在，則查找 HTML 屬性（如 data-*、class 等）
     *
     * @param {ElementHandle} element - Puppeteer 的元素句柄（ElementHandle）
     * @param {string|null|undefined} selector - CSS 選擇器，用於查找子元素
     * @param {Object} attrMap - 屬性映射對象，格式為 { 結果key: 屬性名或硬編碼值或物件 }
     *                          - key: 返回對象中的鍵名（自定義命名）
     *                          - value:
     *                            - 普通屬性名：'data-id', 'href', 'innerText' 等
     *                            - 數字硬編碼：'$$$123', '$$$456.78'
     *                            - 字符串硬編碼：'###hello', '###some text'
     *                            - 布林硬編碼：'@@@true', '@@@false'
     *                            - 物件：{ key1: value1, key2: value2 }（直接合併）
     *
     * @returns {Promise<Object>} 包含所有屬性的物件
     *
     * @example
     * // 基本用法：從子元素中提取屬性
     * const result = await fetchAttributesOfEl(row, '.productClick', {
     *     id: 'data-id',
     *     name: 'data-name'
     * });
     * // 返回：{ id: '40088776', name: '1 淨柔雙效潔顏露' }
     *
     * @example
     * // 新功能：使用物件合併
     * const extraData = { href: '123', id: '3', category: 'electronics' };
     * const result = await fetchAttributesOfEl(row, '.productClick', {
     *     // 從元素提取
     *     productName: 'data-name',
     *     price: 'data-price',
     *
     *     // 物件合併（會展開所有屬性）
     *     ...extraData
     * });
     * // 返回：{
     * //   productName: '淨柔雙效潔顏露',
     * //   price: '299',
     * //   href: '123',        ← 來自 extraData
     * //   id: '3',            ← 來自 extraData
     * //   category: 'electronics' ← 來自 extraData
     * // }
     *
     * @example
     * // 混合使用所有類型
     * const metadata = {
     *     batchId: 'batch_001',
     *     version: '2.0'
     * };
     *
     * const result = await fetchAttributesOfEl(row, '.product-info', {
     *     // 從元素提取
     *     productId: 'data-id',
     *     productName: 'data-name',
     *
     *     // 數字硬編碼
     *     timestamp: `$$$${Date.now()}`,
     *     pageNumber: '$$$1',
     *
     *     // 字符串硬編碼
     *     source: '###WebScraper',
     *
     *     // 布林硬編碼
     *     isActive: '@@@true',
     *
     *     // 物件合併
     *     ...metadata
     * });
     * // 返回：{
     * //   productId: '123',
     * //   productName: '商品名',
     * //   timestamp: 1700000000000,
     * //   pageNumber: 1,
     * //   source: 'WebScraper',
     * //   isActive: true,
     * //   batchId: 'batch_001',  ← 來自 metadata
     * //   version: '2.0'         ← 來自 metadata
     * // }
     *
     * @example
     * // 動態物件合併
     * const userInfo = { userId: '999', userName: 'John' };
     * const sessionInfo = { sessionId: 'abc123', timestamp: Date.now() };
     *
     * const result = await fetchAttributesOfEl(element, '', {
     *     text: 'textContent',
     *     ...userInfo,
     *     ...sessionInfo,
     *     isProcessed: '@@@true'
     * });
     */
    fetchAttributesOfEl = async (element, selector, attrMap) => {
        let targetElement;

        // ✅ 處理 selector 為空的情況
        if (!selector || selector.trim() === '') {
            targetElement = element;
        } else {
            targetElement = await element.$(selector);

            if (!targetElement) {
                console.warn(`⚠️ 找不到元素: ${selector}`);
                return {};
            }
        }

        // ✅ 預處理 attrMap，分離不同類型的值
        const processedAttrMap = {};  // 需要從元素提取的屬性
        const hardcodedValues = {};   // 所有硬編碼和物件合併的值

        for (const [key, attrName] of Object.entries(attrMap)) {
            // ========================================
            // 檢查是否為物件類型（直接合併）
            // ========================================
            if (typeof attrName === 'object' && attrName !== null && !Array.isArray(attrName)) {
                // 這是一個物件，直接展開合併
                // 注意：這種情況通常不會發生，因為使用 ...obj 時會直接展開
                // 但為了完整性還是處理一下
                Object.assign(hardcodedValues, attrName);
                continue;
            }

            const attrStr = String(attrName);

            // ========================================
            // 檢查是否為數字硬編碼（$$$ 開頭）
            // ========================================
            if (attrStr.startsWith('$$$')) {
                const numberStr = attrStr.substring(3);
                const numberValue = parseFloat(numberStr);

                if (!isNaN(numberValue)) {
                    hardcodedValues[key] = numberValue;
                } else {
                    console.warn(`⚠️ 無法解析數字: ${attrStr}`);
                    hardcodedValues[key] = undefined;
                }
                continue;
            }

            // ========================================
            // 檢查是否為字符串硬編碼（### 開頭）
            // ========================================
            if (attrStr.startsWith('###')) {
                const stringValue = attrStr.substring(3);
                hardcodedValues[key] = stringValue;
                continue;
            }

            // ========================================
            // 檢查是否為布林硬編碼（@@@ 開頭）
            // ========================================
            if (attrStr.startsWith('@@@')) {
                const boolStr = attrStr.substring(3).toLowerCase().trim();

                let boolValue;
                if (boolStr === 'true' || boolStr === '1' || boolStr === 'yes' || boolStr === 'y' || boolStr === 'on') {
                    boolValue = true;
                } else if (boolStr === 'false' || boolStr === '0' || boolStr === 'no' || boolStr === 'n' || boolStr === 'off' || boolStr === '') {
                    boolValue = false;
                } else {
                    console.warn(`⚠️ 無法解析布林值: ${attrStr}，默認為 false`);
                    boolValue = false;
                }

                hardcodedValues[key] = boolValue;
                continue;
            }

            // 普通屬性，需要從元素提取
            processedAttrMap[key] = attrName;
        }

        // ✅ 在瀏覽器上下文中執行批量屬性查詢
        const extractedValues = await targetElement.evaluate((el, attrMap) => {
            const result = {};

            for (const [key, attrName] of Object.entries(attrMap)) {
                const value = el[attrName] !== undefined ? el[attrName] : el.getAttribute(attrName);
                result[key] = value !== null ? value : undefined;
            }

            return result;
        }, processedAttrMap);

        // ✅ 合併所有值：提取的值 + 硬編碼值
        // 注意：如果有重複的 key，後面的會覆蓋前面的
        return {
            ...extractedValues, ...hardcodedValues
        };
    };


    /**
     * 從元素或其子元素中獲取指定屬性的值
     *
     * 此方法支援兩種模式：
     * 1. 當 selector 為空時，直接從 element 本身獲取屬性
     * 2. 當 selector 有值時，先查找子元素，再從子元素獲取屬性
     *
     * 屬性查找優先級：
     * - 優先查找 DOM 屬性（如 innerText、textContent、value、href 等）
     * - 若 DOM 屬性不存在，則查找 HTML 屬性（如 data-*、class 等）
     *
     * @param {ElementHandle} element - Puppeteer 的元素句柄（ElementHandle）
     * @param {string|null|undefined} selector - CSS 選擇器，用於查找子元素
     *                                           - 若為空值（''、null、undefined），則直接操作 element 本身
     *                                           - 若有值，則在 element 內查找匹配的第一個子元素
     * @param {string} attrName - 要獲取的屬性名稱
     *                            - DOM 屬性：innerText、textContent、value、href、src 等
     *                            - HTML 屬性：data-*、class、id、alt 等
     *
     * @returns {Promise<any|undefined>}
     *          - 成功：返回屬性值（可能是字串、數字、布林值等）
     *          - 失敗：返回 undefined（找不到元素或屬性不存在）
     *
     * @example
     * // 獲取元素本身的文本內容
     * const text = await fetchAttributeOfEl(divElement, '', 'textContent');
     *
     * @example
     * // 獲取子元素的 href 屬性
     * const href = await fetchAttributeOfEl(parentElement, 'a.link', 'href');
     *
     * @example
     * // 獲取 data 屬性
     * const dataId = await fetchAttributeOfEl(element, '.item', 'data-id');
     */
    fetchAttributeOfEl = async (element, selector, attrName) => {
        let targetElement;

        // ✅ 當 selector 為空時，直接使用 element 本身
        if (!selector || selector.trim() === '') {
            targetElement = element;
        } else {
            targetElement = await element.$(selector);

            if (!targetElement) {
                console.warn(`⚠️ 找不到元素: ${selector}`);
                return undefined;
            }
        }

        // ✅ 回傳值或 undefined，不回傳 null
        return await targetElement.evaluate((el, attrName) => {
            // 優先嘗試 DOM 屬性（innerText、textContent、value 等）
            // 再嘗試 HTML 屬性（data-* 、href 等）
            const value = el[attrName] !== undefined ? el[attrName] : el.getAttribute(attrName);
            return value !== null ? value : undefined;  // null 改成 undefined
        }, attrName);
    };
    /**
     * 判斷 Puppeteer 元素是否為指定的 HTML 標籤
     *
     * 此函數在瀏覽器上下文中執行，檢查元素的 tagName 屬性
     *
     * @param {ElementHandle} element - Puppeteer 的元素句柄
     * @param {string} tagName - 要檢查的標籤名稱（不區分大小寫）
     *                          例如：'a', 'div', 'button', 'input' 等
     *
     * @returns {Promise<boolean>}
     *          - true: 元素是指定的標籤
     *          - false: 元素不是指定的標籤
     *
     * @example
     * // 檢查元素是否為 <a> 標籤
     * const isAnchor = await isElementTag(element, 'a');
     * if (isAnchor) {
     *     console.log('這是一個連結元素');
     * }
     *
     * @example
     * // 檢查元素是否為 <button> 標籤
     * const isButton = await isElementTag(element, 'button');
     */
    isElementTagBy = async (element, tagName) => {
        // ✅ 使用 evaluate 在瀏覽器上下文中執行
        // 獲取元素的 tagName 並與目標標籤比對
        return await element.evaluate((el, targetTag) => {
            // el.tagName 返回大寫的標籤名稱，例如：'A', 'DIV', 'BUTTON'
            // 統一轉換為小寫進行比對，確保不區分大小寫
            return el.tagName.toLowerCase() === targetTag.toLowerCase();
        }, tagName);
    };

    /**
     * 等待 Loading Bar 消失 (代表加載完成)。
     * 使用 { hidden: true } 選項，它能同時檢測元素被移除或樣式設為不可見。
     * @param {import('puppeteer').Page} page - Puppeteer Page 實例。
     * @param {string} selector - Loading Bar 的 CSS 選擇器 (例如 '.loading-spinner')。
     * @param {number} [timeout=10000] - 最大等待時間 (毫秒)。
     * @returns {Promise<boolean>} - 成功消失回傳 true，超時或錯誤回傳 false。
     */
    waitForLoadingToVanish = async (page, selector, timeout = 10000) => {
        if (!selector) return true; // 如果沒提供選擇器，直接當作成功

        try {
            // waitForSelector 搭配 hidden: true 是檢查「消失」的最佳實踐
            // 如果元素一開始就不在 DOM 中，它會立即 Resolve (這正是我們想要的)
            await page.waitForSelector(selector, {
                hidden: true,
                timeout
            });

            // console.log(`Loading 狀態 (${selector}) 已解除 (消失或隱藏)。`);
            return true;

        } catch (error) {
            // 這種情況通常是因為 Loading Bar 卡住一直沒消失，或者超時
            console.warn(`警告: Loading Bar ${selector} 在 ${timeout}ms 內未消失，將強制繼續執行。`);
            return false;
        }
    };

    /**
     * 針對複雜的塊級結構 (例如 <li> 內含 H1, H2, UL) 提取其主要文本塊。
     * 將每個直接子元素 (H1, SPAN, H2, UL) 的 textContent 視為一個獨立的行。
     * * @param {import('puppeteer').ElementHandle} elementHandle - 指向要解析的容器元素句柄 (例如 <li>.tab-con)。
     * @returns {Promise<Array<string>>} - 包含分塊後、已去重的純文本陣列。
     * * @example
     * // 假設 child 是指向上層元素，我們首先找到 .tab-con 元素
     * const tabConHandle = await child.$('.tab-con');
     * * if (tabConHandle) {
     * const textsArray = await extractBlockTexts(tabConHandle);
     * console.log(textsArray);
     * // 輸出範例: ["旗魚鬆五入組，加送旗魚鬆隨手包1入(官網限定)", "旗魚鬆-榮獲台中十大伴手禮...", ...]
     * }
     */
    extractBlockTexts = async (elementHandle) => {
        if (!elementHandle) {
            return [];
        }

        // 在瀏覽器環境中執行操作
        const results = await elementHandle.evaluate((element) => {
            const texts = [];
            const seen = new Set(); // 用於去重

            // 遍歷 element (<li>) 的所有直接子元素
            // 選擇器 ':scope > *' 確保只選取直接子元素 (H1, SPAN, H2, UL...)
            const children = element.querySelectorAll(':scope > *');

            children.forEach(child => {
                // 排除腳本、樣式和圖片標籤
                if (['SCRIPT', 'STYLE', 'IMG'].includes(child.tagName)) {
                    return;
                }

                // 提取整個子元素及其所有後代元素的 textContent
                let text = child.textContent.trim();

                if (text.length > 0) {

                    // 由於文本可能包含圖片的 alt 屬性（如 "laugh"），這裡不做特殊清理，
                    // 但如果需要，可以在此處加入正則表達式清理掉不必要的文本片段。

                    if (!seen.has(text)) {
                        texts.push(text);
                        seen.add(text);
                    }
                }
            });
            return texts;
        });
        return results;
    };

    /**
     * [終極版] 持續滾動頁面到底部，直到確認所有內容加載完畢。
     * 整合了「重試機制」與「Loading Bar 消失檢查」，確保動態內容完全載入。
     * @param {import('puppeteer').Page} page - Puppeteer 的 Page 實例。
     * @param {object} options - 配置參數物件。
     * @param {number} [options.minDelay=1000] - 每次滾動後的最小固定等待時間 (毫秒)。
     * @param {number} [options.maxRetries=3] - 高度未變化時的最大重試次數。
     * @param {string|null} [options.stringOfLoadingSelector=undefined] - (選填) Loading畫遍 的選擇器。如果有傳入，會額外(向下生長的元素拿取中)等待此元素消失。
     * @param {number} [options.loadingTimeout=5000] - 等待 Loading Bar 消失的最大時間。
     * @param {promise} fetcher - 有些網站會從dom拿掉(recycle view去回收)滑過去的頁面，所以要邊滑邊用fetcher
     *
     */
    scrollToBottomAndCheck = async (page, {
        minDelay = 2000,
        maxRetries = 3,
        stringOfLoadingSelector = undefined,
        loadingTimeout = 6000,
        fetcher
    } = {}) => {
        console.log("🚀 開始執行智能滾動檢查...");

        let lastHeight = await page.evaluate(() => document.body.scrollHeight);
        let currentRetries = 0;

        while (true) {
            // 1. 執行滾動：觸碰頁面底部
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

            // 2. 基礎等待：給瀏覽器喘息和觸發 JS 的時間 (必要)
            await new Promise(resolve => setTimeout(resolve, minDelay));

            // 3. [新增] 智能等待：如果有設定 Loading Bar，等待它消失
            if (stringOfLoadingSelector) {
                // 我們使用剛才優化的函數，確保 Loading Bar 真的跑完了
                await this.waitForLoadingToVanish(page, stringOfLoadingSelector, loadingTimeout);
                if(_.isFunction(fetcher)) await fetcher(page)
            }

            // 4. 檢查高度變化
            let newHeight = await page.evaluate(() => document.body.scrollHeight);

            if (newHeight === lastHeight) {
                // --- A. 高度沒變 ---
                currentRetries++;

                if (currentRetries >= maxRetries) {
                    console.log(`✅ 連續 ${maxRetries} 次未檢測到新內容，判定已到達最底部。`);
                    break; // 任務結束
                }

                console.log(`🔄 高度未變化，正在重試等待... (${currentRetries}/${maxRetries})`);

                // 重試時，稍微加長一點點等待時間，應對網路波動
                await new Promise(resolve => setTimeout(resolve, 1000));

            } else {
                // --- B. 高度變了 (有新內容) ---
                console.log(`⬇️ 檢測到新內容 (高度: ${lastHeight} -> ${newHeight})，繼續滾動...`);
                lastHeight = newHeight;
                currentRetries = 0; // 重置重試計數器
            }
        }
    };

    /** 清空當前頁面的cookie(不然購物車會爆掉)*/
    async clearCookies(page) {
        await page.deleteCookie(...await page.cookies());
    }

    /** 從element去找出selector route -=> getSelectorRoute = `#div > .class > tag`*/
    getSelectorRoute = async (page, elementHandle) => {
        return await page.evaluate(element => {
            const getSelector = (el) => {
                if (el.id) {
                    return `#${el.id}`; // 如果有 ID，使用 ID 选择器
                }

                let path = [];
                while (el.parentElement) {
                    let tagName = el.tagName.toLowerCase(); // 获取标签名

                    // 获取所有兄弟节点，判断是否有相同标签的元素
                    const siblings = Array.from(el.parentElement.children).filter(e => e.tagName === el.tagName);
                    if (siblings.length > 1) {
                        // 如果有多个同类元素，使用 nth-child 来定位
                        const index = Array.prototype.indexOf.call(el.parentElement.children, el) + 1;
                        tagName += `:nth-child(${index})`;
                    }

                    path.unshift(tagName); // 将当前选择器添加到路径的最前面
                    el = el.parentElement; // 移动到父级元素
                }

                return path.join(' > '); // 返回完整的 CSS 选择器路径
            };

            return getSelector(element); // 传入目标元素，获取选择器
        }, elementHandle);
    };

    // 修正後的 checkSelectorExists (僅檢查 DOM 存在性)
    async checkSelectorExists(page, selector) {
        // page.$() 會返回 ElementHandle 或 null
        const element = await page.$(selector);
        // 使用 !! 確保返回布林值 (true/false)
        return !!element;
    }

    /** * [優化後] 等待某個element出現並可見
     * 這是等待元素可見的最可靠方法。
     * @param {Page} page - Puppeteer Page 物件
     * @param {string} selector - CSS 選擇器
     * @param {number} timeout - 最大等待時間 (毫秒)
     */
    waitSelectorTilAppear = async (page, selector, timeout = 10000) => {
        // 💡 最佳實踐：直接使用 waitForSelector。
        // 如果元素已存在且可見，它會立即返回。
        // 如果元素存在但不可見，它會等待直到可見或超時。

        try {
            await page.waitForSelector(selector, {
                visible: true, // 核心：確保元素在畫面上是可見的
                timeout
            });

            console.log(`元素 ${selector} 已在 ${page.url()} 上出現！`);

            // 成功，返回 true 或不返回任何東西
            // 為了明確，我們可以返回 true
            return true;

        } catch (error) {
            // 🚨 關鍵：拋出錯誤，通知呼叫方等待失敗。
            const errorMessage = `元素 ${selector} 未在 ${timeout / 1000} 秒內出現。`;
            console.error(errorMessage, error);
            // 拋出一個新的錯誤，可以包含更多上下文資訊
            // throw new Error(errorMessage);
        }
    };

    async clickSolution(page, element) {
        await page.evaluate((el) => {
            el.click();
        }, element);
    }

    /**
     * 瀏覽器頁面守門員：強制瀏覽器只保留指定的網址，其餘頁面一律關閉。
     *
     * @param {string} onlyPath - 唯一允許保留的完整網址 (White List)。
     * @param {object} browser - Puppeteer 的 Browser 實例，預設為 this.browser。
     */
    async managePages(onlyPath, browser = this.browser) {

        // 定義一個內部輔助函式，用來統一計算「當前頁面的標準路徑」
        // 這樣就不用在兩個地方寫重複的邏輯，也避免寫死網址
        const getNormalizedPath = (pageUrl) => {
            try {
                const urlObj = new URL(pageUrl);
                // 假設 Util.getUrlPath 的邏輯是組合 host 和 pathname
                // 如果 this.host 不存在，請確認上下文或直接傳入域名
                return Util.getUrlPath(this.host, urlObj.pathname);
            } catch (e) {
                return null; // 解析失敗（例如 about:blank）時回傳 null
            }
        };

        // -------------------------------------------------
        // 1. 未來防護：監聽是否有「新分頁」被開啟
        // -------------------------------------------------
        browser.on('targetcreated', async target => {
            // 我們只關心 "page" 類型的目標 (忽略 background_page, service_worker 等)
            if (target.type() !== 'page') return;

            try {
                const page = await target.page();
                if (!page) return; // 有時目標建立但頁面尚未準備好

                const pageUrl = page.url();

                // 略過空白頁：新分頁剛開啟時通常是 about:blank，還沒載入網址前不要急著關
                if (pageUrl === 'about:blank') return;

                // 計算標準化路徑
                const currentPath = getNormalizedPath(pageUrl);

                // 比對：如果不符合唯一路徑，就關閉
                if (currentPath && currentPath !== onlyPath) {
                    console.log(`[攔截新分頁] 偵測到非法網址: ${currentPath} (目標應為: ${onlyPath})，正在關閉...`);
                    await page.close();
                }
            } catch (err) {
                // 加上錯誤處理，避免頁面瞬間關閉導致程式報錯崩潰
                console.error(`[新分頁檢查錯誤] 無法處理頁面: ${err.message}`);
            }
        });

        // -------------------------------------------------
        // 2. 現狀清理：檢查目前「已經打開」的所有分頁
        // -------------------------------------------------
        try {
            const pages = await browser.pages();

            // 使用迴圈逐一檢查現有頁面
            for (const p of pages) {
                const pageUrl = p.url();

                // 同樣略過空白頁與已經關閉的頁面
                if (p.isClosed() || pageUrl === 'about:blank') continue;

                const currentPath = getNormalizedPath(pageUrl);

                if (currentPath && currentPath !== onlyPath) {
                    console.log(`[清理舊分頁] 發現非法網址: ${currentPath} (目標應為: ${onlyPath})，正在關閉...`);
                    await p.close();
                }
            }
        } catch (err) {
            console.error(`[舊分頁清理錯誤] ${err.message}`);
        }

        // -------------------------------------------------
        // 3. 觀察期
        // -------------------------------------------------
        console.log('頁面管理已啟動，保持監聽 10 秒...');
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    /** // 測試該函數，設置超時為 10 秒（10000 毫秒），重試間隔為 1 秒（1000 毫秒）
     checkElementVisibleWithRetry('#123 .class1 > tr', 10000, 1000);*/
    async checkElementVisibleWithRetry(page, selector, timeout = 30000, retryInterval = 1000) {
        const startTime = Date.now();
        try {
            while (Date.now() - startTime < timeout) {
                // 1. 檢查元素是否存在
                const elementExists = await page.$(selector);
                if (elementExists) {
                    // 2. 檢查元素的 visibility 和 display 屬性是否符合要求
                    const isVisible = await page.evaluate((selector) => {
                        const element = document.querySelector(selector);
                        if (!element) return false;

                        const style = window.getComputedStyle(element);
                        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                    }, selector);

                    if (isVisible) {
                        console.log(`元素 ${selector} 存在且可見`);
                        return true; // 元素存在且可見，退出函數
                    } else {
                        console.log(`元素 ${selector} 存在但不可見，繼續等待...`);
                    }
                } else {
                    console.log(`元素 ${selector} 不存在，繼續等待...`);
                }

                // 3. 等待 retryInterval 再次檢查
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }

            console.log(`超時：元素 ${selector} 未在 ${timeout / 1000} 秒內變為可見`);
            return false;

        } catch (error) {
            console.error(`發生錯誤: ${error.message}`);
            return false;
        }
    }

    close = async (page) => {
        if (!page) return;

        try {
            const context = page.browserContext();

            // 檢查這個 context 是否為「預設 context」
            // browser.defaultBrowserContext() 可以取得預設的 context 物件
            const browser = page.browser();
            const isDefaultContext = (context === browser.defaultBrowserContext());

            if (!isDefaultContext) {
                // 如果是自定義 Context (Incognito)，直接關閉 Context 即可
                // 這會自動關閉底下的該 page，不需要 page.close()
                await context.close();
            } else {
                // 如果是預設 Context，只能關閉 page，不能關閉 context
                await page.close();
            }
        } catch (error) {
            console.error('關閉頁面/Context 時發生錯誤:', error);
            // 這裡可以視情況加強防錯，例如強制 browser.close()
        }
    };

    /** 一般狀況下，一個spider只用一個browser就好！活動結束就terminate */
    terminate = async () => {
        await this.browser.close();
    };

}

if (configerer.DEBUG_MODE) {
    (async () => {

        /** 用91歌曲列表(有下一頁按鈕的機制)當作爬蟲機制 */
        async function runNextPageTilEndSample() {
            const visible = true;
            const spider  = new Spider(require('puppeteer'),{visible});
            await spider.initial();

            const fetcher = async (page) => {
                const selector = '.mainBody .rlist #songlist > tr';
                const rows = await page.$$(selector);
                return await Util.execute4Tasks(rows, async (row) => ({
                    name: await spider.fetchAttributeOfEl(row, 'td:nth-child(1) > a', 'innerText'),
                    href: await spider.fetchAttributeOfEl(row, 'td:nth-child(1) > a', 'href'),
                    lyricist: await spider.fetchAttributeOfEl(row, 'td:nth-child(2)', 'innerText'),
                    composer: await spider.fetchAttributeOfEl(row, 'td:nth-child(3)', 'innerText'),
                    popularLevel: await spider.fetchAttributeOfEl(row, 'td:nth-child(4)', 'innerText'),
                    createTime: await spider.fetchAttributeOfEl(row, 'td:nth-child(5)', 'innerText')
                }))
            }

            const result = await spider.fetchElementsTilPageEnd({
                href: 'https://www.91pu.com.tw/singer/2015/0521/23.html',
                selectorOfPagingN: '.mainBody .rlist .page > a',
                signOfPagingN: '下一頁 >',
                selectorOfAnchor: '.mainBody .rlist #songlist',
                fetcher
            })
            await Util.persistJsonFilePrettier('./temp/sampleOfClickNextPageEnd.json', result);
            await spider.terminate();
            return reuslt;
        }

        // console.log(await runNextPageTilEndSample());
    })();
}
export default Spider;
