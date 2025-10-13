import { configerer } from "configerer";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import puppeteer from 'puppeteer';

/** author:明悅
 * create time:Sun Oct 13 2024 02:27:45 GMT+0800 (Taipei Standard Time)
 * 一些puppeteer使用的心得！！
 * .$eval = evaluate :取得element元素底下的資料
 * $ 是拿到 reference
 * $$ 是拿到 element list
 * sample  const items = await page.$$eval('#gl-container > *', elements => {
 * sample  const titles = await page.$$eval('#gl-container .gl-title', elements => {
 * '#' =>代表id | '.'=>代表class | <tag不用加前綴  #id > .className > tag
 * innerText => <tag class='class' >{innerText}<tag>
 *
 * ========================================================================
 *   // 等待元素加载，确保页面中的 #dg-detail > #add-to-list 存在
 *   await page.waitForSelector('#dg-detail > #add-to-list');
 *
 * ======================================================================== locator是最新推薦的做法
 *   import puppeteer from 'puppeteer';
 * // Or import puppeteer from 'puppeteer-core';
 *
 * // Launch the browser and open a new blank page
 * const browser = await puppeteer.launch();
 * const page = await browser.newPage();
 *
 * // Navigate the page to a URL.
 * await page.goto('https://developer.chrome.com/');
 *
 * // Set screen size.
 * await page.setViewport({width: 1080, height: 1024});
 *
 * // Type into search box.
 * await page.locator('.devsite-search-field').fill('automate beyond recorder');
 *
 * // Wait and click on first result.
 * await page.locator('.devsite-result-item-link').click();
 *
 * // Locate the full title with a unique string.
 * const textSelector = await page
 *   .locator('text/Customize and automate')
 *   .waitHandle();
 * const fullTitle = await textSelector?.evaluate(el => el.textContent);
 *
 * // Print the full title.
 * console.log('The title of this blog post is "%s".', fullTitle);
 *
 * await browser.close();
 * ======================================================================== locator的doc
 * https://pptr.dev/api/puppeteer.locator/
 * https://pptr.dev/guides/page-interactions#locators
 *
 * networkidle 和 dom render的時間點不一樣，要確保dom上可以抓到要記得locator().wait()
 *
 * ======================================================================== 完美的解釋
 * Sometimes you know that the elements are already on the page. In that case, Puppeteer offers multiple ways to find an element or multiple elements matching a selector. These methods exist on Page, Frame and ElementHandle instances.
 *
 * page.$() returns a single element matching a selector.
 * page.$$() returns all elements matching a selector.
 * page.$eval() returns the result of running a JavaScript function on the first element matching a selector.
 * page.$$eval() returns the result of running a JavaScript function on each element matching a selector.
 *
 */

const THREAD_OF_INFO_FETCHER = 1; //取得sasha_product_list.json sasha_of_product_catalog.json，這裡只要 > 1, subType的項目就拿取不穩定
const THREAD_OF_DETAIL_PRODUCT = 7; // 抓取detail的，因為網頁會擋multi-page，所以每個商品會要新開一個browser
const PRINT_REPORT_OF_PRODUCTS_DETAIL = true; //列印出 XXX.json
/** 列印出product_detail.json */
const USE_PERSISTENT_FILE = false;//'sasha_product_list.json'
const RANDOM_LIST_ENABLE = false;//不要全拿，隨機拿幾個做測試
const SIZE_OF_RANDOM = 100;//如果 RANDOM_LIST_ENABLE = true, 要拿幾個product detail
const FETCH_LIST_ONLY = false;//只會取得取得sasha_product_list.json | sasha_of_product_catalog.json
const ENABLE_OF_OPEN_BROWSER = false;

class sashanailgel_scraper {

    constructor(engine) {
        this.browser = engine; // <<<<<<<<<<< 核心修改：瀏覽器實例由外部傳入並重複使用
        this.items = {}
    }

