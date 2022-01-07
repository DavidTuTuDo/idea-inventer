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

(async () => {
    const api = new Api();
    const listener = new Listener();


    async function deployQuestions({all = false, year = 110, clear = false}) {


        const db = new Databaser(`/Users/davidtu/cross-achieve/high/idea-inventer/ceec_scrape_script/gsat.db`);
        await db.init();

        const qs = _.isNumber(year) ?
            await db.fetchRecords('QUESTION', new Builder().equal('year', year).stmt()) :
            await db.fetchRecords('QUESTION')

        // if (clear === true) {
        //     await api.deleteQuestions(true);
        //     await api.deleteConfuses(true);
        //     await api.deleteAnswers(true);
        // }


        let questions = qs.map((q) => {
            /** 把`a...b...c..` 換成 ['a...','b...','c....']*/
            const choiceStringArray = q.choices.split(`#&#@#`);
            q.topic = {name: q.topic, images: []},
                q.choices = choiceStringArray.map((stmt) => {
                        return {statement: stmt}
                    }
                )
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
            maxYear: 110,
            minYear: 90,
            marks: [{value: 90, label: '90年'}, {value: 100, label: '100年'},
                {value: 105, label: '105年'}, {
                    value: 110, label: '110年'
                }],
            historyExams: [
                {value: '90', label: '90年'},
                {value: '91', label: '91年'},
                {value: '91-2', label: '91年(補考)'},
                {value: '92', label: '92年'},
                {value: '92-2', label: '92年(補考)'},
                {value: '93', label: '93年'},
                {value: '94', label: '94年'},
                {value: '95', label: '95年'},
                {value: '96', label: '96年'},
                {value: '97', label: '97年'},
                {value: '98', label: '98年'},
                {value: '99', label: '99年'},
                {value: '100', label: '100年'},
                {value: '101', label: '101年'},
                {value: '102', label: '102年'},
                {value: '103', label: '103年'},
                {value: '104', label: '104年'},
                {value: '105', label: '105年'},
                {value: '106', label: '106年'},
                {value: '107', label: '107年'},
                {value: '108', label: '108年'},
                {value: '109', label: '109年'},
                {value: '110', label: '110年'}
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
        /** transaction sample */
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


    let linePay = new LinePay({
        channelId: `1656136761`,
        channelSecret: `638c3fc075aaa03fab0a7c9fb89b7723`,
        uri: 'https://sandbox-api-pay.line.me'
    })

    async function submitSubjectMap() {
        await api.deleteSubjectIds(true);
        const questions = await api.fetchQuestions();
        await api.submitSubjectIds(...questions.map(q => {
            return {quid: q.id, year: q.year, subject: q.subject}
        }));
    }


    // async function sampleFetch(){
    //     return await api.firestore().collection('questions')
    //         .where('year','==', 110)
    //         .listDocuments();
    //
    // }
    await api.deleteQuestions(true);
    await api.deleteConfuses(true);
    await api.deleteAnswers(true);
    await deployQuestions({year: undefined, all: false, clear: false});
    // await beforeStartService();
    // await backgroundService();
    // await api.submitUserBeingAdmin(`BYnJOAlUa5aCnpxvoeiIyCzRXSt1`);
    // await submitSubjectMap()
    // console.log((await sampleFetch()).length)
})();


// line-pay request result sample
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

// line-pay request confirm sample
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
