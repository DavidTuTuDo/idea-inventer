import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/FirebaseHelper";
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
            return currentTimeStamp > api.normalizeTimestamp(order.timeOfExpired);
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

    async function fetchProjectPrettier() {
        const projects = await api.fetchProjects();
        const commit = projects.map((project) => {
            delete project.updateTime;
            delete project._doc;
            delete project.id;
            return project;
        })

        Util.appendFile('./stringOfProject.json',JSON.stringify(commit),true,true);
        await Util.prettier('./stringOfProject.json',120);
    }

    async function updateCPRT() {
        await api.submitInfoOfCopyRight({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`
        })
    }

    async function updateCPRTContent() {
        await api.submitInfoOfCopyRightContact({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`,
            phone: `+886982763479`,
            email: `freshingmoon0725@gmail.com`,
        })
    }

    async function updateCPRTProjects() {
        await api.deleteProjects(true);
        await api.submitProjects([
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7832.jpg?alt=media&token=5bf27574-f678-462d-8b3a-ea4077c4910e",
                    "route": "https://kh-high.web.app/",
                    "indexOfSequence": 0,
                    "trait": "線上答題 | 高中學測",
                    "title": "悅考",
                    "descriptions": [{ "statement": "一目暸然的答題方式(單選、多選)" }, { "statement": "錯誤回顧、線上協助" }]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7833.jpg?alt=media&token=4998b3fa-5571-415a-b0d1-0dd4d5d81486",
                    "route": "https://yueh-voice.web.app/",
                    "indexOfSequence": 2,
                    "trait": "線上播放器 ｜客製化",
                    "title": "悅耳",
                    "descriptions": [{ "statement": "建立自己的線上專輯" }, { "statement": "聲音的故事（PODCASTS、街聲）" }]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7838.jpg?alt=media&token=8c1aa03d-5aff-4e93-9745-7bd3bd92e5ed",
                    "route": "empty",
                    "indexOfSequence": 4,
                    "trait": "施工中 | 知識變現 | 技能販售",
                    "title": "悅薪",
                    "descriptions": [
                        { "statement": "施工中" },
                        { "statement": "時薪制販售技能（科目教學、美編、美髮、美睫）" },
                        { "statement": "線上付款（降低人工筆記、保障權益）" }
                    ]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FS__3342348.jpg?alt=media&token=dfdc178e-aa97-4e3c-95d8-7029cbeef62f",
                    "route": "https://yueh-pu.web.app/",
                    "indexOfSequence": 1,
                    "trait": "音樂｜和弦譜",
                    "title": "悅譜",
                    "descriptions": [
                        { "statement": "和弦即時轉調（原調、男女建議調性）" },
                        { "statement": "字體調整（手機、平板、電腦）" }
                    ]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7834.jpg?alt=media&token=9a973889-89a8-4c41-ae34-509b4182646f",
                    "route": "empty",
                    "indexOfSequence": 5,
                    "trait": "施工中 | 線上預約 | 申請",
                    "title": "悅曆",
                    "descriptions": [{ "statement": "施工中" }, { "statement": "場地預約、資格審核、違規計點紀錄" }]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7840.jpg?alt=media&token=0634dc18-6bff-450b-950a-2493898dcc66",
                    "route": "empty",
                    "indexOfSequence": 7,
                    "trait": "施工中 | 線上小説 ｜黑底白字",
                    "title": "悅讀",
                    "descriptions": [{ "statement": "線上閱讀，使用案底色鮮少眼睛壓力" }, { "statement": "閱讀紀錄，全文檢索" }]
                }
            ]
        );
    }


    await expiredOrderBehavior();
    // await updateCPRT();
    // await updateCPRTContent();
    // await updateCPRTProjects();


    // await uploadPaymentOptions();
    // await sampleOfFetchUrl();
    // await submitSampleProduct();
    // console.log(await api.fetchTest());
    // const pool = new InfinitePool(3);
    // await pool.runByTimes(subtractOneTransaction, 2);
    // await api.updateTestTransaction((object) => { return {title:"杜明岳"}})
    // await api.updateProductItem(`53dNl6edK7K3tGLBj71n`,api.normalizeProduct({count:101},true))
})();


