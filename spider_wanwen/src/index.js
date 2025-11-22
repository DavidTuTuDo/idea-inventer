import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool,spider as Spider } from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Sat Nov 22 2025 05:28:50 GMT+0800 (Taiwan Standard Time)
 */
const ENABLE_OF_OPEN_BROWSER = false;
const THREAD_OF_FETCHER = 7
class spider_wanwen extends Spider {

        fetch = async () => {
                const self = this;
                const fetcher = async (page) => {
                        const tabs = await page.$$('.header-in .menu li ul > *');
                        return await Promise.all(tabs.map(async (tab, index) => {
                                return await this.fetchAttributesOfEl(tab, 'li > a', { href: 'href', name: 'aria-label', category: `$$$${index}` });
                        }));
                };
                const categories = await this.activatePage4Task({ fetcher, href: `https://www.wan-wen.com.tw` });
                console.log(`📂 分類列表 ==> ${_.size(categories)}`, categories);
                await Util.persistJsonFilePrettier('./temp/categories.json', categories);

                const boozes = [];
                const handler = new InfinitePool(THREAD_OF_FETCHER);
                await handler.runByParams(async (param) => {
                            const result = await self.fetchBooze(param);
                            boozes.push(...result);
                    }, ..._.filter(categories, cat => /product_d|product/.test(cat.href))

                );
                console.log('boozes => ',boozes);
                await Util.persistJsonFilePrettier('./temp/boozes.json', boozes);
        };

        fetchBooze = async (category) => {
                const task = async (page, cat) => {
                        const children = await page.$$('.container .layoutlist_4 > div');
                        console.log(category.name, ` 有項目：${_.size(children)}`);
                        const result = await Promise.all(children.map(async (child) => {
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
                        }));
                        console.log(`result => `, result);
                        return result;
                };
                const fetcher = async (page) => await task(page, category);
                return this.activatePage4Task({ fetcher, href: category.href });
        };

        fetchVariant = async (param) => {

        };
}

export { spider_wanwen as spider_wanwen }

if (configerer.DEBUG_MODE) {
(async () => {

        console.log(`丸文 爬爬爬開跑`);
        const handler = new spider_wanwen(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.wan-wen.com.tw' });
        await handler.initial();
        const result = await Util.measureExecutionTime(handler.fetch.bind(handler));
        console.log(result.zh_TW);
        await handler.terminate();
        console.log(`完成丸文的爬蟲`);
        return 0;
    }
)();
}
