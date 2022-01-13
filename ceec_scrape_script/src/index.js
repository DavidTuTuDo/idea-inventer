import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import Browser from "./browser";
import {databazer as Databaser} from "databazer";

/** author:明悅
 *  create time:Wed Oct 13 2021 17:25:32 GMT+0800 (Taipei Standard Time)
 */


const folderOfQuestion = '試題內容';
const folderOfAnswer = '選擇題答案';
const folderOfMathAnswer = '選擇(填)題答案';
const nameOfExam = 'GSAT';
const examOfMakeUp = '補考';
const examOfFormal = '正式';

class ceec_scrape_script {

    async fetchCeeCPDFFilesOfPaper() {
        const browser = new Browser(true);
        await browser.init();

        const openCeeCTask = async (page) => {
            await Browser.openPageUtilStable(page, 'https://www.ceec.edu.tw/xmfile?xsmsid=0J052424829869345634')
            // console.log(await page.content());
            const selectors = await page.$$(`.tagList > ul > li`)
            /** 等同於querySelectorAll */
            for (const selector of selectors) {
                const label = await Browser.getInnerTextOfSelector(page, selector);
                if (_.isEqual("全部", label)) continue;
                await Browser.clickSelectorCompletelyLoaded(page, selector);

                if (await Browser.selectorExisted(page, `span[class="dev-script-oper"]`)) {
                    await Browser.selectCompletelyLoaded(page, `span[class="dev-script-oper"] > select`, `50`)
                }

                const filesOfEachYear = await page.$$(`#PageListContainer > .ListTable >.rwdTable > tbody > tr`);
                /** 沒有註明代表tagName .代表className, #代表id, $$代表querySelectorForAll, $代表querySelector*/
                for (const eachYear of filesOfEachYear) {
                    const yearTitle = _.trim(await Browser.getInnerTextOfSelector(page, await eachYear.$(`.title`)));
                    const papers = await eachYear.$$(`.download > ul > li`);
                    if (papers !== null && papers.length > 0) {
                        for (const paper of papers) {
                            const element = await paper.$(`a`);
                            const title = _.trim(await Browser.getSelectorProperty(element, 'title'));
                            const href = _.trim(await Browser.getSelectorProperty(element, 'href'));
                            const innerText = _.trim(await Browser.getSelectorProperty(element, 'innerText'));
                            if (_.isString(innerText) && Util.or(Util.has(innerText, `答案`), Util.has(innerText, `試題`))) {
                                if (Util.isPathEqualsFileType(href, 'pdf')) {
                                    Util.appendInfo(`考科:${label}, 考卷:${title}, 網址:${href}`)
                                    await Browser.download(href, `./GSAT/${label}/${yearTitle}/${innerText}`, `${title}.pdf`);
                                    await Util.syncDelay(20);
                                }
                            }
                        }
                    }
                }
            }
        }
        await browser.doSinglePageWork(openCeeCTask);
        await browser.destroy();
    }

    async goThroughGSAT(dbapth, onlySubject, onlyYear = -1, range = {enable: false, max: 110, min: 100},) {
        const db = new Databaser(dbapth);
        await db.init();
        await db.dropTable('QUESTION');
        const pathOfRoot = `./${nameOfExam}`;
        const subjects = Util.getNamesOfFolderChild(pathOfRoot);
        for (const subject of subjects) {

            if (!_.isEmpty(onlySubject) && !_.isEqual(onlySubject, subject)) {
                continue;
            }

            const pathOfRootSubject = libpath.join(pathOfRoot, subject);
            const years = Util.getNamesOfFolderChild(pathOfRootSubject);
            for (const year of years) {

                const pathOfRootSubjectYear = libpath.join(pathOfRootSubject, year);
                const pathOfExamPaper = libpath.join(pathOfRootSubjectYear, folderOfQuestion);
                const pathOfAnswerPaper = this.handleAnswerPath(pathOfRootSubjectYear);
                const numberOfYear = _.toNumber(year.match(new RegExp(`[0-9]{2,3}`)));

                if (onlyYear > 0 && !_.isEqual(numberOfYear, onlyYear)) {
                    continue;
                }

                if (range.enable && (numberOfYear < range.min || numberOfYear > range.max)) {
                    continue;
                }

                Util.appendInfo(`正在執行${subject}, 第 ${year} 的題目`)

                const extra = Util.has(year, examOfMakeUp) ? examOfMakeUp : examOfFormal;
                const questions = await this.toEachQuestions(
                    this.getHeadFileOfPath(pathOfExamPaper),
                    this.getHeadFileOfPath(pathOfAnswerPaper)
                    , {year: numberOfYear, subject, nameOfExam, extra})

                for (const question of questions) {
                    if (question !== undefined) {
                        delete question.valid;
                        await db.lazyInsertRecord('QUESTION', question);
                    }

                }
            }
        }
    }

