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
    async function deployWeekPopular(n) {
        await api.deleteWeekPopulars(true);
        const top100 = await fetchTopSongsOfRank(n)
        const mapOfUrlNContent = Util.toObjectWithAttributeKey(top100, 'url');
        const urls = top100.map((each) => each.url)
        const tones = await database.fetchRecords('TONE', new Builder().in('url', ...urls).stmt());
        console.log('tones count => ', _.size(tones));
        await deployGuitarPu(...tones);
        const guitars = await api.fetchGuitarpus();
        await api.submitWeekPopulars(...guitars.map((each) => {
            const index = mapOfUrlNContent[each.uuidOfSong].WEEK;
            return {
                name: each.name,
                singer: each.singer,
                indexOfSequence: index,
                idOfTone: each.id,
            }
        }))
    }

    async function deployGuitarPu(...tones) {
        await api.deleteGuitarpus(true);
        await api.deleteRhythms(true);
        await api.deleteKeywords(true);
        await api.submitGuitarpus(...(tones.map((each) => getSubmitGuitarPuItem(each))));

        const guitars = await api.fetchGuitarpus();
        /** 部署Rhythms*/
        await api.submitRhythms(...guitars.map(guitar => {
            return {...guitar, idOfGuitarPu: guitar.id};
        }));

        const rhythms = await api.fetchRhythms();
        /** 部署Keywords*/
        await api.submitKeywords(...rhythms.map((rhythm) => {
            return {
                value: rhythm.name,
                label: rhythm.name,
                popularLevel: rhythm.popularLevel,
                type: 11,
                uid: rhythm.id,
                extra: `11是代表rhythm,12代表singer`,
            }
        }));
    }

    function getSubmitGuitarPuItem(tone) {
        const objOfTones = getMapOfTonalitySpeed(tone.tkInfo);
        const objOfCapoTone = getCapoAndContextTonality(tone.capoLevel);
        const info = {name: tone.name, ...objOfCapoTone, ...objOfTones};
        // console.log(info);
        // console.log('capo  ', _.toNumber(info.capo));
        // console.log('speed  ', _.toNumber(info['速度']));
        return {
            currentContext: tone.tone,
            originalContext: tone.tone,
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
            // uuidOfSong: Util.getEncryptString(tone.url, configerer.ENCRYPT_KEY, true),
            // uuidOfSinger: Util.getEncryptString(tone.singerUrl, configerer.ENCRYPT_KEY, true),
        }
    }

    /**
     *  原調：F#m速度：123
     男調：Fm女調：Cm
     *
     * return { '原調': 'E', '速度': '59', '男調': 'A', '女調': 'E' }
     * */
    function getMapOfTonalitySpeed(string) {
        function getWordOnly(string) {
            return Util.getStringOfHeadMatch(string, `[a-zA-Z0-9-]+`);
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

    async function printRawText() {
        const encrypt = await api.fetchGuitarpuItem('rlgeVPBbAAD5r4DIkiaL');
        const decrypt = Util.getDecryptString(encrypt.context);
        console.log(decrypt);
        Util.appendFile('./pu.raw', decrypt, true, true);
    }


    await deployWeekPopular(300);
    // await printRawText();
    // Util.getStringOfPop(undefined,',');
})();


