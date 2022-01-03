import _ from "lodash"
import path from 'path';
import puppeteer from 'puppeteer';
import rta from './analysis/RankTableAnalysis.js';
import frta from './analysis/FavoriteRankTableAnalysis.js';
import lrta from './analysis/LatestRankTableAnalysis.js';
import ta from './analysis/ToneAnalysis.js';
import sa from './analysis/SingersAnalysis.js';
import sla from './analysis/SongListAnalysis.js';

import {configerer as Config} from 'configerer';
import {utiller as Util, exceptioner as ERROR, pooller as Pooller} from 'utiller';
import {databaser as SQL} from 'databaser';

const INVOKE_REAL_CHROME = false;

(async () => {
        async function syncDelay(delayInms) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(true);
                }, delayInms);
            });
        }

        async function persistRankTable() {
            const tableName = Config.RANK_TABLE_NAME;
            await database.dropTable(tableName);
            for (const maintype in Config.RANK_TABLE_TYPE) {
                Util.appendInfo(`正在fetch 排行榜上  "${maintype}" 的 RANK...`)
                const ranks = await fetchRankTable(Config.RANK_TABLE_TYPE[maintype].ID, Config.RANK_TABLE_TYPE[maintype].SORT)
                for (const rank of ranks) {
                    for (const each of rank.fatefulItems) {
                        const obj = {}
                        obj[`${rank.type ? rank.type : maintype}`] = _.toNumber(each.rank);
                        await database.lazyInsertRecord(tableName,
                            {name: each.name, singer: each.singer.name, updateTime: _.now(), ...obj}, 'name', 'singer');
                    }
                }
            }
        }

        /**
         *
         * sortType sample => {YEAR: 5, SEASON: 4, MONTH: 3, WEEK: 2, DAY: 1}
         *
         * return:[...{type:'YEAR',fatefulItems:[...{name:'歌名',rank:1,singer:{name:'人名'} }]}]
         *
         * */
        async function fetchRankTable(mainType = Config.RANK_TABLE_TYPE.POPULAR.ID, sortType) {
            let page;
            try {
                page = await browser.newPage();
                await page.goto(Config.PATH_SAMPLE_URL_SINGER, {waitUntil: 'networkidle2'});
                await page.click(`span[sid="${mainType}"]`);
                await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
                const all = [];
                if (sortType) {

                    for (const type in sortType) {
                        const selector = await page.$(`div[class="singsort sorttype"] > .list > span[sid="${sortType[type]}"]`);
                        /** 上面的寫法 const eval = await page.$eval(`div[class="singsort sorttype"] > .list > span[sid="${sortType}"]`,(element => element.click())); */
                        await selector.click();
                        await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
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
                    case Config.RANK_TABLE_TYPE.POPULAR.ID:
                        rankPage = new rta(await page.content());
                        break;
                    case Config.RANK_TABLE_TYPE.FAVORITE.ID:
                        rankPage = new frta(await page.content());
                        break;
                    case Config.RANK_TABLE_TYPE.LATEST.ID:
                        rankPage = new lrta(await page.content());
                        break;
                    default:
                        throw new Error(`${mainType} not defined in GlobalConfig.RANK_TABLE_TYPE[mainType].ID`);
                }
                return rankPage;
            }

            async function fetchRankPageData(page) {
                /** fetchObject all pages */
                let songs = [];
                let rankPage;

                rankPage = await getRankPageInstance()
                songs = _.concat(songs, rankPage.getSongList());
                while (rankPage && rankPage.hasNextPage() && songs.length < Config.MAX_COUNTS_IN_RANK) {
                    await page.click(rankPage.getNextPageSymbol());
                    await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
                    rankPage = await getRankPageInstance();
                    if (rankPage) songs = _.concat(songs, rankPage.getSongList());
                }
                return songs;
            }
        }

        async function fetchAllSinger(singerType = 6) {

            await mainPage.goto(Config.PATH_SAMPLE_URL_SINGER,
                {waitUntil: 'networkidle2'}
            );
            await mainPage.click('span[sid="0"]');
            await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
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
                _page.setDefaultNavigationTimeout(60000);
                if (Config.MAIN_MSG.SHOW_SUCCEED) {
                    Util.appendInfo(`正在 ${song.name} 下載頁面.... `);
                }
                await _page.goto(path.join(Config.BASE_URL, song.url),
                    {waitUntil: 'networkidle2'}
                );
                await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
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
            await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
            const content = await _page.content();
            let mSongListAnalysis = new sla(content);
            mSongList = mSongList.concat(mSongListAnalysis.getAll());

            while (mSongListAnalysis.hasNextPage()) {
                await _page.click(`${mSongListAnalysis.getNextPageButtonSymbol()}`);
                await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
                const content = await _page.content();
                mSongListAnalysis = new sla(content);
                mSongList = mSongList.concat(mSongListAnalysis.getAll());
            }
            await _page.close();
            return mSongList;
        }

        async function persistSongs() {
            const start = _.now();
            const singer = await database.fetchRecord('SINGER', SQL.Builder().equal('state', 'NOT').orderByRandom().limit(1).stmt());
            if (singer) {
                try {
                    Util.appendInfo(`正在下載歌手 ${singer.name} 的歌單們....'`);
                    await database.updateState('SINGER', 'ING', singer.uid);
                    const songs = await fetchSongsOfSingersPage(path.join(Config.BASE_URL, singer.url));
                    for (const song of songs) {
                        await database.lazyInsertRecord('SONG',
                            {...song, state: 'NOT', singer: singer.name}, 'name', 'singer');
                        Util.appendInfo(`正在儲存歌手 '${singer.name}' 的歌 '${song.name}' `);
                    }
                    const cost = _.now() - start;
                    await database.updateState('SINGER', 'DONE', singer.uid);
                    await database.updateRecords('SINGER', {cost: cost, songCounts: songs.length},
                        SQL.Builder().equal('uid', singer.uid).stmt());
                } catch (error) {
                    Util.appendError(`persistSongsBySinger() 出現錯誤了, ${error.message}`)
                    await database.updateState('SINGER', 'NOT', singer.uid);
                }
            } else {
                Util.appendInfo(`沒有未完成的歌手了....睡個 ${await Util.syncDelayRandom()} mms`);
            }
        }

        async function persistTone() {
            let song = undefined;
            try {
                const start = _.now();
                const record = Util.getRandomItemOfArray(
                    await database.fetchRecords('SONG', SQL.Builder()
                        .gte('popularLevel',
                            Config.HACK_FETCH_DEPEND_ON_POPULAR_LEVEL_THRESHOLD)
                        .and().equal('state', 'NOT')
                        .orderByRandom().limit(1).stmt())
                );

                if (record) {
                    song = record;
                    await database.updateRecords('SONG', {state: 'ING'}, SQL.Builder().equal(Config.UID, song.uid).stmt());

                    const raw = await fetchTone(song);
                    if (raw !== undefined) {
                        const tone = raw.getNormalizeToneObject();
                        const cost = _.now() - start;
                        await database.lazyInsertRecord('TONE', {
                            ...tone,
                            cost
                        }, 'name', 'singer');
                        await database.updateRecords('SONG', {state: 'DONE'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                        Util.appendInfo(`成功儲存TONE '${tone.name}' .....`)
                        return true;

                    } else {
                        Util.appendError(
                            `persistTone() ${song.name} 出現錯誤, tone 是 undefined`);
                        await database.updateRecords('SONG', {state: 'NOT'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                        return false;
                    }
                } else {
                    Util.appendInfo(`沒有TONE可以下載了....隨機睡個${await Util.syncDelayRandom(1500, 3500)}`)
                    return false;
                }
            } catch (error) {
                if (error instanceof ERROR && error.isConstraintError()) {
                } else {
                    Util.appendError(`persistTone() ${song.name},  ${JSON.stringify(error.message)}`);
                    await database.updateRecords('SONG', {state: 'NOT'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                }
            }
        }

        async function latestSongPersist() {
            const song = await fetchRankTable(Config.RANK_TABLE_TYPE.LATEST.ID);
            if (song.length < 0) {
                Util.appendError(`latestSongPersist 抓取失敗了喔～`);
                return;
            }
            const songs = song[0].fatefulItems;
            const exist = await database.fetchRecords('SONG');
            _.pullAllWith(song, exist, (s1, s2) => _.isEqual(s1.name, s2.name) && _.isEqual(s1.singer, s2.singer))
            Util.appendInfo(`latestSongPersist() 抓了新歌 ${songs.length} 首`);
            for (const item of songs)
                try {
                    await database.insertRecord('SONG',
                        {
                            popularLevel: 10000,
                            name: item.name,
                            singer: item.singer.name,
                            url: item.url,
                            state: 'NOT',
                        });
                } catch (error) {
                    if (error instanceof ERROR && error.isConstraintError()) {
                        /** ignore */
                        Util.appendInfo(`latestSongPersist() 遇到了 CONSTRAINT ERROR ` + Util.deepFlat(error.message));
                    } else {
                        throw new Error(`latestSongPersist 必須注意這個問題 ${error.message}`)
                    }
                }
        }

        async function persistSingers(singerType = 6) {
            Util.appendInfo('persistSingers 起飛了');
            let singers = await fetchAllSinger(singerType);
            const exists = (await database.fetchRecords('SINGER', '', 'names')).map((singer) => singer.names);
            Util.appendInfo(`persistSingers 在網路上歌手有 '${singers.length}' 個, 資料庫裡面有 '${exists.length}'`);
            _.remove(singers, (singer) => {
                return _.indexOf(exists, Util.deepFlat(singer.names)) >= 0
            });
            for (const singer of singers) {
                await database.lazyInsertRecord('SINGER',
                    {...singer, state: 'NOT'}, 'name', 'names');
            }
        }

        async function persist91puEveryThing(singerType = 6) {

            async function browserPageWatcher() {
                if (browser !== undefined) {
                    Util.appendInfo(`browser pages = ${((await browser.pages()).length)}`)
                }
            }

            const poollers = [];
            const errorHandler = (error) => {
                Util.appendError(`９１pu => TASK 遇到問題 ${JSON.stringify(error.message)}`);
            }

            // /** 檢查歌手 once 2 mins */

            const tenSecs = 10 * 1000;
            const twoSecs = 2 * 1000;
            const oneMin = 6 * tenSecs;
            const twoMin = 2 * oneMin;
            const fiveMin = 5 * oneMin;
            const threeMin = 3 * oneMin;

            const singerFetcher = new Pooller(1);
            singerFetcher.setPoolId("SINGER FETCHER");
            singerFetcher.setIgnoreFirstRun();
            singerFetcher.runInBackGround(singerFetcher.runInInfinite, persistSingers,
                oneMin);
            singerFetcher.setTaskFailHandler(errorHandler);
            poollers.push(singerFetcher);

            /** 針對歌手抓 song once 10sec, else sleepx2, x2. 如果沒有未抓的,就超過一周 */
            const songFetch = new Pooller(1);
            songFetch.setPoolId("SONG FETCHER");
            songFetch.runInBackGround(songFetch.runInInfinite, persistSongs, tenSecs);
            songFetch.setTaskFailHandler(errorHandler);
            poollers.push(songFetch);

            /** 抓取排行版上的資訊們 */
            const rankFetch = new Pooller(1);
            rankFetch.cleanTaskInterval();
            rankFetch.setIgnoreFirstRun()
            rankFetch.setPoolId("RANK FETCHER");
            rankFetch.enableTaskTimeout(true, fiveMin);
            rankFetch.runInBackGround(rankFetch.runInInfinite, persistRankTable, fiveMin);
            rankFetch.setTaskFailHandler(errorHandler);
            poollers.push(rankFetch);

            /** 監督browser page 有沒有爆掉 */
            const browserWatcher = new Pooller(1);
            browserWatcher.setPoolId("BROWSER WATCHER");
            browserWatcher.runInBackGround(browserWatcher.runInInfinite, browserPageWatcher, twoMin);
            browserWatcher.setTaskFailHandler(errorHandler);
            poollers.push(browserWatcher);

            /** 猛抓LATEST TABLE的歌曲*/
            const latestToneFetch = new Pooller(1);
            latestToneFetch.setPoolId("LATEST SONG FETCHER");
            latestToneFetch.setIgnoreFirstRun();
            latestToneFetch.runInBackGround(latestToneFetch.runInInfinite, latestSongPersist,
                threeMin);
            latestToneFetch.setTaskFailHandler(errorHandler);
            poollers.push(latestToneFetch);

            /** 針對song找對應的tune. 如果沒有未抓的,就超過一周 10sec一次 else sleepx2 ,3 workers */
            const toneFetch = new Pooller(4);
            toneFetch.cleanTaskInterval();
            toneFetch.setPoolId("TONE FETCHER");
            toneFetch.runInBackGround(toneFetch.runInInfinite, persistTone, twoSecs);
            toneFetch.setTaskFailHandler((error) => console.error(`.....無奈呀 ${error.message}`));
            poollers.push(toneFetch);

            while (true) {
                const millionSecs = await Util.syncDelayRandom(5000, 10000);
                Util.appendInfo(`主線程還在努中工作中, ${millionSecs} mms`);
                if ((Util.getFileContextInJSON(Config.PATH_DYNAMIC_INFO))['cancel']) {
                    Util.appendInfo(`主線程收到關閉指令...`);
                    for (const pooller of poollers) {
                        Util.appendInfo(`POOLER ${pooller.getPoolId()} 正在關閉中`);
                        await pooller.stopInBackground();
                        pooller.showState();
                        Util.appendInfo(`POOLER ${pooller.getPoolId()} 關閉成功!`);
                    }
                    break;
                }
            }
        }

        const database = new SQL('../databaser/secret_infos_latest.db');
        await database.init();

        const browser = await puppeteer.launch({
            headless: !INVOKE_REAL_CHROME
        });
        Util.writeFileInJSON(Config.PATH_DYNAMIC_INFO, {
            cancel: false,
            host: 'David',
            timeStamp: new Date(),
            'dbName': Config.BASE_DATABASE_PATH
        });
        Util.syncDeleteFile(Config.PATH_ERROR_LOG);
        Util.syncDeleteFile(Config.PATH_INFO_LOG);
        const mainPage = await browser.newPage();
        await persist91puEveryThing();
        // await latestSongPersist();
        // /** 針對song找對應的tune. 如果沒有未抓的,就超過一周 10sec一次 else sleepx2 ,3 workers */


        // await browser.close();
        if (Config.MAIN_MSG.SHOW_SUCCEED)
            Util.appendInfo(`＝＝＝＝＝＝＝＝＝＝＝＝＝瀏覽器已關閉＝＝＝＝＝＝＝＝＝＝＝＝＝`);
        return 0;
    }

)();
