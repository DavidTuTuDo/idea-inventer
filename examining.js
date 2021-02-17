import GlobalConfig from "./GlobalConfig";
import _ from "lodash";
import fs from "fs";
import util from './util';
import ERROR from './exception';
import npath from 'path';


class Examining {

    #content
    #filepath

    constructor(path) {
        this.#filepath = path;
    }

    async getText() {
        this.#content = await util.getPDFText(this.#filepath);
        return this.#content.text;
    }

    deleteLinesWhileHas(text, ...predicate) {
        const textlines = text.split(`\n`).map((line) => _.trim(line));
        _.pullAllWith(textlines, predicate, (a1, a2) => util.has(a1, a2)).join();
        return textlines.join('\n');
    }

    deleteLinesWhileEqual(text, ...predicate) {
        const textlines = text.split(`\n`).map((line) => _.trim(line));
        const after = _.differenceWith(textlines, predicate, (a1, a2) => _.isEqual(a1.trim(), a2));
        return after.join('\n');
    }

    deleteMarkLangs(text, startFrom, endWith) {
        startFrom = _.trim(startFrom);
        endWith = _.trim(endWith);

        while (util.has(text, startFrom)) {
            const textlines = text.split(`\n`).map((line) => _.trim(line));
            const from = _.findIndex(textlines, (line) => _.isEqual(line, startFrom));
            const to = _.findIndex(textlines, (line) => _.isEqual(line, endWith), from);
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                util.appendInfo(`from: ${from}, to:${to}`);
            if (to > from > -1) {
                _.pullAt(textlines, _.range(from, to - 1));
            }
            text = textlines.join(`\n`);
        }
        return text;
    }

    correctBrace(text) {
        let array = Array.from(text);
        const indexes = _.keys(_.pickBy(array, (item) => _.isEqual('(', item)))
        const invalid = [];
        for (const _index of indexes) {
            const index = _.toNumber(_index);
            if (array[index + 2] !== ')') {
                for (const i of _.range(index + 1, array.indexOf(')', index))) {
                    if (_.isEqual(array[i], '\n')) invalid.push(i);
                }
            }
        }
        _.pullAt(array, invalid)
        return array.join('')
    }

    deletePagePadding(text, ...pageSign) {
        const textlines = text.split(`\n`).map((line) => _.trim(line));
        for (const page of pageSign) {
            while (util.has(textlines, page)) {
                const index = textlines.indexOf(page);
                const initSlice = textlines.slice(0, index + 1); // 可能會是這種結構 [...'language','','','','1'];
                const endSlice = textlines.slice(index + 1, textlines.length);
                const filterSlice = _.dropRightWhile(initSlice, (value) => _.isEqual(value, page) || _.isEqual(value, ''))
                textlines.length = 0;
                textlines.push(...(_.concat(filterSlice, endSlice)));
            }
        }
        return textlines.join(`\n`);

    }

    deleteLinesAfterIdentity(text, identity, ...whatDoYouWandToDelete) {
        const textlines = text.split(`\n`).map((line) => _.trim(line));
        let index = _.findIndex(textlines, (line) => {
            return util.has(line, identity)
        });
        if (index > 0) {
            const initSlice = textlines.slice(0, index); // 可能會是這種結構 [...'language','','','','1'];
            const slice = textlines.slice(index, textlines.length);
            _.pullAllWith(slice, whatDoYouWandToDelete, (i1, i2) => _.isEqual(i2, i1))
            textlines.length = 0;
            textlines.push(...(_.concat(initSlice, slice)));
        }
        return textlines.join(`\n`);

    }

