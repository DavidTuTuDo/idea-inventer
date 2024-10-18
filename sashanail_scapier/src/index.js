import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
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
 * '#'=>代表id | '.'=>代表class | <tag不用加前綴  #id > .className > tag
 * innerText => <tag class='class' >{innerText}<tag>
 *
 *
 *   // 等待元素加载，确保页面中的 #dg-detail > #add-to-list 存在
 *   await page.waitForSelector('#dg-detail > #add-to-list');
 */


class sashanailgel_scraper {

    constructor(engine) {
        this.browser = engine;
        this.items = {}
    }


    async fetchListOfTypeHref() {
        const pages = [];
        const page = await this.browser.newPage();
        await page.goto(`https://www.sachianail.com/`, {waitUntil: 'networkidle2', timeout: 0});
        const rowElement = await page.$$('#mTopBar > *');
        for (const each of rowElement) {
            const barElement = await each.$('.mbcUshop-firstLvBarItem > a');  // 获取父元素
            const titleText = await barElement.evaluate(el => {
                return {href: el.href, type: el.innerText}
            });
            pages.push({index: _.indexOf(rowElement, each), ...titleText});
        }
        await page.close();
        return pages;
    }

    // 滚动页面并检查是否有新的内容加载
    async scrollToBottomAndCheck(page) {
        const delay = 1500; // 等待新内容加载的延迟时间
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

    async fetchPageProduct({href, type, subType = 'empty'}) {
        const productsOfBrief = {};
        const page = await this.browser.newPage();
        await page.goto(href, {waitUntil: 'networkidle2', timeout: 0});
        console.log(`打開了${type}-${subType} PATH:${href}`)
        await this.scrollToBottomAndCheck(page);
        await Util.syncDelay(Util.getRandomValue(500, 1000));
        await page.bringToFront();
        const parentElement = await page.$$('#gl-container > *');  // 获取父元素
        // console.log(`parentElement =>`, _.size(parentElement))
        for (const row of parentElement) {
            const rowElement = await page.$$('.divFormProductListItem');
            // console.log(`rowElement =>`, _.size(rowElement))
            for (const each of rowElement) {
                const titleText = await Util.fetchElementAttributes(each, '.gl-title', 'innerText');
                const srcValue = await Util.fetchElementAttributes(each, '.gl-img > .gl-item-image > .img-link', 'href')
                const subs = []
                const subItemOptionElement = await each.$$('.addon-select option');
                for (const items of subItemOptionElement) {
                    subs.push(await items.evaluate(el => {
                        if (el.value && parseInt(el.value) > 0)
                            return {name: el.innerText, value: el.value}
                    }))
                }
                productsOfBrief[srcValue] = {
                    index: _.indexOf(subItemOptionElement, row),
                    type, subType,
                    name: titleText,
                    options: _.filter(subs, sub => !_.isUndefined(sub)),
                    href: srcValue,
                };
            }
        }
        await page.close();
        return productsOfBrief;
    }

    async fetchSubTypeOfProduct(pathObj = {href: '', type: ''}) {
        const page = await this.browser.newPage();
        await page.goto(pathObj.href, {waitUntil: 'networkidle2', timeout: 0});
        const pages = [];
        await Util.syncDelay(Util.getRandomValue(500));
        await page.bringToFront(); // 将目标页面带到前台
        const listOfSubType = await page.$$('#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container > ul > li');
        console.log('商品主項目：', pathObj.type, ' 有副項目：', _.size(listOfSubType));
        if (_.size(listOfSubType) > 0) {
            for (const subtitle of listOfSubType) {
                const subtitleElement = await subtitle.$('a');
                const objectOfSubtitle = await subtitleElement.evaluate(el => {
                    return {href: el.href, subType: el.innerText}
                });
                pages.push({...objectOfSubtitle, type: pathObj.type})
            }
            await page.close()
            return pages;
        } else {
            await page.close()
            return [pathObj];
        }
    }

    async fetchProductListPageInfos() {
        const self = this;
        const pages = await this.fetchListOfTypeHref();
        const pagesShouldFetch = pages.filter(page => {
            const splits = page.href.split('/');
            const id = _.toNumber(splits.pop());
            const path = splits.pop();
            return id > 0 && _.isEqual(path, 'plist');
        })


        const targets = [];

        let poolOfSubType = new InfinitePool(1)
        poolOfSubType.enableTaskTimeout(true, 100000);
        await poolOfSubType.runByParams(async (param) => {
            const pages = await self.fetchSubTypeOfProduct(param);
            targets.push(...pages);
        }, ...pagesShouldFetch)

        console.log(targets);

        const objectOfProducts = {}
        const poolOfFetchProduct = new InfinitePool(1)
        poolOfSubType.enableTaskTimeout(true, 100000);
        await poolOfFetchProduct.runByParams(async (param) => {
            const products = await self.fetchPageProduct(param);
            console.log(`網址：${param.href} 取得 ${_.size(products)} 個商品`)
            for(const key in products)
                objectOfProducts[key] = products[key]
        }, ...targets)
        const listOfProducts = _.values(objectOfProducts);
        console.log('所有商品數量：', _.size(listOfProducts), '商品底下所有種類合計：', _.sum(listOfProducts.map(item => _.size(item.options))));
        await Util.persistJsonFilePrettier(`./sasha_of_product_list.json`, listOfProducts);
    }

    mergeArraysByName(a1, a2) {
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

    async fetchProductPriceDetail(path) {
        const page = await this.browser.newPage();
        await page.goto(path, {waitUntil: 'networkidle2', timeout: 0});
        const options = [];

        async function fetchItemObject(nameOfOption) {
            const stringOfPrice = await Util.fetchElementAttributes(page, '#gd-price > span', 'innerText');
            const srcOfOptionPhoto = await Util.fetchElementAttributes(page, '.gd-img > .just-image > figure > img', 'src');
            const price = Util.extractNumber(stringOfPrice);

            /** 加入購物車 */
            await Util.writeElementAttributes(page, `#gd-detail > table > tbody > .product-number > td > input`, {value: Util.getRandomValue('100000', '200000')})

            const selectorOfAppendToCart = await page.$(`#gd-detail > table > tbody > .add-cart-zone > td > #add-to-list`);
            await selectorOfAppendToCart.click();

            options.push({name: _.trim(nameOfOption), price, photo: srcOfOptionPhoto});
        }

        const optionsOfProductNPriceDetails = await page.$$('#gd-detail > table > tbody > .square-style > td > div > *');
        console.log(`產品的項目有 -> `, _.size(optionsOfProductNPriceDetails))
        const headPhoto = await Util.fetchElementAttributes(page, `#m-content-box > .divFormProductDetail > #gd-info-box > .gd-img-box > .gd-img > .just-image > figure > img`, 'src');

        for (const element of optionsOfProductNPriceDetails) {
            const nameOfOption = await Util.fetchElementAttributes(element, 'label', 'title')
            await element.click();
            await Util.syncDelay(10);
            await fetchItemObject(nameOfOption);
        }

        /** 購物車的點擊 */
        const selectorOfAppendToCart = await page.$(`#mbcUshop-MemberOp > .divCtrlMemberOpView > .member-op`);

        await Promise.all([
            selectorOfAppendToCart.click(),
            page.waitForNavigation({waitUntil: 'networkidle2', timeout: 0}) // 等待页面加载完成
        ]);

        const optionsInCart = [];
        const listInCart = await page.$$(`#m-content-box > .divFormShopCart > .default-cart > #order-list > table > tbody > tr`);
        console.log(_.size(listInCart));
        for (const product of listInCart) {
            const nameOfOption = await Util.fetchElementAttributes(product, `.t1-4`, `innerText`);
            const countOfMax = await Util.fetchElementAttributes(product, `.t1-6 > input`, `value`);
            optionsInCart.push({name: _.trim(nameOfOption), count: _.toNumber(countOfMax)})
        }

        console.log({headPhoto, options: this.mergeArraysByName(options, optionsInCart)});
    }

}

export {sashanailgel_scraper as sashanailgel_scraper}

if (configerer.DEBUG_MODE) {
    (async () => {
            const browser = await puppeteer.launch({
                headless: true
            });
            for (const page of await browser.pages()) await page.close();

            const handler = new sashanailgel_scraper(browser);
            await handler.fetchProductListPageInfos()
            // await handler.fetchProductPriceDetail(`https://www.sachianail.com/pitem/M00000641`);
            await browser.close();


        }
    )();
}
