import _ from "lodash"
import path from 'path';
import puppeteer from 'puppeteer';
import rta from './analysis/brain/RankTableAnalysis.js';
import frta from './analysis/brain/FavoriteRankTableAnalysis.js';
import lrta from './analysis/brain/LatestRankTableAnalysis.js';

import ta from './analysis/brain/ToneAnalysis.js';
import sa from './analysis/brain/SingersAnalysis.js';
import sla from './analysis/brain/SongListAnalysis.js';
import GlobalConfig from './GlobalConfig.js';
import firebaseHandler from './firebase';
import Util from './util';
import SQL from './database';
import Pooller from "./pooller";
import ERROR from "./exception";
import Moment from 'moment';
import {findConfigUpwards} from "@babel/core/lib/config/files/index-browser";

(async () => {
        const sqlHandler = new SQL();
        await sqlHandler.init();

        async function syncDelay(delayInms) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(true);
                }, delayInms);
            });
        }

        async function persistRankTable() {
            const tableName = GlobalConfig.RANK_TABLE_NAME;
            await sqlHandler.dropTable(tableName);
            for (const maintype in GlobalConfig.RANK_TABLE_TYPE) {
                Util.appendInfo(`正在fetch 排行榜上  "${maintype}" 的 RANK...`)
                const ranks = await fetchRankTable(GlobalConfig.RANK_TABLE_TYPE[maintype].ID, GlobalConfig.RANK_TABLE_TYPE[maintype].SORT)
                for (const rank of ranks) {
                    for (const each of rank.items) {
                        const obj = {}
                        obj[`${rank.type ? rank.type : maintype}`] = _.toNumber(each.rank);
                        await sqlHandler.lazyInsertRecord(tableName,
                            {...obj, name: each.name, singer: each.singer.name, updateTime: _.now()}, 'name', 'singer');
                    }
                }

            }
        }

        /** sortType sample => {YEAR: 5, SEASON: 4, MONTH: 3, WEEK: 2, DAY: 1}
         *
         * return:[...{type:'YEAR',items:[...{name:'歌名',rank:1,singer:{name:'人名'} }]}]
         *
         * */
        async function fetchRankTable(mainType = GlobalConfig.RANK_TABLE_TYPE.POPULAR.ID, sortType) {
            let page;
            try {
                page = await browser.newPage();
                await page.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER, {waitUntil: 'networkidle2'});
                await page.click(`span[sid="${mainType}"]`);
                await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
                const all = [];
                if (sortType) {

                    for (const type in sortType) {
                        const selector = await page.$(`div[class="singsort sorttype"] > .list > span[sid="${sortType[type]}"]`);
                        /** 上面的寫法 const eval = await page.$eval(`div[class="singsort sorttype"] > .list > span[sid="${sortType}"]`,(element => element.click())); */
                        await selector.click();
                        await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
                        all.push({type, items: await fetchRankPageData(page)});
                    }
                } else {
                    all.push({type: '', items: await fetchRankPageData(page)});
                }
                return all;
            } catch (error) {
                Util.appendError(`fetch rank tables fail, because ` + error.message);
            } finally {
                if (page) await page.close()
            }

            async function getRankPageInstance() {
                let rankPage;
                switch (mainType) {
                    case GlobalConfig.RANK_TABLE_TYPE.POPULAR.ID:
                        rankPage = new rta(await page.content());
                        break;
                    case GlobalConfig.RANK_TABLE_TYPE.FAVORITE.ID:
                        rankPage = new frta(await page.content());
                        break;
                    case GlobalConfig.RANK_TABLE_TYPE.LATEST.ID:
                        rankPage = new lrta(await page.content());
                        break;
                    default:
                        throw new Error(`${mainType} not defined in GlobalConfig.RANK_TABLE_TYPE[mainType].ID`);
                }
                return rankPage;
            }

            async function fetchRankPageData(page) {
                /** fetch all pages */
                let songs = [];
                let rankPage;

                rankPage = await getRankPageInstance()
                songs = _.concat(songs, rankPage.getSongList());
                while (rankPage && rankPage.hasNextPage() && songs.length < GlobalConfig.MAX_COUNTS_IN_RANK) {
                    await page.click(rankPage.getNextPageSymbol());
                    await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
                    rankPage = await getRankPageInstance();
                    if (rankPage) songs = _.concat(songs, rankPage.getSongList());
                }
                return songs;
            }
        }

        async function fetchAllSinger(singerType = 6) {
            await mainPage.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER,
                {waitUntil: 'networkidle2'}
            );
            await mainPage.click('span[sid="0"]');
            await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
            const content = await mainPage.content();
            const mSingerAnalysis = new sa(content);
            const all = mSingerAnalysis.getAllSingers(singerType);
            return all;
        }

        async function fetchTone(song) {
            let _page = undefined;
            let tone = undefined;
            try {
                _page = await browser.newPage();
                if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
                    Util.appendInfo(`正在 ${song.name} 下載頁面.... `);
                }
                await _page.goto(path.join(GlobalConfig.BASE_URL, song.url),
                    {waitUntil: 'networkidle2'}
                );
                await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
                tone = new ta(await _page.content());
            } catch (error) {
                const errorlog = ` fetchTone(${song.name})  Error: ` + error.message
                Util.appendError(errorlog);
                throw new Error(error);
            } finally {
                if (_page !== undefined) {
                    Util.appendInfo(`已經將 ${song.name} 頁面正常關閉....`);
                    await _page.close();
                }
            }
            return tone;
        }

        async function fetchSongsOfSingersPage(path) {
            let mSongList = [];
            const _page = await browser.newPage();
            await _page.goto(path,
                {waitUntil: 'networkidle2'}
            );
            await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
            const content = await _page.content();
            let mSongListAnalysis = new sla(content);
            mSongList = mSongList.concat(mSongListAnalysis.getAll());

            while (mSongListAnalysis.hasNextPage()) {
                await _page.click(`${mSongListAnalysis.getNextPageButtonSymbol()}`);
                await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
                const content = await _page.content();
                mSongListAnalysis = new sla(content);
                mSongList = mSongList.concat(mSongListAnalysis.getAll());
            }
            await _page.close();
            return mSongList;
        }

        async function persistSongsAndSinger(singer) {
            try {
                const start = _.now();
                const _db = await sqlHandler.fetchRecords('SINGER', SQL.Builder().equal('name', singer.name).stmt());
                if (_db.length > 0) {
                    Util.appendFile(GlobalConfig.PATH_INFO_LOG, `此歌手 '${singer.name}' 已在資料庫中'`);
                    return;
                }
                Util.appendFile(GlobalConfig.PATH_ERROR_LOG, `正在下載歌手 ${singer.name} 的歌單們....'`);
                const mSongList = await fetchSongsOfSingersPage(path.join(GlobalConfig.BASE_URL, singer.url));
                for (const song of mSongList) {
                    try {
                        await sqlHandler.lazyInsertRecord('SONG',
                            {...song, state: 'NOT', singer: singer.name}, 'name', 'singer');
                        Util.appendFile(GlobalConfig.PATH_INFO_LOG, `正在儲存歌手 '${singer.name}' 的歌 '${song.name}' `);
                    } catch (error) {
                        Util.appendFile(GlobalConfig.PATH_ERROR_LOG,
                            `TABLE SONG 出現錯誤了,${song.name} ${JSON.stringify(error)}`)

                    }
                }
                const songCounts = _.isArray(mSongList) ? mSongList.length : 0;
                const cost = _.now() - start;
                await sqlHandler.lazyInsertRecord('SINGER', {
                    ...singer,
                    songCounts,
                    cost
                }, 'name', 'names');
                return singer;
            } catch (error) {
                Util.appendFile(GlobalConfig.PATH_ERROR_LOG,
                    `fetchSongsBySinger ${singer.name} 出現錯誤 ${JSON.stringify(error)}`)
            }
        }

        async function persistRank() {

        }

        async function persistTone() {
            let song = undefined;
            try {
                const start = _.now();
                const record = Util.getRandomItemOfArray(
                    await sqlHandler.fetchRecords('SONG', SQL.Builder()
                        .gte('popularLevel',
                            GlobalConfig.HACK_FETCH_DEPEND_ON_POPULAR_LEVEL_THRESHOLD)
                        .and().equal('state', 'NOT')
                        .orderByRandom().limit(1).stmt())
                );

                if (record) {
                    song = record;
                    await sqlHandler.updateRecords('SONG', {state: 'ING'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());

                    const raw = await fetchTone(song);
                    if (raw !== undefined) {
                        const tone = raw.getNormalizeToneObject();
                        const cost = _.now() - start;
                        await sqlHandler.lazyInsertRecord('TONE', {
                            ...tone,
                            cost
                        }, 'name', 'singer');
                        await sqlHandler.updateRecords('SONG', {state: 'DONE'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());
                        Util.appendInfo(`成功儲存TONE '${tone.name}' .....`)
                        return true;

                    } else {
                        Util.appendError(
                            `persistTone() ${song.name} 出現錯誤, tone 是 undefined`);
                        await sqlHandler.updateRecords('SONG', {state: 'NOT'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());
                        return false;
                    }
                } else {
                    Util.appendInfo(`沒有TONE可以下載了....`)
                    return false;
                }
            } catch (error) {
                if (error instanceof ERROR && error.isConstraintError()) {
                    Util.appendInfo(`persistTone() ${song.name}, 是一首 DUP 的狀況.....`);
                    await sqlHandler.updateRecords('SONG', {state: 'DUP'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());
                } else {
                    Util.appendError(`persistTone() ${song.name},  ${JSON.stringify(error.message)}`);
                    await sqlHandler.updateRecords('SONG', {state: 'NOT'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());
                }
            }
        }

        async function persist(singerType = 6) {
            let singers = [];


            async function fetchSingers() {
                let singers = await fetchAllSinger(singerType);
                const exists = (await sqlHandler.fetchRecords('SINGER', '', 'name')).map((exist) => exist.name);
                Util.appendInfo(`在資料庫的歌手有 '${singers.length}' 個`)
                singers = _.remove(singers, (singer) => {
                    return !exists.includes(singer.name);
                })
                singers = Util.getShuffledArrayWithLimitCount(singers, singers.length);
            }

            async function fetchSongs() {
                if (singers.length > 0) {
                    const singer = singers.pop();
                    Util.appendFile(GlobalConfig.PATH_INFO_LOG,
                        `尚未完成的歌手還有 '${singers.length}' 個`)
                    await persistSongsAndSinger(singer);
                } else {
                    Util.appendFile(GlobalConfig.PATH_INFO_LOG,
                        `沒有需要fetch的song了, 尚未完成的歌手還有 '${singers.length}' 個`)
                }
            }

            async function browserWatcher() {
                if (browser !== undefined) {
                    Util.appendInfo(`browser pages = ${((await browser.pages()).length)}`)
                }
            }

            const poollers = [];
            /** 抓排行榜 once 1 mins */

            const errorHandler = (error) => {
                Util.appendError(`TASK 遇到問題 ${JSON.stringify(error.message)}`);
            }

            /** 檢查歌手 once 2 mins */
            const singerFetcher = new Pooller(1);
            const twoMin = 2 * 60 * 1000;
            singerFetcher.setPoolId("SINGER FETCHER");
            singerFetcher.runInBackGround(singerFetcher.runInInfinite, fetchSingers, twoMin);
            singerFetcher.setTaskFailHandler(errorHandler);
            poollers.push(singerFetcher);

            /** 針對歌手抓 song once 10sec, else sleepx2, x2. 如果沒有未抓的,就超過一周 */
            const songFetch = new Pooller(2);
            const TwentySecs = 20 * 1000;
            songFetch.setPoolId("SONG FETCHER");
            songFetch.runInBackGround(songFetch.runInInfinite, fetchSongs, TwentySecs);
            songFetch.setTaskFailHandler(errorHandler);
            poollers.push(songFetch);

            /** 針對song找對應的tune. 如果沒有未抓的,就超過一周 10sec一次 else sleepx2 ,3 workers */
            const toneFetch = new Pooller(2);
            toneFetch.cleanTaskInterval();
            toneFetch.setPoolId("TONE FETCHER");
            toneFetch.runInBackGround(toneFetch.runInInfinite, persistTone);
            toneFetch.setTaskFailHandler(errorHandler);
            poollers.push(toneFetch);

            /** 抓取排行版上的資訊們 */
            const rankFetch = new Pooller(1);
            rankFetch.cleanTaskInterval();
            rankFetch.setPoolId("RANK FETCHER");
            const fiveMin = 5 * 60 * 1000;
            rankFetch.runInBackGround(rankFetch.runInInfinite, persistRankTable, fiveMin);
            rankFetch.setTaskFailHandler(errorHandler);
            poollers.push(rankFetch);

            /** 監督browser page 有沒有爆掉 */
            const browserWatch = new Pooller(1);
            browserWatch.setPoolId("BROWSER WATCHER");
            browserWatch.runInBackGround(browserWatch.runInInfinite, browserWatcher, 20000);
            browserWatch.setTaskFailHandler(errorHandler);
            poollers.push(browserWatch);


            while (_.find(poollers.map((pooller) => pooller.isRunning()), (self) => self)) {
                const millionSecs = await Util.syncDelayRandom(5000, 10000);
                Util.appendInfo(`主線程還在努中工作中, ${millionSecs} mms`);
                if ((Util.readFileInJSON(GlobalConfig.PATH_DYNAMIC_INFO))['cancel']) {
                    Util.appendInfo(`主線程收到關閉指令...`);
                    for (const pooller of poollers) {
                        Util.appendInfo(`POOLER ${pooller.getPoolId()} 正在關閉中`);
                        await pooller.stopInBackground();
                        Util.appendInfo(`POOLER ${pooller.getPoolId()} 關閉成功!`);
                    }
                }
            }

        }

        const browser = await puppeteer.launch({
            headless: !GlobalConfig.INVOKE_REAL_CHROME
        });
        Util.writeFileInJSON(GlobalConfig.PATH_DYNAMIC_INFO, {cancel: false, host: 'David', timeStamp: new Date()});
        Util.deleteFile(GlobalConfig.PATH_ERROR_LOG);
        Util.deleteFile(GlobalConfig.PATH_INFO_LOG);
        const mainPage = await browser.newPage();
        await persist(5);
        await browser.close();
        if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
            console.log(`＝＝＝＝＝＝＝＝＝＝＝＝＝瀏覽器已關閉＝＝＝＝＝＝＝＝＝＝＝＝＝`);
        return 0;
    }

)();

async function downloadAllSong(singerType = 6) {
    await firebaseHandler.setSinger(singer);
    await firebaseHandler.setTone(mToneObject);
    await firebaseHandler.setSingerTones(mToneObject);
}
