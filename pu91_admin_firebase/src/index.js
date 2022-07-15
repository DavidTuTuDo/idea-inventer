import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import Moment from 'moment';
import * as admin from "firebase-admin";
import path from "path";

/** author:明悅
 *  create time:Thu Mar 04 2021 15:45:49 GMT+0800 (Taipei Standard Time)
 */

class firebaser {

    constructor(credential = Util.getFileContextInRaw(configerer.PATH_ACCOUNT_ADMIN)) {
        admin.initializeApp({
            credential: admin.credential.cert(_.isString(credential) ?
                JSON.parse(credential) : credential),
            databaseURL: configerer.DATA_BASE_URL
        });
        this.db = admin.database();
        this.firestore = admin.firestore();
    }

    getFireStore(){
        return this.firestore;
    }

    async deleteAll() {
        await this.db.ref(path.join(configerer.REFERENCE_ROOT)).set({});
        Util.appendInfo(`firebase delete all succeed`);
    }

    async deleteTable(tableName) {
        await this.db.ref(path.join(configerer.REFERENCE_ROOT, tableName)).set({});
        Util.appendInfo(`firebase delete table ${tableName}`);
    }

    /** methods of CREATE,UPDATE */

    async setTone(tone) {
        const refer = `${tone.name}_${tone.singers.join('_')}`;
        await this.setValues(path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_TONE, `${refer}`), tone);

        /** join tone and singer to SUGGEST_WORD table */
        const params = {};
        const updatePath = path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SUGGEST_WORDS);
        for (let singer of tone.singers) {

            params[path.join(singer, configerer.REFERENCE_SUGGEST_TYPE)] = configerer.TYPE_SUGGEST_SINGER;
            params[path.join(singer, configerer.REFERENCE_SUGGEST_POPULAR)] = tone.popularLevel;
        }
        params[path.join(tone.name, configerer.REFERENCE_SUGGEST_TYPE)] = configerer.TYPE_SUGGEST_TONE;
        params[path.join(tone.name, configerer.REFERENCE_SUGGEST_POPULAR)] = tone.popularLevel;

        await this.updateValues(updatePath, params)
    }

    async setSinger(singer) {
        for (let name of singer.names) {
            await this.setValues(path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SINGER, `${name}`, configerer.REFERENCE_INFO), singer);
            await this.setValues(path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SINGER, `${name}`, configerer.REFERENCE_TYPE), singer.type)
        }
    }

    async setQuestion(question) {
        const refPath = path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_QUESTION, `${question.uid}`);
        await this.setValues(refPath, question);
    }

    async setExam(questions) {
        const refPath = path.join(configerer.REFERENCE_ROOT, 'QuestionsOfExam');
        await this.setValues(refPath, {questions: questions});
    }

    async setQuestions(questions) {
        const refPath = path.join(configerer.REFERENCE_ROOT, 'Questions');
        await this.setValues(refPath,  questions);
    }

    async setValues(refPath, params) {
        if (configerer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`SET PATH:${refPath},PARAM:${JSON.stringify(params)}`);
        return await this.db.ref(refPath).set(params);
    }

    async updateValues(refPath, params) {
        if (configerer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`UPDATE PATH:${refPath},PARAM:${JSON.stringify(params)}`);
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
            configerer.REFERENCE_ROOT,
            configerer.REFERENCE_SUGGEST_WORDS,
            word);
        await this.setValues(ref, params);
    }

    async setSingerTones(tone) {
        const pk = this.getTonesPk(tone);
        for (let singerName of tone.singers) {
            const refPath = path.join(
                configerer.REFERENCE_ROOT,
                configerer.REFERENCE_SINGER,
                `${singerName}`,
                configerer.REFERENCE_SINGER_TONES,
                pk);
            const params = {
                name: tone.name,
                popularLevel: tone.popularLevel,
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
                configerer.REFERENCE_ROOT,
                configerer.REFERENCE_SINGER,
                singer,
                configerer.REFERENCE_SINGER_TONES,
                this.getTonesPk(tone),
                updatedReference);
            params[refPath] = updatingValue;
        }
        const refPath = path.join(
            configerer.REFERENCE_ROOT,
            configerer.REFERENCE_TONE,
            this.getTonesPk(tone),
            updatedReference);
        params[refPath] = updatingValue;

        return await this.updateValues(path.join(configerer.REFERENCE_ROOT), params)
    }

    /** methods of READ */
    async getToneListByKeyword(key) {
        const result = await this.fetchOnceByConstraint(path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_TONE), key);
        return result;
    }

    fetchOnceByConstraint = async (refPath, key) => {

        Util.isKeywordRule(key);
        let ref = this.db.ref(refPath);
        const snapshot = await ref.orderByKey().startAt(`${key.trim()}`).endAt(`${key.trim()}\uf8ff`).once("value");

        if (configerer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`FETCH PATH:${refPath},PARAM:${key}`);

        return snapshot;
    }

    async getSuggestedNameListByKeyword(key) {
        /** 設計一個 點擊次數 和關鍵字的 杜明岳:3 */
    }

    async getSingerListByKeyword(key) {
        const result = await this.fetchOnceByConstraint(path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SINGER), key);
        return result;
    }


    async getToneListBySingerName(name) {
        Util.isKeywordRule(name);
        const refPath = path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SINGER, name);
        const ref = this.db.ref(refPath);

        if (configerer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`FETCH PATH:${refPath}`);

        return await ref.once("value");
    }

    async getSingerListByType(type) {
        Util.isSingerTypeRule(type);
        const refPath = path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SINGER);
        const ref = this.db.ref(refPath);

        if (configerer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`FETCH PATH:${refPath}`);

        return await ref.orderByChild(configerer.REFERENCE_TYPE).equalTo(type).once("value");
    }

    async getSuggestWord() {
        const refPath = path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_SUGGEST_WORDS);
        if (configerer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`FETCH PATH:${refPath}`);
        return await this.db.ref(refPath).orderByValue().once('value');
    }

    async updatePurchasePlans() {
        const plans = [
            {
                pid: 2331,
                name: `1個月`,
                price: 50
            },
            {
                pid: 2332,
                name: `3個月`,
                price: 120
            },
            {
                pid: 2333,
                name: `6個月`,
                price: 200
            }
        ]

        for (const plan of plans) {
            await this.setValues(path.join(configerer.REFERENCE_ROOT, configerer.REFERENCE_PRICE, _.toString(plan.pid)), plan)
        }
    }





}

