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
    console.log(`注意注意, 五秒後要部署到admin server了,動到prod的資料就爆炸了.`)

    const api = new Api();
    const listener = new Listener();
    // await api.submitProductItem({
    //     name:'小狗',
    //     count:10,
    //     color:'黑色',
    // })

    async function subtractOne() {
        const item = await api.fetchProductItem(`afIOihtOdfusq7x2lvHU`);
        console.log('取得 item=>', item);
        item.count = item.count - 1;
        const updateContent = {count: item.count - 1};
        await api.updateProductItem(`afIOihtOdfusq7x2lvHU`, updateContent);
        console.log('update item=>', updateContent);
    }

    async function subtractOneTransaction() {
        await api.updateTestAtomically(
            async (item, transaction) => {
                const old = item.subTitle;
                const latest = old + 1;
                transaction.set(api.getProductItemDocRef(), api.normalizeProduct({name: `香蕉 ${latest}`}))
                return {subTitle: latest}
            })
    }

    async function submitSampleProduct() {
        await api.deletePreciseOrders(true);
        await api.deletePreciseProducts(true);
        await api.submitPreciseProducts([{
            name: 'iphone13 pro',
            price: 100,
            quantityOfCurrent: 300,
            maxCountOfPerOrder: 10,
            photos: [{
                statement: 'iphone13pro 樣板',
                url: 'https://cs-a.ecimg.tw/items/DYARCHA900BUHR3/000001_1634635600.png'
            }]
        }, {
            name: 'iphone12',
            price: 80,
            quantityOfCurrent: 300,
            maxCountOfPerOrder: 10,
            photos: [{
                statement: 'iphone12 樣板',
                url: 'https://mrmad.com.tw/wp-content/uploads/2020/10/iphone-12-vs-iphone-11.jpg'
            }]
        }, {
            name: 'iphone11',
            price: 50,
            quantityOfCurrent: 300,
            maxCountOfPerOrder: 10,
            photos: [{
                statement: 'iphone11 樣板',
                url: 'https://www.trustedreviews.com/wp-content/uploads/sites/54/2019/09/iphone11-1-920x613.jpg'
            }]
        },
            {
                name: 'iphoneX',
                price: 40,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [{
                    statement: 'iphoneX 樣板',
                    url: 'https://www.trustedreviews.com/wp-content/uploads/sites/54/2019/09/iphone11-1-920x613.jpg'
                }]
            }
            , {
                name: 'iphone8',
                price: 30,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [{
                    statement: 'iphone8 樣板',
                    url: 'https://mrmad.com.tw/wp-content/uploads/2020/10/iphone-12-vs-iphone-11.jpg'
                }]
            }])
    }

    async function sampleOfFetchUrl() {
        const products = await api.fetchPreciseProducts();
        const urls = _.head(_.flattenDeep(products.map(item => item.photos)).map((item => item.url)));
        console.log(urls);

        // console.log(_.head(_.flattenDeep([...urls])))
        // return Util.getValueOfPriority(this.imageUrlOfHeadPhoto, );
    }

    async function uploadPaymentOptions() {
        await api.submitOptions([{
            name: 'Line Pay',
            image: '',
            description: '',
            indexOfSequence: 3,
            idOfUnique: 'linepay',
        },
            {
                name: '綠界支付',
                image: '',
                description: '信用卡、ATM、超商支付',
                indexOfSequence: 2,
                idOfUnique: 'ecpay',
            }

        ])
    }

    async function expiredOrderBehavior() {
        console.log('執行 SchedulerOfExpiredOrder 腳本');
        const orders = await api.fetchPreciseOrdersOfLimitation('in', 'stateOfPayment', 'pending', 'waiting');
        /** 比對當前時間是否 > expired time，如果過期了 1.把狀態改成failure, 還有增加失效原因 */
        const currentTimeStamp = Util.getCurrentTimeStamp()
        const results = _.filter(orders, (order) => {
            return currentTimeStamp >  api.normalizeTimestamp(order.timeOfExpired);
        })
        const expired = _.map(results, result => {
            return {
                ...result,
                messageOfPayment: `已超過付費期限 ${Util.getCurrentTimeFormatYMDHM(api.normalizeTimestamp(result.timeOfExpired))}`,
                stateOfPayment: `failure`,
            }
        })
        await api.updatePreciseOrders(expired);
    }
    await expiredOrderBehavior();



    // await uploadPaymentOptions();
    // await sampleOfFetchUrl();
    // await submitSampleProduct();
    // console.log(await api.fetchTest());
    // const pool = new InfinitePool(3);
    // await pool.runByTimes(subtractOneTransaction, 2);
    // await api.updateTestTransaction((object) => { return {title:"杜明岳"}})
    // await api.updateProductItem(`53dNl6edK7K3tGLBj71n`,api.normalizeProduct({count:101},true))
})();


