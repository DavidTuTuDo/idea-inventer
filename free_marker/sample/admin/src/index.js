import Api from './api';
import {databaser} from "databaser";
import {utiller as Util, pooller as InfinitePool} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/CommonFirebaseHelper";
import LinePay from "./base/LinePay";
import libpath from 'path';
import config from './config';
import moment from 'moment';

(async () => {
    const db = new databaser(`/Users/davidtu/cross-achieve/high/idea-inventer/databaser/secret_infos_latest.db`);
    await db.init();
    const qs = await db.fetchRecords('CHOOSER');
    const api = new Api();
    const listener = new Listener();

    function getLinePayFormOfOrder(orderId, price, productName, imageUrl, host = config.host) {
        const order = {
            amount: price,
            currency: 'TWD',
            orderId: orderId,
            packages: [
                {
                    id: orderId,
                    amount: price,
                    name: productName,
                    products: [
                        {
                            name: productName,
                            quantity: 1,
                            price: price,
                            imageUrl: imageUrl,
                        }
                    ]
                }
            ],
            redirectUrls: {
                confirmUrl: `${host}/purchaseSucceed`,
                cancelUrl: `${host}/purchaseFail`,
            }
        };
        return order;
    }

    function listenToPurchaseSucceedReport() {
        listener.listenPurchaseReports(async (changes) => {
            for (const change of changes) {
                if (change.type !== 'added') {
                    console.log(`listenPurchaseReports`, change.id, change.type)
                    continue;
                }

                const report = change.data;
                const reportId = change.id;
                const updateContent = {};
                try {
                    const order = await api.fetchPurchaseOrderItem(report.orderId);
                    const confirmContent = {
                        amount: order.price,
                        currency: 'TWD'
                    }
                    Util.appendInfo(confirmContent);

                    const linePayResult = await linePay.confirm(confirmContent, report.transactionId);
                    Util.appendInfo(linePayResult);
                    /** 從pid 找到duration裡面有註記服購買天數, 算出start,end 再寫入,寫入user/purchaseList */
                    const days = _.toNumber(Util.getNormalizedStringNotEndWith(order.duration, 'd'));
                    const startTime = await firebase.getCurrentServerTimeStamp();
                    const endTime = firebase.getTimeStampObj(moment(startTime.toMillis()).add(days, 'days').valueOf())

                    await api.submitPurchaseProductItem(order.uid, {
                        orderId: report.orderId,
                        expiration: {
                            startTime,
                            endTime
                        },
                    })
                    updateContent.status = 'succeed';
                    updateContent.transactionId = linePayResult.info.transactionId;
                } catch (error) {
                    Util.appendError(error);
                    updateContent.status = 'fail';
                    updateContent.message = error.message;
                } finally {
                    await api.updatePurchaseReportItem(reportId, updateContent);
                }
            }
        }, (condition) => condition.where('status', '==', 'pending'))
    }

    function listenToPurchaseOrder() {
        listener.listenPurchaseOrders(async (changes) => {
            for (const change of changes) {
                const order = change.data;
                const orderId = change.id;

                if (!_.isEqual(change.type, 'added')) continue;
                /** 在finally有做update, 然後會再收到一次local的推播, 因為資料還沒寫到backend, 所以非added的事件都忽略掉*/

                const updateContent = {};
                const resultData = {id: order.listenerId};
                const restfulData = {status: "succeed", message: "LinePay request succeed"};

                try {
                    const pid = order.productInfos[0].pid;
                    /** 在server端從pid去找到商品價格, 不能讓client端自己帶入價格, 會被hack, 目前沒有accumulate的作為,只抓出第一筆作為整個order的價格 */
                    const plan = await api.fetchPurchasePlanItem(pid);
                    const orderObj = getLinePayFormOfOrder(orderId, plan.price, plan.fullName, plan.imageUrl);
                    const linePayResult = await linePay.request(orderObj);
                    const totalPrice = plan.price;

                    Util.appendInfo(`uid=${order.uid}`, `\nline-pay request result`, linePayResult)
                    if (_.isEqual(linePayResult.returnCode, '0000')) {
                        /** 這樣才表示成功 */
                        updateContent.status = 'waiting';
                        updateContent.transactionId = linePayResult.info.transactionId;
                        updateContent.paymentAccessToken = linePayResult.info.paymentAccessToken;
                        updateContent.price = totalPrice;
                        updateContent.duration = plan.duration;
                        /** 類似api 的 return value, 不過是讓user 自己去監聽ㄧ個node 的變化 */
                        resultData.data = {paymentUrl: linePayResult.info.paymentUrl.web}

                    } else {
                        restfulData.status = 'fail';
                        restfulData.message = `LinePay出問題, returnCode = ${linePayResult.returnCode}`;
                    }
                } catch (error) {
                    Util.appendError(error);
                    restfulData.status = 'fail';
                    restfulData.message = error.message;
                } finally {
                    await api.restfulSubmitPurchaseListenerItem(order.uid, resultData, restfulData);
                    await api.updatePurchaseOrderItem(orderId, updateContent);
                }
            }
        }, (condition) => condition.where('status', '==', 'pending'))
    }

    async function beforeStartService(efficient) {
        await api.deletePurchasePlans();
        await api.deleteQuestions();
        await api.deleteMyShortcuts('BYnJOAlUa5aCnpxvoeiIyCzRXSt1', true);
        await api.deleteShortcuts();
        await api.submitShortcuts(
            {
                title: '我的數據',
                icon: 'path:ListAlt',
                route: `path:https://material-ui.com/components/material-icons/`
            }
            , {
                title: '我的最愛',
                icon: 'muIcon:FavoriteBorder',
                subs: [
                    {
                        title: '數學',
                        icon: 'path:https://is4-ssl.mzstatic.com/image/thumb/Purple114/v4/f6/17/2f/f6172f86-4b1e-529a-b01b-da9b32ea809f/source/256x256bb.jpg',
                        route: 'path:https://www.google.com/'
                    },
                    {
                        title: '英文',
                        icon: 'muIcon:Explicit',
                        route: `route:main`,

                    },
                    {
                        title: '國文',
                        icon: 'muIcon:Memory',
                        route: `route:purchase`
                    }
                ]
            },
            {
                title: '發燒',
                icon: 'muIcon:Whatshot',
                route: `route:exam:31232:tedsld`
            },
            {
                title: '最常錯誤',
                icon: 'path:https://assets.mydogsname.com/images/categories/003-dog.png'
            }
        )

        await api.submitMyShortcuts(
            'BYnJOAlUa5aCnpxvoeiIyCzRXSt1',
            {
                title: '我的數據',
                icon: 'muIcon:AddAlarm',
                route: 'path:https://www.google.com/'
            })
        await api.submitPurchasePlans(
            {id: 1001, pid: 1001, name: '1個月', price: 60, priceTip: '平均一個月60元', fullName: '選擇王-1個月禮包', duration: '31d'},
            {
                id: 1002,
                pid: 1002,
                name: '2個月',
                price: 110,
                priceTip: '平均一個月55元',
                fullName: '選擇王-2個月禮包',
                duration: '62d'
            },
            {
                id: 1003,
                pid: 1003,
                name: '3個月',
                price: 150,
                priceTip: '平均一個月50元',
                fullName: '選擇王-3個月禮包',
                duration: '63d'
            })


        let questions = qs.map((q) => {
            /** 把`a...b...c..` 換成 ['a...','b...','c....']*/
            const choiceStringArray = q.choice.split(new RegExp(`\\([A-D]\\)`, `g`));
            choiceStringArray.shift();
            q.topic = {name: q.topic, images: [{url: 'https://mimi19up.appspot.com/public/IMG_5633.jpg'}]},
                q.choices = choiceStringArray.map((stmt) => {
                        return {statement: Util.getNormalizedStringNotEndWith(stmt, ',', ' ')}
                    }
                )
            delete q.uid;
            return q;
        })
        if (efficient) {
            questions = _.sampleSize(questions, 30)
        }
        await api.submitQuestions(...questions);
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

    async function backgroundService() {


        await api.deletePurchaseOrders(true);
        await api.deletePurchaseReports(true);
        await api.deletePurchaseListeners('BYnJOAlUa5aCnpxvoeiIyCzRXSt1', true);
        await api.deletePurchaseProducts('BYnJOAlUa5aCnpxvoeiIyCzRXSt1', true);


        listenToPurchaseOrder();
        listenToPurchaseSucceedReport();

        await Util.syncDelay(60 * 5 * 1000); //監聽五分鐘
    }

    await beforeStartService(true);
    await backgroundService();
    // await api.submitUserBeingAdmin(`BYnJOAlUa5aCnpxvoeiIyCzRXSt1`);
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
