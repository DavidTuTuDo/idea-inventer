import { configerer } from "configerer";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool, spider as Spider } from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Sat Nov 22 2025 05:28:50 GMT+0800 (Taiwan Standard Time)
 */
const ENABLE_OF_OPEN_BROWSER = false;
const THREAD_OF_FETCHER = 7;

class spider_wanwen extends Spider {

    fetch = async () => {
        const self = this;
        const fetcher = async (page) => {
            const tabs = await page.$$('.header-in .menu li ul > *');
            return await Util.execute4Tasks(tabs, async (tab, index) => await this.fetchAttributesOfEl(tab, 'li > a', { href: 'href', name: 'aria-label', category: `$$$${index}` }));
        };
        const categories = await this.activatePage4Task({ fetcher, href: `https://www.wan-wen.com.tw` });
        console.log(`📂 categories ==> ${_.size(categories)}`, categories);
        await Util.persistJsonFilePrettier('./temp/categories.json', categories);

        const boozes = [];
        const handler = new InfinitePool(THREAD_OF_FETCHER);
        await handler.runByParams(async (param) => {
                const result = await self.fetchBooze(param);
                boozes.push(...result);
            }, ..._.filter(categories, cat => /product_d|product/.test(cat.href))
        );
        console.log('boozes => ', boozes);
        await Util.persistJsonFilePrettier('./temp/boozes.json', boozes);

        const variants = [];
        await handler.runByParams(async (param) => {
                const result = await self.fetchBoozeVariant(param);
                variants.push(result);
            }, ...boozes
        );
        await Util.persistJsonFilePrettier('./temp/variants.json', variants)
    };

    fetchBooze = async (category) => {
        const task = async (page, cat) => {
            const children = await page.$$('.container .layoutlist_4 > div.col-sm-4.col-md-4');
            console.log(category.name, ` variant counts：${_.size(children)}`);
            const result = await Util.execute4Tasks(children, async (child) => {
                try {
                    const nameNHref = await this.fetchAttributesOfEl(child, '.col-sm-4 a', { href: 'href', name: 'title' });
                    const photoOfDemo = await this.fetchAttributeOfEl(child, '.col-sm-4 img', 'src');
                    const booze = { ...nameNHref, photoOfDemo, category: cat.category, belonging: cat.name };
                    console.log(nameNHref.name, ':', booze);
                    return booze;
                } catch (error) {
                    console.log(`${cat.name}:`, error.message);
                    return { enable: false };
                }
            })
            console.log(`booze result => `, result);
            return result;
        };
        const fetcher = async (page) => await task(page, category);
        return this.activatePage4Task({ fetcher, href: category.href });
    };