    handleAnswerPath(pathOfRootSubjectYear) {
        const formalPath = libpath.join(pathOfRootSubjectYear, folderOfAnswer)
        if (Util.isPathExist(formalPath))
            return formalPath;
        else
            return libpath.join(pathOfRootSubjectYear, folderOfMathAnswer);
    }

    getHeadFileOfPath(path) {
        return Util.findFilePathBy(path, (file) => _.isEqual(file.extension, `pdf`)).shift();
    }

    /** 回傳 [[
     { qid: 1, answer: 'C' },
     { qid: 2, answer: 'A' },
     { qid: 3, answer: 'B' },
     ]*/
    analysisAnswerTexts(text) {
        const oneLineString = Util.toOneLineString(text);
        const regex = new RegExp(`\\d{1,2}\\s{1,2}`, `g`);
        const rawAnswers = _.split(oneLineString, regex);
        /** 第一個是髒資料, 在'1 '之前*/
        rawAnswers.shift();
        const qids = oneLineString.match(regex);

        const answers = _.zipWith(rawAnswers, qids,
            (answer, qid) => {

                const answerShouldBe = _.trim(answer).match(new RegExp(`[a-wA-W]{1,7}`));

                /** 處理這種 `E 以上答案依照考選部規定`*/
                return {
                    qid: _.toNumber(_.trim(qid)),
                    answer: answerShouldBe === null ? undefined : answerShouldBe[0],
                }
            })
        const filtered = _.filter(answers, (each) => each.answer !== undefined);
        return _.sortBy(filtered, 'qid');

    }


    /** file的資料結構是自定義的, from utiller:path*/
    async toEachQuestions(pathInfoOfQuestion, pathInfoOfAnswer,
                          info = {
                              extra: '正式',
                              year: 100,
                              subject: 'English',
                              nameOfExam: 'GSAT'
                          }) {

        function safeGetAnswer(question) {
            const target = answers.find((ans) => _.isEqual(question.qid, ans.qid));
            return target ? target.answer : '';
        }

        function safeGetQuestionOrderNumber(string) {
            return _.toNumber(Util.getNormalizedStringNotEndWith(Util.toSpaceLessString(string),'.'));
        }

        const answers = [];
        if (pathInfoOfAnswer !== undefined && info.year > 95) {
            const pdfOfAnswer = await Util.getPDFText(pathInfoOfAnswer.absolute);
            answers.push(...this.analysisAnswerTexts(pdfOfAnswer.text, info));
        }

        const pdfOfQuestion = await Util.getPDFText(pathInfoOfQuestion.absolute);
        const texts = pdfOfQuestion.text;

        Util.appendFile('./since.txt', texts, true, true);

        /**
         *
         *  用來搞定100年的自然, 應該這一年的題號 會是 '4 8 .  ', ' 1 . '
         *  const regex = new RegExp(`[1-9]?[1-9]?\\s?\\d\\s?\\.\\s{2}`,`g`)
         *
         *  用來分割多數的情況  '11.' , '1.'
         *  const regex = new RegExp(`\\d{1,2}\\.\\s{1,2}`, `g`);
         *
         *  最中立的方式, 但可能會多index = 0 的狀況.
         *  const regex = new RegExp(`[1-9]?[1-9]?\\s?\\d\\s?\\.\\s{1,2}`, `g`)
         *
         */
        const regex = new RegExp(`[1-9]?[1-9]?\\s?\\d\\s?\\.\\s{1,2}`, `g`)

        const eachQuestions = _.split(texts, regex);
        eachQuestions.shift();
        /** 第一個是髒資料, 在'1. '之前*/
        const titles = texts.match(regex);
        const rawQuestions = _.zipWith(eachQuestions, titles,
            (question, title) => {
                return {
                    qid: safeGetQuestionOrderNumber(title),
                    content: _.trim(Util.toNewLineLessString(question))
                }
                /**
                 * {
                     content: 'Elderly shoppers in this store are advised to take the elevator rather than the _____, which may move too fast for them to keep their balance.
                      (A) airway (B) operator (C) escalator (D) instrument  '
                    }
                 */
            });

        const afterFactoryQuestions = rawQuestions.map(raw => this.toChoiceQuestionFormat(raw, info));

        const questions = _.filter(afterFactoryQuestions, question => question.valid);

        const formalizeQuestion = questions.map((question) => {
            return {...question, ...info, answer: this.isGSATMath(info) ? '' : safeGetAnswer(question)}
        });

        return formalizeQuestion;
    }

