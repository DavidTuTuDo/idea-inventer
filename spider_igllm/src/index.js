import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool,spider as Spider } from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import puppeteer from 'puppeteer';
/** author:明悅
 *  create time:Sat Dec 06 2025 06:25:03 GMT+0800 (Taiwan Standard Time)
 */
const ENABLE_OF_OPEN_BROWSER = false;
const MAXIMUM_PAGES_OF_FETCHER = 5;

class spider_igllm extends Spider {


    constructor(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' }) {
        super(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' });
    }

    verificationIGByCookie = async (href) => {
        const cookies4MetaAuth = [
            {
                name: 'sessionid',
                value: '1626208095%3AXax8QgSRW2n0lg%3A14%3AAYh0MwtLkPTxPXOJpkLEDgnbUX10_9xGM67nzjEwHbpm', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
                // expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 可以選擇性設定過期時間
            },
            {
                name: 'ds_user_id',
                value: '1626208095', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: false
            },
            {
                name: 'csrftoken',
                value: 'QUIeEqEgIo22pNxRHSYozYc5h3miyFa6', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: false
            },
            {
                name: 'datr',
                value: 'UJ0tZ6IcJPtp7aPMqvYSttq3', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: 'mid',
                value: 'ZzozPAAEAAEHmNwtz-aDWmCZ1_RR', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: 'ig_did',
                value: '959F431C-8E37-4973-8B39-23FDA019685E', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: 'ig_direct_region_hint',
                value: '"FRC\\0541626208095\\0541796399535:01fe16c46d1e242e6512891af96a1dcfe24a462636e03a702f7b7e1648423c613c113ee4"', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: 'rur',
                value: '"CCO\\0541626208095\\0541796450483:01fe20c56b32e9b572a3f4459a944574934772623e95746bb910b81dcfc9cf91db9acf6a"', // 替換為實際值
                domain: '.instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
            }
            // ... 其他必要的 Cookies
        ];
        await this.activatePage4Load({ href, cookies: cookies4MetaAuth })
    }

    fetch = async (href) => {
        await this.verificationIGByCookie(href);
        await Util.syncDelay(500);
        const briefs = await this.fetchBriefsOfAccount(href);

        const folder = Util.getTailStringSplitBy(href, '/');
        await Util.persistJsonFilePrettier(`./temp/${folder}/briefs.json`, briefs);

        const stories = []
        const handler = new InfinitePool(MAXIMUM_PAGES_OF_FETCHER, `ig:${href}`);
        await handler.runByParams(async (param) => {
            stories.push(await this.fetchStoryByBrief(param));
        }, ...briefs);
        await Util.persistJsonFilePrettier(`./temp/${folder}/stories.json`, stories);
    }

    fetchBriefsOfAccount = async (href) => {
        const storiesOfAccount = [];//ig下滑之後會把上面的div從dom拿掉
        const fetcher = async (page) => {
            const selector = 'body div:nth-of-type(1) .xg7h5cd.x1n2onr6 .x1n2onr6 > div > div'
            const rows = await page.$$(selector);
            console.log(`11.有幾列呢 => `, rows.length, ' 行');
            const result = await Util.execute4Tasks(rows, async (row) => {
                const children = await row.$$('div.x1lliihq.x1n2onr6');
                console.log(`22.每一列 => `, _.size(children), ' 個');

                return await Util.execute4Tasks(children, async (child) => ({
                    title: await this.fetchAttributeOfEl(child, 'img', 'alt'),
                    href: await this.fetchAttributeOfEl(child, 'a', 'href'),
                    headPhoto: await this.fetchAttributeOfEl(child, 'img', 'src')
                }))
            })
            storiesOfAccount.push(...result);
            return result;
        }
        await this.fetchElementsTilPageScrollEnd({
            href,
            stringOfLoadingSelector: '.html-div.x14z9mp > .x78zum5.xdt5ytf.xl56j7k',
            fetcher
        })
        const storiesOfficial = Util.getArrayOfUniqBy(_.flattenDeep(storiesOfAccount), 'href');
        console.log(`size:`, `${_.size(storiesOfficial)}\n\n`, storiesOfficial);
        return storiesOfficial;
    }

    fetchStoryByBrief = async (brief) => {
        const task = async (page, brief) => {
            const main = await page.$('body div:nth-of-type(1) div[role="button"]');
            const sub = await page.$('body div:nth-of-type(1) .html-div.xdj266r.x14z9mp');
            let hasNextPresent = true;
            const resources = [];
            const titles = await Util.execute4Tasks(await sub.$$('span.x193iq5w'), async (each) => await this.extractBlockTexts(each));
            const time = await this.fetchAttributesOfEl(sub, 'time', { ts: 'datetime', time: 'title', display: 'innerText' });
            do {
                const gallery = await main.$('div img');
                const movie = await main.$('div video');

                if (gallery) {
                    const photo = await this.fetchAttributeOfEl(gallery, '', 'src')
                    if (photo) resources.push(photo);
                }
                if (movie) {
                    const video = await this.fetchAttributeOfEl(movie, '', 'src')
                    if (video) resources.push(video);
                }
                let nextButton = await main.$('button[aria-label="下一步"]');
                hasNextPresent = nextButton && await nextButton.asElement();
                if (hasNextPresent) {
                    await nextButton.click();
                    await this.wait4Until(page);
                }
            } while (hasNextPresent);
            return { time, titles: Util.getStringsOfFlatten(titles), resources, ...brief };
        }
        const fetcher = async (page) => task(page, brief);
        return this.activatePage4Task({ fetcher, href: brief.href });
    }

}

export { spider_igllm as spider_igllm }

if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new spider_igllm(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.instagram.com/' });
            /**
             * 測試單一品項抓取detail的function
             * await handler.sampleOfFetchSingleItem();
             * return;
             * */
            const pathOfAccount = 'https://www.instagram.com/david.tu.guitar';
            await handler.initial();
            const result= await Util.measureExecutionTime(handler.fetch.bind(handler),
                pathOfAccount);
            console.log(result.zh_TW);
            await handler.terminate();
        }
    )();
}
