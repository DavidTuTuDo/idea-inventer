import { configerer } from "configerer";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool, spider as Spider } from 'utiller';
import _ from 'lodash';
import puppeteer from 'puppeteer';

const THREAD_OF_INFO_FETCHER = 3; //取得sasha_product_list.json sasha_of_product_catalog.json，這裡只要 > 1, subType的項目就拿取不穩定
const THREAD_OF_DETAIL_PRODUCT = 7; // 抓取detail的，因為網頁會擋multi-page，所以每個商品會要新開一個browser
const PRINT_REPORT_OF_PRODUCTS_DETAIL = true; //列印出 XXX.json
/** 列印出product_detail.json */
const USE_PERSISTENT_FILE = true;//'sasha_product_list.json'
const RANDOM_LIST_ENABLE = false;//不要全拿，隨機拿幾個做測試
const SIZE_OF_RANDOM = 20;//如果 RANDOM_LIST_ENABLE = true, 要拿幾個product detail
const FETCH_LIST_ONLY = false;//只會取得取得sasha_product_list.json | sasha_of_product_catalog.json
const ENABLE_OF_OPEN_BROWSER = false;

class sashanailgel_scraper extends Spider {

    constructor(pu, config = { visible: ENABLE_OF_OPEN_BROWSER }) {
        super(pu, config);
    }

    fetchListOfTypeHref = async () => {
        const self = this;
        const fetcher = async (page) => {
            const children = await page.$$('#mTopBar > *');
            const categories = await Promise.all(
                children.map(async (child, index) =>
                    await self.fetchAttributesOfEl(child,
                        '.mbcUshop-firstLvBarItem > a',
                        { valueOfType: `$$$${index}`, href: 'href', labelOfType: 'innerText' })));
            console.log(`📂 分類列表 ==> ${_.size(categories)}`, categories);
            return categories;
        };
        return this.activatePage4Task({ href: `https://www.sachianail.com`, fetcher });
    };

    async fetchBriefBooze({ href, valueOfType, valueOfSubType, labelOfType, labelOfSubType } = {}) {
        const productsOfBrief = {};
        const fetcher = async (page) => {
            console.log(`打開了 TYPE: ${labelOfType}-SUB-TYPE ${labelOfSubType} PATH:${href}`);
            await this.scrollToBottomAndCheck(page,
                { stringOfLoadingSelector: '#m-content-box > #gl-loading-bar' });
            await Util.syncDelayRandom(500, 1000);
            await page.bringToFront();
            console.log(`已確認到底部，開始抓取每個項目`);
            const parentElement = await page.$$('#gl-container > *');  // 获取父元素
            for (const row of parentElement) {
                const head = _.indexOf(parentElement, row);
                const rowElement = await page.$$('.divFormProductListItem');
                // console.log(`rowElement =>`, _.size(rowElement))
                for (const each of rowElement) {
                    const tail = _.indexOf(rowElement, each);
                    const titleText = await Util.fetchElementAttributes(each, '.gl-title', 'empty', 'innerText');
                    const srcValue = await Util.fetchElementAttributes(each, '.gl-img > .gl-item-image > .img-link', 'empty', 'href');
                    const subs = [];
                    const subItemOptionElement = await each.$$('.addon-select option');
                    for (const item of subItemOptionElement) {
                        const sub = await item.evaluate(((el) => {
                            if (el.value && parseInt(el.value) > 0)
                                return { name: el.innerText, value: el.value };
                        }));
                        subs.push({ ...sub, index: _.indexOf(subItemOptionElement, item) });
                    }

                    productsOfBrief[srcValue] = {
                        index: _.toNumber(`${head}${tail}`),
                        valueOfType, valueOfSubType,
                        category: [{ valueOfType, valueOfSubType }], //一個商品可能出現在多個分頁(value) 和 分頁子類(sub)
                        name: titleText,
                        options: _.filter(subs, sub => !_.isUndefined(sub)).map(each => {
                            return { name: _.trim(each.name), value: _.toNumber(each.value) };
                        }),
                        href: srcValue
                    };
                    console.log(`5655123 list 推了 ${titleText} TYPE:${labelOfType}-SUB-TYPE ${labelOfSubType}`);
                }
            }
            return productsOfBrief;
        };
        return this.activatePage4Task({ href, fetcher, incognito: true });
    }

