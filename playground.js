import fs from "fs";
import path from 'path';
import _ from 'lodash';
import util from './util';
import nodeUtil from 'util';


class Playground {

    constructor() {
        console.log("i am playground constructor");
    }
}

// const pg = new Playground();
//  async function doingSt() {
//      console.log('hihi');
//  }
//
//
//  doingSt()


function david(params = []) {
    for (const i of params) {
        console.info(i);
    }
    console.log(arguments);
}

// _([1, 2, 3, 4, 5, 6, 7]);

const aaa = {aa: {a: 3}, bb: {cc: 5}};

function getKeys(parent, value) {
    for (let [_key, _value] of Object.entries(parent)) {
        if (value === _value) {
            console.log(_key);

        }
    }
}

const cachePath = path.join('cache', 'continued.txt');
if (fs.existsSync(cachePath)) {
    for (const a of [1, 2, 3, 4, 5, 6, 7])
        fs.appendFileSync(cachePath, `\n${a}`, (err) => {
            console.log('shit');
        })
} else {
    fs.writeFile(cachePath, "1", (err) => {
        console.log('shit');
    })
}

// const array = fs.readFileSync(cachePath,'utf-8',(err) => {}).split('\n');
// console.log(array);

// const test = 1324342423784723984723894792384723.2344234231;
// console.log(typeof test);

class rrr {

    constructor() {
        this.self = this;
        this.lang = 'lang '
    }


    get() {
        this.lang += '... stmt ...';
        return this.self;
    }

    shit() {
        this.lang += '... shit ...';
        return this.self;
    }

    run() {
        console.log(this.lang);
    }
}

function tttttt(...rfff) {
    console.log(rfff);
}

// tttttt('sdaasd','dsds','dsadsa');


// const dddd = {a: 3, b: 4}
// const eee = {...dddd, c: 'fedsd'};
// console.log(JSON.stringify(eee));

const array = ['fsdfds', {a: 1, b: {ffdsf: 'sdsd'}}, {c: 2, d: 4}, {e: 'sasd', f: 'wdsas'}];

function decrypt(collection) {
    let _self = '';
    if (_.isArray(collection)) {
        for (const o of collection) {
            _self += (_.isEmpty(_self) ? '' : '_') + decrypt(o);
        }
        return _self;
    } else if (_.isObject(collection)) {
        for (const key in collection) {
            _self += (_.isEmpty(_self) ? '' : '_') + key + '_' + decrypt(collection[key])
        }
        return _self;
    } else {
        return collection;
    }
}


// const p = {ch:3,rr:[3,4],f:{ff:3}};
// console.log(decrypt(p));


class sss {

    async sswait() {
        return new Promise(resolve => {
            setTimeout(() => {

                resolve(true);
            }, 1000);
        });
    }

    constructor() {
        this.worker = 2;
        this.current = 0;
        this.self = this;
    }

    async dd() {
        const startTime = _.now();
        await this.wait();
        await this.wait();
        console.log(startTime);
        return 2;
    }

    async yy(symbol) {
        while (this.worker <= this.current) {
            console.log(`${symbol} 還在等 worker`)
            await this.wait();
        }
        return 0;
    }

    cc = async (symbol) => {
        const self = this;
        const startTime = _.now();
        await self.wait();
        // this.current = this.current + 1;
        // await this.yy(symbol)
        // this.current = this.current - 1;

        console.log(symbol + ', ' + startTime);
        return symbol + ', ' + startTime;
    }

    async asyncPool(poolLimit, array, iteratorFn) {
        const ret = [];
        const executing = [];

        for (const item of array) {
            console.log(`====================> index ${_.indexOf(array, item)}`)

            const p = Promise.resolve().then(() => {
                console.log('PPPPPPPP');
                return iteratorFn(item, array)
            });
            ret.push(p);
            console.log('ret push');
            if (poolLimit <= array.length) {
                const e = p.then(() => {
                    console.log('EEEEEEEEE');
                    return executing.splice(executing.indexOf(e), 1)
                });
                executing.push(e);
                console.log('executing push');

                if (executing.length >= poolLimit) {
                    await Promise.race(executing);
                }
            }
        }
        console.log('=================> Done');
        return Promise.all(ret);
    }

    async do() {
        const dd = 20;
        const ff = [...Array(dd)].map((con, index) => index);
        return await this.asyncPool(3, ff, this.cc);

        // Promise.all(ff).then((eee) => {
        //     console.log(eee);
        // });
        // this.cc().then((eee) => console.log(eee))
    }

    async ccccc(worker = 3) {

        async function wrapper(f) {
            const self = this;
            const result = await f;
            // console.log(`task index:`+ taskPromises.indexOf(self));
            completedPromise.push(result);
            // taskPromises.slice(taskPromises.indexOf(self), 1);
            if (completedPromise.length === tasks.length) {
                key = true;
            }
            return result;
        }

        async function lock() {
            while (!key) {
                await self.wait(500, '我是key');
            }
            return '打開鎖了';
        }

        const self = this;
        let key = false;
        const taskPromises = [];
        const completedPromise = [];
        const tasks = [...Array(20)].map((obj, index) => {
            return [util.getRandomValue(1000, 5000), index]
        });


        for (const i of tasks) {
            taskPromises.push(wrapper(this.wait(i[0], `${i[0]} ${i[1]}`)));
            if (worker === taskPromises.length) {
                await Promise.all(taskPromises);
                taskPromises.length = 0;
            }
        }


        // return tasks;
        // const first = await Promise.race(taskPromises);
        await lock();
        return Promise.all(completedPromise);

    }


    asd = () => {

    }

    async wait(obj) {
        const symbol = obj.symbol;
        const time = obj.time;
        console.log(`......${symbol} ${time} in`);
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`......${symbol} out`);
                resolve(symbol);
            }, time);
        });
    }
}

// console.log(typeof true);
// let d = new sss();
//
// d.asyncPool(3,[...Array(20)].map((obj,index) => {return {time:util.getRandomValue(1000,3000),symbol:index}}),d.wait).then(
//     (dd) => {
//         console.log('get:=============>' +  JSON.stringify(dd.length) + '--------' +JSON.stringify(dd));
//     }
// )

// const fss = [...Array(10)].map((con, index) => this.cc(index));
// console.log(fss);

// d.ccccc().then((dd, ss) => {
//     console.log('get:=============>' +  JSON.stringify(dd.length) + '--------' +JSON.stringify(dd));
//     // console.log(ss);
// });


// function  joinEscapeChar(str) {
//     return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
// }
//
// console.log(joinEscapeChar(`dd'dsdsadsa`));

class eee {
    constructor() {
        this.value = 0;
    }

    async wait(obj) {
        const symbol = obj.symbol;
        const time = obj.time;

        return new Promise(resolve => {
            if (time != undefined)
                console.log(`wait()......${symbol} ${time} in`);
            setTimeout(() => {
                if (time != undefined)
                    console.log(`wait()......${symbol} out`);
                resolve(symbol);
            }, time);
        });
    }

    async add() {
        await this.wait(0);
        this.value += 1;
        return this.value;
    }

    async task() {
        let now = _.now();
        const key = util.getRandomValue(1010, 1099);
        // console.log();
        await this.wait({symbol: key, time: key})
        console.log(`${key} task() - after wait${await this.add()}`);
        console.log(`${key} task() - spend time:${_.now() - now}`)
        return key;
    }

    async do() {
        const promises = [...Array(10)].map((co, index) => this.task());
        return await Promise.race(promises);
    }
}

new eee().do().then((sdf) => console.log(`race end with ${sdf}`));


