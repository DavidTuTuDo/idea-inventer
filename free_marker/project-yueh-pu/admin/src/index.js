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
        await api.updateProductItemTransaction(`afIOihtOdfusq7x2lvHU`,
            (item) => {
                const old = item.count;
                if (old <= 20)
                    throw new ERROR(9999,'不能小於85');

                const latest = old - 1;
                return {count: latest}
            })
    }

    // console.log(await api.fetchTest());
    // const pool = new InfinitePool(4);
    // await pool.runByTimes(subtractOneTransaction, 11);
    // await api.updateTestTransaction((object) => { return {title:"杜明岳"}})

})();


