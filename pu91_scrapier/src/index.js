import _ from "lodash"
import path from 'path';
import puppeteer from 'puppeteer';
import rta from './analysis/RankTableAnalysis.js';
import frta from './analysis/FavoriteRankTableAnalysis.js';
import lrta from './analysis/LatestRankTableAnalysis.js';
import ta from './analysis/ToneAnalysis.js';
import sa from './analysis/SingersAnalysis.js';
import sla from './analysis/SongListAnalysis.js';

import Config from './config';
import {utiller as Util, exceptioner as ERROR, pooller as Pooller} from 'utiller';
import {databazer as SQL} from 'databazer';

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
                    for (const each of rank.items) {
                        const obj = {}
                        obj[`${rank.type ? rank.type : maintype}`] = _.toNumber(each.rank);
                        await database.lazyInsertRecord(tableName,
                            {
                                url: each.url,
                                singerUrl: each.singer.pageUrl,
                                name: each.name,
                                singer: each.singer.name,
                                updateTime: _.now(), ...obj
                            }, 'url');
                    }
                }
            }
        }

        /**
         *
         * sortType sample => {YEAR: 5, SEASON: 4, MONTH: 3, WEEK: 2, DAY: 1}
         *
         * return:[...{type:'YEAR',items:[...{name:'歌名',rank:1,singer:{name:'人名'} }]}]
         *
         * */
        async function fetchRankTable(mainType = Config.RANK_TABLE_TYPE.POPULAR.ID, sortType) {
            const page = await browser.newPage();
            ;
            const all = [];
            try {
                await page.goto(Config.PATH_SAMPLE_URL_SINGER, {waitUntil: 'networkidle2'});
                await page.click(`span[sid="${mainType}"]`);
                await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
                if (sortType) {
                    for (const type in sortType) {
                        const selector = await page.$(`div[class="singsort sorttype"] > .list > span[sid="${sortType[type]}"]`);
                        /** 上面的寫法 const eval = await page.$eval(`div[class="singsort sorttype"] > .list > span[sid="${sortType}"]`,(element => element.click())); */
                        await selector.click();
                        await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
                        const songs = await fetchItemsFromRankPageData(page);
                        all.push({type, items: songs});
                    }
                } else {
                    const songs = await fetchItemsFromRankPageData(page);
                    all.push({type: '', items: songs});
                }
                return all;
            } catch (error) {
                Util.appendError(`fetch rank tables fail, because ` + error.message);
                return all;
            } finally {
                if (page !== undefined) await page.close()
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

            async function fetchItemsFromRankPageData(page) {
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
            const page = await browser.newPage();
            try {
                await page.goto(Config.PATH_SAMPLE_URL_SINGER,
                    {waitUntil: 'networkidle2'}
                );
                await page.click('span[sid="0"]');
                await syncDelay(Config.HACK_DELAY_OF_MILLION_SECS);
                const content = await page.content();
                const mSingerAnalysis = new sa(content);
                const all = mSingerAnalysis.getAllSingers(singerType);
                return all;
            } catch (error) {
                Util.appendError(`fetchAllSinger error ${error}`)
            } finally {
                await page.close();
            }

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
            let _page;
            try {
                _page = await browser.newPage();
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
                return mSongList;
            } catch (error) {
                Util.appendError(`fetchSongsOfSingersPage error ${error}`)
            } finally {
                if (_page) await _page.close();
            }

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
                        if(Util.isUndefinedNullEmpty(song.url)) continue;

                        await database.lazyInsertRecord('SONG',
                            {
                                ...song,
                                state: 'NOT',
                                singer: singer.name,
                                singerId: singer.uid,
                                singerUrl: singer.url
                            }, 'url');
                        Util.appendInfo(`正在儲存歌手 '${singer.name}' 的歌 '${song.name}' `);
                    }
                    const cost = _.now() - start;
                    await database.updateState('SINGER', 'DONE', singer.uid);
                    await database.updateRecords('SINGER', {cost: cost, songCounts: songs.length},
                        SQL.Builder().equal('uid', singer.uid).stmt());
                } catch (error) {
                    Util.appendError(`persistSongsBySinger() 出現錯誤了, ${error.message}`)
                    await database.updateState('SINGER', 'FAIL', singer.uid);
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
                        .gte('popularLevel', Config.HACK_FETCH_DEPEND_ON_POPULAR_LEVEL_THRESHOLD).and().equal('state', 'NOT').orderByRandom().limit(1).stmt())
                );

                if (record) {
                    song = record;
                    if (Util.or(_.isEmpty(song.name) || _.isEmpty(song.url))) {
                        await database.updateRecords('SONG', {state: 'FAIL'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                    } else {
                        await database.updateRecords('SONG', {state: 'ING'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                        const raw = await fetchTone(song);
                        if (raw !== undefined) {
                            const tone = raw.getNormalizeToneObject();
                            const cost = _.now() - start;
                            await database.lazyInsertRecord('TONE', {
                                ...tone,
                                url: song.url,
                                songId: song.uid,
                                singerId:song.singerId,
                                singerUrl:song.singerUrl,
                                cost
                            }, 'url');
                            await database.updateRecords('SONG', {state: 'DONE'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                            Util.appendInfo(`成功儲存TONE '${tone.name}' .....`)
                            return true;

                        } else {
                            Util.appendError(
                                `persistTone() ${song.name} 出現錯誤, tone 是 undefined`);
                            await database.updateRecords('SONG', {state: 'NOT'}, SQL.Builder().equal(Config.UID, song.uid).stmt());
                            return false;
                        }
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
            const songs = song[0].items;
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

            const inValid = _.remove(singers, (singer) => {
                return _.isEmpty(_.trim(singer.name)) || _.isEmpty(_.trim(singer.url))
            })

            const exists = (await database.fetchRecords('SINGER', '', 'names')).map((singer) => singer.names);
            Util.appendInfo(`persistSingers 在網路上歌手有 '${singers.length}' 個, 資料庫裡面有 '${exists.length}'`);
            _.remove(singers, (singer) => {
                return _.indexOf(exists, Util.deepFlat(singer.names)) >= 0
            });

            Util.appendFile('./newbie_singers.txt', Util.deepFlat(inValid, '\n\n === '), true, true);
            /** 應該是名單內有重複的歌手, 才會
             * persistSingers 在網路上歌手有 '2255' 個, 資料庫裡面有 '2235'
             * */
            for (const singer of singers) {
                await database.lazyInsertRecord('SINGER',
                    {...singer, state: 'NOT'}, 'url');
            }
        }

        async function persist91puEveryThing(singerType = 6) {
            const poollers = [];

            async function browserPageWatcher() {
                if (browser !== undefined) {
                    Util.appendInfo(`browser pages = ${((await browser.pages()).length)}`)
                }
            }

            function joinTaskToPool(countOfWorker = 1,
                                    nameOfPool = 'DEFAULT',
                                    disableFirstRun = true,
                                    asyncTask = async () => {
                                        await Util.syncDelay()
                                    },
                                    period = 1000
            ) {
                const pool = new Pooller(countOfWorker);
                pool.setPoolId(nameOfPool);
                pool.setDisableFirstRun(disableFirstRun);
                pool.runInfiniteInBackground(asyncTask,
                    period);
                pool.enableTaskTimeout(true, tenMin);
                pool.setTaskFailHandler(errorHandler);
                poollers.push(pool);
                return pool;
            }

            const errorHandler = (error) => {
                Util.appendError(`９１pu => TASK 遇到問題 ${error.message}`);
            }

            // /** 檢查歌手 once 2 mins */


            const twoSecs = 2 * 1000;
            const fourSecs = 4 * 1000;
            const tenSecs = 10 * 1000;

            const oneMin = 6 * tenSecs;
            const twoMin = 2 * oneMin;
            const fiveMin = 5 * oneMin;
            const threeMin = 3 * oneMin;
            const tenMin = 10 * oneMin;
            const twentyMin = 2 * tenMin;
            const halfHour = 3 * tenMin;
            const oneHour = 2 * halfHour;


            /** 抓所有歌手 */
            // joinTaskToPool(1, "SINGER FETCHER", false, persistSingers, oneHour);
            /** 抓取排行版上的資訊們 */
            // joinTaskToPool(1, "RANK FETCHER", false, persistRankTable, halfHour);
            /** 監督browser page 有沒有爆掉 */
            joinTaskToPool(1, "BROWSER WATCHER", true, browserPageWatcher, tenSecs);
            /** 猛抓LATEST TABLE的歌曲*/
            // joinTaskToPool(1, "LATEST SONG FETCHER", true, latestSongPersist, twentyMin);
            /** 針對song找對應的tune. 如果沒有未抓的,就超過一周 10sec一次 else sleepx2 ,3 workers */
            joinTaskToPool(5, "TONE FETCHER", true, persistTone, tenSecs);
            /** 針對歌手抓 song once 10sec, else sleepx2, x2. 如果沒有未抓的,就超過一周 */
            joinTaskToPool(3, "SONG FETCHER", false, persistSongs, tenSecs);

            while (true) {
                const random = Util.getRandomValue(5000, 8000)
                Util.exeAll(poollers, (each) => each.showState())
                Util.appendInfo(`主線程還在努中工作中, 休息一毀兒 ${random} mms`);
                await Util.syncDelay(random);
                const cancelAllThread = Util.getFileContextInJSON(Config.PATH_DYNAMIC_INFO)['cancel'];
                Util.appendInfo(`讀取了 ${Config.PATH_DYNAMIC_INFO}, 是否執行停止:${cancelAllThread}`);
                if (cancelAllThread) {
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

        const database = new SQL(Config.BASE_DATABASE_PATH);
        await database.init();

        const browser = await puppeteer.launch({
            headless: !Config.INVOKE_REAL_CHROME
        });
        Util.writeFileInJSON(Config.PATH_DYNAMIC_INFO, {
            cancel: false,
            host: 'David',
            timeStamp: new Date(),
            'dbName': Config.BASE_DATABASE_PATH
        });
        Util.syncDeleteFile(Config.PATH_ERROR_LOG);
        Util.syncDeleteFile(Config.PATH_INFO_LOG);
        await persist91puEveryThing();
        // await latestSongPersist();
        // /** 針對song找對應的tune. 如果沒有未抓的,就超過一周 10sec一次 else sleepx2 ,3 workers */


        // await browser.close();
        if (Config.MAIN_MSG.SHOW_SUCCEED)
            Util.appendInfo(`＝＝＝＝＝＝＝＝＝＝＝＝＝瀏覽器已關閉＝＝＝＝＝＝＝＝＝＝＝＝＝`);
        return 0;
    }

)();
