import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/CommonFirebaseHelper";
import {linepayer as LinePay} from "linepayer";
import libpath from 'path';
import config from './config';
import moment from 'moment';

const OFFICIAL_YEARS_OF_YEARS = _.range(93, 112, 1);


(async () => {
    console.log(`注意注意, 五秒後要部署到admin server了,動到prod的資料就爆炸了.`)
    await Util.syncDelay(5000)

    const api = new Api();
    const listener = new Listener();

    async function deployQuestions({dbpath = '', year = 120}) {
        const db = new Databaser(`/Users/davidtu/cross-achieve/high/idea-inventer/ceec_scrape_script/${dbpath}`);
        await db.init();

        const qs = (_.isNumber(year) && year > 0) ?
            await db.fetchRecords('QUESTION', new Builder().equal('year', year).stmt()) :
            await db.fetchRecords('QUESTION')

        let questions = qs.map((q) => {
            /** 把`a...b...c..` 換成 ['a...','b...','c....']*/
            const choiceStringArray = q.choices.split(`#&#@#`);
            q.topic = {name: q.topic, images: []},
                q.choices = choiceStringArray.map((stmt) => {
                        return {statement: stmt}
                    }
                )

            q.timesOfYear = _.isEqual(q.extra, '正式') ? 1 : 2
            delete q.uid;
            q.type = q.nameOfExam;
            return q;
        })
        await api.submitQuestions(...questions);
    }

    async function beforeStartService() {
        await api.deletePurchasePlans();
        await api.deleteMyShortcuts('BYnJOAlUa5aCnpxvoeiIyCzRXSt1', true);
        await api.deleteShortcuts();
        await api.submitShortcuts(
            {
                title: '回到首頁',
                icon: 'muIcon:Bedtime',
                route: `route:main`,
                indexOfSequence: 0,
            }
            ,
            {
                title: '我的歷史錯誤',
                icon: 'muIcon:Rule',
                route: `route:historyWrong`,
                indexOfSequence: 2,
            },
            {
                title: '問過的問題',
                icon: 'muIcon:HistoryToggleOff',
                route: `route:myFatefulQuestions:stupidAsk`,
                indexOfSequence: 2,
            },
            {
                title: '回答的題目',
                icon: 'muIcon:Rule',
                route: `route:myFatefulQuestions:kindlyReply`,
                indexOfSequence: 2,
            }
            , {
                title: '最愛的題目',
                icon: 'muIcon:FavoriteBorder',
                route: `route:myFatefulQuestions:favorite`,
                indexOfSequence: 2,
            },
            {
                title: '相關網站',
                icon: 'muIcon:Whatshot',
                indexOfSequence: 3,
                subs: [
                    {
                        title: '大考入學中心',
                        icon: 'muIcon:School',
                        route: 'path:https://www.ceec.edu.tw/',
                        indexOfSequence: 2,
                    },
                    {
                        title: '大數數學',
                        icon: 'muIcon:Calculate',
                        route: `path:https://bignmath.weebly.com/`,
                        indexOfSequence: 1,
                    }
                ]
            },
        )

        await api.submitHistoryFilter({
            whichSubjects: [
                {label: "全部", value: "all"},
                {label: "英文", value: "英文"},
                {label: "數學", value: "數學"},
                {label: "國文", value: "國文"},
                {label: "自然", value: "自然"},
                {label: "社會", value: "社會"},
            ],
            replyTypes: [
                {value: "wrong", label: "答錯"},
                {value: "right", label: "答對"},
                {value: "all", label: "全部"},
            ],
            orderByWhats: [
                {
                    label: '最近',
                    value: 'latest'
                },
                {
                    label: '作答耗時(最久)',
                    value: 'duration'
                },
            ]
        });

        await api.submitExamHistoryInfo({
            maxYear: 111,
            minYear: 91,
            marks: [{value: 91, label: '91年'}, {value: 100, label: '100年'},
                {value: 105, label: '105年'}, {
                    value: 111, label: '111年'
                }],
            historyExams: [
                {value: '91-1', label: '91年'},
                {value: '91-2', label: '91年(補考)'},
                {value: '92-1', label: '92年'},
                {value: '92-2', label: '92年(補考)'},
                {value: '93-1', label: '93年'},
                {value: '94-1', label: '94年'},
                {value: '95-1', label: '95年'},
                {value: '96-1', label: '96年'},
                {value: '97-1', label: '97年'},
                {value: '98-1', label: '98年'},
                {value: '99-1', label: '99年'},
                {value: '100-1', label: '100年'},
                {value: '101-1', label: '101年'},
                {value: '102-1', label: '102年'},
                {value: '103-1', label: '103年'},
                {value: '104-1', label: '104年'},
                {value: '105-1', label: '105年'},
                {value: '106-1', label: '106年'},
                {value: '107-1', label: '107年'},
                {value: '108-1', label: '108年'},
                {value: '109-1', label: '109年'},
                {value: '110-1', label: '110年'},
                {value: '111-1', label: '110年'},
            ]
        })
        await api.submitExpired({expiredTime: moment('2022-01-22').valueOf()})

        await api.submitPurchasePlans(
            {id: 1001, pid: 1001, name: '1個月', price: 60, priceTip: '平均一個月60元', fullName: '明悅科技-1個月', duration: '31d'},
            {
                id: 1002,
                pid: 1002,
                name: '2個月',
                price: 110,
                priceTip: '平均一個月55元',
                fullName: '明悅科技-2個月',
                duration: '62d'
            },
            {
                id: 1003,
                pid: 1003,
                name: '3個月',
                price: 150,
                priceTip: '平均一個月50元',
                fullName: '明悅科技-3個月',
                duration: '63d'
            })
    }

    async function transactionSample() {
        /** transaction initialBehaviorOfMathOptionalQuestion */
        await firebase.firestore().collection('tests').doc('first').set({index: 1});
        const asyncTasks = _.range(20).map(() => {
            return async () => {
                await firebase.firestore().runTransaction(async (transaction) => {
                    const ref = firebase.firestore().collection('tests').doc('first');
                    const result = await transaction.get(ref);
                    const newbie = result.data().index + 1;
                    await transaction.update(ref, {index: newbie});
                })
            }
        });

        const pool = new InfinitePool(5)
        await pool.runByEachTask(asyncTasks);
    }

    async function sampleOfDeleteEnglish() {
        for (const year of [99, 98, 97, 96]) {
            const result = await api.fetchQuestions(
                {where: (stmt) => stmt.where('year', '==', year)},
                {where: (stmt) => stmt.where('subject', '==', '英文')}
            );

            for (const each of result) {
                console.log(`delete ${each.subject} ${each.year} ${each.qid}-${each.id}`)
                await api.deleteQuestionItem(each.id);
            }
        }
    }


    async function batchDeleteSubjectMap() {
        for (const year of OFFICIAL_YEARS_OF_YEARS) {
            console.log(`正在刪除 SubjectIds ${year}`);
            await api.deleteSubjectIds(false, {where: (stmt) => stmt.where('year', '==', year)});
        }


    }

    async function submitSubjectMap() {
        await batchDeleteSubjectMap();
        for (const year of OFFICIAL_YEARS_OF_YEARS) {
            console.log(`正在fetch ${year}`);
            const questions = await api.fetchQuestions({where: (stmt) => stmt.where('year', '==', year)});
            console.log(`submit id/map year=> ${year}年`, questions.length);
            await api.submitSubjectIds(...questions.map(q => {
                return {quid: q.id, year: q.year, subject: q.subject, timesOfYear: q.timesOfYear}
            }));
        }
    }

    async function batchDoing(){
        const ids =[
            "yVF1wzFDJTVhpPVmq4I4",
            "LuhrfegQ23bPvGeJqUhK",
            "Pa3ZFORBmelHeTPiBtkx",
            "m6fZtMSBBhmIegebRWRD",
            "Oc7xRsPP870sH6wUG1HO",
            "TeXNYoQsnCGk6lQGxYL3",
            "zRDfwEFdEBPbi3nrvA4h",
            "3cvqUkWLVAWtV2h78oGr",
            "VBzOcwQ1V7CPynImhAu6",
            "L847lqPGXyUbwkBv3d0Y",
            "uHgAYHu9Xh2kDV88ZqR6",
            "eA2O04WoV5ouFn54yuH2",
            "rdWD6gRyUZrMx4riuHte",
            "Stg4Zo6yWgY0qRz0B3kU",
            "PhqnzWHxGnTSY3Bzemd2",
            "Nckv0dkkh3hrq4iCDebU",
            "rZ5sDQdezejlhuOg3I9C"]

        const answsers = [
            "GCDABHFEJ",
            "EHGBJACFD",
            "DGABCEHJI",
            "HEAGIFCJD",
            "IHCGBAEJD",
            "FCIJEHGAD",
            "CBDJGAIHE",
            "GHIEBJFAC",
            "AEBGCDHFJ",
            "IGAJEDHFB",
            "JAEHFGCIB",
            "CJFHDBEAG",
            "IECBJAFGH",
            "FEHDBCAJG",
            "DHIAEJGFB",
            "CDGIHFBAE",
            "GIAJHDBFE"
        ]

        const combines = _.zip(ids,answsers);
        // console.log(combines)


        for(const each of combines) {
            const item = await api.fetchQuestionItem(each.shift());
            const answerString = each.pop();
            delete item._doc;
            delete item.id;
            delete item.updateTime;

            const as = answerString.split('')
            const waitForSubmits = [];
            let index = 32;
            for(const a of as) {
                const deepClone = _.cloneDeep(item);
                deepClone.qid = index;
                deepClone.topic.name = `請依照題目作答 ${index}`;
                deepClone.answer = a;
                index = index + 1;
                waitForSubmits.push(deepClone);
            }

            const result = await api.submitQuestions(...waitForSubmits);
            console.log(result);
        }


    }


    async function migrate() {
        for (const year of OFFICIAL_YEARS_OF_YEARS) {
            console.log(`正在fetch ${year}`);
            const questions = await api.fetchQuestions({where: (stmt) => stmt.where('year', '==', year)});
            console.log(`submit id/map year=> ${year}年`, questions.length);
            const afters = questions.map((q) => {
                return {...q, timesOfYear: 1}
            })
            await api.submitQuestions(...afters);
        }
    }

    async function testBatchFunctions() {
        const fetchAll = await api.fetchItems('testBatch');
        // const samples = _.range(0,300).map((each) => { return {name:`update ,text${each}`}})
        // await api.updateItems('testBatch',...samples)
        const news = fetchAll.map((each) => {
            return {id: each.id}
        })

        await api.updateItems('testBatch', ...news.map((each) => {
            return {
                id: each.id,
                sign: Util.getRandomHash(10)
            }
        }))
    }

    await batchDoing();
    // await deployQuestions({dbpath:'gsat-92.db',year: -1});
    // await submitSubjectMap()
    // await testBatchFunctions();
    // await api.deleteQuestions(true);
    // await api.deleteConfuses(true);
    // await api.deleteAnswers(true);
    // await beforeStartService();
    // await backgroundService();
    // await api.submitUserBeingAdmin(`BYnJOAlUa5aCnpxvoeiIyCzRXSt1`);
    // await submitSubjectMap()
    // console.log((await sampleFetch()).length)
})();


