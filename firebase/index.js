import * as admin from 'firebase-admin';
import GlobalConfig from "../GlobalConfig";
import path from 'path';
import _ from "lodash";
import Util from '../util';
import fs from "fs";

const serviceAccount = require(GlobalConfig.PATH_ACCOUNT_ADMIN);

class FireBaseAdminHandler {

    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: GlobalConfig.DATA_BASE_URL
        });
        this.db = admin.database();
    }

    async cleanReference() {
        await this.db.ref(path.join(GlobalConfig.REFERENCE_ROOT)).set({});
    }

    /** methods of CREATE,UPDATE */

    async setTone(tone) {
        const refer = `${tone.name}_${tone.singers.join('_')}`;
        await this.setValues(path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_TONE, `${refer}`), tone);

        /** join tone and singer to SUGGEST_WORD table */
        const params = {};
        const updatePath = path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SUGGEST_WORDS);
        for (let singer of tone.singers) {

            params[path.join(singer, GlobalConfig.REFERENCE_SUGGEST_TYPE)] = GlobalConfig.TYPE_SUGGEST_SINGER;
            params[path.join(singer, GlobalConfig.REFERENCE_SUGGEST_POPULAR)] = tone.clickedCountOfWhole;
        }
        params[path.join(tone.name, GlobalConfig.REFERENCE_SUGGEST_TYPE)] = GlobalConfig.TYPE_SUGGEST_TONE;
        params[path.join(tone.name, GlobalConfig.REFERENCE_SUGGEST_POPULAR)] = tone.clickedCountOfWhole;

        await this.updateValues(updatePath, params)
    }

    async setSinger(singer) {
        for (let name of singer.names) {
            await this.setValues(path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SINGER, `${name}`, GlobalConfig.REFERENCE_INFO), singer);
            await this.setValues(path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SINGER, `${name}`, GlobalConfig.REFERENCE_TYPE), singer.type)
        }
    }

    async setValues(refPath, params) {
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`SET PATH:${refPath},PARAM:${JSON.stringify(params)}`);

        return await this.db.ref(refPath).set(params);
    }

    async updateValues(refPath, params) {
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`UPDATE PATH:${refPath},PARAM:${JSON.stringify(params)}`);

        return await this.db.ref(refPath).update(params);
    }

    getTonesPk(tone) {
        return `${tone.name}_${tone.singers.join('_')}`;
    }

    /**
     * {
     *      score: // number
     * }
     *
     * */

    async enrichSuggestWord(word, params) {
        const ref = path.join(
            GlobalConfig.REFERENCE_ROOT,
            GlobalConfig.REFERENCE_SUGGEST_WORDS,
            word);
        await this.setValues(ref, params);
    }

    async setSingerTones(tone) {
        const pk = this.getTonesPk(tone);
        for (let singerName of tone.singers) {
            const refPath = path.join(
                GlobalConfig.REFERENCE_ROOT,
                GlobalConfig.REFERENCE_SINGER,
                `${singerName}`,
                GlobalConfig.REFERENCE_SINGER_TONES,
                pk);
            const params = {
                name: tone.name,
                clickedCountOfWhole: tone.clickedCountOfWhole,
                composer: tone.composer
            }
            await this.setValues(refPath, params);
        }
    }

    async updateTonesChildValue(tone, updatingValue) {
        const params = {};
        const updatedReference = Util.getItsKeyByValue(tone, updatingValue);
        for (let singer of tone.singers) {
            const refPath = path.join(
                GlobalConfig.REFERENCE_ROOT,
                GlobalConfig.REFERENCE_SINGER,
                singer,
                GlobalConfig.REFERENCE_SINGER_TONES,
                this.getTonesPk(tone),
                updatedReference);
            params[refPath] = updatingValue;
        }
        const refPath = path.join(
            GlobalConfig.REFERENCE_ROOT,
            GlobalConfig.REFERENCE_TONE,
            this.getTonesPk(tone),
            updatedReference);
        params[refPath] = updatingValue;

        return await this.updateValues(path.join(GlobalConfig.REFERENCE_ROOT), params)
    }

    /** methods of READ */
    async getToneListByKeyword(key) {
        const result = await this.fetchOnceByConstraint(path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_TONE), key);
        return result;
    }

    async fetchOnceByConstraint(refPath, key) {
        this.isKeywordRule(key);
        let ref = this.db.ref(refPath);
        const snapshot = await ref.orderByKey().startAt(`${key.trim()}`).endAt(`${key.trim()}\uf8ff`).once("value");

        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`FETCH PATH:${refPath},PARAM:${key}`);

        return snapshot;
    }

    async getSuggestedNameListByKeyword(key) {
        /** 設計一個 點擊次數 和關鍵字的 杜明岳:3 */
    }

    async getSingerListByKeyword(key) {
        const result = await this.fetchOnceByConstraint(path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SINGER), key);
        return result;
    }


    async getToneListBySingerName(name) {
        Util.isKeywordRule(name);
        const refPath = path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SINGER, name);
        const ref = this.db.ref(refPath);

        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`FETCH PATH:${refPath}`);

        return await ref.once("value");
    }

    async getSingerListByType(type) {
        Util.isSingerTypeRule(type);
        const refPath = path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SINGER);
        const ref = this.db.ref(refPath);

        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`FETCH PATH:${refPath}`);

        return await ref.orderByChild(GlobalConfig.REFERENCE_TYPE).equalTo(type).once("value");
    }

    async getSuggestWord() {
        const refPath = path.join(GlobalConfig.REFERENCE_ROOT, GlobalConfig.REFERENCE_SUGGEST_WORDS);
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`FETCH PATH:${refPath}`);
        return await this.db.ref(refPath).orderByValue().once('value');
    }

}

const handler = new FireBaseAdminHandler();
export default handler;

if (GlobalConfig.DEBUG_MODE) {
    (async () => {
        // const snapshot = await handler.getToneListByKeyword('Bedasds');
        // const snapshot = await handler.getSingerListByKeyword('陳');
        // const snapshot = await handler.getToneListBySingerName('陳芳語');
        // const snapshot = await handler.getSingerListByType(1);
        const snapshot = await handler.getSuggestWord();
        let arrays = Object.keys(snapshot.val());
        console.log(arrays);
        fs.writeFile('./test.txt',JSON.stringify(arrays,null,2),(err) => {
            if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
                console.log(`error: ${err}`)
        });


        // if (!_.isUndefined(snapshot) && snapshot.val())
        //     console.log(Object.keys(snapshot.val()));

        const obj =
            {
                "capoLevel": "Capo: 4 (E)",
                "clickedCountOfWhole": 123,
                "composer": "詞：肆一 / 劉永輝   曲：劉永輝",
                "name": "可不可以你也剛好喜歡我",
                "sfzf": "参考刷法：X ↑↑↓ X ↑↑↓\n参考指法：T1 21 T1 21",
                "singers": ["FS", "Fuying", "Sam"],
                "tkInfo": "原調：Ab-B\n男調：Ab-B女調：C-Db",
                "tone": "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"
            }

        // await handler.setTone(obj);
        // await handler.setSingerTones(obj);
        // await handler.updateTonesChildValue(obj, obj.clickedCountOfWhole);
        console.log('Query Done');
    })()

}

