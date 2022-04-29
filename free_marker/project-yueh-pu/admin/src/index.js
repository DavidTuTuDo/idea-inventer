import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/CommonFirebaseHelper";
import {linepayer as LinePay} from "linepayer";
import libpath from 'path';
import config from './config';
import moment from 'moment';
import {configerer} from "configerer";


(async () => {

    const api = new Api();
    const listener = new Listener();
    const database = new Databaser('/Users/davidtu/cross-achieve/high/idea-inventer/pu91_scrapier/guitar_pu_from_91.db');
    await database.init();

    /** 找出週 rank*/

    async function fetchTopSongsOfRank(n) {
        return Util.getArrayOfSize(_.orderBy(await database.fetchRecords('RANK',
            new Builder().gt('WEEK', 0).orderBy({WEEK: 'ASC'}).stmt()), (each) => each.WEEK, 'ASC'), n);
    }

    /** 找出週 rank 對應的tone*/
    async function deployMainPageHotRhythm(n) {
        const ranks = await fetchTopSongsOfRank(n);
        let guitars = await getObjectOfToneUrlAsKey()

        await api.submitHotRhythms(...ranks.map((each) => {
            return {
                name: each.name,
                singer: each.singer,
                indexOfSequence: each.WEEK,
                idOfGuitarPu: getDocumentId(each, guitars),
                uuidOfSong: each.url,
            }
        }))

        function getDocumentId(rank, guitars) {
            const url = rank.url;
            // console.log(rank.WEEK,' 歌名: ', rank.name, 'url:', rank.url);
            const guitar = guitars[url];
            return guitar ? guitar.idOfRemote : '';
        }
    }

    /** 找出週 rank 對應的tone*/
    async function deployMainPageHotSingers(n) {
        const singers = Util.getArrayOfSize((await api.fetchSingers(
            {orderBy: (stmt) => stmt.orderBy("popularLevel", 'desc')},
            {limit: (stmt) => stmt.limit(n)}
        )), n)
        await api.submitHotSingers(...singers.map((each, index) => {
            return {
                name: each.name,
                singer: each.singer,
                indexOfSequence: index,
                idOfSinger: each.id,
                statement: `作品 ${each.countsOfRhythm} 件`,
            }
        }))

        function getDocumentId(rank, guitars) {
            const url = rank.url;
            // console.log(rank.WEEK,' 歌名: ', rank.name, 'url:', rank.url);
            const guitar = guitars[url];
            return guitar ? guitar.id : '';
        }
    }

    async function accumulatePopularLevelOfSinger() {
        const singers = await database.fetchRecords('SINGER');
        for (const singer of singers) {
            const tones = await database.fetchRecords('TONE', new Builder().equal('singerUrl', singer.url).stmt());
            const popularLevel = _.sum(tones.map((each) => each.popularLevel));
            const countsOfRhythm = _.size(tones);
            console.log(`歌手:${singer.name}, 有 ${popularLevel} 個讚, 有 ${countsOfRhythm} 個作品`);
            await database.updateRecords('SINGER', {
                popularLevel: popularLevel,
                songCounts: countsOfRhythm
            }, new Builder().equal('uid', singer.uid).stmt())
        }
    }

    async function deploySingers(popularLevel) {
        const singers = await database.fetchRecords('SINGER', new Builder().gt('songCounts', 0).and().gte('popularLevel', popularLevel).stmt());
        console.log('所有singer => ' + _.size(singers))
        const removeItems = _.remove(singers, (singer) => !Util.isUndefinedNullEmpty(singer.idOfRemote));
        console.log('所有singer 扣掉 已經有idOfRemote => ' + _.size(singers))
        await api.submitSingers(...singers.map((singer) => {
            return {
                name: singer.name,
                nicknames: singer.names.split(`#&#@#`).map(each => {
                    return {statement: each}
                }),
                type: singer.type,
                uuidOfSinger: singer.url,
                popularLevel: singer.popularLevel,
                countsOfRhythm: singer.songCounts,
            }
        }));

    }

    async function deployKeywords() {
        /** 部署Keywords*/

        const singers = await fetchSingersContainRemoteId();
        const rhythms = await fetchTonesContainRemoteId();

        const keywords = [];
        keywords.push(...singers.map((singer) => {
            return {
                value: singer.name,
                label: singer.name,
                popularLevel: singer.popularLevel,
                type: 12,
                uid: singer.idOfRemote,
                extra: `11是代表rhythm,12代表singer`,
            }
        }));

        keywords.push(...rhythms.map((rhythm) => {
            return {
                value: rhythm.name,
                label: rhythm.name,
                popularLevel: rhythm.popularLevel,
                type: 11,
                uid: rhythm.idOfRhythm,
                extra: `11是代表rhythm,12代表singer`,
            }
        }));

        await api.submitKeywords(...keywords);
    }

    async function deployAllSingerTone(popularLevel) {
        await deploySingers(popularLevel);
        await deployGuitarPuByPopularLevel(popularLevel);
    }

    async function deployGuitarPuByPopularLevel(n) {
        const tones = await database.fetchRecords('TONE', new Builder().gte('popularLevel', n).stmt())
        console.log('所有tones => ' + _.size(tones))
        _.remove(tones, (tone) => !Util.isUndefinedNullEmpty(tone.idOfRemote))
        console.log('所有tones 扣掉 已經有idOfRemote => ' + _.size(tones))
        await deployGuitarPu(...tones);
    }

    async function fetchSingersContainRemoteId(){
        const singersOfLocalDatabase = await database.fetchRecords('SINGER');
        _.remove(singersOfLocalDatabase, (singer) => Util.isUndefinedNullEmpty(singer.idOfRemote));
        return singersOfLocalDatabase
    }

    async function getObjectOfSingerUrlAsKey(){
        return Util.toObjectWithAttributeKey((await fetchSingersContainRemoteId()), 'url');
    }

    async function getObjectOfToneUrlAsKey(){
        return Util.toObjectWithAttributeKey((await fetchTonesContainRemoteId()), 'url');
    }

    async function fetchTonesContainRemoteId(){
        const tonesOfLocalDatabase = await database.fetchRecords('TONE');
        _.remove(tonesOfLocalDatabase, (tone) => Util.isUndefinedNullEmpty(tone.idOfRemote));
        return tonesOfLocalDatabase
    }

    async function deployGuitarPu(...tones) {
        const singers = await getObjectOfSingerUrlAsKey();
        await api.submitGuitarpus(...(tones.map((each) => getSubmitGuitarPuItem(each, singers))));
        const guitars = await api.fetchGuitarpus();
        /** 部署Rhythms*/

        await api.submitRhythms(...guitars.map(guitar => {
            return {...guitar, idOfGuitarPu: guitar.id};
        }));
    }

    function getSubmitGuitarPuItem(tone, singers) {

        function refactorTone(string) {
            /** decode */
            const origin = Util.getDecryptString(string);

            let latest = Util.replaceAllWithSets(origin,
                {from: '▲', to: '🌕'},
                {from: '★', to: '🌓'},
                {from: '△', to: '🌑'},
                {from: '✩', to: '🌙'},
                {from: '☆', to: '🌙'},
                {from: '\\|', to: '།'},
                {from: '\\[前奏\\]', to: '(開始)'},
                {from: '\\[尾奏\\]', to: '(結束)'},
                {from: '\\[間奏\\]', to: '(橋段)'},
                {from: '\\[間奏1\\]', to: '(橋段I)'},
                {from: '\\[間奏2\\]', to: '(橋段II)'},
                {from: '\\[間奏3\\]', to: '(橋段III)'},
                {from: '\\[間奏4\\]', to: '(橋段IV)'},
                {from: '\\(End\\)', to: '(終止)'},
            )

            /**   本來以為加個空白就能搞定對齊問題, 沒那麼簡單
             latest = Util.getStringHandledByEachLine(latest, (each, index, all) => {
                const isMatch = each.match(new RegExp('^[🌓🌑🌙🌕].+', 'g'));
                if (!isMatch) {
                    all[index] = ` ${each}`;
                }
            })
             */
            return Util.getEncryptString(latest);
            /** encode */
        }

        const objOfTones = getMapOfTonalitySpeed(tone.tkInfo);
        // '原調': 'E', '速度': '59', '男調': 'A', '女調': 'E'
        if (Util.isUndefinedNullEmpty(objOfTones['原調']) ||
            Util.isUndefinedNullEmpty(objOfTones['男調']) ||
            Util.isUndefinedNullEmpty(objOfTones['女調'])
        ) {
            console.log(tone.name, ' ===> ', objOfTones);
        }

        const objOfCapoTone = getCapoAndContextTonality(tone.capoLevel);
        const info = {name: tone.name, ...objOfCapoTone, ...objOfTones};
        // console.log(info);
        // console.log('capo  ', _.toNumber(info.capo));
        // console.log('speed  ', _.toNumber(info['速度']));
        const latestTone = refactorTone(tone.tone);
        return {
            id: Util.isUndefinedNullEmpty(tone.idOfRemote) ? undefined : tone.idOfRemote,
            currentContext: latestTone,
            originalContext: latestTone,
            tonalityOfContext: info.tonalityOfContext,
            capoLevel: info.capo ? _.toNumber(info.capo) : -1,
            tonalityOfFemale: info['女調'],
            tonalityOfMale: info['男調'],
            tonalityOfOriginal: info['原調'],
            speed: info['速度'] ? _.toNumber(info['速度']) : -1,
            singer: tone.singer,
            name: tone.name,
            uuidOfSong: tone.url,
            uuidOfSinger: tone.singerUrl,
            composer: tone.composer,
            popularLevel: tone.popularLevel,
            idOfSinger: getSingerDocumentId(),
        }

        function getSingerDocumentId() {
            const singerUrl = tone.singerUrl;
            if (singers && singerUrl && singers[singerUrl]) {
                return singers[singerUrl].idOfRemote;
            }
            return '';
        }
    }

    async function submitShortcut() {
        await api.deleteShortcuts();
        await api.submitShortcuts(
            {
                title: '回到首頁',
                icon: 'muIcon:Bedtime',
                route: `route:main`,
                indexOfSequence: 0,
            }
            , {
                title: '我的最愛',
                icon: 'muIcon:FavoriteBorder',
                route: `route:personalRhythm`,
                indexOfSequence: 1,
            },
            {
                title: '相關網站',
                icon: 'muIcon:Whatshot',
                indexOfSequence: 2,
                subs: [
                    {
                        title: '91譜',
                        icon: 'muIcon:School',
                        route: 'path:https://www.91pu.com.tw/',
                        indexOfSequence: 1,
                    }
                ]
            },
        )
    }

    /**
     *  原調：F#m速度：123
     男調：Fm女調：Cm
     *
     * return { '原調': 'E', '速度': '59', '男調': 'A', '女調': 'E' }
     * */
    function getMapOfTonalitySpeed(string) {
        function getWordOnly(string) {
            return Util.getStringOfHeadMatch(string, `[#a-zA-Z0-9-]+`);
        }

        let array = Util.toOneLineString(string).split(new RegExp('\(原調|速度|男調|女調\)', 'gm'));
        array.shift();
        array = _.chunk(array, 2);
        const object = {}
        for (const each of array) {
            object[each.shift()] = Util.replaceAll(getWordOnly(each.pop()), '-', '|');
        }
        return object;
    }

    /**
     * Capo: 1 (Am)
     *
     * { tonalityOfContext:C , capo:4}*/
    function getCapoAndContextTonality(string) {
        function getFirstNumber(string) {
            return Util.getStringOfHeadMatch(string, `[0-9]`);
        }

        function getStringOfBrace(string) {
            return Util.getStringOfHeadMatch(string, `(?<=\\()[\\w]+?(?=\\))`)
        }

        const obj = {
            capo: getFirstNumber(string),
            tonalityOfContext: getStringOfBrace(string)
        }
        return obj;
    }

    async function syncRemoteIdWithToneAndSingerAndRhythm() {
        const singers = await api.fetchSingers();
        for (const singer of singers) {
            await database.updateRecords('SINGER', {idOfRemote: singer.id},
                new Builder().equal('url', singer.uuidOfSinger).stmt())
        }

        const guitars = await api.fetchGuitarpus()
        for (const guitar of guitars) {
            await database.updateRecords('TONE', {idOfRemote: guitar.id},
                new Builder().equal('url', guitar.uuidOfSong).stmt())
        }

        const rhythms = await api.fetchRhythms()
        for (const rhythm of rhythms) {
            await database.updateRecords('TONE', {idOfRhythm: rhythm.id},
                new Builder().equal('url', rhythm.uuidOfSong).stmt())
        }
    }

    /** 避免智慧權蠢做法 */
    async function updateTonesWithSameRemoteId() {
        const tones = await fetchTonesContainRemoteId();
        const objectOfSinger = await getObjectOfSingerUrlAsKey();

        const submits = tones.map(tone => getSubmitGuitarPuItem(tone, objectOfSinger));
        await api.submitGuitarpus(...submits);
    }

    async function updateSpecificGuitarPu(id = 'Wipyxry0V0CKLkPxjaS1') {
        const records = await database.fetchRecords('TONE', new Builder().equal('idOfRemote', id).stmt())
        const record = _.head(records);
        const guitar = getSubmitGuitarPuItem(record)
        await api.updateGuitarpuItem(guitar.id,
            {
                currentContext: guitar.currentContext,
                originalContext: guitar.originalContext
            }
        )
    }

    // await deployGuitarPuByPopularLevel(2000);
    // await deploySingers(2000);

    // await accumulatePopularLevelOfSinger()

    // 這五個是initialize一組的
    // await deployAllSingerTone(500);
    // await deployMainPageHotRhythm(20);
    // await deployMainPageHotSingers(20);
    // await deployKeywords();
    // await syncRemoteIdWithToneAndSingerAndRhythm()
    // await submitShortcut();
    // await updateTonesWithSameRemoteId();
    // console.log(await getObjectOfSingerUrlAsKey());
    // await updateSpecificGuitarPu();
})();