// line-pay request result initialBehaviorOfMathOptionalQuestion
// {
//     returnCode: '0000',
//         returnMessage: 'Success.',
//     info: {
//     paymentUrl: {
//         web: 'https://sandbox-web-pay.line.me/web/payment/wait?transactionReserveId=Q0Y1S3RrRHdVckxBRTl4eWdMTHAzdE1BdlRlZlVDcERGRnk5aEJBdWVtaXlWd2ppSjlBNmdETlpNNlFWMXZIVA',
//             app: 'line://pay/payment/Q0Y1S3RrRHdVckxBRTl4eWdMTHAzdE1BdlRlZlVDcERGRnk5aEJBdWVtaXlWd2ppSjlBNmdETlpNNlFWMXZIVA'
//     },
//     transactionId: 2021062600677715500,
//     paymentAccessToken: '767269698167'
//      }
// }

// line-pay request confirm initialBehaviorOfMathOptionalQuestion
// {
//     returnCode: '0000',
//         returnMessage: 'Success.',
//     info: {
//     transactionId: 2021062600677717000,
//         orderId: 'wR5gnRsakNscW5oMGlwy',
//         payInfo: [ [Object] ],
//         packages: [ [Object] ],
//
// =================================
//      payInfo: [
//     {
//         method: 'CREDIT_CARD',
//         amount: 100,
//         maskedCreditCardNumber: '************1111'
//     }
//     ]
//
// =================================
//
// packages: [
//     {
//         id: 'Item20191015001',
//         amount: 100,
//         userFeeAmount: 0,
//         products: [ [Object] ]
//     }
// ]
//
