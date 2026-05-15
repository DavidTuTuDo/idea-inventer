const edit = true;

import { configerer } from "configerer";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import fs from "fs";
import crypto from "crypto";
class agent_diary_manager {
    /**
     * 讀取 `./temp` 資料夾中的所有 `.txt` 檔案，將內容透過正則表達式分割為日期與時間，
     * 並將資料合併、整理為具有獨立 id (UUID) 的階層式 JSON 陣列。
     * 後讀取的檔案如果包含相同日期，會被合併到該日期下。
     *
     * @returns {Array<Object>} 整理好的日記資料陣列
     * @example
     * // Return format:
     * [
     *   {
     *     "date": "2026/05/05",
     *     "contents": [
     *       {
     *         "dateTime": "2026/05/05/19:37",
     *         "author": "Alice",
     *         "content": "今天天氣很好",
     *         "uid": "123e4567-e89b-12d3-a456-426614174000"
     *       }
     *     ]
     *   }
     * ]
     */
    processTempFiles() {
        const tempDir = libpath.resolve("./temp");

        if (!fs.existsSync(tempDir)) {
            console.log("temp 資料夾不存在");
            return [];
        }

        // 1. 讀取所有 .txt 檔案，並進行排序 (確保從 00.txt 讀取到 99.txt)
        let files = fs.readdirSync(tempDir);
        files = files.filter((file) => file.endsWith(".txt")).sort(); // 預設字母排序剛好符合 00.txt -> 99.txt

        if (files.length === 0) {
            console.log("temp 資料夾中沒有 .txt 檔案");
            return [];
        }

        // 建立一個 map 用來合併相同日期的內容
        // dateMap: { 'YYYY/MM/DD': [ { dateTime, author, content, uid }, ... ] }
        const dateMap = new Map();

        for (const file of files) {
            const filePath = libpath.join(tempDir, file);
            let fileContent = fs.readFileSync(filePath, "utf8");

            // 只有檔名包含 -special 才做時間轉換
            if (file.includes("-special")) {
                // 預處理時間格式：將「上午/下午 hh:mm」轉換為 24 小時制的「HH:mm」
                // 匹配格式例如：「下午07:37」、「上午09:12」、「下午 07:37」
                fileContent = fileContent.replace(/(上午|下午)\s*(\d{1,2}):(\d{2})/g, (match, ampm, hour, minute) => {
                    let h = parseInt(hour, 10);
                    if (ampm === "下午" && h < 12) {
                        h += 12;
                    } else if (ampm === "上午" && h === 12) {
                        h = 0;
                    }
                    // 將小時補零成兩位數
                    const formattedHour = h.toString().padStart(2, "0");
                    return `${formattedHour}:${minute}`;
                });
            }

            // 2. 利用 reqEx split 提取出日期並分段
            // 加上 \n? 確保匹配前面有換行的日期，或 \r?\n? 兼容 windows / unix 換行符
            // 依照要求，明確修改為 YYYY/MM/DD（[一二三四五六日]）格式 (支援斜線和點)
            const datePattern = /(?:\r?\n)?(?:\\)?(\d{4}[/]\d{2}[/]\d{2})[（(][一二三四五六日][)）]/g;
            const dateSplits = fileContent.split(datePattern);

            let tempDailyReports = [];

            for (let i = 1; i < dateSplits.length; i += 2) {
                const date = dateSplits[i];
                const content = dateSplits[i + 1] ? dateSplits[i + 1].trim() : "";

                if (content.length > 0) {
                    tempDailyReports.push({
                        date: date,
                        content: content
                    });
                }
            }

            // 解析每個日期的時間段落
            // 依照要求，明確修改為 \n12:41\t 格式 (為了相容不同換行符，我們支援 \r?\n)
            // 加上括號 (\d{2}:\d{2}) 是為了能在 split 後將匹配的時間本身保留在陣列中
            // ^ 代表開頭，確保時間前是換行或字串開頭
            const timePattern = /(?:^\r?\n|\n|^)(\d{2}:\d{2})\t/gm;

            for (const dailyReport of tempDailyReports) {
                // 有些日記可能沒有時間戳記，因此我們需要做判斷
                // 如果找不到時間戳記，或者分割後只有一個段落，則當成沒有時間戳記的一般訊息處理
                const timeSplits = dailyReport.content.split(timePattern);
                let contentsByTime = [];

                if (timeSplits.length > 1) {
                    for (let i = 1; i < timeSplits.length; i += 2) {
                        const time = timeSplits[i];
                        const rawContent = timeSplits[i + 1] ? timeSplits[i + 1].trim() : "";

                        if (rawContent.length > 0) {
                            const tabSplits = rawContent.split("\t");

                            let author = "";
                            let content = rawContent;

                            if (tabSplits.length >= 2) {
                                author = tabSplits[0].trim();
                                content = tabSplits.slice(1).join("\t").trim();
                            }

                            // 產生長度超過30的獨立 id (UUID v4 通常為 36 個字元)
                            const uid = crypto.randomUUID();

                            // 組合 dateTime: 'YYYY/MM/DD/hh:ss'
                            const dateTime = `${dailyReport.date} ${time}`;

                            contentsByTime.push({
                                dateTime: dateTime,
                                author: author,
                                content: content,
                                uid: uid
                            });
                        }
                    }
                } else {
                    // 如果這一天完全沒有 hh:mm 格式，就整包當成一則內容
                    const rawContent = dailyReport.content;
                    if (rawContent.length > 0) {
                        const tabSplits = rawContent.split("\t");

                        let author = "";
                        let content = rawContent;

                        if (tabSplits.length >= 2) {
                            author = tabSplits[0].trim();
                            content = tabSplits.slice(1).join("\t").trim();
                        }

                        // 沒有時間時，我們可以在開頭把日期塞回 content，符合後續 getDiariesOfMessages 邏輯
                        content = `${dailyReport.date}\n${content}`;

                        const uid = crypto.randomUUID();
                        const dateTime = `${dailyReport.date}`; // 沒有時間就只放日期

                        contentsByTime.push({
                            dateTime: dateTime,
                            author: author,
                            content: content,
                            uid: uid
                        });
                    }
                }

                // 合併邏輯：如果日期已存在，則將新內容併入該日期的 Array 中
                if (contentsByTime.length > 0) {
                    if (dateMap.has(dailyReport.date)) {
                        dateMap.get(dailyReport.date).push(...contentsByTime);
                    } else {
                        dateMap.set(dailyReport.date, contentsByTime);
                    }
                }
            }
        }

        // 將 Map 轉換回要求的 Array 格式
        const reportsOfFinal = [];
        for (const [date, contents] of dateMap.entries()) {
            reportsOfFinal.push({
                date: date,
                contents: contents
            });
        }

        return reportsOfFinal;
    }

