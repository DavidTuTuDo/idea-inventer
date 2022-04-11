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


(async () => {

    const api = new Api();
    const listener = new Listener();
    const database = new Databaser('/Users/davidtu/cross-achieve/high/idea-inventer/pu91_scrapier/guitar_pu_from_91.db');
    await database.init();
    /** 找出週 rank*/

    async function fetchTopSongsOfRank(n) {
        Util.getArrayOfSize(_.orderBy(await database.fetchRecords('RANK',
            new Builder().gt('WEEK', 0).orderBy({WEEK:'ASC'}).stmt()), (each) => each.WEEK, 'ASC'), n);
    }

    /** 找出週 rank 對應的tone*/
    async function deployWeekPopular() {
        await api.deleteWeekPopulars(true);
        await api.deleteGuitarpus(true);

        const top100 = await fetchTopSongsOfRank(100)
        console.log('top100 count => ', _.size(top100));
        const mapOfUrlNContent = Util.toObjectWithAttributeKey(top100, 'url');
        console.log(_.size(mapOfUrlNContent));
        const urls = top100.map((each) => each.url)
        const tones = await database.fetchRecords('TONE', new Builder().in('url', ...urls).stmt());
        console.log('tones count => ', _.size(tones));

        for (const each of tones) {
            const objOfTones = getMapOfTonalitySpeed(each.tkInfo);
            const objOfCapoTone = getCapoAndContextTonality(each.capoLevel);
            const info = {name: each.name, ...objOfCapoTone, ...objOfTones};
            // console.log(info);
            // console.log('capo  ', _.toNumber(info.capo));
            // console.log('speed  ', _.toNumber(info['速度']));
            /** get uid after submit tone */
            const result = await api.submitGuitarpuItem({
                currentContext: each.tone,
                originalContext: each.tone,
                tonalityOfContext: info.tonalityOfContext,
                capoLevel: info.capo ? _.toNumber(info.capo) : -1,
                tonalityOfFemale: info['女調'],
                tonalityOfMale: info['男調'],
                tonalityOfOriginal: info['原調'],
                speed: info['速度'] ? _.toNumber(info['速度']) : -1,
            });
            if (result.succeed) {
                const item = result.value;
                const idOfTone = item.id;
                const song = mapOfUrlNContent[each.url];
                await api.submitWeekPopulars({
                    name: song.name,
                    singer: song.singer,
                    indexOfSequence: song.WEEK,
                    idOfTone,
                })
            }
            /** submit weekPopular with tone uid */
        }
    }

    async function deployKeyword()  {
        // console.log(Util.getArrayOfSize((await  api.fetchKeywords()).map(each => { return { title:each.label,priority:each.priority}}),100));
        await api.deleteKeywords(true);
        const songs = await database.fetchRecords(`SONG`,
            new Builder().gt('popularLevel',0).orderBy({popularLevel:`DESC`}).limit(3000).stmt());

        // console.log(songs);

        await api.submitKeywords(
            ...songs.map((song) => {return {
             value:song.name,
             priority:song.popularLevel,
             label:song.name,
            }})

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
            return Util.getStringOfHeadMatch(string, `[a-zA-Z0-9-]+`);
        }

        let array = Util.toOneLineString(string).split(new RegExp('\(原調|速度|男調|女調\)', 'gm'));
        array.shift();
        array = _.chunk(array, 2);
        const object = {}
        for (const each of array) {
            object[each.shift()] = Util.replaceAll(getWordOnly(each.pop()),'-','|');
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

    // await deployWeekPopular();
    await deployKeyword();
    // await printRawText();
    // Util.getStringOfPop(undefined,',');
})();