    async fetchListOfTypeHref() {
        const page = await this.browser.newPage();
        try {
            await page.goto(`https://www.sachianail.com/`, { waitUntil: 'networkidle2', timeout: 0 });
            const rowElement = await page.$$('#mTopBar > *');

            // 並行處理，但保留您原本的 for...of 結構
            const pages = [];
            for (const each of rowElement) {
                const barElement = await each.$('.mbcUshop-firstLvBarItem > a');
                if (!barElement) continue;
                const titleText = await barElement.evaluate(el => {
                    return { href: el.href, labelOfType: el.innerText }
                });
                pages.push({ valueOfType: _.indexOf(rowElement, each), ...titleText });
            }
            return pages;
        } finally {
            await page.close();
        }
    }

    async fetchProductsInPage({ href, valueOfType, valueOfSubType, labelOfType, labelOfSubType } = {}) {
        const productsOfBrief = {};
        const page = await this.browser.newPage();
        try {
            await page.goto(href, { waitUntil: 'networkidle2', timeout: 0 });
            console.log(`打開了 TYPE: ${labelOfType}-SUB-TYPE ${labelOfSubType} PATH:${href}`)
            await this.scrollToBottomAndCheck(page);
            if (THREAD_OF_INFO_FETCHER > 1)
                await this.waitForStyleAndClose(page, '#m-content-box > #gl-loading-bar', 30000)
            await Util.syncDelay(Util.getRandomValue(300, 600));
            await page.bringToFront();
            console.log(`已確認到底部，開始抓取每個項目`);

            const parentElement = await page.$$('#gl-container > *');
            // console.log(`parentElement =>`, _.size(parentElement))

            // <<<<<<<<<<< 優化：並行處理所有商品元素的資料抓取
            const rowElement = await page.$$('.divFormProductListItem');
            // console.log(`rowElement =>`, _.size(rowElement))

            await Promise.all(rowElement.map(async (each, tail) => {
                const [titleText, srcValue, subItemOptionElement] = await Promise.all([
                    Util.fetchElementAttributes(each, '.gl-title', 'empty', 'innerText'),
                    Util.fetchElementAttributes(each, '.gl-img > .gl-item-image > .img-link', 'empty', 'href'),
                    each.$$('.addon-select option')
                ]);

                if (!srcValue || srcValue === 'empty') return;

                const subs = await Promise.all(subItemOptionElement.map(async (item, index) => {
                    const sub = await item.evaluate(((el) => {
                        if (el.value && parseInt(el.value) > 0)
                            return { name: el.innerText, value: el.value }
                    }));
                    return sub ? { ...sub, index } : null;
                }));

                productsOfBrief[srcValue] = {
                    index: _.toNumber(`${_.indexOf(parentElement, each)}${tail}`), // 這裡的 head 邏輯需要調整，暫時用 each 的 index
                    valueOfType, valueOfSubType,
                    category: [{ valueOfType, valueOfSubType }],
                    name: titleText,
                    options: _.compact(subs).map(each => ({ name: _.trim(each.name), value: _.toNumber(each.value) })),
                    href: srcValue,
                };
                console.log(`5655123 list 推了 ${titleText} TYPE:${labelOfType}-SUB-TYPE ${labelOfSubType}`);
            }));

            return productsOfBrief;
        } finally {
            await page.close();
        }
    }

    async fetchSubTypeOfProduct(pathObj = { href: '', type: '' }) {
        const page = await this.browser.newPage();
        try {
            await page.goto(pathObj.href, { waitUntil: 'networkidle2', timeout: 0 });
            const pages = [];
            await Util.syncDelay(Util.getRandomValue(300, 600));
            await page.bringToFront(); // 将目标页面带到前台
            if (THREAD_OF_INFO_FETCHER > 1)
                await this.waitSelectorTilAppear(page, `#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container`, 30000)

            const listOfSubType = await page.$$('#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container > ul > li');
            console.log('商品主項目：', pathObj.labelOfType, ' 有副項目：', _.size(listOfSubType));

            if (_.size(listOfSubType) > 0) {
                for (const subtitle of listOfSubType) {
                    const subtitleElement = await subtitle.$('a');
                    if (!subtitleElement) continue;
                    const objectOfSubtitle = await subtitleElement.evaluate(el => {
                        return { href: el.href, labelOfSubType: el.innerText }
                    });
                    delete pathObj.href;
                    pages.push({ ...objectOfSubtitle, ...pathObj, valueOfSubType: _.indexOf(listOfSubType, subtitle) })
                }
                return pages;
            } else {
                return [pathObj];
            }
        } finally {
            await page.close();
        }
    }

