import { configerer } from "configerer";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Fri Nov 14 2025 02:39:42 GMT+0800 (Taiwan Standard Time)
 */
const ENABLE_OF_OPEN_BROWSER = false;

class beattiya_spider {

    constructor(engine) {
        this.browser = engine;
        this.items = {};
    }

    getDesktopPage = async () => {
        const page = await this.browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });
        return page;
    };


    async fetcher() {
        const self = this;
        const mainPage = await this.getDesktopPage();
        await mainPage.goto(`https://www.its-beattiya.com.tw/`, { waitUntil: 'networkidle2', timeout: 0 });

        // ==================== 取得所有分類 ====================
        const categorySelector = '#navbar .three-dimension-menu.qk-dropdown_menu .level-2-dropdown.scrollbar > *';
        const categoryRows = await mainPage.$$(categorySelector);

        const categories = await Promise.all(
            categoryRows.map(async (row, index) => ({
                href: await this.fetchAttributeOfEl(row, 'a', 'href'),
                name: await this.fetchAttributeOfEl(row, 'a', 'innerText'),
                category: index
            }))
        );

        console.log(`📂 分類列表 ==> ${_.size(categories)}`, categories);

        // ==================== 爬取所有分類的產品並合併 ====================
        const boozes = [];

        const handler = new InfinitePool(10);
        handler.enableTaskTimeout(true, 40000);

        await handler.runByParams(async (param) => {
            const result = await self.boozeFetcher(param);
            boozes.push(...result);
        }, ...categories);

        console.log(`📦 所有boozes ==> ${_.size(boozes)}`, boozes);

        // await mainPage.close();
        await Util.persistJsonFilePrettier('./temp/boozes.json', boozes);

        const variants = [];
        for (const booze of boozes) variants.push(await this.variantFetcher(booze));

        await handler.runByParams(async (param) => {
            const result = await self.variantFetcher(param);
            variants.push(...result);
        }, ...boozes);

        await Util.persistJsonFilePrettier('./temp/variants.json', variants);
    }

    /**
     * 爬取指定分類下的所有產品
     *
     * @param {Object} cat - 分類物件，需包含 href 屬性
     * @param {string} cat.href - 分類的 URL
     * @returns {Promise<Array>} 所有產品的陣列，每個產品包含 { href, name, id, belonging }
     *
     * @example
     * const products = await this.www({
     *     href: 'https://example.com/collections/skincare'
     * });
     * // 返回所有分頁的產品列表
     */
    boozeFetcher = async (cat) => {
        // ==================== 檢查 URL 是否為分類頁面 ====================
        if (!cat.href?.includes('collections')) return [];
        const page = await this.getDesktopPage();
        // ==================== 設定選擇器和屬性映射 ====================
        const selector = '#template #collection .products_content > *';
        const attrMap = {
            href: 'href',
            name: 'data-name',
            id: 'data-id',
            belonging: 'data-list'
        };

        // ==================== 定義：取得單一頁面的產品列表 ====================
        /**
         * fetchProducts 函數
         * 作用：在當前頁面取得所有產品
         *
         * 執行步驟：
         * 1. 用選擇器 ($$ 複數) 找到所有產品元素
         * 2. 遍歷每個產品元素，用 fetchAttributesOfEl 取得屬性
         * 3. 用 Promise.all 並行執行所有的屬性取得操作
         * 4. 返回當前頁面的所有產品
         */
        const fetchBoozes = async (cat) => {
            const rows = await page.$$(selector);
            return await Promise.all(rows.map(async (row) => {
                const bean = await this.fetchAttributesOfEl(row, '.productClick', attrMap);
                return { ...bean, category: cat.category };
            }));
        };

        // ==================== do...while 循環：逐頁爬取所有產品 ====================
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
        let listOfBooze = [];
        try {
            await page.goto(cat.href, { waitUntil: 'networkidle2', timeout: 0 });
            do {
                await Util.syncDelay(10);
                // ✅ 第一步：取得當前頁面的所有產品
                const products = await fetchBoozes(cat);

                // ✅ 第二步：將當前頁的產品加入總列表
                listOfBooze = listOfBooze.concat(products);

                // ⬇️ while 條件判斷
                // - clickNextPage(page) 會點擊「下一頁」按鈕
                //   如果成功點擊且有下一頁，返回 true，do 區塊會重新執行
                //   如果沒有下一頁，返回 false，循環停止
                // - Util.syncDelay(10) 延遲 10ms，讓頁面有時間加載
            } while (await this.clickNextPage(page));
        } catch (error) {
            console.error(`抓取失敗: ${error.message}`);
            return [];
        } finally {
            // ✅ 關鍵：確保頁面被關閉
            await page.close();
        }

        return listOfBooze;
    }

    variantFetcher = async (booze) => {
        const self = this;
        const page = await this.getDesktopPage();
        await page.goto(booze.href, { waitUntil: 'networkidle2', timeout: 0 });
        const node = await page.$(`#product`);

        async function getVariant() {
            const name = await self.fetchAttributeOfEl(node, `#product_content .product_title h1`, 'innerText');
            const brief = await self.fetchAttributeOfEl(node, `#product_content .product_brief`, 'innerText');
            const fetchOfDescription = async () => {
                const stmts = [];
                const children = await node.$$(`#product_description .desc_body .ckeditor > *`);
                const contents = await Promise.all(children.map(async (child) => await self.fetchAttributeOfEl(child, '', 'innerText')));
                for (const content of contents) stmts.push(...contents);
                return stmts.join('\n');
            };
            const slogan = await self.fetchAttributeOfEl(node,'#product_content .product_slogan', 'innerText');
            const fetchOfPhotos = async () => {
                const children = await node.$$(`#variant_photos .thumb-container`);
                return await Promise.all(children.map(async (child) => await self.fetchAttributeOfEl(child, 'img', 'src')));
            };
            const description = await fetchOfDescription()
            const photos = await fetchOfPhotos();
            return { name, brief, slogan, description, photos, category: booze.category };
        }

        const variant = await getVariant();
        await Util.syncDelay(10);
        await page.close();
        return variant;
    };

    /**
     * 點擊下一頁按鈕
     *
     * @param {Page} page - Puppeteer Page 實例
     * @param {string} selector - 頁面按鈕容器選擇器
     * @returns {Promise<boolean>} 成功返回 true，失敗返回 false
     *
     * @example
     * const success = await this.clickNextPage(page);
     */
    clickNextPage = async (page, selector = `.pagination-container .pagination > *`) => {
        try {
            // ==================== 第一步：取得所有頁面按鈕 ====================
            const paginationItems = await page.$$(selector);

            if (!paginationItems || paginationItems.length === 0) {
                console.log(`⚠️ 找不到頁面按鈕們`);
                return false;
            }
            console.log(`📍 找到 ${paginationItems.length} 個頁面按鈕`);
            // ==================== 第二步：從右到左尋找下一頁按鈕（»） ====================
            let nextPageButton = null;
            for (const item of [...paginationItems].reverse()) {
                const buttonText = await this.fetchAttributeOfEl(item, 'a', 'innerText');

                if (buttonText === '»') {
                    nextPageButton = item;
                    break;
                }
            }
            if (!nextPageButton) {
                console.log(`⚠️ 找不到下一頁按鈕 (»)`);
                return false;
            }

            console.log(`✅ 找到下一頁按鈕`);

            // ==================== 第三步：檢查下一頁按鈕是否禁用 ====================
            const isDisabled = await nextPageButton.evaluate(el =>
                el.disabled || el.classList.contains('disabled')
            );

            if (isDisabled) {
                console.log(`⚠️ 下一頁按鈕已禁用 (已是最後一頁)`);
                return false;
            }

            // ==================== 第四步：點擊下一頁按鈕 ====================
            console.log(`🖱️ 點擊下一頁按鈕...`);
            await nextPageButton.click();

            // ==================== 第五步：等待頁面導航完成 ====================
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 0
            }).catch(() => {
                // 忽略超時錯誤
            });

            console.log(`✅ 成功翻到下一頁`);
            return true;

        } catch (error) {
            console.log(`❌ 點擊下一頁出錯: ${error.message}`);
            return false;
        }
    };

    /**
     * 通用函數：從元素或其子元素上批量提取指定的屬性
     *
     * 此方法支援兩種模式：
     * 1. 當 selector 為空時，直接從 element 本身批量獲取屬性
     * 2. 當 selector 有值時，先查找子元素，再從子元素批量獲取屬性
     *
     * 屬性查找優先級：
     * - 優先查找 DOM 屬性（如 innerText、textContent、value、href 等）
     * - 若 DOM 屬性不存在，則查找 HTML 屬性（如 data-*、class 等）
     *
     * @param {ElementHandle} element - Puppeteer 的元素句柄（ElementHandle）
     * @param {string|null|undefined} selector - CSS 選擇器，用於查找子元素
     *                                           - 若為空值（''、null、undefined），則直接操作 element 本身
     *                                           - 若有值，則在 element 內查找匹配的第一個子元素
     * @param {Object} attrMap - 屬性映射對象，格式為 { 結果key: 屬性名 }
     *                          - key: 返回對象中的鍵名（自定義命名）
     *                          - value: 要查詢的屬性名稱（DOM 或 HTML 屬性）
     *
     * @returns {Promise<Object>} 包含所有屬性的物件
     *                            - 成功：返回包含所有請求屬性的對象
     *                            - 部分失敗：不存在的屬性值為 undefined
     *                            - 完全失敗：找不到元素時返回空對象 {}
     *
     * @example
     * // 從子元素中提取多個屬性
     * const result = await fetchAttributesOfEl(row, '.productClick', {
     *     id: 'data-id',           // HTML 自定義屬性
     *     name: 'data-name',       // HTML 自定義屬性
     *     href: 'href',            // HTML 標準屬性
     *     text: 'innerText',       // DOM 屬性
     *     belonging: 'data-list'   // HTML 自定義屬性
     * });
     * // 返回：{ id: '40088776', name: '1 淨柔雙效潔顏露', href: '/...', text: '...', belonging: '...' }
     *
     * @example
     * // 從元素本身提取多個屬性（selector 為空）
     * const result = await fetchAttributesOfEl(divElement, '', {
     *     text: 'textContent',
     *     className: 'className',
     *     dataId: 'data-id'
     * });
     * // 返回：{ text: 'Some text', className: 'my-class', dataId: '123' }
     *
     * @example
     * // 提取表單元素的多個狀態
     * const formData = await fetchAttributesOfEl(formElement, 'input[name="email"]', {
     *     value: 'value',
     *     isDisabled: 'disabled',
     *     placeholder: 'placeholder'
     * });
     * // 返回：{ value: 'user@example.com', isDisabled: false, placeholder: '請輸入郵箱' }
     */
    fetchAttributesOfEl = async (element, selector, attrMap) => {
        let targetElement;

        // ✅ 處理 selector 為空的情況
        // 當 selector 為 null、undefined、空字串或只有空白時
        // 直接使用 element 本身，避免 querySelector 的 SyntaxError
        if (!selector || selector.trim() === '') {
            targetElement = element;
        } else {
            // 在 element 內部查找匹配 selector 的第一個子元素
            // 使用 Puppeteer 的 $(selector) 方法
            targetElement = await element.$(selector);

            // 如果找不到匹配的子元素，返回空對象
            if (!targetElement) {
                console.warn(`⚠️ 找不到元素: ${selector}`);
                return {};
            }
        }

        // ✅ 在瀏覽器上下文中執行批量屬性查詢
        // evaluate() 會在瀏覽器環境中執行回調函數
        return await targetElement.evaluate((el, attrMap) => {
            // 批量屬性查詢邏輯（在瀏覽器端執行）
            const result = {};
            // 遍歷屬性映射對象，逐一提取屬性值
            // Object.entries() 將對象轉換為 [key, value] 陣列
            // 例如：{ id: 'data-id', name: 'data-name' }
            //    => [['id', 'data-id'], ['name', 'data-name']]
            for (const [key, attrName] of Object.entries(attrMap)) {
                // 屬性查詢邏輯（與 fetchAttributeOfEl 相同）
                // 優先嘗試 DOM 屬性（innerText、textContent、value 等）
                // 再嘗試 HTML 屬性（data-* 、href 等）
                const value = el[attrName] !== undefined
                    ? el[attrName]                    // DOM 屬性存在時使用
                    : el.getAttribute(attrName);      // 否則使用 HTML 屬性

                result[key] = value !== null ? value : undefined;
            }

            // 返回包含所有屬性的結果對象
            return result;
        }, attrMap);  // 將 attrMap 傳遞給瀏覽器端的函數
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
            const value = el[attrName] !== undefined
                ? el[attrName]
                : el.getAttribute(attrName);
            return value !== null ? value : undefined;  // null 改成 undefined
        }, attrName);
    }

}

export { beattiya_spider as beattiya_spider };

if (configerer.DEBUG_MODE) {
    (async () => {
            console.log(`beattiya spider開跑`);

            async function getBrowser(visible) {
                const browser = await puppeteer.launch({
                    headless: !visible
                });
                for (const page of await browser.pages()) await page.close();
                return browser;
            }
            const browser = await getBrowser(ENABLE_OF_OPEN_BROWSER);
            const handler = new beattiya_spider(browser);
            await Util.measureExecutionTime(handler.fetcher.bind(handler));
            await browser.close();
            return 0;
        }
    )();
}
