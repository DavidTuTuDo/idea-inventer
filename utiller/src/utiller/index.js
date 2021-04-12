import _ from "lodash";
import Crypto from "crypto";
import CryptoJS from "crypto-js";
import {configer} from 'configer';
import ERROR from '../exceptioner';
import moment from "moment";

String.format = function () {
    let param = [];
    for (let i = 0, l = arguments.length; i < l; i++) {
        param.push(arguments[i]);
    }
    let statment = param[0]; // get the first element(the original statement)
    param.shift(); // remove the first element from array
    return statment.replace(/\{(\d+)\}/g, function (m, n) {
        return param[n];
    });
}

class Utiller {

    async syncDelay(delayInms = 2000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(delayInms);
            }, delayInms);
        });
    }


    /** this is used for unit test */
    asyncUnitTaskFunction = (millionSec, _funparam, errorSimulator) => async (param) => {
        const randomValue = this.getRandomValue(millionSec, (millionSec * 1.2));
        try {
            const symbol = randomValue;
            console.log(`before executed ===> i'm symbol of ${symbol}, ready to be executed, inner param = ${_funparam}`);
            await this.syncDelay(randomValue);
            if (_.isFunction(errorSimulator) && errorSimulator(param)) throw Error('force to made error happen');
            console.log(`after executed ===> i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds ${param ? `i hav params ===> ${param}` : ''}`);
            return {randomValue, symbol, param};
        } catch (error) {
            console.error(new Error(`asyncUnitTask() catch error ${error.message}`))
        } finally {
            console.log(`wow.... finally got you`);
        }

    }

    isOrEquals(self, ...several) {
        for (const each of several) {
            if (_.isEqual(self, each)) return true;
        }
        return false;
    }

    isAndEquals(...predicates) {
        for (const predicate of predicates) {
            if (!predicate()) {
                return false;
            }
        }
        return true
    }

    /** '###string' =>  'string' */
    getStringOfDropHeadSign(string, sign) {
        return _.dropWhile(Array.from(string),
            (each) => _.isEqual(each, sign)).join('')
    }

    getOneLineString(string) {
        return string.split('\n').join('');
    }


    isAndWith(self, predicate, ...several) {
        for (const each of several) {
            if (!predicate(self, each)) return false;
        }
        return true;
    }

    async syncDelayRandom(min = 3000, max = 5000) {
        const random = this.getRandomValue(min, max);
        await this.syncDelay(random);
        return random;
    }

    /** 如果是array,用 indexOf檢查each
     *  如果是object,看有沒有這個key
     *  如果是string, 就檢查有沒有包含 */
    has(collection, item) {
        if (_.isArray(collection)) {
            return _.indexOf(collection, item) > -1;
        }
        if (_.isObject(item)) {
            return collection[item];
        }
        if (_.isString(collection)) {
            return collection.indexOf(item) > -1;
        }
        return false;
    }

    getRandomHash() {
        const random = Crypto.randomBytes(30).toString('hex');
        return random;
    }

    getEncryptString(texts) {
        const encrypted = CryptoJS.AES.encrypt(texts, configer.ENCRYPT_KEY).toString();
        return encrypted;
    }

    getDecryptString(ciphertext) {
        const decrypted = CryptoJS.AES.decrypt(ciphertext, configer.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    getFirebaseFormattedString(texts) {
        return _.replace(texts, /[\.\#\$\[\]]/g, "-").trim();
    }

    formalizeNamesToArray(singerString) {
        let normalize = singerString;
        /** avoid this situation, 演唱：陳勢安、畢書盡 (Bii)   編曲：Jerry C */
        normalize = normalize.split(configer.SEPARATE_TONE_SINGER)[0].trim();

        normalize = _.replace(normalize, /[,\/#!$%\^&\*;:{}=_`、~()（）]/g, "_").trim();
        /** avoid this situation, 陳勢安_畢書盡__Bii_ */
        normalize = this.getFirebaseFormattedString(normalize);

        normalize = _.replace(normalize, /\_\_+/g, '_').trim();

        while (_.endsWith(normalize, "_")) {
            /** avoid this situation, 陳勢安_畢書盡_Bii_ */
            normalize = normalize.slice(0, -1).trim();
        }
        const words = normalize.split('_');
        /** avoid this situation, ["畢書盡 ","Bii","陳勢安 "] */
        return _.map(words, word => _.trim(word));
    }

    getShuffledArrayWithLimitCountHighPerformance(arr, n) {
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            n = len;

        if (n > len)
            throw new RangeError("getShuffledArrayWithLimitCount: more elements taken than available");

        while (n--) {
            let x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    getShuffledArrayWithLimitCount(arr, n) {
        let shuffled = _.shuffle(arr);
        return shuffled.slice(0, n);
    }

    getRandomItemOfArray(array) {
        if (!_.isArray(array)) throw new ERROR(9999, `why are you so stupid, typeof array should be array, not ==> ${array} `)
        const item = this.getShuffledArrayWithLimitCount(array, 1);
        return item.length > 0 ? item[0] : undefined;
    }

    getShuffledItemFromArray(arr) {
        let shuffled = _.shuffle(arr);
        return shuffled[0];
    }

    getShuffledArray(arr) {
        let shuffled = _.shuffle(arr);
        return shuffled;
    }

    isJson(item) {
        item = typeof item !== "string"
            ? JSON.stringify(item)
            : item;

        try {
            item = JSON.parse(item);
        } catch (e) {
            return false;
        }

        if (typeof item === "object" && item !== null) {
            return true;
        }
        return false;
    }

    getObjectValue(obj) {
        if (_.isObject(obj)) {
            return Object.values(obj)[0];
        }
        return '';
    }

    getObjectKey(obj) {
        if (_.isObject(obj)) {
            return Object.keys(obj)[0];
        }
        return '';
    }

    printf() {
        console.log('i can use in node.js react.js');
    }

    isKeywordRule(constraint) {
        if (_.isUndefined(constraint) || _.isEmpty(constraint))
            throw new Error('PARAMS CAN NOT BE EMPTY');

        if (!_.isString(constraint))
            throw new Error('PARAMS SHOULD BE STRING');

        if (constraint.length > 20)
            throw new Error('EXCEED 20 WORDS IS NOT ALLOWED');
    }

    getItsKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }


    startWiths(string, key = []) {
        for (const _key of key) {
            if (_.startsWith(string, _key)) {
                return true;
            }
        }
        return false;
    }

    getCallersName = () => {
        let callerName;
        try {
            throw new Error();
        } catch (e) {
            let re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
            re.exec(st), m = re.exec(st);
            if (!_.isNull(m))
                callerName = m[1] || m[2];
        }

        if (_.startsWith('asyncGeneratorStep', callerName)) callerName = '';
        return (callerName);
    }

    replaceAll(string, patten, to) {
        return _.replace(string, new RegExp(`${patten}`, `g`), to); /** g就是 global */
    }

    getRandomValue = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    deepFlat(collection) {
        let _self = '';
        if (_.isArray(collection)) {
            for (const o of collection) {
                _self += (_.isEmpty(_self) ? '' : '_') + this.deepFlat(o);
            }
            return _self;
        } else if (_.isObject(collection)) {
            for (const key in collection) {
                _self += (_.isEmpty(_self) ? '' : '_') + key + '_' + this.deepFlat(collection[key])
            }
            return _self;
        } else {
            return _.trim(collection);
        }
    }

    joinEscapeChar(str) {
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }

    getValueWithIntegerType(whatever) {
        try {
            const value = parseInt(whatever);
            return isNaN(value) ? 0 : value;
        } catch (error) {
            return 0;
        }
    }

    async asyncPool(poolLimit, array, iteratorFn) {
        const ret = [];
        const executing = [];

        for (const item of array) {
            const p = Promise.resolve().then(() => {
                return iteratorFn(item, array)
            });
            ret.push(p);
            if (poolLimit <= array.length) {
                const e = p.then(() => {
                    return executing.splice(executing.indexOf(e), 1)
                });
                executing.push(e);
                if (executing.length >= poolLimit) {
                    await Promise.race(executing);
                }
            }
        }
        return Promise.all(ret);
    }

    getAttrValueInSequence(info, ...attrs) {
        for (const attr of attrs) {
            if (!_.isEmpty(info[attr])) {
                return info[attr];
            }
        }
        return info;
    }


    // 半形轉化為全形
    toDBC(txtstring) {
        var tmp = "";
        for (var i = 0; i < txtstring.length; i++) {
            if (txtstring.charCodeAt(i) === 32) {
                tmp = tmp + String.fromCharCode(12288);
            }
            if (txtstring.charCodeAt(i) < 127) {
                tmp = tmp + String.fromCharCode(txtstring.charCodeAt(i) + 65248);
            }
        }
        return tmp;
    }

    // 全形轉換為半形
    toCDB(str) {
        var tmp = "";
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) === 12288) {
                tmp += String.fromCharCode(str.charCodeAt(i) - 12256);
                continue;
            }
            if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) {
                tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
            } else {
                tmp += String.fromCharCode(str.charCodeAt(i));
            }
        }
        return tmp
    }

    indexesOf(arr, val) {
        const indexes = []
        let i = -1;
        while ((i = arr.indexOf(val, i + 1)) !== -1) {
            indexes.push(i);
        }
        return indexes;
    }

    /** modify origin array */
    insertToArray = (array, _index, ...item) => {
        _index = _index + 1;
        /** 植樹問題拔 我想 */
        const initial = _.slice(array, 0, _index);
        const end = _.slice(array, _index, array.length);
        const combine = [...initial, ...item, ...end];
        array.length = 0;
        array.push(...combine);

    }

    /** 去掉文字裡討厭的換行*/
    toOneLineString(string) {
        return _.join(_.split(string, '\n'), '');
    }

    /** 讓字串結尾必須是指定的 predicate, ex: `i'm good today?,,` => `i'm good today` */
    getNormalizedStringEndWith(string, predicate) {
        string = this.toCDB(string);
        predicate = this.toCDB(predicate);
        const after = _.join(_.dropRightWhile(string, (each) => !_.isEqual(each, predicate)), '');
        return _.isEmpty(after) ? string : after;
    }

    /** 讓字串開頭不可以是 predicate, ex: `,, \n\t\s i'm good today?` => `i'm good today?` */
    getNormalizedStringNotStartWith(string, ...predicate) {
        string = this.toCDB(string);
        const after = _.join(_.dropWhile(string, (each) => this.has(predicate, each)), '');
        return _.isEmpty(after) ? string : after;
    }

    /** 讓字串開頭不可以是 predicate, ex: `,, \n\t\s i'm good today?` => `i'm good today?` */
    getNormalizedStringNotEndWith(string, ...predicate) {
        string = this.toCDB(string);
        const after = _.join(_.dropRightWhile(string, (each) => this.has(predicate, each)), '');
        return _.isEmpty(after) ? string : after;
    }

    /** 取得 YYYY-MM-DD */
    getTodayTimeFormat() {
        return moment().format("YYYY-MM-DD")
    }

    /** 取得 YYY-MM-DD-HH-mm-ss */
    getCurrentTimeFormat() {
        return moment().format("YYYY-MM-DD-HH-mm-ss")
    }

    isStringContainInLines(context, key) {
        for (let each of _.split(context, '\n')) {
            if (this.has(each, key))
                return true;
        }
        return false;
    }

    camel(...words) {
        return _.camelCase(words.join('_'));
    }

    /**
     * [{key1:value1},{key2:values2}]
     * =>
     * {key1:value1,key2:value2}
     *
     * */
    array2Obj(array) {
        const obj = {};
        for (const each of array) {
            obj[`${this.getObjectKey(each)}`] = this.getObjectValue(each);
        }
        return obj;
    }

    isEmptyString(string){
        return _.isEqual(_.trim(string),'');
    }


}

if (configer.DEBUG_MODE) {
}

export default Utiller;