    async fetchProductListPageInfos() {
        if (USE_PERSISTENT_FILE) {
            const list = JSON.parse(Util.getFileContextInRaw(`./sasha_of_product_list.json`))
            await this.fetchWholeProductDetailBehavior(list);
            return;
        }

        const self = this;
        const pages = await this.fetchListOfTypeHref();
        const pagesShouldFetch = pages.filter(page => {
            const splits = page.href.split('/');
            const id = _.toNumber(splits.pop());
            const path = splits.pop();
            return id > 0 && _.isEqual(path, 'plist');
        })

        const targets = [];
        /** 抓取商品Catalog */
        let poolOfSubType = new InfinitePool(THREAD_OF_INFO_FETCHER)
        poolOfSubType.enableTaskTimeout(true, 120000);
        await poolOfSubType.runByParams(async (param) => {
            const pages = await self.fetchSubTypeOfProduct(param);
            targets.push(...pages);
        }, ...pagesShouldFetch)

        if (PRINT_REPORT_OF_PRODUCTS_DETAIL)
            await Util.persistJsonFilePrettier(`./temp/sasha_of_product_catalog.json`, targets);

        /** 抓取商品列表
         * 將 sasha_of_product_catalog.json 裡的path全都觸及至底後fetch
         * */
        const objectOfProducts = {}
        const poolOfFetchProduct = new InfinitePool(THREAD_OF_INFO_FETCHER)
        poolOfFetchProduct.enableTaskTimeout(true, 200000);
        await poolOfFetchProduct.runByParams(async (param) => {
            const products = await self.fetchProductsInPage(param);
            console.log(`網址：${param.href} 取得 ${_.size(products)} 個商品`);
            _.forOwn(products, (product, key) => {
                const exist = objectOfProducts[key];
                if (exist) exist.category.push(...product.category);
                else objectOfProducts[key] = product;
            });
        }, ...targets);
        const listOfProducts = _.values(objectOfProducts);
        console.log('所有商品數量：', _.size(listOfProducts), '商品底下所有種類合計：', _.sum(listOfProducts.map(item => _.size(item.options))));
        if (PRINT_REPORT_OF_PRODUCTS_DETAIL)
            await Util.persistJsonFilePrettier(`./temp/sasha_of_product_list.json`, listOfProducts);

        if (FETCH_LIST_ONLY) {
            Util.appendInfo(`已取得商品資訊列表，不繼續拿detail資訊`)
            return;
        }

        await this.fetchWholeProductDetailBehavior(listOfProducts);
    }

    async fetchWholeProductDetailBehavior(list) {
        /** 抓取商品細項資訊 */

        const self = this;
        const productsOfDetail = [];
        const listOfFailFetch = [];
        const poolOfFetchProductDetail = new InfinitePool(THREAD_OF_DETAIL_PRODUCT);
        poolOfFetchProductDetail.enableTaskTimeout(true, 3456789);

        const listOfProduct = RANDOM_LIST_ENABLE ? Util.getShuffledArrayWithLimitCount(list, SIZE_OF_RANDOM) : list

        // <<<<<<<<<<< 核心修改：將 browser 實例傳遞給每一個任務
        await poolOfFetchProductDetail.runByParams(async (product) => {
            try {
                // 將共享的 browser 實例傳入，而不是每次都新建
                const productDetail = await self.fetchProductPriceDetail(product, self.browser);
                /**
                 * brief page -> detail page
                 * brief page商品的裡面有 序號(integer) 所有和 detail page的option 做merge
                 * */
                const options = this.mergeArraysByName(product.options, productDetail.options)
                delete productDetail.options
                productsOfDetail.push({
                    ...product, options, ...productDetail
                })
            } catch (error) {
                console.log(`PRODUCT:${product.name} 抓取DETAIL資料失敗：`, error.message)
                listOfFailFetch.push(product);
            }

        }, ...listOfProduct);

        if (PRINT_REPORT_OF_PRODUCTS_DETAIL) {
            const current = Util.getCurrentTimeStamp();
            if (_.size(productsOfDetail) > 0)
                await Util.persistJsonFilePrettier(`./temp/sasha_of_products_detail_${current}.json`, productsOfDetail);
            if (_.size(listOfFailFetch) > 0)
                await Util.persistJsonFilePrettier(`./temp/sasha_of_products_list_failure_${current}.json`, listOfFailFetch);
        }
    }

