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
            pages.push(titleText);
        }
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

    async fetchPageProduct(path, type, subType = 'empty') {
        const page = await this.browser.newPage();
        await page.goto(path, {waitUntil: 'networkidle2', timeout: 0});
        console.log(`打開了${type}-${subType} PATH:${path}`)
        await this.scrollToBottomAndCheck(page);
        await Util.syncDelay(10);

        const parentElement = await page.$$('#gl-container > *');  // 获取父元素
        // console.log('parent => ', parentElement);
        for (const row of parentElement) {
            const rowElement = await page.$$('.divFormProductListItem');
            // console.log('row => ', row, _.indexOf(parentElement, row));
            for (const each of rowElement) {
                const titleElement = await each.$('.gl-title');
                const titleText = await titleElement.evaluate(el => el.innerText);
                const hrefOfDetailElement = await each.$('.gl-img > .gl-item-image > .img-link')
                const srcValue = await hrefOfDetailElement.evaluate(el => el.href);  // 或者 el.getAttribute('src') 来更精确获取原始值
                const headPhotoElement = await each.$('.gl-img > .gl-item-image > .img-link > img')

                let headPhoto = '';
                try {
                    headPhoto = await headPhotoElement.evaluate(el => el.src);
                } catch (error) {
                    console.log(`${path}->${titleText} 的 headPhoto報錯錯`);
                }

                const subs = []
                const subItemOptionElement = await each.$$('.addon-select option');
                for (const items of subItemOptionElement) {
                    subs.push(await items.evaluate(el => {
                        if (el.value && parseInt(el.value) > 0)
                            return {name: el.innerText, value: el.value}
                    }))
                }
                // console.log(subs);
                this.items[srcValue] = {
                    type, subType,
                    name: titleText,
                    options: _.filter(subs, sub => !_.isUndefined(sub)),
                    href: srcValue,
                    headPhoto,
                };
            }
        }
        await page.close();
    }

    async output() {
        let products = _.values(this.items);
        console.log('所有商品數量：', _.size(products), '商品底下所有種類合計：', _.sum(products.map(item => _.size(item.options))));
        await Util.persistJsonFilePrettier(`./sasha_of_product_list.json`, products);
    }

    async fetchSubTypeOfProduct(pathObj = {href: '', type: ''}) {
        const page = await this.browser.newPage();
        await page.goto(pathObj.href, {waitUntil: 'networkidle2', timeout: 0});
        const pages = [];
        await Util.syncDelay(10);
        const listOfSubType = await page.$$('#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container > ul > *');
        console.log(pathObj.type, _.size(listOfSubType));
        if (_.size(listOfSubType) > 0) {
            for (const subtitle of listOfSubType) {
                const subtitleElement = await subtitle.$('li > a');
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
        const pages = await this.fetchListOfTypeHref();
        const pagesShouldFetch = pages.filter(page => {
            const splits = page.href.split('/');
            const id = _.toNumber(splits.pop());
            const path = splits.pop();
            return id > 0 && _.isEqual(path, 'plist');
        })

        console.log(pagesShouldFetch);
        const targets = [];
        for (const page of pagesShouldFetch) {
            const pages = await this.fetchSubTypeOfProduct(page)
            targets.push(...pages)
        }
        console.log(targets);

        for (const target of targets) {
            await this.fetchPageProduct(target.href, target.type, target.subType)
        }
        await this.output();
    }

    async fetchProductPriceDetail(path) {
        const page = await this.browser.newPage();
        await page.goto(path, {waitUntil: 'networkidle2', timeout: 0});
        const options = [];

        async function fetchItemObject(nameOfOption) {
            const refOfPrice = await page.$('#gd-price > span');
            const stringOfPrice = await refOfPrice.evaluate(el => el.innerText);
            const refOfOptionPhoto = await page.$('.gd-img > .just-image > figure > img')
            const srcOfOptionPhoto = await refOfOptionPhoto.evaluate(el => el.src);
            const price = Util.extractNumber(stringOfPrice);

            /** 加入購物車 */
            const countOfSelectedElement = await page.$(`#gd-detail > table > tbody > .product-number > td > input`);
            if(countOfSelectedElement) {await page.evaluate((inputElement) => {inputElement.value = '100000';}, countOfSelectedElement);
            } else console.log('782738129 countOfSelectedElement not found');

            const selectorOfAppendToCart = await page.$(`#gd-detail > table > tbody > .add-cart-zone > td > #add-to-list`);
            await selectorOfAppendToCart.click();

            options.push({name: _.trim(nameOfOption), price, photo: srcOfOptionPhoto, count: 0});
        }

        const optionsOfProductNPriceDetails = await page.$$('#gd-detail > table > tbody > .square-style > td > div > *');
        console.log(`產品的項目有 -> `, _.size(optionsOfProductNPriceDetails))
        for (const element of optionsOfProductNPriceDetails) {
            const labelElement = await element.$('label');
            const nameOfOption = await labelElement.evaluate(el => el.title);
            await element.click();
            await Util.syncDelay(100);
            await fetchItemObject(nameOfOption);
        }

        /** 購物車的點擊 */
        const selectorOfAppendToCart = await page.$(`#mbcUshop-MemberOp > .divCtrlMemberOpView > .member-op`);

        await Promise.all([
            selectorOfAppendToCart.click(),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0}) // 等待页面加载完成
        ]);

        const optionsInCart = [];
        const listInCart = await page.$$(`#m-content-box > .divFormShopCart > .default-cart > #order-list > table > tbody > tr`);
        // const listInCart = await page.$$(`#m-content-box > .default-cart > #order-list > table > tbody > tr > *`);
        console.log(_.size(listInCart));
        for(const product of listInCart) {
            const nameOfOptionElement = await product.$(`.t1-4`);
            const nameOfOption = await nameOfOptionElement.evaluate(el => el.innerText);
            const countOfMaxElement = await product.$(`.t1-6 > input`);
            const countOfMax = await countOfMaxElement.evaluate(el => el.value);
            optionsInCart.push({name:_.trim(nameOfOption),count: _.toNumber(countOfMax)})
        }


        console.log(options);
        console.log(optionsInCart);


    }
}

export {sashanailgel_scraper as sashanailgel_scraper}

if (configerer.DEBUG_MODE) {
    (async () => {
            const browser = await puppeteer.launch({
                headless: false
            });

            const handler = new sashanailgel_scraper(browser);
            // await handler.fetchProductPriceDetail(`https://www.sachianail.com/pitem/M00000641`);
            // await handler.fetchProductPriceDetail(`https://www.sachianail.com/pitem/M00000374`);
            await handler.fetchProductPriceDetail(`https://www.sachianail.com/pitem/M00000649`);



        }
    )();
}
