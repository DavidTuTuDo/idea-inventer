import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';

/** author:明悅
 *  create time:Tue Nov 09 2021 23:34:19 GMT+0800 (Taipei Standard Time)
 */

class playground {

}

export {playground as playground}

if (configerer.DEBUG_MODE) {
    (async () => {
            const latest = _.flattenDeep([['1','2','3'],['bbb','vccc','ddd'],['#$%#$','@!#12','@!#1']]);
            console.log(latest);
            // const AtoZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // const oneToTen = '123456789';
            // const length = 5
            // console.log(oneToTen.substr(0,length));
            // console.log(AtoZ.substr(0,length));


            // async function runTaskWithTimeout() {
            //     const timeout = (ms, message) => {
            //         return new Promise((_, reject) => {
            //             setTimeout(() => {
            //                 reject(new Error(message));
            //             }, ms);
            //         });
            //     };
            //
            //     try {
            //         await Promise.race([
            //             timeout(3000, 'timeout happen'), // 3000 = the maximum time to wait
            //             (async () => {
            //                 // ..
            //                 console.log('task start')
            //                 await wait(4000);
            //             })()
            //         ]);
            //
            //         /** assume this is async function*/
            //         console.log('task complete')
            //     } catch (error) {
            //         console.log('catch error', error.message);
            //     } finally {
            //         console.log('task finally')
            //     }
            // }
            //
            // const timeout = (ms, message) => {
            //     return new Promise((_, reject) => {
            //         setTimeout(() => {
            //             reject(new Error(message));
            //         }, ms);
            //     });
            // };
            //
            // async function wait(ms) {
            //     return new Promise(resolve => {
            //         setTimeout(() => {
            //             resolve(ms);
            //         }, ms);
            //     });
            // }
            // await runTaskWithTimeout();
            // const array = [1,2,3,4,5,6,7,8];
            // console.log(_.nth(array,-9 % _.size(array)));
            // const ddd = [];
            // console.log(ddd.shift());
            // const sss = true;
            // console.log(!!sss);
            // const a = {aa: 1, ab: {abc: 1, abd: 2}}
            // const b = {bb: 2, bc: {abc: 1, abd: 2}}
            // const c = {cc: 3, cd: {abc: 1, abd: 2}}
            // _.merge(a, b);
            // a.bc = {fuc:4,dac:3};

            // console.log(`a===> `, a);
            // console.log(`b===> `, b);
            //
            // console.log('empty:?????>>> ',`${_.isEmpty('2')}`);

            // const array = _.range(90,110);
            // const full = array.map((each) => {
            //     return {value:`${each}`,
            //         label:`${each}年`}
            // })
            // console.log(full);
            // Util.printf();
            // console.log(_.range(95,112,1));
            // const ddd =false;
            // const rrr = !!ddd;
            // console.log('dddd===> ', rrr);

            // const line = `@desktop: ~"only screen and (min-width: 600px) and (max-width: 1680px)";`;
            // const line2 = `@media @mobile`;
            // let pattern = new RegExp('^' + '@[desktop|mobile|desktop]', 'i');
            //
            // console.log(pattern.test(line2));
            // const string = 'G/B Am 我';
            // const sample = 'G/B';
            // const reg = new RegExp(`^[A-G]`,'gm');
            // console.log(reg.test(sample));
            // const node0 = {z: 10}
            // const node1 = {a: node0, b: 200}
            //
            // const node2 = _.clone(node1);
            // node2.c = 300;
            // node2.a.z = 101;
            // console.log(node2);
            // console.log(node1);
            // /** 如果你想複製一個節點node, 可以用 clone = _.clone(node), clone的節點可以新增屬性 不會影響node, 但如果更動與node相關的屬性, node也會連動更改*/
            // console.log(_.tail([1]));
        }
    )();
}