    // <<<<<<<<<<< 核心修改：修改函式簽名，接收 browser 實例
    fetchProductPriceDetail = async (product, browser) => {
        const self = this;
        // <<<<<<<<<<< 核心修改：不再呼叫 getBrowserPage，而是使用傳入的 browser 建立無痕分頁
        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        const path = product.href;
        const options = [];

        async function fetchItemObject(nameOfOption) {
            console.log('fetchItemObject ==> ', nameOfOption);
            const [stringOfPrice, srcOfOptionPhoto] = await Promise.all([
                Util.fetchElementAttributes(page, '#gd-price > span', '0', 'innerText'),
                Util.fetchElementAttributes(page, '#m-content-box > .divFormProductDetail > #gd-info-box > .gd-img-box > .gd-img > .just-image > figure > img', 'empty', 'src')
            ]);
            const price = Util.extractNumber(stringOfPrice);
            console.log(stringOfPrice, srcOfOptionPhoto, price)
            if (price > 0) {
                const input = `#gd-detail > table > tbody > .product-number > td > input`
                console.log(`[${product.name}-${nameOfOption}]輸入框[${input}]得到focus`)
                /** 加入購物車 */
                const countsOfRandom = Util.getRandomValue(10000, 20000);
                await Util.writeElementAttributes(page, input, { value: _.toString(countsOfRandom) })
                console.log(`加了 ${nameOfOption} ：${countsOfRandom} 個 `);
                const button = `#gd-detail > table > tbody > .add-cart-zone > td > #add-to-list`;
                const selectorOfAppendToCart = await page.$(button);
                await Util.syncDelay(300);
                await self.clickSolution(page, selectorOfAppendToCart)
                await Util.syncDelay(300); //加入購物車要讓子彈飛一下～
                options.push({ name: _.trim(nameOfOption), price, photo: srcOfOptionPhoto });
            }
        }

        async function fetchIntroduceOfProductDetail() {
            const statements = [];
            const photos = [];
            const selectorOfIntro = `#gd-good-detail > #ushop_content_iframe`
            const detail = await page.$(selectorOfIntro);
            if (!detail) return { statement: '', photos: [] }; // 如果沒有 iframe，直接返回
            const frameOfDetail = await detail.contentFrame();
            if (!frameOfDetail) return { statement: '', photos: [] }; // 如果 iframe 沒有內容，直接返回

            const stmts = await frameOfDetail.$$('#_mbc_frame_container_pc > #A1 > *');
            console.log(`產品描述的項目有 -> `, _.size(stmts), ` 個`);

            // 並行處理所有描述項目
            const details = await Promise.all(stmts.map(async (stmt) => {
                let tagName = '';
                try {
                    tagName = _.trim(await stmt.evaluate((el) => el.tagName));
                } catch (error) {
                    Util.appendError(`15121321301 找不到tagName`);
                    return null;
                }

                const key = _.lowerCase(tagName);
                switch (key) {
                    case 'p':
                        const text = await Util.fetchElementAttributes(stmt, `span`, '', `innerText`);
                        return { type: 'text', content: text };
                    case 'div':
                        const img = await Util.fetchElementAttributes(stmt, `img`, '', `src`);
                        return !Util.isUndefinedNullEmpty(img) ? { type: 'image', content: { href: img } } : null;
                    case '':
                        return null;
                    default:
                        console.log(`65421321 未預期的tagName=> ${tagName}`)
                        return null;
                }
            }));

            statements.push(..._.compact(details).filter(d => d.type === 'text').map(d => d.content));
            photos.push(..._.compact(details).filter(d => d.type === 'image').map(d => d.content));

            return { statement: statements.join('\n'), photos };
        }

        try {
            await page.goto(path, { waitUntil: 'networkidle2', timeout: 0 });
            // await this.managePages(path, browser); // 這個函式有 10 秒延遲，會拖慢速度，暫時註解
            const selectorOfSrc = `#m-content-box > .divFormProductDetail > #gd-info-box > .gd-img-box > .gd-img > .just-image > figure > img`
            await this.waitSelectorTilAppear(page, selectorOfSrc, 40000)
            await page.bringToFront();
            const optionsOfProductNPriceDetails = await page.$$('#gd-detail > table > tbody > .square-style > td > div > *');
            const sizeOfSubItem = _.size(optionsOfProductNPriceDetails);
            console.log(`產品的項目有 -> `, sizeOfSubItem, ` 個`);

            const [serial, photoOfDemo, introduce] = await Promise.all([
                Util.fetchElementAttributes(page, '.gd-good-id', '', 'innerText'),
                Util.fetchElementAttributes(page, selectorOfSrc, 'empty', 'src'),
                fetchIntroduceOfProductDetail()
            ]);

            for (const element of optionsOfProductNPriceDetails) {
                const nameOfOption = await Util.fetchElementAttributes(element, 'label', 'empty', 'title')
                if (sizeOfSubItem > 1 && element) {
                    await element.click()
                    await Util.syncDelay(1200);
                    await fetchItemObject(nameOfOption);
                    /** 商品項目只有一個的時候，會預設回圈選 */
                } else if (sizeOfSubItem === 1) await fetchItemObject(nameOfOption);
            }

            /** 購物車的點擊，因為購物車才能抓到商品剩餘數量，所以要先放到購物車 */
            const selectorOfAppendToCart = await page.$(`#mbcUshop-MemberOp > .divCtrlMemberOpView > .member-op`);

            await this.clickSolution(page, selectorOfAppendToCart);
            // console.log(`[${product.name}]點擊購物車之後，是否卡在這裡`)
            await this.checkElementVisibleWithRetry(page, `#m-content-box > .divFormShopCart > .default-cart > #order-list > table > tbody > tr > .t1-6 > .limit-quota-hint`, 300000)
            // await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 30000}) // 等待页面加载完成

            const optionsInCart = [];
            const listInCart = await page.$$('#m-content-box > .divFormShopCart > .default-cart > #order-list > table > tbody > tr');
            for (const productInCart of listInCart) {
                const nameOfOption = await Util.fetchElementAttributes(productInCart, `.t1-4`, 'empty', `innerText`);
                const countOfMax = await Util.fetchElementAttributes(productInCart, `.t1-6 > input`, '0', `value`);
                optionsInCart.push({ name: _.trim(nameOfOption), count: _.toNumber(countOfMax) })
            }

            const result = {
                serial, statement: introduce.statement,
                photos: introduce.photos, photoOfDemo: photoOfDemo, options: this.mergeArraysByName(options, optionsInCart)
            }
            console.log(result);
            return result;
        } catch (error) {
            console.log(`[${product.name}]點擊購物車之後，等待檢驗數量過程中失敗`, error.message)
            throw new ERROR(9999, `[${product.name}]發生錯誤${error.message}`)
        } finally {
            // <<<<<<<<<<< 核心修改：只關閉無痕分頁，不關閉瀏覽器
            await context.close();
            console.log(`[${product.name}]關閉頁面的所有PERSISTENT`);
        }
    }