    /**
     * 將 `processTempFiles()` 回傳的階層式陣列打平，彙整成一個包含所有訊息的一維陣列。
     * 同時過濾掉內容僅為 [照片]、[貼圖]、[影片] 或是空字串的無效訊息。
     *
     * @param {Array<Object>} [obj=this.processTempFiles()] `processTempFiles` 輸出的資料格式
     * @returns {Array<Object>} 一維的訊息物件陣列
     * @example
     * // Return format:
     * [
     *   {
     *     "dateTime": "2026/05/05/19:37",
     *     "author": "Alice",
     *     "content": "今天天氣很好",
     *     "uid": "123e4567-e89b-12d3-a456-426614174000"
     *   },
     *   {
     *     "dateTime": "2026/05/06",
     *     "author": "",
     *     "content": "2026.05.06\n中午自己下樓...",
     *     "uid": "987f6543-e21c-45d6-b890-426614174001"
     *   }
     * ]
     */
    getAllMessages = (obj = this.processTempFiles()) => {
        // 如果沒有傳入 obj 或非陣列，回傳空陣列 (防呆邏輯)
        if (!obj || !Array.isArray(obj)) return [];

        const messages = [];

        for (const daily of obj) {
            // 確保 daily.contents 存在且為陣列 (防呆邏輯)
            if (daily && daily.contents && Array.isArray(daily.contents)) {
                const validContents = daily.contents.filter((msg) => {
                    if (!msg.content) return false;

                    const trimmedContent = msg.content.trim();

                    // 過濾掉內容僅為 [照片], [貼圖], [影片] 或空字串的無效訊息
                    if (!trimmedContent) return false;
                    if (trimmedContent === "[照片]") return false;
                    if (trimmedContent === "[貼圖]") return false;
                    if (trimmedContent === "[影片]") return false;
                    if (trimmedContent === "傳送了聯絡資訊") return false; // 常見的系統訊息也一併過濾，視需求可保留或刪除
                    if (trimmedContent === "已取消收回訊息") return false;

                    return true;
                });

                messages.push(...validContents);
            }
        }

        return messages;
    };

