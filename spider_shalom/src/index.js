import { configerer } from "configerer";
import _ from 'lodash';
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool, spider as Spider } from 'utiller';
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';

// 定義基礎路徑
const BASE_DIR = './temp/mantter';
const MONITOR_PATH = path.join(BASE_DIR, 'monitor.json');

/** * author:明悅
 * create time:Tue Apr 14 2026 22:32:22 GMT+0800 (Taiwan Standard Time)
 */

class spider_shalom extends Spider {

    constructor(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' }) {
        super(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' });
    }

    verificationByCookie = async (href) => {
        const cookies4MetaAuth = [
            {
                name: 'sessionid',
                value: 'duiz8o86uveck98jvrzc0vni5hwqtyv2', // 替換為實際值
                domain: 'pms.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: 'csrftoken',
                value: 'mCjaxwdVBS56cwwPxT6bXWQvOS0kELOWQNV3G0aOkdwekWDrBlsPPceqPdpFM5vN', // 替換為實際值
                domain: 'pms.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: false
            },
            { name: '_gid', value: 'GA1.3.258081327.1775808518', domain: '.shalom.com.tw', path: '/', secure: true, httpOnly: true },
            { name: '_gcl_au', value: '1.1.1936469463.1775561336', domain: '.shalom.com.tw', path: '/', secure: true, httpOnly: true },
            { name: '_ga_YMC77L3KTD', value: 'GS2.1.s1775561335$o1$g0$t1775561337$j58$l0$h1191434673', domain: '.shalom.com.tw', path: '/', secure: true, httpOnly: true },
            { name: '_ga_C54MDKFL8E', value: 'GS2.1.s1776178021$o20$g1$t1776178021$j60$l0$h0', domain: '.shalom.com.tw', path: '/', secure: true, httpOnly: true },
            { name: '_ga', value: 'GA1.1.2146716185.1772026668', domain: '.shalom.com.tw', path: '/', secure: true, httpOnly: true },
            { name: '_fbp', value: 'fb.2.1775561336035.739211692746777395', domain: '.shalom.com.tw', path: '/', secure: true, httpOnly: true }
        ];

        // 1. 取得 Page 實例
        const page = await this.activatePage4Load({ href, cookies: cookies4MetaAuth });

        // 2. 隨機 User-Agent 池 (皆為現代常見瀏覽器)
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/123.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
        ];

        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

        // 3. 注入隨機 UA 與偽裝標頭 (增加真實感，防護 CloudFront 檢查)
        await page.setUserAgent(randomUA);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        });

        console.log(`[Anti-Bot] 已套用隨機 User-Agent 與真實 Headers`);
        return page;
    }

    /** 取得起始 ID 的邏輯 */
    getStartId = async () => {
        try {
            const data = await fs.readFile(MONITOR_PATH, 'utf-8');
            const { lastId } = JSON.parse(data);
            console.log(`[Monitor] 偵測到進度，將從 ${lastId - 1} 繼續開始...`);
            return lastId - 1;
        } catch (e) {
            console.log(`[Monitor] 無歷史紀錄或找不到檔案，從預設值 177001 開始`);
            return 177001;
        }
    };

    /** 更新進度紀錄 */
    updateMonitor = async (currentId) => {
        try {
            await fs.mkdir(BASE_DIR, { recursive: true });
            let countsOfSucceed = 1;
            let startTime = new Date().toLocaleString();

            try {
                const oldData = await fs.readFile(MONITOR_PATH, 'utf-8');
                const prevStatus = JSON.parse(oldData);
                countsOfSucceed = (prevStatus.countsOfSucceed || 0) + 1;
                startTime = prevStatus.startTime || startTime;
            } catch (e) {
                // 讀取失敗代表是第一筆
            }

            const status = {
                lastId: currentId,
                countsOfSucceed,
                startTime,
                updateTime: new Date().toLocaleString()
            };

            await fs.writeFile(MONITOR_PATH, JSON.stringify(status, null, 2));
            console.log(`[Monitor] 目前已成功處理 ${countsOfSucceed} 筆`);

        } catch (error) {
            console.error(`[Monitor Error] 更新失敗: ${error.message}`);
        }
    };

    extractBehavior = async (href, id = '100001') => {
        const groupName = Math.floor(parseInt(id) / 500) * 500;
        const targetDir = path.join(BASE_DIR, groupName.toString());

        await fs.mkdir(targetDir, { recursive: true });

        // 載入頁面
        const page = await this.verificationByCookie(href);

        try {
            // ==========================================
            // [新增邏輯] 1. 精確偵測 CloudFront 403 攔截頁面
            // ==========================================
            const isBlocked = await page.evaluate(() => {
                const h1 = document.querySelector('h1');
                const bodyText = document.body?.innerText || '';

                // 檢查是否包含 <h1>403 ERROR</h1> 或底部的 CloudFront 特徵字眼
                const has403Header = h1 && h1.innerText.includes('403 ERROR');
                const hasCloudFrontText = bodyText.includes('Generated by cloudfront');

                return has403Header || hasCloudFrontText;
            });

            // 如果發現被擋，主動拋出包含 "403" 的錯誤，交給外層的 fetch 觸發 5 分鐘冷卻
            if (isBlocked) {
                throw new Error(`403 Forbidden: 偵測到 CloudFront 攔截畫面 (ID: ${id})`);
            }
            // ==========================================

            await Util.syncDelay(2000);

            // 原本的邏輯繼續執行...
            await page.click('::-p-text(進階)');
            await Util.syncDelay(50);

            await page.type('input[name="keyword"]', id);
            await Util.syncDelay(50);

            await Promise.all([
                page.waitForResponse(res =>
                        res.url().includes('mainorder/list/') && res.status() === 200,
                    { timeout: 8000 }
                ),
                page.click('::-p-text(開始搜尋)')
            ]);
            await Util.syncDelay(500);

            if (await this.hasSearchResults(page)) {
                const selector = 'body #wrapper #order_list .render_target > div';
                const rows = await page.$$(selector);
                const target = rows[0];
                const detailLink = await target.$('a[data-name="href"]');
                if (detailLink) await detailLink.click();
            } else {
                console.log(`[${id}] 沒有搜尋結果，跳過`);
                return;
            }

            const newTarget = await this.getCurrentBrowser().waitForTarget(
                t => t.url().includes('booking/detail/')
            );
            const pageOfDetail = await newTarget.page();
            await Util.syncDelay(2000);

            const order = {
                basic: await this.extractTab1(pageOfDetail),
                detail: await this.extractTab2(pageOfDetail),
                history: await this.extractTab4(pageOfDetail),
                updateTime: Date.now()
            };

            const filePath = path.join(targetDir, `${id}.json`);
            await Util.persistJsonFilePrettier(filePath, order);
            console.log(`[Success] 已存入 ${filePath}`);

        } catch (error) {
            console.error(`[Error] 處理 ${id} 時發生錯誤:`, error.message);
            throw error; // 將錯誤往上拋給 fetch 處理
        } finally {
            await this.getCurrentBrowser().close();
            await this.initial();
        }
    };

    fetch = async (href) => {
        // 啟動時基於 monitor.json 查找起始點
        let startNum = await this.getStartId();

        for (const num of _.range(startNum, 100001, -1)) {
            const idStr = _.toString(num);
            let success = false;

            // 遇到錯誤時會留在這個 while 迴圈，直到該 ID 成功為止
            while (!success) {
                try {
                    await this.extractBehavior(href, idStr);

                    // 成功處理後更新紀錄
                    await this.updateMonitor(num);
                    success = true;

                    // 正常抓取間隔
                    await Util.syncDelayRandom(100, 2500);

                } catch (e) {
                    const errorMsg = e.message || "";

                    // 1. 如果遇到 403 Forbidden (CloudFront 攔截)
                    if (errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden')) {
                        const waitTime = 2.5 * 60 * 1000; // 2.5 分鐘
                        console.log(`[Warning] 觸發 CloudFront 403 防護，將靜置 2.5 分鐘後自動重試... (ID: ${idStr})`);
                        await Util.syncDelay(waitTime);

                        // 嘗試關閉舊環境，重新初始化 (配合 extractBehavior 中的 verificationByCookie 會換新 User-Agent)
                        await this.getCurrentBrowser().close().catch(() => {});
                        await this.initial();

                    }
                    // 2. 如果是其他錯誤 (Timeout, Selector 等)
                    else {
                        const waitTime = 20 * 1000; // 20 秒
                        console.log(`[Error] 處理 ${idStr} 發生非 403 錯誤: ${errorMsg}`);
                        console.log(`[Info] 等待 20 秒後嘗試重新處理同一個 ID...`);
                        await Util.syncDelay(waitTime);

                        await this.getCurrentBrowser().close().catch(() => {});
                        await this.initial();
                    }
                }
            }
        }
    };

    /** 歷史紀錄 */
    async extractTab4(page) {
        await page.click('a[href="#tab-4"]');
        await Util.syncDelay(300)
        let allData = [];

        const [initialResponse] = await Promise.all([
            page.waitForResponse(res =>
                    res.url().includes('list/?mainorder_id=') && res.status() === 200,
                { timeout: 8000 }
            ),
            page.evaluate(() => {
                const btn = document.querySelector('button[data-target="#recordModal"]');
                if (btn) btn.click();
            })
        ]);

        let apiResult = await initialResponse.json();
        if (apiResult.data) {
            allData.push(...apiResult.data);
        }

        while (apiResult.page_more === true) {
            await Util.syncDelay(1000);
            const [nextResponse] = await Promise.all([
                page.waitForResponse(res =>
                        res.url().includes('list/?mainorder_id=') && res.status() === 200,
                    { timeout: 8000 }
                ),
                page.click('div#recordModal div.modal-body div.text-center.mt20 button#next')
            ]);

            apiResult = await nextResponse.json();

            if (apiResult.data) {
                allData.push(...apiResult.data);
            }
        }

        console.log(`[History] 抓取完成，共 ${allData.length} 筆`);
        return allData;
    }

    /** 訂房資訊 */
    async extractTab1(page) {
        await page.click('a[href="#tab-1"]');
        await Util.syncDelay(500)
        const prefix = `#tab-1`;
        const name = await page.$eval(`${prefix} input[data-name="name"]`, el => el.value);
        const identityNo = await page.$eval(`${prefix} input[data-name="identity_no"]`, el => el.value);
        const gender = await page.$eval(`${prefix} select[data-name="gender"]`, el => {
            const index = el.selectedIndex;
            return el.options[index].text;
        })
        const phone1 = await page.$eval(`${prefix} input[data-name="phone1"]`, el => el.value);
        const phone2 = await page.$eval(`${prefix} input[data-name="phone2"]`, el => el.value);
        const email = await page.$eval(`${prefix} input[data-name="email"]`, el => el.value);
        const address = await page.$eval(`${prefix} input[data-name="address"]`, el => el.value);
        const affiliation = await page.$eval(`${prefix} input[data-name="affiliation"]`, el => el.value);
        const nationality = await page.$eval(`${prefix} input[data-name="nationality"]`, el => el.value);
        const carNo = await page.$eval(`${prefix} input[data-name="car_no"]`, el => el.value);
        const comment = await page.$eval(`${prefix} textarea[data-name="comment"]`, el => el.value);

        return {
            name, identityNo, gender, phone1, phone2, email,
            address, affiliation, nationality, carNo, comment
        }
    }

    /** 消費明細 */
    async extractTab2(page) {
        await page.click('a[href="#tab-2"]');
        await Util.syncDelay(500)
        const prefix = `#tab-2`;
        const bookingData = await page.evaluate(() => {
            const container = document.querySelector('#overview');
            const serial = container.querySelector('[data-name="booking_sn"]')?.innerText.trim();
            const host = container.querySelector('[data-name="name"]')?.innerText.trim();
            const state = container.querySelector('[data-name="status_style"] .font-bold')?.innerText.trim();
            const checkin = container.querySelector('.checkin_date')?.innerText.trim();
            const checkout = container.querySelector('.checkout_date')?.innerText.trim();
            const roomType = container.querySelector('[data-name="roomtype_id"]')?.innerText.trim();
            const amount = container.querySelector('[data-name="amount"]')?.innerText.trim();
            const total = container.querySelector('[data-name="total_roomorders"]')?.innerText.trim();
            const roomInfo = `${checkin} 至 ${checkout}， ${roomType}×${amount} ( ${total}間 )`;
            return { serial, host, roomInfo, state };
        });

        const rows = await page.$$(`${prefix} .render_target[data-mode="single"] > div`);
        const rooms = [];
        for (const row of rows) {
            await Util.syncDelay(500);
            const [response] = await Promise.all([
                page.waitForResponse(res =>
                        res.url().includes('list/?roomorder_id=') && res.status() === 200,
                    { timeout: 5000 }
                ),
                row.evaluate(el => {
                    const btn = el.querySelector('#edit_stay_contact');
                    if (btn) btn.click();
                })
            ]);

            const apiResult = await response.json();
            const guestData = apiResult.data;
            const roomInfo = await row.$eval(`button[data-target="#editRoomOrderModal"]`, el => el.innerText);
            const roomId = await row.$eval(`.arrange_room_btn [data-name="room_id"]`, el => el.innerText.trim());
            const projectInfo = await row.$eval('.edit_project_btn', el => el.innerText.trim());
            const bookingType = await row.$eval('.project-label [data-name="booking_type"]', el => el.innerText.trim());
            const priceText = await row.$eval('.edit_price_btn', el => el.innerText.trim());
            const checkin = await row.$eval('[data-name="checkin_date"]', el => el.innerText.trim());
            const checkout = await row.$eval('[data-name="checkout_date"]', el => el.innerText.trim());

            rooms.push({
                guest: guestData, info: roomInfo, id: `#${roomId}`,
                bookingType, projectInfo, price: priceText, checkin, checkout
            })
        }

        return { ...bookingData, rooms }
    }

    /** 檢查是否有搜尋結果 */
    hasSearchResults = async (page) => {
        const blankSelector = '#blank';
        try {
            await page.waitForSelector(blankSelector);
            const isNotFoundVisible = await page.$eval(blankSelector, (el) => {
                return window.getComputedStyle(el).display !== 'none';
            });
            return !isNotFoundVisible;
        } catch (error) {
            return false;
        }
    }
}

export { spider_shalom as spider_shalom }

const ENABLE_OF_OPEN_BROWSER = true;
const SPIDER_USER = `https://pms.shalom.com.tw/web/booking/list/#advance-filter`;

if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new spider_shalom(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.instagram.com/' });
            await handler.initial();
            const result = await Util.measureExecutionTime(handler.fetch.bind(handler), SPIDER_USER);
            console.log(result.zh_TW);
            await handler.terminate();
        }
    )();
}