    async sampleOfFetchSingleItem() {
        // <<<<<<<<<<< 核心修改：需要傳入 browser 實例來測試
        await this.fetchProductPriceDetail({ name: '測試', href: `https://www.sachianail.com/pitem/M00000677` }, this.browser);
    }

    /** --------------------------------------------------------------------------- 關於puppeteer util的部分 --------------------------------------------------------------------------- */
        // 滚动页面并检查是否有新的内容加载
    scrollToBottomAndCheck = async (page) => {
        const delay = 2000; // 等待新内容加载的延迟时间
        let lastHeight = await page.evaluate('document.body.scrollHeight');

        while (true) {
            await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');

            // 等待新的内容加载
            await new Promise(resolve => setTimeout(resolve, delay));
            let newHeight = await page.evaluate('document.body.scrollHeight');

            if (newHeight === lastHeight) {
                console.log("No more new content, scroller arrived to bottom");
                break;
            }
            lastHeight = newHeight;
        }
    }

    mergeArraysByName = (a1, a2) => {
        // 使用 _.mergeWith 和 _.keyBy 基于 'name' 键合并数组
        const merged = _.values(_.mergeWith(
            _.keyBy(a1, 'name'), // 将 a1 转换为以 name 为键的对象
            _.keyBy(a2, 'name'), // 将 a2 转换为以 name 为键的对象
            (objValue, srcValue) => {
                // 如果两个值都是对象，递归合并
                if (_.isObject(objValue)) {
                    return _.merge(objValue, srcValue);
                }
                // 如果其中一个为空，返回非空的值
                return objValue || srcValue;
            }
        ));

        // 返回合并后的数组
        return merged;
    }

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