    isGSATMath(info) {
        return _.isEqual(info.subject, '數學') && _.isEqual(info.nameOfExam, 'GSAT');
    }

    toChoiceQuestionFormat(raw, info) {
        let choices = [];
        let topic = '';
        let answer = '';
        let valid = false;
        let typeOfQuestion = '';
        /** 1.選擇題
         2.綜合測驗(15~20為題組, 有些會把題號放在 題目內當作克漏字填充, 例如 22. (A) she(B)he (C) this   ?       __22 ___ is good ,)
         3.文意選填(答案欄位會有 A-J的概念)
         4.申論題(全文字回答)
         5.多選題(A-E)
         */
        let nameOfExam = '';
        /** 國考, 學測, 統測, */
        let subject = '';
        /** 國文, 英文,電子學 */
        let year = '';
        /** 考試年份 */
        let extra = '';
        /** 注意91年有 補考的狀況 */
        let qid = -1;
        /** 在試卷上原始的題號 */

        const rawContent = raw.content.trim();
        let topicAnswers = _.split(rawContent, new RegExp(`\\(\\s{0,2}[A-Z]\\s{0,2}\\)`, `g`));

        if (this.isGSATMath(info)) {
            topicAnswers = _.split(rawContent, new RegExp(`\\(\\s{0,2}[1-8]\\s{0,2}\\)`, `g`));
        }

        if (topicAnswers && _.size(topicAnswers) > 2) {
            topic = _.trim(topicAnswers.shift());
            choices.push(...(topicAnswers.map(each => _.trim(each))));
            valid = true;
        }
        qid = raw.qid;
        return {
            choices,
            topic,
            answer,
            valid,
            qid,
        }

    }

    async samplePdfFile() {
        const path = './download/英文';
        const files = Util.findFilePathBy(path, (file) => _.isEqual(file.extension, 'pdf'));
        const file = _.find(files, (file) => _.isEqual(file.fileNameExtension, `110學測英文試卷 .pdf`));
        await this.toEachQuestions(file);
    }


}

export {ceec_scrape_script as ceec_scrape_script}

if (configerer.DEBUG_MODE) {
    (async () => {
            const handler = new ceec_scrape_script();
            // await handler.fetchCeeCPDFFilesOfPaper();
            // await handler.samplePdfFile();


            /** 拿到 90-99 */
            // await handler.goThroughGSAT('國文',-1,{enable:true,min:90,max:99});

            /** 拿到 100-110 */
            // await handler.goThroughGSAT('./gsat.db', undefined, -1, {enable: true, min: 100, max: 110});
            // await handler.goThroughGSAT('./gsat-math.db', '數學', -1, {enable: true, min: 100, max: 110});
            // await handler.goThroughGSAT('./gsat-sin.db', '自然', 100, {enable: false});
            // await handler.goThroughGSAT('./gsat-chi.db', '國文', 100, {enable: false});
            // await handler.goThroughGSAT('./gsat-soci.db', '社會', 100, {enable: false});
            // await handler.goThroughGSAT('./gsat-95.db', undefined, 95, {enable: false});
            // await handler.goThroughGSAT('./gsat-eng98.db', '英文', 98, {enable: false});
            // await handler.goThroughGSAT('./gsat-eng97.db', '英文', 97, {enable: false});
            // await handler.goThroughGSAT('./gsat-eng96.db', '英文', 96, {enable: false});

        }
    )();
}