    async fetchSubTypeOfProduct(pathObj = { href: '', labelOfType: '' }) {
        const self = this;
        const task = async (page, pathObj) => {
            await Util.syncDelayRandom(100, 300);
            await page.bringToFront();
            await Util.syncDelayRandom(300, 500);
            await this.waitSelectorTilAppear(page, `#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container`, 30000);
            const children = await page.$$('#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container > ul > li');
            const length = _.size(children);
            console.log('商品主項目：', pathObj.labelOfType, ' 有副項目：', length);
            return  await Promise.all(children.map(async (child, index) => {
                const fetch = async () => {
                    if (length > 0) {
                        delete pathObj.href;
                        return await self.fetchAttributesOfEl(child, 'a',
                            { valueOfSubType: `$$$${index}`, href: 'href', labelOfSubType: 'innerText', obj:pathObj });
                    } else return await Promise.resolve(pathObj);
                }
                return  await fetch();
            }));
        };
        const fetcher = async (page) => await task(page, pathObj);
        return this.activatePage4Task({ href: pathObj.href, fetcher, incognito: true });
    }

    async fetchProductListPageInfos() {
        if (USE_PERSISTENT_FILE) {
            const list = JSON.parse(Util.getFileContextInRaw(`./temp/sasha_of_product_list.json`));
            await this.fetchWholeProductDetailBehavior(list);
            return;
        }

        const self = this;
        const categories = await this.fetchListOfTypeHref();

        const pagesShouldFetch = categories.filter(page => {
            const splits = page.href.split('/');
            const id = _.toNumber(splits.pop());
            return id > 0 && _.isEqual(splits.pop(), 'plist');
        });

        const targets = [];
        /** 抓取商品Catalog */
        let poolOfSubType = new InfinitePool(THREAD_OF_INFO_FETCHER);
        poolOfSubType.enableTaskTimeout(true, 120000);
        await poolOfSubType.runByParams(async (param) => {
            const pages = await self.fetchSubTypeOfProduct(param);
            targets.push(...pages);
        }, ...pagesShouldFetch);

        if (PRINT_REPORT_OF_PRODUCTS_DETAIL)
            await Util.persistJsonFilePrettier(`./temp/sasha_of_product_catalog.json`, targets);


        /** 抓取商品列表，將 sasha_of_product_catalog.json 裡的path全都觸及至底後fetch */
        const objectOfProducts = {};
        const poolOfFetchProduct = new InfinitePool(THREAD_OF_INFO_FETCHER);
        poolOfFetchProduct.enableTaskTimeout(true, 200000);
        await poolOfFetchProduct.runByParams(async (param) => {
            const products = await self.fetchBriefBooze(param);
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
            Util.appendInfo(`已取得商品資訊列表，不繼續拿detail資訊`);
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

        const listOfProduct = RANDOM_LIST_ENABLE ? Util.getShuffledArrayWithLimitCount(list, SIZE_OF_RANDOM) : list;
        await poolOfFetchProductDetail.runByParams(async (product) => {
            try {
                const productDetail = await self.fetchProductPriceDetail(product);
                /**
                 * brief page -> detail page
                 * brief page商品的裡面有 序號(integer) 所有和 detail page的option 做merge
                 * */
                const options = this.mergeArraysByName(product.options, productDetail.options);
                delete productDetail.options;
                productsOfDetail.push({
                    ...product, options, ...productDetail
                });
            } catch (error) {
                console.log(`PRODUCT:${product.name} 抓取DETAIL資料失敗：`, error.message);
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

    fetchProductPriceDetail = async (product) => {
        const self = this;
        const options = [];

        async function fetchItemObject(page, nameOfOption) {
            console.log('fetchItemObject ==> ', nameOfOption);
            const stringOfPrice = await Util.fetchElementAttributes(page, '#gd-price > span', '0', 'innerText');
            const srcOfOptionPhoto = await Util.fetchElementAttributes(page, '#m-content-box > .divFormProductDetail > #gd-info-box > .gd-img-box > .gd-img > .just-image > figure > img', 'empty', 'src');
            const price = Util.extractNumber(stringOfPrice);
            console.log(stringOfPrice, srcOfOptionPhoto, price);
            if (price > 0) {
                const input = `#gd-detail > table > tbody > .product-number > td > input`;
                console.log(`[${product.name}-${nameOfOption}]輸入框[${input}]得到focus`);
                /** 加入購物車 */
                const countsOfRandom = 1;
                await Util.writeElementAttributes(page, input, { value: _.toString(countsOfRandom) });
                console.log(`加了 ${nameOfOption} ：${countsOfRandom} 個 `);
                const button = `#gd-detail > table > tbody > .add-cart-zone > td > #add-to-list`;
                const selectorOfAppendToCart = await page.$(button);
                await Util.syncDelay(100);
                await self.clickSolution(page, selectorOfAppendToCart);
                await Util.syncDelay(100); //加入購物車要讓子彈飛一下～
                options.push({ name: _.trim(nameOfOption), price, photo: srcOfOptionPhoto });
            }
        }

        async function fetchIntroduceOfProductDetail(page) {
            const statements = [];
            const photos = [];
            const selectorOfIntro = `#gd-good-detail > #ushop_content_iframe`;
            const detail = await page.$(selectorOfIntro);
            const frameOfDetail = await detail.contentFrame();
            const stmts = await frameOfDetail.$$(`#_mbc_frame_container_pc > #A1 > *`);
            console.log(`產品描述的項目有 -> `, _.size(stmts), ` 個`);
            for (const stmt of stmts) {
                let tagName = '';
                try {
                    tagName = _.trim(await stmt.evaluate((el) => el.tagName));
                } catch (error) {
                    Util.appendError(`15121321301 找不到tagName`);
                }

                const key = _.lowerCase(tagName);
                switch (key) {
                    case 'p':
                        /** 文字 */
                        const text = await Util.fetchElementAttributes(stmt, `span`, '', `innerText`);
                        statements.push(text);
                        break;
                    case 'div':
                        /** 圖片 */
                        const img = await Util.fetchElementAttributes(stmt, `img`, '', `src`);
                        if (!Util.isUndefinedNullEmpty(img)) photos.push({ href: img });
                        break;
                    case '':
                        /** ignore default value*/
                        break;
                    default:
                        console.log(`65421321 未預期的tagName=> ${tagName}`);
                        break;
                }
            }
            return { statement: statements.join('\n'), photos };
        }

        const task = async (page, product) => {

            const getCountOfMax4Product = async (p)=>  {
                const maxCountText = await Util.fetchElementAttributes(p, '.limit-quota-hint', '', 'textContent');
                // 2. 使用正規表達式提取字串中的數字
                const maxCountMatch = maxCountText.match(/\d+/);
                // 3. 將字串轉換為整數 (Integer)，若無匹配則回傳整數 0
                return maxCountMatch ? parseInt(maxCountMatch[0], 10) : 0
            }

            try {
                await this.managePages(product.href, page.browserContext());
                const selectorOfSrc = `#m-content-box > .divFormProductDetail > #gd-info-box > .gd-img-box > .gd-img > .just-image > figure > img`;
                await this.waitSelectorTilAppear(page, selectorOfSrc, 40000);
                await page.bringToFront();
                const optionsOfProductNPriceDetails = await page.$$('#gd-detail > table > tbody > .square-style > td > div > *');
                const sizeOfSubItem = _.size(optionsOfProductNPriceDetails);
                console.log(`產品的項目有 -> `, sizeOfSubItem, ` 個`);
                const serial = await Util.fetchElementAttributes(page, '.gd-good-id', '', 'innerText');
                const photoOfDemo = await Util.fetchElementAttributes(page, selectorOfSrc, 'empty', 'src');
                const introduce = await fetchIntroduceOfProductDetail(page);

                for (const element of optionsOfProductNPriceDetails) {
                    const nameOfOption = await Util.fetchElementAttributes(element, 'label', 'empty', 'title');
                    if (sizeOfSubItem > 1 && element) {
                        await element.click();
                        await Util.syncDelay(1200);
                        await fetchItemObject(page, nameOfOption);
                        /** 商品項目只有一個的時候，會預設回圈選 */
                    } else if (sizeOfSubItem === 1) await fetchItemObject(page, nameOfOption);
                }

                /** 購物車的點擊，因為購物車才能抓到商品剩餘數量，所以要先放到購物車 */
                const selectorOfAppendToCart = await page.$(`#mbcUshop-MemberOp > .divCtrlMemberOpView > .member-op`);

                await this.clickSolution(page, selectorOfAppendToCart);
                // console.log(`[${product.name}]點擊購物車之後，是否卡在這裡`)
                await Util.syncDelay(300);
                // await this.checkElementVisibleWithRetry(page, `#m-content-box > .divFormShopCart > .default-cart > #order-list > table > tbody > tr > .t1-6 > .limit-quota-hint`, 300000);
                // await page.waitForNavigation({waitUntil: 'networkidle2', timeout: 30000}) // 等待页面加载完成
                const optionsInCart = [];
                const listInCart = await page.$$(`#m-content-box > .divFormShopCart > .default-cart > #order-list > table > tbody > tr`);
                for (const product of listInCart) {
                    const nameOfOption = await Util.fetchElementAttributes(product, `.t1-4`, 'empty', `innerText`);
                    // const countOfMax = await Util.fetchElementAttributes(product, `.t1-6 > input`, '0', `value`);
                    const countOfMax = await getCountOfMax4Product(product);
                    console.log(`${nameOfOption} 拿到countOfMax ==> ${countOfMax}`);
                    optionsInCart.push({ name: _.trim(nameOfOption), count: _.toNumber(countOfMax) });
                }

                const result = {
                    serial, statement: introduce.statement,
                    photos: introduce.photos, photoOfDemo: photoOfDemo, options: this.mergeArraysByName(options, optionsInCart)
                };
                console.log(result);
                return result;
            } catch (error) {
                console.log(`[${product.name}]點擊購物車之後，等待檢驗數量過程中失敗`, error.message);
                throw new ERROR(9999, `[${product.name}]發生錯誤${error.message}`);
            } finally {
                console.log(`[${product.name}]關閉頁面的所有PERSISTENT`);
            }
        };
        const fetcher = async (page) => await task(page,product);
        return this.activatePage4Task({ href: product.href, fetcher, incognito: true });
    }

    /**
     * @sample 不要刪掉！！！！
     * */
    async sampleOfFetchSingleItem() {
        await this.fetchProductPriceDetail({ name: '測試', href: `https://www.sachianail.com/pitem/M00000677` });
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
    };

    /** incognito = true 就是無痕模式 */
    async getBrowserPage(visible = false, incognito = false, browser) {
        if (browser)
            return { page: await brow.newPage(), browser: browser };

        const brow = await this.establishBrowserCore(visible);
        // 創建一個無痕模式的上下文
        if (incognito) {
            const context = await brow.createBrowserContext();
            return { page: await context.newPage(), browser: brow };
        } else return { page: await brow.newPage(), browser: brow };
    }

    printSucceedFailureLog() {
        const listOfTotal = JSON.parse(Util.getFileContextInRaw(`./sasha_of_product_list.json`));
        const listOfSucceed = JSON.parse(Util.getFileContextInRaw(`./sasha_of_products_detail.json`));
        const listOfFailure = JSON.parse(Util.getFileContextInRaw(`./sasha_of_products_list_failure.json`));
        console.log('listOfTotal：', _.size(listOfTotal));
        console.log('succeed：', _.size(listOfSucceed));
        console.log('failure：', _.size(listOfFailure));

        for (const item of [...listOfFailure, ...listOfSucceed])
            _.remove(listOfTotal, (each) => item.href === each.href);

        console.log(listOfTotal);
        // const result = this.deleteItemsFromArray(listOfTotal, 'id', listOfSucceed, listOfFailure);
        // console.log(result);
    }

    async buildNewList() {
        const listA = JSON.parse(Util.getFileContextInRaw(`./sasha_of_product_list.json`)).map((each) => {
            return { href: each.href, category: each.category };
        });
        const listB = JSON.parse(Util.getFileContextInRaw(`./sasha_of_products_detail.json`));
        const latest = Util.mergeArrayBy("href", listA, listB);
        await Util.persistJsonFilePrettier(`./temp/sasha_of_product_list_latest.json`, latest);
    }

}

export { sashanailgel_scraper as sashanailgel_scraper };

if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new sashanailgel_scraper(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.sachianail.com' });
            /**
             * 測試單一品項抓取detail的function
             * await handler.sampleOfFetchSingleItem();
             * return;
             * */
            await handler.initial();
            const result= await Util.measureExecutionTime(handler.fetchProductListPageInfos.bind(handler));
            console.log(result.zh_TW);
            await handler.terminate();
        }
    )();
}