    async checkSelectorExists(page, selector) {
        // 檢查選擇器是否存在
        const element = await page.$(selector);
        return !!element;
    }

    /** 當loading bar 消失時，假定為加載完成 */
    waitForStyleAndClose = async (page, selector, timeout) => {
        try {
            // 使用 evaluate 來檢查元素的 display 屬性，並每隔500毫秒檢查一次
            await page.waitForFunction(
                (selector) => {
                    const element = document.querySelector(selector);
                    return element && window.getComputedStyle(element).display === 'none';
                },
                {timeout: 10000}, // 最多等10秒
                selector
            );

            console.log(`元素 ${selector} 的 display 設為 none 了！`);
        } catch (error) {
            console.error(`元素 ${selector} 的 display 沒有在指定時間內設為 none。`, error);
        }

    }

    /** 等待某個element出現代表可以抓取dom,有時候networkidle 不等於 dom已經render成功 */
    waitSelectorTilAppear = async (page, selector, timeout = 10000) => {
        /** 已存在就立即返回 */
        if (await this.checkSelectorExists(page, selector)) return;

        try {
            // 等待特定元素出現
            await page.waitForSelector(selector, {
                visible: true, // 確保元素是可見的
                timeout // 可選：最多等10秒
            });

            console.log(`元素 ${selector} 已出現！`);

        } catch (error) {
            console.error(`元素 ${selector} 未在指定時間內出現。`, error);
        }
    }

    // <<<<<<<<<<< 核心修改：這個函式不再需要，由最外層的 main function 取代
    // async getBrowser(visible) {
    //     const browser = await puppeteer.launch({
    //         headless: !visible
    //     });
    //     for (const page of await browser.pages()) await page.close();
    //     return browser;
    // }

    // <<<<<<<<<<< 核心修改：這個函式不再需要，由 fetchProductPriceDetail 內部邏輯取代
    // /** incognito = true 就是無痕模式 */
    // async getBrowserPage(visible = false, incognito = false, browser) {
    //     if (browser)
    //         return {page: await brow.newPage(), browser: browser};
    //
    //     const brow = await this.getBrowser(visible);
    //     // 創建一個無痕模式的上下文
    //     if (incognito) {
    //         const context = await brow.createBrowserContext();
    //         return {page: await context.newPage(), browser: brow};
    //     } else return {page: await brow.newPage(), browser: brow};
    // }

    async finish() {
        // this.printSucceedFailureLog();
        // <<<<<<<<<<< 核心修改：finish 不再需要關閉瀏覽器，交由最外層的 finally 區塊處理
        // await this.browser.close()
        console.log('所有爬蟲任務已提交，等待主程序關閉瀏覽器...');
    }

    async clickSolution(page, element) {
        await page.evaluate((el) => {
            el.click();
        }, element)
    }

