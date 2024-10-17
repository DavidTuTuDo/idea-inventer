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
        const delay = 1000; // 等待新内容加载的延迟时间
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
                }catch (error) {
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
        await Util.persistJsonFilePrettier(`./products.json`, products);
    }

    async fetchSubTypeOfProduct(path) {
        const page = await this.browser.newPage();
        await page.goto(path.href, {waitUntil: 'networkidle2', timeout: 0});
        const pages = [];
        await Util.syncDelay(10);
        const listOfSubType = await page.$$('#mTopSubBar > .m-list-sub-wrap > .list-row-sub-container > ul > *');
        console.log(path.type, _.size(listOfSubType));
        if (_.size(listOfSubType) > 0) {
            for (const subtitle of listOfSubType) {
                const subtitleElement = await subtitle.$('li > a');
                const objectOfSubtitle = await subtitleElement.evaluate(el => {
                    return {href: el.href, subType: el.innerText}
                });
                pages.push({...objectOfSubtitle, type: path.type})
            }
            await page.close()
            return pages;
        } else {
            await page.close()
            return [path];
        }
    }
}

export {sashanailgel_scraper as sashanailgel_scraper}

if (configerer.DEBUG_MODE) {
    (async () => {
            const browser = await puppeteer.launch({
                headless: true
            });

            const handler = new sashanailgel_scraper(browser);
            const pages = await handler.fetchListOfTypeHref();
            const pagesShouldFetch = pages.filter(page => {
                const splits = page.href.split('/');
                const id = _.toNumber(splits.pop());
                const path = splits.pop();
                return id > 0 && _.isEqual(path, 'plist');
            })

            console.log(pagesShouldFetch);


            const targets = [];
            for (const page of pagesShouldFetch) {
                const pages = await handler.fetchSubTypeOfProduct(page)
                targets.push(...pages)
            }
            console.log(targets);

            for (const target of targets) {
                await handler.fetchPageProduct(target.href, target.type, target.subType)
            }

            await handler.output();

        }
    )();
}
