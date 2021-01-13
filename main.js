import _ from "lodash"
import path from 'path';
import puppeteer from 'puppeteer';
import rta from './analysis/brain/RankTableAnalysis.js';
import ta from './analysis/brain/ToneAnalysis.js';
import sa from './analysis/brain/SingersAnalysis.js';
import sla from './analysis/brain/SongListAnalysis.js';
import GlobalConfig from './GlobalConfig.js';
import fs from 'fs';
import firebaseHandler from './firebase';
import Util from './util';
import SQL from './database';

(async () => {

    async function snycDelay(delayInms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true);
            }, delayInms);
        });
    }

    async function fetchSongTable() {
        await mainPage.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER,
            {waitUntil: 'networkidle2'}
        );
        await mainPage.click('span[sid="1"]');
        await snycDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        /** fetch all pages */
        const _pages = [1, 2, 3, 4, 5];
        let songs = [];
        for (let _page of _pages) {
            await mainPage.click(`a[onClick="loadWS0(${_page});"]`);
            await snycDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
            const content = await mainPage.content();
            const songAnalysis = new rta(content);
            songs = _.concat(songs, songAnalysis.getSongList());
        }

        for (let song of songs) {
            await mainPage.goto(path.join(GlobalConfig.BASE_URL, song.url),
                {waitUntil: 'networkidle2'}
            );
            const content = await mainPage.content();
            const tone = new ta(content);
            tone.persistedUnderObjectFolder();
        }
    }

    async function fetchAllSinger(singerType = 6) {
        await mainPage.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER,
            {waitUntil: 'networkidle2'}
        );
        await mainPage.click('span[sid="0"]');
        await snycDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        const content = await mainPage.content();
        const mSingerAnalysis = new sa(content);
        const all = mSingerAnalysis.getAllSingers(singerType);
        return all;
    }

    async function getSongsOfSingersPage(root) {
        let mSongList = [];
        await mainPage.goto(root,
            {waitUntil: 'networkidle2'}
        );
        await snycDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        const content = await mainPage.content();
        let mSongListAnalysis = new sla(content);
        mSongList = mSongList.concat(mSongListAnalysis.getAll());

        while (mSongListAnalysis.hasNextPage()) {
            await mainPage.click(`${mSongListAnalysis.getNextPageButtonSymbol()}`);
            await snycDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
            const content = await mainPage.content();
            mSongListAnalysis = new sla(content);
            mSongList = mSongList.concat(mSongListAnalysis.getAll());
        }

        return mSongList;
    }

    async function downloadSongsByUrl(url) {
        let mSongList = await getSongsOfSingersPage(url);
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(mSongList);

        if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
            console.log(`取得原始歌單 ${mSongList.map((song) => song.name)}`);

        if (GlobalConfig.HACK_LIMITED_TESTING_MODE) {
            mSongList = Util.getShuffledArrayWithLimitCount(mSongList, GlobalConfig.HACK_LIMITED_COUNT_OF_SONG_LIST);
            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`取得混肴歌單 ${mSongList.map((song) => song.name)}`);
        }

        await fetchTone('', mSongList, (tone, song) => {
            const mToneObject = tone.getNormalizeToneObject();
            firebaseHandler.setTone(mToneObject);
            firebaseHandler.setSingerTones(mToneObject);
            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`成功儲存 ${mToneObject.singer} , ${mToneObject.name} 至 FIREBASE`);
        });

    }


    async function downloadAllSong(singerType = 6, limited = undefined) {
        const sqlHandler = new SQL();
        await sqlHandler.init();
        let allSingers = await fetchAllSinger(singerType);
        let completedSingers = [];
        if (GlobalConfig.CONTINUE_FROM_LAST_TIME && fs.existsSync(GlobalConfig.PATH_FILE_COMPLETED_SINGERS)) {
            const singers = await sqlHandler.fetchRecords('SINGER', SQL.Builder().groupBy('name').stmt(), 'name');
            completedSingers = _.map(singers, singer => singer.name);
        }

        if (GlobalConfig.HACK_LIMITED_TESTING_MODE)
            allSingers = Util.getShuffledArrayWithLimitCount(allSingers, limited)
        let current = 0;
        for (let singer of allSingers) {
            const mRootPath = path.join(GlobalConfig.TONES_ROOT, singer.name);
            let mSongList = [];
            let mValidSongList = [];
            /** create folder */
            if (GlobalConfig.CONTINUE_FROM_LAST_TIME) {
                if (completedSingers.includes(singer.name)) {
                    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
                        console.log(`${singer.name} 已經完成了`);
                        current = current + 1;
                        continue;
                    }
                }
            }

            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`正在讀取 ${singer.name} 的頁面`);
            if (_.isEmpty(singer.names)) continue;


            if (!fs.existsSync(GlobalConfig.TONES_ROOT)) fs.mkdirSync(GlobalConfig.TONES_ROOT);
            mSongList = await getSongsOfSingersPage(path.join(GlobalConfig.BASE_URL, singer.url));

            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                console.log(mSongList);

            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`取得原始歌單 ${mSongList.map((song) => song.name)}`);

            if (GlobalConfig.HACK_LIMITED_TESTING_MODE) {
                mSongList = Util.getShuffledArrayWithLimitCount(mSongList, GlobalConfig.HACK_LIMITED_COUNT_OF_SONG_LIST);
                if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                    console.log(`取得混肴歌單 ${mSongList.map((song) => song.name)}`);
            }
            for (const song of mSongList) {

                if (!song || _.isUndefined(song) || _.isEmpty(song.name) || _.isEmpty(song.url)) {
                    if (GlobalConfig.MAIN_MSG.SHOW_ERROR) {
                        Util.appendFile(GlobalConfig.PATH_ERROR_LOG, `遇到奇怪的結構 ${JSON.stringify(singer)} ${JSON.stringify(song)}`);
                    }
                    continue;
                }

                if (GlobalConfig.PERMISSION_DOWNLOAD_DEPEND_ON_POPULAR && song.popularLevel < GlobalConfig.HACK_PERMISSION_CLICKED_THRESHOLD) {
                    try {
                        await sqlHandler.insertRecord('NOT_YET_TONE', {...song, singer: singer.name}, 'name', 'singer');
                    } catch (error) {
                        Util.appendFile(GlobalConfig.PATH_ERROR_LOG, `TABLE NOT_YET_TONE 出現錯誤了,${song.name} ${JSON.stringify(error)}`)
                    }
                    continue;
                }

                if (!GlobalConfig.PERMISSION_FORCE_DOWNLOAD_TONE &&
                    fs.existsSync(path.join(mRootPath, song.name + '.txt'))) {
                    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
                        console.log(`已經下載過了... ${song.name}`)
                    }
                    continue;
                }

                if (GlobalConfig.SKIP_DEPEND_ON_EXIST) {
                    if (!_.isEmpty(await sqlHandler.fetchRecords('TONE', SQL.Builder().equal('name', song.name).stmt()))) {
                        Util.appendFile(GlobalConfig.PATH_ERROR_LOG, `這首歌下載過了 ${song.name}`)
                        continue;
                    }
                }
                mValidSongList.push(song);
            }

            const tones = await Util.asyncPool(GlobalConfig.THREAD_WORKER, mValidSongList, fetchTone);

            for (const tone of tones) {
                if (!tone) continue;

                const mToneObject = tone.getNormalizeToneObject();
                if (GlobalConfig.USE_SQL_DATABASE) {
                    try {
                        await sqlHandler.insertRecord('TONE', mToneObject, 'name', 'singer');
                        if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                            console.log(`成功儲存 ${singer.name} , ${mToneObject.name} 至 sql-database`);
                    } catch (error) {
                        Util.appendFile(GlobalConfig.PATH_ERROR_LOG, `TABLE TONE 儲存失敗 ${singer.name} , ${mToneObject.name} ${JSON.stringify(error)}`)
                    }
                } else {
                    await firebaseHandler.setSinger(singer);
                    await fetchTone(mRootPath, mSongList, (tone, song) => {

                        if (GlobalConfig.DEBUG_MODE) {
                            tone.downloadFile(mRootPath);
                            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                                console.log(`成功下載 ${song.name} => 目錄 ${mRootPath}`);
                        } else {
                            const mToneObject = tone.getNormalizeToneObject();
                            firebaseHandler.setTone(mToneObject);
                            firebaseHandler.setSingerTones(mToneObject);
                            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                                console.log(`成功儲存 ${singer.name} , ${mToneObject.name} 至 firebase`);
                        }
                    });
                }
            }
            current = current + 1;
            const totalTones = mSongList? mSongList.length:0
            try {
                await sqlHandler.insertRecord('SINGER', {...singer, totalTones, updateTime: _.now()}, 'name');
            } catch (error) {
                Util.appendFile(GlobalConfig.PATH_ERROR_LOG, `儲存歌手失敗 ${singer.name} ,  ${JSON.stringify(error)}`)
            }
            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`已完成歌手 ==> ${current}/${allSingers.length}`);
        }
    }

    async function fetchTone(song) {
        const _page = await browser.newPage();
        if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
            console.log(`正在下載頁面 ==> , ${song.name}`)
        }
        await _page.goto(path.join(GlobalConfig.BASE_URL, song.url),
            {waitUntil: 'networkidle2'}
        );
        await snycDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        const tone = new ta(await _page.content());
        await _page.close();
        return tone;
    }

    const browser = await puppeteer.launch({
        headless: !GlobalConfig.INVOKE_REAL_CHROME
    });
    const mainPage = await browser.newPage();
    await downloadAllSong(GlobalConfig.SINGER_TYPE_OF_ALL, GlobalConfig.HACK_LIMITED_COUNT_OF_DOWNLOAD_SINGER);
    // await downloadSongsByUrl('https://www.91pu.com.tw/singer/2015/0804/430.html');
    await browser.close();
    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
        console.log(`＝＝＝＝＝＝＝＝＝＝＝＝＝瀏覽器已關閉＝＝＝＝＝＝＝＝＝＝＝＝＝`);
    return 0;
})();