    /**
     *
     * browser.on('targetcreated')：當一個新的目標（標籤頁或窗口）被創建時，這個事件會被觸發。target.page() 返回對應的 Page 對象。
     * URL(page.url()).pathname：我們從頁面的 URL 中提取出 pathname，用來與 onlyPath 進行比較。注意，我們去掉了 /，使得 onlyPath 可以直接比較。
     * page.close()：如果新的頁面路徑與 onlyPath 不匹配，則立即關閉該頁面。
     * browser.pages()：這個方法返回當前已打開的所有頁面。你可以用來遍歷現有的頁面，並關閉 onlyPath 以外的頁面。
     * 這個函數會自動關閉不符合 onlyPath 的頁面，無論是現有的還是新創建的頁面。如果有其他問題或需要調整，隨時告訴我！
     *
     */
    async managePages(onlyPath, browser) {
        // 監聽當有新頁面創建時的事件
        browser.on('targetcreated', async target => {
            const page = await target.page();

            if (page) {
                const url = new URL(page.url());
                const path = `https://www.sachianail.com${url.pathname}`;  // 不去掉前導的 "/"

                // 如果新頁面的 path 不等於 onlyPath，則關閉該頁面
                if (path !== onlyPath) {
                    console.log(`Closing page with path: ${path},should be ${onlyPath}`);
                    await page.close();
                }
            }
        });

        // 檢查並關閉所有不等於 onlyPath 的已打開頁面
        const pages = await browser.pages();

        for (const p of pages) {
            const url = new URL(p.url());
            const path = `https://www.sachianail.com${url.pathname}`;  // 不去掉前導的 "/"

            // 關閉 onlyPath 以外的頁面
            if (path !== onlyPath) {
                console.log(`Closing page with path: ${path},should be ${onlyPath}`);
                await p.close();
            }
        }

        // 讓瀏覽器保持打開一段時間以便觀察
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

    printSucceedFailureLog() {
        const listOfTotal = JSON.parse(Util.getFileContextInRaw(`./sasha_of_product_list.json`))
        const listOfSucceed = JSON.parse(Util.getFileContextInRaw(`./sasha_of_products_detail.json`))
        const listOfFailure = JSON.parse(Util.getFileContextInRaw(`./sasha_of_products_list_failure.json`))
        console.log('listOfTotal：', _.size(listOfTotal))
        console.log('succeed：', _.size(listOfSucceed))
        console.log('failure：', _.size(listOfFailure))

        for (const item of [...listOfFailure, ...listOfSucceed])
            _.remove(listOfTotal, (each) => item.href === each.href);

        console.log(listOfTotal);
        // const result = this.deleteItemsFromArray(listOfTotal, 'id', listOfSucceed, listOfFailure);
        // console.log(result);
    }

    async buildNewList() {
        const listA = JSON.parse(Util.getFileContextInRaw(`./sasha_of_product_list.json`)).map((each) => { return { href: each.href, category: each.category } });
        const listB = JSON.parse(Util.getFileContextInRaw(`./sasha_of_products_detail.json`));
        const latest = Util.mergeArrayBy("href", listA, listB);
        await Util.persistJsonFilePrettier(`./temp/sasha_of_product_list_latest.json`, latest);
    }

}

export { sashanailgel_scraper as sashanailgel_scraper }

if (configerer.DEBUG_MODE) {
    (async () => {
        // <<<<<<<<<<< 核心修改：在所有任務開始前，只啟動一次瀏覽器
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: !ENABLE_OF_OPEN_BROWSER
            });
            // <<<<<<<<<<< 核心修改：將 browser 實例傳入
            const handler = new sashanailgel_scraper(browser);
            /**
             * 測試單一品項抓取detail的function
             * await handler.sampleOfFetchSingleItem();
             * return;
             * */
            await Util.measureExecutionTime(handler.fetchProductListPageInfos.bind(handler));
            await handler.finish();
        } catch (error) {
            console.error("爬蟲主流程發生嚴重錯誤:", error);
        } finally {
            // <<<<<<<<<<< 核心修改：所有任務結束後，才在這裡統一關閉瀏覽器
            if (browser) {
                await browser.close();
                console.log('所有任務完成，瀏覽器已關閉。');
            }
        }
    })();
}
