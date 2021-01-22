import _ from "lodash"
import path from 'path';
import puppeteer from 'puppeteer';
import rta from './analysis/brain/RankTableAnalysis.js';
import ta from './analysis/brain/ToneAnalysis.js';
import sa from './analysis/brain/SingersAnalysis.js';
import sla from './analysis/brain/SongListAnalysis.js';
import GlobalConfig from './GlobalConfig.js';
import firebaseHandler from './firebase';
import Util from './util';
import SQL from './database';
import pooller from './pooller';

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

    async function fetchSongTable() {
        await mainPage.goto(GlobalConfig.PATH_SAMPLE_URL_SINGER,
            {waitUntil: 'networkidle2'}
        );
        await mainPage.click('span[sid="1"]');
        await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        /** fetch all pages */
        const _pages = [1, 2, 3, 4, 5];
        let songs = [];
        for (let _page of _pages) {
            await mainPage.click(`a[onClick="loadWS0(${_page});"]`);
            await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
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
        await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        const content = await mainPage.content();
        const mSingerAnalysis = new sa(content);
        const all = mSingerAnalysis.getAllSingers(singerType);
        return all;
    }

    async function fetchTone(song) {
        const _page = await browser.newPage();
        if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED) {
            console.log(`正在 ${song.name} 下載頁面.... `)
        }
        await _page.goto(path.join(GlobalConfig.BASE_URL, song.url),
            {waitUntil: 'networkidle2'}
        );
        await syncDelay(GlobalConfig.HACK_DELAY_OF_MILLION_SECS);
        const tone = new ta(await _page.content());
        await _page.close();
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
                    await sqlHandler.insertRecordAndCreateTableAlterColumnIfNotExist('SONG',
                        {...song, state: 'NOT', singer: singer.name}, 'name', 'singer');
                    Util.appendFile(GlobalConfig.PATH_INFO_LOG, `正在儲存歌手 '${singer.name}' 的歌 '${song.name}' `);
                } catch (error) {
                    Util.appendFile(GlobalConfig.PATH_ERROR_LOG,
                        `TABLE SONG 出現錯誤了,${song.name} ${JSON.stringify(error)}`)

                }
            }
            const songCounts = _.isArray(mSongList) ? mSongList.length : 0;
            const cost = _.now() - start;
            await sqlHandler.insertRecordAndCreateTableAlterColumnIfNotExist('SINGER', {
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

    async function persistTone() {
        let tone = {};
        try {
            const start = _.now();
            const records = await sqlHandler.fetchRecords('SONG',
                SQL.Builder().gte('popularLevel', GlobalConfig.HACK_FETCH_DEPEND_ON_POPULAR_LEVEL_THRESHOLD).and().equal('state', 'NOT').limit(5).stmt());
            const record = Util.getShuffledArrayWithLimitCount(records, 1);
            if (record.length > 0) {
                const song = record[0];
                await sqlHandler.updateRecords('SONG', {state: 'ING'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());

                const raw = await fetchTone(song);
                tone = raw.getNormalizeToneObject();
                const cost = _.now() - start;
                await sqlHandler.insertRecordAndCreateTableAlterColumnIfNotExist('TONE', {
                    ...tone,
                    cost
                }, 'name', 'singer');
                Util.appendFile(GlobalConfig.PATH_INFO_LOG,
                    `成功儲存TONE '${tone.name}' .....`)
                await sqlHandler.updateRecords('SONG', {state: 'DONE'}, SQL.Builder().equal(GlobalConfig.UID, song.uid).stmt());
                return true;
            } else {
                Util.appendFile(GlobalConfig.PATH_INFO_LOG,
                    `沒有TONE可以下載了....`)
                return false;
            }
        } catch (error) {
            Util.appendFile(GlobalConfig.PATH_ERROR_LOG,
                `persistTone ${tone ? tone.name : 'QQ沒抓到毛'} 出現錯誤 ${JSON.stringify(error)}`)
        }
    }

    async function persist(singerType = 6) {
        let singers = await fetchAllSinger(singerType);
        singers = Util.getShuffledArrayWithLimitCount(singers, singers.length);

        if (GlobalConfig.CONTINUE_FROM_LAST_TIME) {
            /** 把allSinger 清除掉 DB內有的 */
            const exists = (await sqlHandler.fetchRecords('SINGER', '', 'name')).map((exist) => exist.name);
            Util.appendFile(GlobalConfig.PATH_INFO_LOG,
                `在資料庫的歌手有 '${singers.length}' 個`)
            singers = _.remove(singers, (singer) => {
                return !exists.includes(singer.name);
            })
        }

        async function factory() {
            const taskType = singers.length > 0 ? Util.getRandomValue(1, 2) : 2;
            switch (taskType) {
                case 1:
                    /** singer & song */
                    const singer = singers.pop();
                    Util.appendFile(GlobalConfig.PATH_INFO_LOG,
                        `尚未完成的歌手還有 '${singers.length}' 個`)
                    await persistSongsAndSinger(singer);
                    break;
                case 2:
                    /** tone */
                    return  persistTone();
                    break;
            }
        }

        const self =  new pooller(5);
        self.cleanInterval();
        self.adds([...Array(10000)].map((v,i) => {return factory}));
        await self.run();
    }

    const browser = await puppeteer.launch({
        headless: !GlobalConfig.INVOKE_REAL_CHROME
    });
    const mainPage = await browser.newPage();
    await persist(6);
    await browser.close();
    if (GlobalConfig.MAIN_MSG.SHOW_SUCCEED)
        console.log(`＝＝＝＝＝＝＝＝＝＝＝＝＝瀏覽器已關閉＝＝＝＝＝＝＝＝＝＝＝＝＝`);
    return 0;
})();

async function downloadAllSong(singerType = 6) {
    await firebaseHandler.setSinger(singer);
    await firebaseHandler.setTone(mToneObject);
    await firebaseHandler.setSingerTones(mToneObject);
}
