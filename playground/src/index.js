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
            // const AtoZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // const oneToTen = '123456789';
            // const length = 5
            // console.log(oneToTen.substr(0,length));
            // console.log(AtoZ.substr(0,length));
            const ddd = [];
            console.log(ddd.shift());
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

        }
    )();
}
