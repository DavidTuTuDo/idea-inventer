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

    // await sampleOfFetchUrl();
    await submitSampleProduct();

    // console.log(await api.fetchTest());
    // const pool = new InfinitePool(3);
    // await pool.runByTimes(subtractOneTransaction, 2);
    // await api.updateTestTransaction((object) => { return {title:"杜明岳"}})
    // await api.updateProductItem(`53dNl6edK7K3tGLBj71n`,api.normalizeProduct({count:101},true))
})();


