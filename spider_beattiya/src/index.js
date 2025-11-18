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


    async vvv() {
        const page = await this.getDesktopPage();
        await page.goto(`https://www.its-beattiya.com.tw/`, { waitUntil: 'networkidle2', timeout: 0 });

        // ==================== 取得所有分類 ====================
        const categorySelector = '#navbar .three-dimension-menu.qk-dropdown_menu .level-2-dropdown.scrollbar > *';
        const categoryRows = await page.$$(categorySelector);

        const categories = await Promise.all(
            categoryRows.map(async (row, index) => ({
                href: await this.fetchAttributeOfEl(row, 'a', 'href'),
                name: await this.fetchAttributeOfEl(row, 'a', 'innerText'),
                category: index
            }))
        );

        console.log('📂 分類列表 ==> ', categories);

        // ==================== 爬取所有分類的產品並合併 ====================
        const listOfBooze = (await Promise.all(categories.map(cat => this.www(cat)))).flat();

        console.log('📦 所有產品 ==> ', listOfBooze);
        await page.close();
        await Util.persistJsonFilePrettier('./temp/listOfBooze.json',listOfBooze);

        // return listOfBooze;
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
    async www(cat) {
        // ==================== 檢查 URL 是否為分類頁面 ====================
        if (!cat.href?.includes('collections')) return [];

        const page = await this.getDesktopPage();
        await page.goto(cat.href, { waitUntil: 'networkidle2', timeout: 0 });

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
            return Promise.all(rows.map(async (row) => {
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

        do {
            // ✅ 第一步：取得當前頁面的所有產品
            const products = await fetchBoozes(cat);

            // ✅ 第二步：將當前頁的產品加入總列表
            listOfBooze = listOfBooze.concat(products);

            // ⬇️ while 條件判斷
            // - clickNextPage(page) 會點擊「下一頁」按鈕
            //   如果成功點擊且有下一頁，返回 true，do 區塊會重新執行
            //   如果沒有下一頁，返回 false，循環停止
            // - Util.syncDelay(10) 延遲 10ms，讓頁面有時間加載
        } while (await this.clickNextPage(page) && await Util.syncDelay(10));

        await page.close();
        return listOfBooze;
    }

    async xxx() {

    }

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
                console.warn(`⚠️ 找不到頁面按鈕們`);
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
                console.warn(`⚠️ 找不到下一頁按鈕 (»)`);
                return false;
            }

            console.log(`✅ 找到下一頁按鈕`);

            // ==================== 第三步：檢查下一頁按鈕是否禁用 ====================
            const isDisabled = await nextPageButton.evaluate(el =>
                el.disabled || el.classList.contains('disabled')
            );

            if (isDisabled) {
                console.warn(`⚠️ 下一頁按鈕已禁用 (已是最後一頁)`);
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
            console.error(`❌ 點擊下一頁出錯: ${error.message}`);
            return false;
        }
    };

    /**
     * 通用函數：從元素上提取指定的屬性
     *
     * @param {ElementHandle} element - Puppeteer 的行元素
     * @param {string} selector - 選擇器（如 '.productClick'）
     * @param {Object} attrMap - 屬性映射 { 結果key: 屬性名 }
     *                          例如：{ id: 'data-id', name: 'data-name', href: 'href' }
     * @returns {Promise<Object>} 包含所有屬性的物件
     *
     * @example
     * const result = await extractAttributes(row, '.productClick', {
     *     id: 'data-id',
     *     name: 'data-name',
     *     href: 'href',
     *     belonging: 'data-list'
     * });
     * // 返回：{ id: '40088776', name: '1 淨柔雙效潔顏露', href: '/...', belonging: '...' }
     */
    fetchAttributesOfEl = async (element, selector, attrMap) => {
        const child = await element.$(selector);

        if (!child) {
            console.warn(`⚠️ 找不到元素: ${selector}`);
            return {};
        }

        // ✅ 建立 evaluate 函數，支援 HTML 屬性和 DOM 屬性
        return await child.evaluate((el, attrMap) => {
            const result = {};

            // 遍歷屬性映射，逐一取值
            for (const [key, attrName] of Object.entries(attrMap)) {
                // 優先嘗試 DOM 屬性（innerText、textContent、value 等）
                // 再嘗試 HTML 屬性（data-* 、href 等）
                const value = el[attrName] !== undefined
                    ? el[attrName]
                    : el.getAttribute(attrName);

                // ✅ null 或空字符串改成 undefined
                result[key] = value || undefined;
            }

            return result;
        }, attrMap);
    }

    /**
     * 取得單個屬性值
     *
     * @param {ElementHandle} element - Puppeteer 的行元素
     * @param {string} selector - 選擇器（如 '.productClick'）
     * @param {string} attrName - 屬性名（如 'data-id'、'href'、'data-name'）
     * @returns {Promise<string|null>} 屬性值，找不到則返回 null
     *
     * @example
     * const id = await getAttribute(row, '.productClick', 'data-id');
     * // 返回：'40088776'
     *
     * const name = await getAttribute(row, '.productClick', 'innerText');
     * // 返回：'1 淨柔雙效潔顏露'
     */
    async fetchAttributeOfEl(element, selector, attrName) {
        const child = await element.$(selector);

        if (!child) {
            console.warn(`⚠️ 找不到元素: ${selector}`);
            return undefined;
        }

        // ✅ 回傳值或 undefined，不回傳 null
        return await child.evaluate((el, attrName) => {
            // 優先嘗試 DOM 屬性（innerText、textContent、value 等）
            // 再嘗試 HTML 屬性（data-* 、href 等）
            const value = el[attrName] !== undefined
                ? el[attrName]
                : el.getAttribute(attrName);

            return value || undefined;  // null 改成 undefined
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

            const handler = new beattiya_spider(await getBrowser(ENABLE_OF_OPEN_BROWSER));
            await Util.measureExecutionTime(handler.vvv.bind(handler));

        }
    )();
}