    getAllChoiceObjAfterIdentityV2(text, identity) {
        const textlines = text.split(`\n`).map((line) => _.trim(line));
        let index = _.findIndex(textlines, (line) => {
            return util.has(line, identity)
        });
        const qObjArray = [];
        if (index > 0) {
            const texts = _.trim(textlines.slice(index + 1, textlines.length).join());
            const questions = texts.split(new RegExp(`\\([A-D]\\)[0-9][0-9]* `, `g`));
            /** 把 1 ... 12 13 當作切割點 */
            const answers = texts.match(new RegExp(`\\([A-D]\\)[0-9][0-9]* `, `g`));
            /** 抓出所有(A) (B) ... */
            _.pull(questions, '');
            /** 因為split 之後 第一格如果是分割點, 會製造一個 空字串 */

            if (_.size(answers) === _.size(questions)) {
                _.every(questions, (question, index) => {
                    qObjArray.push({
                        index: answers[index].match(new RegExp(`[0-9][0-9]*`))[0],
                        answer: answers[index].match(new RegExp(`\([A-D]\)`))[0],
                        question
                    })
                    return true;
                })
            } else {
                util.appendError(`${this.#filepath} v2不符合選擇題格式 抓不出來 questions:'${questions.length}, answers:'${answers.length}'`);

            }

        }
        return qObjArray;
    }

    /** 先把選擇題組合成一個字串,然後用split(reg[A-D]) 切成 字串的陣列, 然後處理掉 */
    getAllChoiceObjAfterIdentity(text, identity) {
        const textlines = text.split(`\n`).map((line) => _.trim(line));
        let index = _.findIndex(textlines, (line) => {
            return util.has(line, identity)
        });
        const qObjArray = [];
        if (index > 0) {
            const texts = _.trim(textlines.slice(index + 1, textlines.length).join());
            /** +1 的目的是不要包到identity */

            const theQNChoiseInOrder = texts.split(new RegExp(`\\([A-D]\\)`, `g`));
            /** 把 (A) (B) ... */

            const abcdInOrder = texts.match(new RegExp(`\\([A-D]\\)`, `g`));
            /** 抓出所有(A) (B) ... */
            _.pull(theQNChoiseInOrder, '');
            /** 因為split 之後 第一格如果是分割點, 會製造一個 空字串 */
            const qc = _.chunk(theQNChoiseInOrder, 5);
            const ac = _.chunk(abcdInOrder, 5);
            if (qc.length === ac.length) {
                for (const group of qc) {
                    const idx = _.indexOf(qc, group);
                    qObjArray.push({
                        answer: _.head(ac[idx]),
                        question: _.head(qc[idx]),
                        choice: combine(_.tail(ac[idx]), _.tail(qc[idx]))
                    })
                }
                util.appendInfo(`${this.#filepath} 符合`);
            } else {
                util.appendError(`${this.#filepath} 不符合選擇題格式 抓不出來 qc:'${qc.length}, ac:'${ac.length}'`);
            }

            function combine(a1, a2) {
                let str = '';
                for (const item of a1) {
                    const idx = _.indexOf(a1, item);
                    str += `${a1[idx]}${a2[idx]}`;
                }
                return str;
            }
        }
        return qObjArray;

    }
}

(async () => {
    for (const path of _.reverse(util.getPathUnderDir('./pdfs'))) {
        const pdf = new Examining(path)

        let text = await pdf.getText();
        text = util.ToCDB(text);
        text = pdf.correctBrace(text);
        text = pdf.deleteLinesWhileHas(text,
            `--    --`,
            `重製必究`,
            `高分詳解`)
        text = pdf.deleteLinesWhileEqual(text, `‧`, `高上`, `高點`);
        text = pdf.deleteMarkLangs(text, `試題評析`, `答:`)
        text = pdf.deletePagePadding(text, ...(_.range(1, 20).map((_index) => `${_index}`)));
        text = pdf.deleteLinesAfterIdentity(text, `測驗題部分`, '');
        const choiseQ = pdf.getAllChoiceObjAfterIdentity(text, `測驗題部分`);
        const choiseQv2 = pdf.getAllChoiceObjAfterIdentityV2(text, `測驗題部分`);


        util.appendFile(`./output/${npath.basename(path)}.txt`, text, true);
    }
    // let tartget = '(1\n' +
    //     ')具有我國國籍之證明。\n'
    // console.log('1   ' + tartget);
    // console.log('2   ' + tartget);
})();


export default Examining;
