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

    /** 找出週 rank*/

    /** 找出週 rank 對應的tone*/
    async function deployWeekPopular() {
        await api.deleteWeekPopulars(true);
        await api.deleteRhythms(true);

        const database = new Databaser('/Users/davidtu/cross-achieve/high/idea-inventer/pu91_scrapier/guitar_pu_from_91.db');
        await database.init();
        const top100 = Util.getArrayOfSize(_.orderBy(await database.fetchRecords('RANK', new Builder().gt('WEEK', 0).stmt()), (each) => each.WEEK, 'ASC'), 100);
        console.log('top100 count => ', _.size(top100));

        const mapOfUrlNContent = Util.toObjectWithAttributeKey(top100, 'url');
        console.log(_.size(mapOfUrlNContent));
        const urls = top100.map((each) => each.url)
        const tones = await database.fetchRecords('TONE', new Builder().in('url', ...urls).stmt());
        console.log('tones count => ', _.size(tones));

        for (const each of tones) {
            /** get uid after submit tone */
            const result = await api.submitRhythmItem({context: each.tone});
            if (result.succeed) {
                const item = result.value;
                const idOfTone = item.id;
                const song = mapOfUrlNContent[each.url];
                await api.submitWeekPopulars({
                    name:song.name,
                    singer:song.singer,
                    indexOfOrder:song.week,
                    idOfTone,
                })
            }
            /** submit weekPopular with tone uid */
        }
    }

    await deployWeekPopular();
    // Util.getStringOfPop(undefined,',');
})();


