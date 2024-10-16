import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Sun Oct 13 2024 02:27:45 GMT+0800 (Taipei Standard Time)
 */

class sashanailgel_scraper {

    constructor(engine) {
        this.browser = engine;
    }


    async fetchListOfTitleHref() {
        const pages = [];
        const page = await this.browser.newPage();
        await page.goto(`https://www.sachianail.com/`, {waitUntil: 'networkidle2', timeout: 0});
        const rowElement = await page.$$('#mTopBar > *');
        console.log(_.size(rowElement));
        for (const each of rowElement) {
            const barElement = await each.$('.mbcUshop-firstLvBarItem > a');  // 获取父元素
            const titleText = await barElement.evaluate(el => {
                return {href: el.href, title: el.innerText}
            });
            pages.push(titleText);
        }
        console.log(pages);
        return pages;
    }

    // 滚动页面并检查是否有新的内容加载
    async scrollToBottomAndCheck(page) {
        const delay = 1000; // 等待新内容加载的延迟时间
        let lastHeight = await page.evaluate('document.body.scrollHeight');

        while (true) {
            await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');

            // 等待新的内容加载
            await new Promise(resolve => setTimeout(resolve, delay));

            let newHeight = await page.evaluate('document.body.scrollHeight');

            // 如果页面高度不再变化，表示没有新的内容加载，退出循环
            if (newHeight === lastHeight) {
                console.log("No more new content, closing page...");
                break;
            }
            lastHeight = newHeight;
        }
    }

    async fetchWholePageProduct(path) {
        const page = await this.browser.newPage();
        await page.goto(path.href, {waitUntil: 'networkidle2', timeout: 0});

        /**
         * 一些puppeteer使用的心得！！
         * .$eval = evaluate :取得element元素底下的資料
         * $ 是拿到 reference
         * $$ 是拿到 element list
         * sample  const items = await page.$$eval('#gl-container > *', elements => {
         * sample  const titles = await page.$$eval('#gl-container .gl-title', elements => {
         * '#'=>代表id | '.'=>代表class | <tag不用加前綴  #id > .className > tag
         */
        const subtitles = [];
        await Util.syncDelay(1000);
        const listOfSubTitles = await page.$$('#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container > ul > *');
        console.log(path.title, _.size(listOfSubTitles));
        if (_.size(listOfSubTitles) > 0) {
            for (const subtitle of listOfSubTitles) {
                const subtitleElement = await subtitle.$('li > a');
                const objectOfSubtitle = await subtitleElement.evaluate(el => {
                    return {href: el.href, title: el.innerText}
                });
                subtitles.push(objectOfSubtitle);
                console.log(`${path.title} 底下有`, subtitles)
            }
        } else {
            console.log(`${path.title} 底下沒有sub title`)
        }
        await page.close()
        return;
        await this.scrollToBottomAndCheck(page);
        await Util.syncDelay(3000);

        const parentElement = await page.$$('#gl-container > *');  // 获取父元素
        // console.log('parent => ', parentElement);
        const items = {};

        for (const row of parentElement) {
            const rowElement = await page.$$('.divFormProductListItem');
            // console.log('row => ', row, _.indexOf(parentElement, row));
            for (const each of rowElement) {
                const titleElement = await each.$('.gl-title');
                const titleText = await titleElement.evaluate(el => el.innerText);
                // console.log(titleText);
                const hrefOfDetailElement = await each.$('.gl-img > .gl-item-image > .img-link')
                const srcValue = await hrefOfDetailElement.evaluate(el => el.href);  // 或者 el.getAttribute('src') 来更精确获取原始值
                const subs = []
                const subItemOptionElement = await each.$$('.addon-select option');
                for (const items of subItemOptionElement) {
                    subs.push(await items.evaluate(el => {
                        if (el.value && parseInt(el.value) > 0)
                            return {name: el.innerText, value: el.value}
                    }))
                }
                // console.log(subs);
                items[srcValue] = {name: titleText, subs: _.filter(subs, sub => !_.isUndefined(sub)), href: srcValue};
            }
        }

        let products = _.values(items);
        console.log('所有商品數量：', _.size(products), '商品底下所有種類合計：', _.sum(products.map(item => _.size(item.subs))));
        await Util.persistJsonFilePrettier(`./products.json`, products);
        await page.close();
    }
}

export {sashanailgel_scraper as sashanailgel_scraper}

if (configerer.DEBUG_MODE) {
    (async () => {
            const browser = await puppeteer.launch({
                headless: false
            });

            const handler = new sashanailgel_scraper(browser);
            const pages = await handler.fetchListOfTitleHref();
            const pagesShouldFetch = pages.filter(page => {
                const splits = page.href.split('/');
                const id = splits.pop();
                const path = splits.pop();
                return id > 0 && _.isEqual(path, 'plist');
            })
            console.log(pagesShouldFetch);
            for (const page of pagesShouldFetch) {
                await handler.fetchWholePageProduct(page)
            }


            // pagesShouldFetch.map(page => handler.fetchWholePageProduct(page).then(result => result))
            // const products = pagesShouldFetch.map(page =>  fetchWholePageProduct(page))

        }
    )();
}