    /**
     * 從 `getAllMessages()` 取得的一維訊息陣列中，過濾出 `content` 內容開頭為日期的項目，
     * 或是內容大於 5 行的項目。
     * 支援的日期開頭格式包含: `yyyy.mm.dd` 或 `yyyy/mm/dd`。
     *
     * @param {Array<Object>} [array=this.getAllMessages()] 透過 `getAllMessages` 輸出的陣列
     * @returns {Array<Object>} 篩選過後的一維訊息物件陣列 (包含日記格式的內容或大於 5 行的內容)
     * @example
     * // Return format:
     * [
     *   {
     *     "dateTime": "2026/05/06",
     *     "author": "",
     *     "content": "2026.05.06\n中午自己下樓...",
     *     "uid": "987f6543-e21c-45d6-b890-426614174001"
     *   }
     * ]
     */
    getDiariesOfMessages(array = this.getAllMessages()) {
        // 如果 array 不是陣列，回傳空陣列
        if (!Array.isArray(array)) return [];

        /** 篩選出contents包含 yyyy.mm.dd 或是 yyyy/mm/dd 的內容*/
        // 移除 yyyymmdd，要求日期中間必須有 . 或 /
        const dateStartPattern = /^\d{4}[./]\d{2}[./]\d{2}/;
        return array.filter((msg) => {
            if (!msg || !msg.content) return false;

            // 條件 1: 開頭符合日期格式
            const trimmedContent = msg.content.replace(/^["\s\\]+/, "");
            const isDateStart = dateStartPattern.test(trimmedContent);

            // 條件 2: 內容行數大於 5 行
            // 利用 \n 來分割字串計算行數
            // const lines = msg.content.split('\n');
            // 過濾掉空行計算實際有文字的行數，或者直接計算所有換行數
            // 這裡我們直接計算所有分割出來的行數
            // const isMoreThan5Lines = lines.length > 10;
            // || isMoreThan5Lines;
            return isDateStart;
        });
    }

    extractDiaries = async (list = this.getDiariesOfMessages()) => {
        // const list = Util.getFileContextInJSON('./temp/diary.json');
        if (!Array.isArray(list)) return [];

        const latest = [];
        const exactDateStartPattern = /^["\s\\]*(\d{4}[./]\d{2}[./]\d{2})(?:[（(][一二三四五六日][)）])?[\s\r\n]*/;

        for (const msg of list) {
            if (!msg.content) continue;

            const trimmedContent = msg.content.trim();
            const match = trimmedContent.match(exactDateStartPattern);

            if (match) {
                const createTime = match[1];
                const extractedContent = trimmedContent.replace(exactDateStartPattern, "").trim();

                latest.push({
                    injectTime: msg.dateTime,
                    createTime: createTime,
                    author: msg.author,
                    content: extractedContent
                });
            }
        }
        const sorted = latest.sort((a, b) => a.createTime.localeCompare(b.createTime));
        return sorted;
    };

    getDiariesOfNormalized = async () => {
        const sorted = await this.extractDiaries();
        /** persist太浪漫時間了
        await Util.persistJsonFilePrettier('./temp/gen/formal_diary.json', sorted);
        await Util.persistJsonFilePrettier('./temp/gen/analyst_diary.json', sorted.map(each => ({ createTime: each.createTime, author: each.author })));
         */

        return sorted;
    };
}

export default agent_diary_manager;
