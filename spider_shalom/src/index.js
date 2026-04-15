import { configerer } from "configerer";
import _ from 'lodash';
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool, spider as Spider } from 'utiller';
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
// 定義基礎路徑
const BASE_DIR = './temp/mantter';
const MONITOR_PATH = path.join(BASE_DIR, 'monitor.json');
/** author:明悅
 *  create time:Tue Apr 14 2026 22:32:22 GMT+0800 (Taiwan Standard Time)
 */

class spider_shalom extends Spider {

    constructor(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' }) {
        super(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' });
    }

    verificationByCookie = async (href) => {
        const cookies4MetaAuth = [
            {
                name: 'sessionid',
                value: 'eporj2asdwnq2yaoynh26i63d2g7y0xf', // 替換為實際值
                domain: 'pms.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
                // expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 可以選擇性設定過期時間
            },
            {
                name: 'csrftoken',
                value: 'L4BlmUkhBxl82pqAC6C6QPdaEJiZ1dZe9TUqQ2qWKbXOgeM3a23SHPV5li0lB6dl', // 替換為實際值
                domain: 'pms.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: false
            },
            {
                name: '_gid',
                value: 'GA1.3.258081327.1775808518', // 替換為實際值
                domain: '.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: '_gcl_au',
                value: '1.1.1936469463.1775561336', // 替換為實際值
                domain: '.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: '_ga_YMC77L3KTD',
                value: 'GS2.1.s1775561335$o1$g0$t1775561337$j58$l0$h1191434673', // 替換為實際值
                domain: '.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: '_ga_C54MDKFL8E',
                value: 'GS2.1.s1776178021$o20$g1$t1776178021$j60$l0$h0', // 替換為實際值
                domain: '.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: '_ga',
                value: 'GA1.1.2146716185.1772026668', // 替換為實際值
                domain: '.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            },
            {
                name: '_fbp',
                value: 'fb.2.1775561336035.739211692746777395', // 替換為實際值
                domain: '.shalom.com.tw',
                path: '/',
                secure: true,
                httpOnly: true
            }
            // ... 其他必要的 Cookies
        ];
        return this.activatePage4Load({ href, cookies: cookies4MetaAuth })
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
            // 1. 確保資料夾存在
            await fs.mkdir(BASE_DIR, { recursive: true });

            let countsOfSucceed = 1;
            let startTime = new Date().toLocaleString();

            // 2. 嘗試讀取舊紀錄以累加次數
            try {
                const oldData = await fs.readFile(MONITOR_PATH, 'utf-8');
                const prevStatus = JSON.parse(oldData);

                // 如果之前有紀錄，就累加次數，並保留最初的開始時間
                countsOfSucceed = (prevStatus.countsOfSucceed || 0) + 1;
                startTime = prevStatus.startTime || startTime;
            } catch (e) {
                // 讀取失敗代表是第一筆，維持預設值 1
            }

            // 3. 組成新狀態
            const status = {
                lastId: currentId,
                countsOfSucceed,
                startTime,
                updateTime: new Date().toLocaleString()
            };

            // 4. 寫入檔案
            await fs.writeFile(MONITOR_PATH, JSON.stringify(status, null, 2));

            // Console 提示進度，看著比較安心
            console.log(`[Monitor] 目前已成功處理 ${countsOfSucceed} 筆`);

        } catch (error) {
            console.error(`[Monitor Error] 更新失敗: ${error.message}`);
        }
    };

    extractBehavior = async (href, id = '100001') => {
        // 1. 計算分片資料夾名稱 (每 500 筆一抽屜)
        const groupName = Math.floor(parseInt(id) / 500) * 500;
        const targetDir = path.join(BASE_DIR, groupName.toString());

        // 確保資料夾存在 (使用 import 的 fs.mkdir)
        await fs.mkdir(targetDir, { recursive: true });

        const page = await this.verificationByCookie(href);

        try {
            await Util.syncDelay(2000);
            await page.click('::-p-text(進階)');
            await Util.syncDelay(50);

            await page.type('input[name="keyword"]', id);
            await Util.syncDelay(50);

            await page.click('::-p-text(開始搜尋)');
            await this.wait4Until(page, { timeout: 5000 });

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
            await this.wait4Until(pageOfDetail, { timeout: 5000 });

            const order = {
                basic: await this.extractTab1(pageOfDetail),
                detail: await this.extractTab2(pageOfDetail),
                history: await this.extractTab4(pageOfDetail),
                updateTime: Date.now()
            };

            // 2. 存入分片資料夾
            const filePath = path.join(targetDir, `${id}.json`);
            await Util.persistJsonFilePrettier(filePath, order);
            console.log(`[Success] 已存入 ${filePath}`);

        } catch (error) {
            console.error(`[Error] 處理 ${id} 時發生錯誤:`, error.message);
            throw error;
        } finally {
            await this.getCurrentBrowser().close();
            await this.initial();
        }
    };

    fetch = async (href) => {
        // 3. 啟動時查找 monitor.json
        const startNum = await this.getStartId();

        for (const num of _.range(startNum, 100001, -1)) {
            const idStr = _.toString(num);
            try {
                await this.extractBehavior(href, idStr);
                // 4. 成功處理後更新紀錄
                await this.updateMonitor(num);
            } catch (e) {
                console.log(`[Fatal] ${idStr} 執行失敗，停止程式以便排查。[Message] ${e.message}`);
                break;
            }
        }
    };

    /** 歷史紀錄 */
    async extractTab4(page) {
        await page.click('a[href="#tab-4"]');
        await Util.syncDelay(300)
        let allData = [];

        // --- 第一階段：執行初始點擊並獲取第一頁資料 ---
        const [initialResponse] = await Promise.all([
            // 監聽第一次 API 回應
            page.waitForResponse(res =>
                    res.url().includes('list/?mainorder_id=') && res.status() === 200,
                { timeout: 8000 }
            ),
            // 點擊「查看歷史紀錄」按鈕
            page.evaluate(() => {
                const btn = document.querySelector('button[data-target="#recordModal"]');
                if (btn) btn.click();
            })
        ]);

        let apiResult = await initialResponse.json();
        // 將第一頁資料存入總陣列
        if (apiResult.data) {
            allData.push(...apiResult.data);
        }

        // --- 第二階段：分頁處理 (當 page_more 為 true 時持續點擊) ---
        while (apiResult.page_more === true) {
            await Util.syncDelay(300);
            console.log(`偵測到更多分頁，正在準備點擊下一頁...`);

            const [nextResponse] = await Promise.all([
                // 準備監聽下一頁的 API 回應
                page.waitForResponse(res =>
                        res.url().includes('list/?mainorder_id=') && res.status() === 200,
                    { timeout: 8000 }
                ),
                // 點擊「下一頁」按鈕，使用完整的 Selector 路徑
                page.click('div#recordModal div.modal-body div.text-center.mt20 button#next')
            ]);

            // 更新當前的 apiResult 以判斷是否還有下一頁
            apiResult = await nextResponse.json();

            if (apiResult.data) {
                allData.push(...apiResult.data);
            }
        }

        // --- 第三階段：輸出最終加總結果 ---
        console.log('--------------------------------------');
        console.log(`【抓取完成】`);
        console.log(`資料總長度: ${allData.length} 筆`);
        // console.log(`詳細內容:`, JSON.stringify(allData, null, 2));
        return allData;
    }

    /** 訂房資訊 */
    async extractTab1(page) {
        await page.click('a[href="#tab-1"]');
        await Util.syncDelay(300)
        const prefix = `#tab-1`;
        const name = await page.$eval(`${prefix} input[data-name="name"]`, el => el.value);
        const identityNo = await page.$eval(`${prefix} input[data-name="identity_no"]`, el => el.value);
        const gender = await page.$eval(`${prefix} select[data-name="gender"]`, el => {
            // 取得被選中的那個 option 元素
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
        console.log('[訂房資訊] \n', name, identityNo, gender, phone1,
            phone2, email, address, affiliation, nationality, carNo, comment)
        return {
            name, identityNo, gender, phone1, phone2, email,
            address, affiliation, nationality, carNo, comment
        }
    }

    /** 消費明細 */
    async extractTab2(page) {
        await page.click('a[href="#tab-2"]');
        await Util.syncDelay(300)
        const prefix = `#tab-2`;
        const bookingData = await page.evaluate(() => {
            const container = document.querySelector('#overview');
            // 1. 訂單編號
            const serial = container.querySelector('[data-name="booking_sn"]')?.innerText.trim();
            // 2. 訂房人 (Host)
            const host = container.querySelector('[data-name="name"]')?.innerText.trim();
            // 3. 狀態 (State)
            const state = container.querySelector('[data-name="status_style"] .font-bold')?.innerText.trim();
            // 4. 房間資訊 (RoomInfo)
            const checkin = container.querySelector('.checkin_date')?.innerText.trim();
            const checkout = container.querySelector('.checkout_date')?.innerText.trim();
            const roomType = container.querySelector('[data-name="roomtype_id"]')?.innerText.trim();
            const amount = container.querySelector('[data-name="amount"]')?.innerText.trim();
            const total = container.querySelector('[data-name="total_roomorders"]')?.innerText.trim();
            const roomInfo = `${checkin} 至 ${checkout}， ${roomType}×${amount} ( ${total}間 )`;
            return { serial, host, roomInfo, state };
        });

        console.log(bookingData);

        const rows = await page.$$(`${prefix} .render_target[data-mode="single"] > div`);
        const rooms = [];
        for (const row of rows) {
            await Util.syncDelay(500);
            /** 1. 定義監聽並觸發點擊 (使用 Promise.all 徹底排除 Race Condition) */
            const [response] = await Promise.all([
                // 準備監聽回應：只要 URL 包含該關鍵字且狀態為 200
                page.waitForResponse(res =>
                        res.url().includes('list/?roomorder_id=') && res.status() === 200,
                    { timeout: 5000 } // 避免 API 壞掉導致整個迴圈卡死
                ),

                /** 執行點擊：在瀏覽器環境內點擊該 row 裡的按鈕 */
                row.evaluate(el => {
                    const btn = el.querySelector('#edit_stay_contact');
                    if (btn) btn.click();
                })
            ]);

            /** 2. 拿回資料並存成區域變數 */
            const apiResult = await response.json();
            const guestData = apiResult.data;
            /**
             * {
             *       "address": "台北市忠孝東路四段270號17樓 台北市",
             *       "affiliation": "",
             *       "birthday": null,
             *       "car_no": "",
             *       "comment": "",
             *       "crm_link": null,
             *       "email": "denny@peakoceangreenwish.com",
             *       "fax": "",
             *       "gender": 0,
             *       "id": 31035348,
             *       "identity_no": "",
             *       "identity_path": "",
             *       "identity_path2": "",
             *       "name": "Bin Tuan Mat Tuan Khairuddin",
             *       "nationality": "Taiwan",
             *       "phone1": "0933810211",
             *       "phone2": "",
             *       "primary": true
             *     }
             */

            const roomInfo = await row.$eval(`button[data-target="#editRoomOrderModal"]`, el => el.innerText);
            const roomId = await row.$eval(`.arrange_room_btn [data-name="room_id"]`, el => el.innerText.trim());
            const projectInfo = await row.$eval('.edit_project_btn', el => el.innerText.trim());
            const bookingType = await row.$eval('.project-label [data-name="booking_type"]', el => el.innerText.trim());
            const priceText = await row.$eval('.edit_price_btn', el => el.innerText.trim());
            const checkin = await row.$eval('[data-name="checkin_date"]', el => el.innerText.trim());
            const checkout = await row.$eval('[data-name="checkout_date"]', el => el.innerText.trim());
            console.log(`消費明細[${_.indexOf(rows, row)}] \n`, guestData, roomInfo, roomId,
                bookingType, projectInfo, priceText, checkin, checkout);

            rooms.push({
                guest: guestData, info: roomInfo, id: `#${roomId}`,
                bookingType, projectInfo, price: priceText, checkin, checkout
            })
        }

        return { ...bookingData, rooms }
    }

    /**
     * 檢查是否有搜尋結果
     * @param {object} page - Puppeteer page instance
     * @returns {Promise<boolean>} - true 表示有結果 (>0), false 表示找不到
     */
    hasSearchResults = async (page) => {
        const blankSelector = '#blank';

        try {
            // 1. 確保元素已經出現在 DOM 中（或是等待 API 更新完該元素狀態）
            await page.waitForSelector(blankSelector);

            // 2. 檢查該元素的 display 樣式
            const isNotFoundVisible = await page.$eval(blankSelector, (el) => {
                // 取得計算後的樣式
                return window.getComputedStyle(el).display !== 'none';
            });

            // 如果「找不到」的提示是隱藏的 (display: none)，代表有結果
            return !isNotFoundVisible;

        } catch (error) {
            console.error("檢查搜尋結果時發生錯誤:", error);
            return false;
        }
    }
}

export { spider_shalom as spider_shalom }

const ENABLE_OF_OPEN_BROWSER = true;
const MAXIMUM_PAGES_OF_FETCHER = 5;
/** 整個Accounts下滑完的所有資料們 */
const SPIDER_USER = `https://pms.shalom.com.tw/web/booking/list/#advance-filter`;
if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new spider_shalom(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.instagram.com/' });
            await handler.initial();
            const result = await Util.measureExecutionTime(handler.fetch.bind(handler),
                SPIDER_USER);
            console.log(result.zh_TW);
            await handler.terminate();
        }
    )();
}
