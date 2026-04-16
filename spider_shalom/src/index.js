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
                value: 'u2lq3p1op68v4vsx9duvw7424paxfhs2', // 替換為實際值
                domain: 'pms.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: 'csrftoken',
                value: 'LwmtruAMlkfH7IduzwWXHtt2lHRe4GmMsRMWTAm6v3YLeRrFipVdsoWdhvnKGM92', // 替換為實際值
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

            await Util.syncDelay(1500);

            // 原本的邏輯繼續執行...
            await page.click('::-p-text(進階)');
            await Util.syncDelay(50);

            await page.type('input[name="keyword"]', id);
            await Util.syncDelay(50);

            await Promise.all([
                page.waitForResponse(res =>
                        res.url().includes('mainorder/list/') && res.status() === 200,
                    { timeout: 5000 }
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

            let pageOfDetail;
            try {
                /* * 策略 1：嘗試等待新目標 (Target) 出現
                 * 這裡設定 timeout 為 10000ms (10秒)。
                 * 如果系統是開新分頁，waitForTarget 會成功捕獲到該 target。
                 */
                const newTarget = await this.getCurrentBrowser().waitForTarget(
                    t => t.url().includes('booking/detail/'),
                    { timeout: 10000 }
                );
                pageOfDetail = await newTarget.page();

            } catch (e) {
                /* * 策略 2：超時備案 (Fallback)
                 * 當 10 秒過去仍等不到新 Target 時，代表可能是在「原分頁跳轉」或反應過慢。
                 * 我們直接從目前瀏覽器所有的 Pages 裡面去撈取。
                 * 這裡使用 try-catch 包覆，確保 Exception 不會傳遞到外層導致爬蟲崩潰。
                 */
                console.warn(`[Target Timeout] 等待詳情頁新目標超時，改為掃描現有分頁...`);

                const pages = await this.getCurrentBrowser().pages();

                // 從現有的所有分頁中，找出 URL 包含 'booking/detail/' 的那一個
                pageOfDetail = pages.find(p => p.url().includes('booking/detail/'));

                // 如果連 URL 匹配的分頁都找不到，則保險起見拿取「最後一個分頁」(通常是當前焦點分頁)
                if (!pageOfDetail) {
                    pageOfDetail = pages[pages.length - 1];
                }

                console.log(`[Fallback Success] 已成功切換至目標分頁，繼續執行抓取任務。`);
            }

            // 確認拿到 pageOfDetail 後再繼續後續動作
            if (!pageOfDetail) throw new Error("無法取得詳情頁 Page 實例");

            await Util.syncDelay(1500);

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
            if (error.message.includes('Tab-2-Timeout')) {
                console.error(`[Skip] 單號 ${id} 因消費明細抓取超時，放棄該筆單號並記錄。`);
                await this.recordException(id); // 執行記錄動作
                // 直接結束這個 method，不讓它進到最後的 updateMonitor(currentId)
                return;
            }

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
                        const waitTime = 3 * 60 * 1000; // 3 分鐘
                        console.log(`[Warning] 觸發 CloudFront 403 防護，將靜置 3 分鐘後自動重試... (ID: ${idStr})`);
                        await Util.syncDelay(waitTime);

                        // 嘗試關閉舊環境，重新初始化 (配合 extractBehavior 中的 verificationByCookie 會換新 User-Agent)
                        await this.getCurrentBrowser().close().catch(() => {});
                        await this.initial();

                    }
                    // 2. 如果是其他錯誤 (Timeout, Selector 等)
                    else {
                        const waitTime = 10 * 1000; // 20 秒
                        console.log(`[Error] 處理 ${idStr} 發生非 403 錯誤: ${errorMsg}`);
                        console.log(`[Info] 等待 10 秒後嘗試重新處理同一個 ID...`);
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
        await Util.syncDelay(250)
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
        console.log(`tab-4 history抓取完成，共 ${allData.length} 筆`);
        return allData;
    }

    /** 訂房資訊 */
    async extractTab1(page) {
        await page.click('a[href="#tab-1"]');
        await Util.syncDelay(250)
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
        await Util.syncDelay(250); // 稍微增加 Tab 切換等待時間
        const prefix = `#tab-2`;

        // 抓取基本訂房概況
        const bookingData = await page.evaluate(() => {
            const container = document.querySelector('#overview');
            if (!container) return null;
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
            try {
                await Util.syncDelay(250);

                // 這裡是原本容易卡住的地方，加入 Promise.all 監控
                const [response] = await Promise.all([
                    page.waitForResponse(res =>
                            res.url().includes('list/?roomorder_id=') && res.status() === 200,
                        { timeout: 8000 } // 設定為 8 秒超時
                    ),
                    row.evaluate(el => {
                        const btn = el.querySelector('#edit_stay_contact');
                        if (btn) btn.click();
                    })
                ]);

                const apiResult = await response.json();
                const guestData = apiResult.data;

                // 抓取其他欄位
                const roomInfo = await row.$eval(`button[data-target="#editRoomOrderModal"]`, el => el.innerText).catch(()=>'');
                const roomId = await row.$eval(`.arrange_room_btn [data-name="room_id"]`, el => el.innerText.trim()).catch(()=>'');
                const projectInfo = await row.$eval('.edit_project_btn', el => el.innerText.trim()).catch(()=>'');
                const priceText = await row.$eval('.edit_price_btn', el => el.innerText.trim()).catch(()=>'');

                rooms.push({
                    guest: guestData, info: roomInfo, id: `#${roomId}`,
                    projectInfo, price: priceText
                });

            } catch (err) {
                // 如果這筆消費明細內的任何一個 room 點不開或 API 超時，直接拋出錯誤讓外層放棄整張單
                throw new Error(`Tab-2-Timeout: 內部 room 資料抓取超時`);
            }
        }
        return { ...bookingData, rooms };
    }

    /** 記錄處理失敗的單號至 monitor.json */
    recordException = async (id) => {
        try {
            await fs.mkdir(BASE_DIR, { recursive: true });
            let data = { exceptionNo: [] };

            try {
                const content = await fs.readFile(MONITOR_PATH, 'utf-8');
                data = JSON.parse(content);
                // 確保 exceptionNo 欄位存在且為陣列
                if (!Array.isArray(data.exceptionNo)) {
                    data.exceptionNo = [];
                }
            } catch (e) {
                // 檔案不存在則使用預設結構
            }

            // 如果單號不在裡面，才記錄進去
            if (!data.exceptionNo.includes(id)) {
                data.exceptionNo.push(id);
                await fs.writeFile(MONITOR_PATH, JSON.stringify(data, null, 2));
                console.log(`[Monitor] 已將異常單號 ${id} 存入 exceptionNo 清單`);
            }
        } catch (error) {
            console.error(`[Monitor Error] 寫入異常清單失敗: ${error.message}`);
        }
    };

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

    /** * 針對單一單號進行測試或補抓
     * @param {string} href - 起始網址
     * @param {string|number} targetId - 指定的單號 (如: 100321)
     */
    fetchSingle = async (href, targetId) => {
        const idStr = _.toString(targetId);
        console.log(`[Single Fetch] 啟動單筆測試模式，目標單號: ${idStr}`);

        try {
            // 直接呼叫核心行為邏輯
            await this.extractBehavior(href, idStr);
            console.log(`[Single Fetch] 單號 ${idStr} 測試處理完成。`);
        } catch (error) {
            console.error(`[Single Fetch] 測試單號 ${idStr} 時發生異常: ${error.message}`);
            // 在單筆測試模式下，通常我們會希望看到更詳細的錯誤資訊
            if (configerer.DEBUG_MODE) console.error(error);
        }
    };
}

export { spider_shalom as spider_shalom }

const ENABLE_OF_OPEN_BROWSER = true;
const SPIDER_USER = `https://pms.shalom.com.tw/web/booking/list/`;

if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new spider_shalom(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.instagram.com/' });
            await handler.initial();
            const result = await Util.measureExecutionTime(handler.fetch.bind(handler), SPIDER_USER);
            /**
             * 測試單一筆的執行方法
             * const result = await Util.measureExecutionTime(handler.fetchSingle.bind(handler), SPIDER_USER, 176102);
             */
            console.log(result.zh_TW);
            await handler.terminate();
        }
    )();
}
