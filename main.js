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


(async () => {

    async function snycDelay(delayInms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true);
            }, delayInms);
        });
    }

    async function fetchSongTable() {
        await page.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER,
            {waitUntil: 'networkidle2'}
        );
        await page.click('span[sid="1"]');
        await snycDelay(GlobalConfig.DELAY_OF_MILLION_SECS);
        /** fetch all pages */
        const _pages = [1, 2, 3, 4, 5];
        let songs = [];
        for (let _page of _pages) {
            await page.click(`a[onClick="loadWS0(${_page});"]`);
            await snycDelay(GlobalConfig.DELAY_OF_MILLION_SECS);
            const content = await page.content();
            const songAnalysis = new rta(content);
            songs = _.concat(songs, songAnalysis.getSongList());
        }

        for (let song of songs) {
            await page.goto(path.join(GlobalConfig.BASE_URL, song.url),
                {waitUntil: 'networkidle2'}
            );
            const content = await page.content();
            const tone = new ta(content);
            tone.persistedUnderObjectFolder();
        }
    }

    async function fetchAllSinger(singerType = 6) {
        await page.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER,
            {waitUntil: 'networkidle2'}
        );
        await page.click('span[sid="0"]');
        await snycDelay(GlobalConfig.DELAY_OF_MILLION_SECS);
        const content = await page.content();
        const mSingerAnalysis = new sa(content);
        const all = mSingerAnalysis.getAllSingers(singerType);
        return all;
    }

    async function getSongsOfSingersPage(root) {
        let mSongList = [];
        await page.goto(root,
            {waitUntil: 'networkidle2'}
        );
        await snycDelay(GlobalConfig.DELAY_OF_MILLION_SECS);
        const content = await page.content();
        let mSongListAnalysis = new sla(content);
        mSongList = mSongList.concat(mSongListAnalysis.getAll());

        while (mSongListAnalysis.hasNextPage()) {
            await page.click(`${mSongListAnalysis.getNextPageButtonSymbol()}`);
            await snycDelay(GlobalConfig.DELAY_OF_MILLION_SECS);
            const content = await page.content();
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

        await downloadTones('', mSongList, (tone, song) => {

            const mToneObject = tone.getNormalizeToneObject();
            firebaseHandler.setTone(mToneObject);
            firebaseHandler.setSingerTones(mToneObject);
            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`成功儲存 ${mToneObject.singer} , ${mToneObject.name} 至 FIREBASE`);
        });

    }

    function showError(reason) {
        console.log(reason)
    }

    async function downloadAllSong(singerType = 6, limited = undefined) {
        let allSingers = await fetchAllSinger(singerType);
        let completedSingers = [];
        if (GlobalConfig.CONTINUE_FROM_LAST_TIME && fs.existsSync(GlobalConfig.PATH_COMPLETED_SINGERS)) {
            completedSingers = fs.readFileSync(GlobalConfig.PATH_COMPLETED_SINGERS, 'utf-8', showError).split('\n')
        }

        if (GlobalConfig.HACK_LIMITED_TESTING_MODE)
            allSingers = Util.getShuffledArrayWithLimitCount(allSingers, limited)
        let current = 0;
        for (let singer of allSingers) {
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

            const mRootPath = path.join(GlobalConfig.TONES_ROOT, singer.name);
            let mSongList = [];
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

            await firebaseHandler.setSinger(singer);
            await downloadTones(mRootPath, mSongList, (tone, song) => {

                if (GlobalConfig.DEBUG_MODE) {
                    tone.downloadFile(mRootPath);
                    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                        console.log(`成功下載 ${song.name} => 目錄 ${mRootPath}`);
                } else {
                    const mToneObject = tone.getNormalizeToneObject();
                    firebaseHandler.setTone(mToneObject);
                    firebaseHandler.setSingerTones(mToneObject);
                    appendFile(GlobalConfig.PATH_COMPLETED_TONES, `${mToneObject.singer}_${mToneObject.name}`);
                    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                        console.log(`成功儲存 ${singer.name} , ${mToneObject.name} 至 firebase`);
                }

            });
            current = current + 1;

            if (GlobalConfig.CONTINUE_FROM_LAST_TIME) {
                appendFile(GlobalConfig.PATH_COMPLETED_SINGERS, singer.name);
            }

            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
                console.log(`已完成歌手 ==> ${current}/${allSingers.length}`);
        }
    }

    function appendFile(path, data) {
        if (!fs.existsSync(path))
            fs.writeFileSync(path, data, showError);
        else
            fs.appendFileSync(path, `\n${data}`, showError);
    }

    async function downloadTones(folder, songlist, callback) {
        for (let song of songlist) {

            if (_.isUndefined(song) || _.isEmpty(song.name)) {
                if (GlobalConfig.MAIN_MSG.SHOW_ERROR) {
                    console.log(`遇到奇怪的結構 ${JSON.stringify(song)}`)
                }
                continue
            }

            if (GlobalConfig.PERMISSION_DOWNLOAD_DEPEND_ON_CLICK && song.clickTimesOfWhole < GlobalConfig.HACK_PERMISSION_CLICKED_THRESHOLD) {
                continue;
            }

            if (!GlobalConfig.PERMISSION_FORCE_DOWNLOAD_TONE &&
                fs.existsSync(path.join(folder, song.name + '.txt'))) {
                if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
                    console.log(`已經下載過了... ${song.name}`)
                }
                continue;
            }
            if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
                console.log(`正在下載頁面 ==> , ${song.name}`)
            }
            await page.goto(path.join(GlobalConfig.BASE_URL, song.url),
                {waitUntil: 'networkidle2'}
            );
            await snycDelay(GlobalConfig.DELAY_OF_MILLION_SECS);
            const tone = new ta(await page.content());

            callback(tone, song);

        }
    }

    const browser = await puppeteer.launch({
        headless: !GlobalConfig.INVOKE_REAL_CHROME
    });
    const page = await browser.newPage();
    await downloadAllSong(GlobalConfig.SINGER_TYPE_OF_ALL, GlobalConfig.HACK_LIMITED_COUNT_OF_DOWNLOAD_SINGER);
    // await downloadSongsByUrl('https://www.91pu.com.tw/singer/2015/0804/430.html');
    await browser.close();
    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
        console.log(`＝＝＝＝＝＝＝＝＝＝＝＝＝瀏覽器已關閉＝＝＝＝＝＝＝＝＝＝＝＝＝`);
    return 0;
})();