export {firebaser as firebaser}

if (configerer.DEBUG_MODE) {
    (async () => {

            const handler = new firebaser();
            const fire = handler.getFireStore();
            // const result = await  fire.collection("user").doc("david").set({
            //     name: "Los Angeles",
            //     state: "CA",
            //     country: 12,
            //     names:[12,23,342]
            // })
            // const result = await fire.collection('user').doc('david').collection(`prouducts`).doc('hat').get()
            // const result = await fire.collection('products').doc('hat').get()
            // console.log(result);
            // result.forEach((doc) => {console.log(doc.data())})

            // console.log(result.data());
            // const snapshot = await handler.getToneListByKeyword('Bedasds');
            // const handler = new firebaser();gs();
            // const snapshot = await handler.getSingerListByKeyword('陳');
            // const snapshot = await handler.getToneListBySingerName('陳芳語');
            // const snapshot = await handler.getSingerListByType(1);
            // const snapshot = await handler.getSuggestWord();
            // let arrays = Object.keys(snapshot.val());
            // Util.appendInfo(arrays);
            // fs.writeFile('./test.txt',JSON.stringify(arrays,null,2),(err) => {
            //     if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
            //         Util.appendInfo(`error: ${err}`)
            // });


            // if (!_.isUndefined(snapshot) && snapshot.val())
            //     console.log(Object.keys(snapshot.val()));
            //
            // const obj =
            //     {
            //         "capoLevel": "Capo: 4 (E)",
            //         "popularLevel": 123,
            //         "composer": "詞：肆一 / 劉永輝   曲：劉永輝",
            //         "name": "可不可以你也剛好喜歡我",
            //         "sfzf": "参考刷法：X ↑↑↓ X ↑↑↓\n参考指法：T1 21 T1 21",
            //         "singers": ["FS", "Fuying", "Sam"],
            //         "tkInfo": "原調：Ab-B\n男調：Ab-B女調：C-Db",
            //         "tone": "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"
            //     }

            // await handler.setTone(obj);
            // await handler.setSingerTones(obj);
            // await handler.updateTonesChildValue(obj, obj.popularLevel);
            // console.log('Query Done');

        }
    )();
}