    fetchBoozeVariant = async (booze) => {
        const self = this;

        async function waitTilJs(page, TIMEOUT_MS, imageSelector, old) {
            try {
                await page.waitForFunction(
                    (selector, prevSrc) => {
                        const img = document.querySelector(selector);
                        // 檢查條件：圖片元素存在 且 它的 src 屬性不等於舊值
                        return img && img.src && img.src !== prevSrc;
                    },
                    { timeout: TIMEOUT_MS }, // 設定最長等待時間
                    imageSelector, // 傳遞給函式的參數 (selector)
                    old         // 傳遞給函式的參數 (prevSrc)
                );
            } catch (error) {
                if (error.name === 'TimeoutError') console.error(`錯誤：等待圖片 src 變動逾時 (${TIMEOUT_MS}ms)！`);
                else console.error(`發生錯誤: ${error.message}`);
            }
        }

        const task = async (page, booze) => {

            const elementOfBody = await page.$('.pagecontent');
            const elementOfBrief = await elementOfBody.$('.products-info');

            /** 抓取商品分項(S X XL)的邏輯區 */
            const selects = await elementOfBrief.$$(`.pd-info.clearfix #prod_stand > option`)
            // console.log(`規格數量：${_.size(selects)}`);
            const variants = [];
            for (const select of selects) {
                const TIMEOUT_MS = 3000;
                const imageSelector = '#gallery .big img'; //variant變選中大圖(選擇器)
                const old = await this.fetchAttributeOfEl(elementOfBody, imageSelector, 'src');
                const attr = await this.fetchAttributesOfEl(select, '', { name: 'innerText', id: 'value' });
                await page.select(`.pd-info.clearfix #prod_stand`, attr.id);////** vavriant的<select 觸發方式
                await waitTilJs(page, TIMEOUT_MS, imageSelector, old);
                const latest = await this.fetchAttributeOfEl(elementOfBody, imageSelector, 'src');
                const content = await elementOfBrief.$('.price-box.list-inline')
                const price = await this.fetchAttributeOfEl(content, '.price-red b', 'innerText');
                const priceB4Discount = await this.fetchAttributeOfEl(content, '#O_fixPrice b', 'innerText');
                variants.push({ ...attr, photo: latest, price, priceB4Discount, count: 100 });
            }
            // console.log('variants： ', variants)

            /** 抓取商品圖案的邏輯區 */
            const gallery = await elementOfBody.$$(`#gallery .thumbnails > .list-h > li`);
            const photos = await Util.execute4Tasks(gallery, async (frame) => await this.fetchAttributeOfEl(frame, 'a', 'href'))
            // console.log('photos： ', photos)
            const photoOfDemo = booze.photoOfDemo;//

            /** 抓取品名簡述們的邏輯區 */
            const brief = (await this.extractBlockTexts(await page.$('article.editor'))).join('');
            /** 抓取品項的分頁詳細介紹[...{title='特色｜品質｜證書',desc:'',photos:[]}] */
            const tabsOfDesc = await elementOfBody.$$(`.tab-box .tab.list-h li > a`);
            const introduces = [];
            for (const tab of tabsOfDesc) {
                const index = _.indexOf(tabsOfDesc, tab);
                await tab.click();
                await Util.syncDelay(700);
                const title = await this.fetchAttributeOfEl(tab, '', 'innerText');
                const context = await elementOfBody.$$('.tab-container .list-h > *');
                // console.log(`context lines size(${_.size(context)})`);
                const description = (await this.extractBlockTexts(_.nth(context, index))).join('');
                const gallery = index > 1 ? await _.nth(context, index).$$(`img`) : await elementOfBody.$$(`.product_table > img`);
                const photos = await Util.execute4Tasks(gallery, async (frame) => await this.fetchAttributeOfEl(frame, '', 'src'));
                introduces.push({ title, description, photos });
            }
            console.log({ photos, variants, brief, introduces, photoOfDemo });

            const price = 0;//從variant去算
            const priceB4Discount = 0; // 從variant去算
            return {
                name: booze.name, belonging: booze.belonging, category: booze.category,
                photos, variants, brief, introduces, photoOfDemo, price, priceB4Discount
            }
        };

        const fetcher = async (page) => await task(page, booze);
        return this.activatePage4Task({ fetcher, href: booze.href });
    };
}

export { spider_wanwen as spider_wanwen };

if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new spider_wanwen(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.wan-wen.com.tw' });
            console.log(`丸文 爬爬爬開跑`);

            /** 數個規格的商品 */
            async function pageOfMultiVariant() {
                await handler.initial();
                const result = await handler.fetchBoozeVariant(
                    { href: `https://www.wan-wen.com.tw/product_d.php?lang=tw&tb=3&id=2215&tab=881` });
                console.log(result);
            }

            /** 單一規格的商品 */
            async function pageOfSingleVariant() {
                await handler.initial();
                const result = await handler.fetchBoozeVariant(
                    { href: `https://www.wan-wen.com.tw/product_d.php?lang=tw&tb=3&id=1513` });
                console.log(result);
            }

            async function fetch() {
                await handler.initial();
                const result = await Util.measureExecutionTime(handler.fetch.bind(handler));
                console.log(result.zh_TW);
            }

            await fetch();

            await handler.terminate();
            console.log(`完成丸文的爬蟲`);
            return 0;
        }
    )();
}
