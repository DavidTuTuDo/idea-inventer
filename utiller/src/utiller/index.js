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

    constructor() {
        this.init();
    }

    init() {
        // this.enrichZhTw();
    }

    appendInfo(...logs) {
        console.log(...logs);
    }

    appendError(...logs) {
        console.error(...logs);
    }

    async syncDelay(delayInms = 2000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(delayInms);
            }, delayInms);
        });
    }


    /** this is used for unit test,
     * param 是給 runInBackground 用的 => param */
    asyncUnitTaskFunction = (millionSec = 2000, _funparam = "預設的param", errorSimulator) => async (param) => {
        const randomValue = this.getRandomValue(millionSec, (millionSec * 1.2));
        try {
            const symbol = randomValue;
            this.appendInfo(`before executed ===> i'm symbol of ${symbol}, ready to be executed, inner param = ${_funparam}`);
            await this.syncDelay(randomValue);
            if (_.isFunction(errorSimulator) && errorSimulator(param)) throw Error('force to made error happen');
            this.appendInfo(`after executed ===> i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds ${param ? `i hav params ===> ${param}` : ''}`);
            return {randomValue, symbol, param};
        } catch (error) {
            this.appendError(new Error(`asyncUnitTask() catch error ${error.message}`))
        } finally {
            this.appendInfo(`wow.... finally got you`);
        }

    }

    /** 就是把 target 放到 condition 裡面處理, 然後取代原本的target*/
    accumulate(target, conditions) {
        let beginning = target;
        for (const condition of conditions) {
            if (condition !== undefined && _.isFunction(condition)) {
                beginning = condition(beginning);
            }
        }
        return beginning
    }

    isOrEquals(target, ...several) {
        for (const each of several) {
            if (_.isEqual(target, each)) return true;
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

    or(...booleans) {
        for (const boo of booleans) {
            if (!!boo)
                return true;
        }
        return false;
    }

    and(...booleans) {
        for (const boo of booleans) {
            if (!!!boo)
                return false;
        }
        return true;
    }

    /** 選一個exsist的candidate回傳, 像是firebase 可以 idToken 又可以 oauthIdToken*/
    getExistOne(...candidates) {
        for (const candidate of candidates) {
            if (candidate)
                return candidate;
        }
    }

    /** '###string' =>  'string' */
    getStringOfDropHeadSign(string, sign) {
        return _.dropWhile(Array.from(string),
            (each) => _.isEqual(each, sign)).join('')
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

    getRandomHash(size = 30) {
        const random = Crypto.randomBytes(size).toString('hex');
        return random;
    }

    /** alwaysTheSame 就是產出的encrypt value會固定(適合用在欄位的key), 不然會產生隨機偏移量, 但皆不影響解譯 */
    getEncryptString(texts, key = configer.ENCRYPT_KEY, alwaysTheSame = false) {
        const maxLengthOfKey = 22;
        if (key.length > maxLengthOfKey)
            throw new ERROR(8010, _.size(key))
        /** 帶入偏移量, keyOfkeyOfCrypto 需要是長度為22的字串, 太獵奇了*/
        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");
        const keyOfCrypto = alwaysTheSame ? CryptoJS.enc.Base64.parse(`${key}${_.range(0, maxLengthOfKey - key.length).join('')}`) : key;
        return CryptoJS.AES.encrypt(texts, keyOfCrypto, {iv: ivOfCrypto}).toString();
    }

    getDecryptString(ciphertext, key = configer.ENCRYPT_KEY) {
        const maxLengthOfKey = 22;
        if (key.length > maxLengthOfKey)
            throw new ERROR(8010, _.size(key))

        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");
        try {
            const value = CryptoJS.AES.decrypt(ciphertext, key, {iv: ivOfCrypto}).toString(CryptoJS.enc.Utf8)
            if (!_.isEmpty(value.trim()))
                return value;
        } catch (e) {
            /** 把問題給吃掉了, 也不能紀錄, 因為用了appendError*/
        }
        return CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Base64.parse(`${key}${_.range(0, maxLengthOfKey - key.length).join('')}`), {iv: ivOfCrypto}).toString(CryptoJS.enc.Utf8);
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
        this.appendInfo('i can use in node.js react.js');
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

    deepFlat(collection, sign = '_') {
        let _self = '';
        if (_.isArray(collection)) {
            for (const o of collection) {
                _self += (_.isEmpty(_self) ? '' : sign) + this.deepFlat(o);
            }
            return _self;
        } else if (_.isObject(collection)) {
            for (const key in collection) {
                _self += (_.isEmpty(_self) ? '' : sign) + key + sign + this.deepFlat(collection[key])
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

    getIndexOfContext(context, stmt) {
        return _.findIndex(context, (per) => {
            return _.isEqual(per.trim(), stmt);
        });
    }

    /** 去掉文字裡討厭的換行*/
    toOneLineString(string) {
        return _.join(_.split(string, '\n'), '');
    }

    toSpaceLessString(string) {
        return _.split(string, ' ').map((each) => _.trim(each)).join('')
    }

    exist(obj) {
        return !_.isNull(obj) && !_.isUndefined(obj);
    }

    isUndefinedNullEmpty(obj) {
        return obj === undefined || _.isEmpty(obj) || obj === null
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
    getTodayTimeFormat(ts) {
        return moment(ts ? ts : undefined).format("YYYY-MM-DD")
    }

    /** 取得 YYY-MM-DD-HH-mm-ss */
    getCurrentTimeFormat(ts) {
        return moment(ts ? ts : undefined).format("YYYY-MM-DD-HH-mm-ss")
    }

    getCurrentMillionSecTimeFormat(ts) {
        return moment(ts ? ts : undefined).format("YYYY-MM-DD-HH-mm-ss-SSS")
    }

    isBetweenTimeStamp(target = this.getCurrentTimeStamp(), min, max) {
        return moment(target).isBetween(min, max)
    }

    isBeforeTimeStamp(target = this.getCurrentTimeStamp(), time) {
        return moment(target).isBefore(time);
    }

    isAfterTimeStamp(target = this.getCurrentTimeStamp(), time) {
        return moment(target).isAfter(time);
    }

    /** 獲得 幾天後的timestamp 的概念 {months: 2,days:3} =>
     * ts => 1643434497341
     再利用 getCurrentTimeStamp(ts) => 2022-01-29
     */
    getTimeStampAfterCondition(target = this.getCurrentTimeStamp(), param = {
        days: 0,
        months: 0,
        years: 0,
        minutes: 0,
        seconds: 0
    }) {
        let base = moment(target);
        for (const each in param) {
            const number = param[each];
            const unit = each;
            if (number !== 0) {
                base = base.add(number, unit);
            }
        }
        return base.valueOf();
    }

    /** 要記住timestamp 可以轉換成西元時間(timestamp),或是期間(duration) 把duration time-stamp 轉成 02:13.445 */
    getTimeFormatOfDurationToMillionSecond(duration) {
        return moment.utc(duration).format("HH小時mm分鐘ss秒SSS");
    }

    /** duration是兩個timestamp相減,把duration time-stamp 轉成 02:13,moment.utc 就是不會加八小時啦幹 */
    getTimeFormatOfDurationToSecond(duration) {
        return moment.utc(duration).format("HH小時mm分鐘ss秒");
    }

    /** duration是兩個timestamp相減,把duration time-stamp 轉成 02:13,moment.utc 就是不會加八小時啦幹 , 為什麼對多1天 超怪 */
    getTimeFormatOfDurationToDay(duration) {
        return moment.utc(duration).format("DD天HH小時mm分鐘ss秒");
    }

    getChineseTimeFormat(ts) {
        moment.locale('zh-TW')
        return moment(ts).format("LLLL");
    }

    getMinuteFormatOfDuration(ds) {
        moment.duration(ds).asMinutes();
    }

    getSecondFormatOfDuration(ds) {
        moment.duration(ds).asSeconds();
    }

    getDayFormatOfDuration(ds) {
        moment.duration(ds).asDays();
    }

    /** param可以是timeStamp,也可是date,或是string
     * timestamp : 1231231279
     * date :(new Date).now()
     * string: '2021-11-21'
     *
     * getDurationOfMillionSec('2022-01-21' || 123123112312 || (new Date).now())) */;

    getDurationOfMillionSec(dateOrTimeStamp) {
        const currentTimestamp = this.getCurrentTimeStamp();
        const targetTimeStamp = moment(dateOrTimeStamp).valueOf();
        const queue = _.sortBy([{ts: currentTimestamp}, {ts: targetTimeStamp}], (each) => each.ts).map((each) => each.ts);

        let after = moment(queue.pop());
        let before = moment(queue.shift()); // another date
        let duration = moment.duration(after.diff(before));
        let ms = duration.asMilliseconds();
        return ms;
    }

    getCurrentTimeStamp() {
        return moment().valueOf()
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

    upperCamel(...words) {
        return _.upperFirst(this.camel(...words))
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

    /**
     *
     * [{name:'aaa',sign:2},{name:'aaa',sign:3},{name:'b',sign:4}] =>
     * {aaa:[{{name:'aaa',sign:2},{name:'aaa',sign:3}}], b:[{name:'b',sign:4}]}
     */
    arrayToObjWith(array, predicate) {
        const obj = {};
        for (const item of array) {
            const key = predicate(item);
            const content = obj[key];
            if (content && _.isArray(content)) {
                content.push(item)
            } else {
                obj[key] = [item];
            }
        }
        return obj;
    }

    isEmptyString(string) {
        return _.isEqual(_.trim(string), '');
    }

    /** 放在後面的priority 越大 */
    mergeObject(...obj) {
        return _.merge(...obj);
    }

    syncSetTimeout(func, ms, callback = () => {
    }) {
        (function sync(done) {
            if (!done) {
                setTimeout(function () {
                    func();
                    sync(true);
                }, ms);
                return;
            }
            callback();
        })();
    }

    /**
     *  rootName : /free_marker/src/exam/web
     *  pathName : /free_marker/src/exam/web/src/base/AlertDialog.js
     *  return: /src/base/AlertDialog.js
     * */
    getRelativePath(pathName, rootName) {
        return _.dropWhile(pathName, (each, index) => {
            return _.isEqual(each, rootName[index])
        }).join('');
    }

    /**
     * mutated;
     const arr = [0,1,2,3,4,5,6,7,8];
     dropItemsByIndex(arr,1,3);
     this.appendInfo(arr); [ 0, 4, 5, 6, 7, 8 ]
     */
    dropItemsByIndex(array, from, end) {
        _.remove(array, (value, index, array) => (end >= index && index >= from));
    }

    isEven(n) {
        return n % 2 === 0;
    }

    isOdd(n) {
        return Math.abs(n % 2) === 1;
    }

    enrichZhTw() {
        moment.locale('zh-tw', {
            months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
            monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
            weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
            weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
            weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
            longDateFormat: {
                LT: 'Ah點mm分',
                LTS: 'Ah點m分s秒',
                L: 'YYYY-MM-DD',
                LL: 'YYYY年MMMD日',
                LLL: 'YYYY年MMMD日Ah點mm分',
                LLLL: 'YYYY年MMMD日ddddAh點mm分',
                l: 'YYYY-MM-DD',
                ll: 'YYYY年MMMD日',
                lll: 'YYYY年MMMD日Ah點mm分',
                llll: 'YYYY年MMMD日ddddAh點mm分'
            },
            meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
            meridiemHour: function (h, meridiem) {
                let hour = h;
                if (hour === 12) {
                    hour = 0;
                }
                if (meridiem === '凌晨' || meridiem === '早上' ||
                    meridiem === '上午') {
                    return hour;
                } else if (meridiem === '下午' || meridiem === '晚上') {
                    return hour + 12;
                } else {
                    // '中午'
                    return hour >= 11 ? hour : hour + 12;
                }
            },
            meridiem: function (hour, minute, isLower) {
                const hm = hour * 100 + minute;
                if (hm < 600) {
                    return '凌晨';
                } else if (hm < 900) {
                    return '早上';
                } else if (hm < 1130) {
                    return '上午';
                } else if (hm < 1230) {
                    return '中午';
                } else if (hm < 1800) {
                    return '下午';
                } else {
                    return '晚上';
                }
            },
            calendar: {
                sameDay: function () {
                    return this.minutes() === 0 ? '[今天]Ah[點整]' : '[今天]LT';
                },
                nextDay: function () {
                    return this.minutes() === 0 ? '[明天]Ah[點整]' : '[明天]LT';
                },
                lastDay: function () {
                    return this.minutes() === 0 ? '[昨天]Ah[點整]' : '[昨天]LT';
                },
                nextWeek: function () {
                    let startOfWeek, prefix;
                    startOfWeek = moment().startOf('week');
                    prefix = this.diff(startOfWeek, 'days') >= 7 ? '[下]' : '[本]';
                    return this.minutes() === 0 ? prefix + 'dddA點整' : prefix + 'dddAh點mm';
                },
                lastWeek: function () {
                    let startOfWeek, prefix;
                    startOfWeek = moment().startOf('week');
                    prefix = this.unix() < startOfWeek.unix() ? '[上]' : '[本]';
                    return this.minutes() === 0 ? prefix + 'dddAh點整' : prefix + 'dddAh點mm';
                },
                sameElse: 'LL'
            },
            ordinalParse: /\d{1,2}(日|月|周)/,
            ordinal: function (number, period) {
                switch (period) {
                    case 'd':
                    case 'D':
                    case 'DDD':
                        return number + '日';
                    case 'M':
                        return number + '月';
                    case 'w':
                    case 'W':
                        return number + '周';
                    default:
                        return number;
                }
            },
            relativeTime: {
                future: '%s内',
                past: '%s前',
                s: '幾秒',
                m: '1 分鐘',
                mm: '%d 分鐘',
                h: '1 小時',
                hh: '%d 小時',
                d: '1 天',
                dd: '%d 天',
                M: '1 個月',
                MM: '%d 个月',
                y: '1 年',
                yy: '%d 年'
            },
            week: {
                // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
                dow: 1, // Monday is the first day of the week.
                doy: 4  // The week that contains Jan 4th is the first week of the year.
            }
        });
    }

    /** react js Util */
    getVisibleOrHidden(judgement) {
        return {visibility: judgement ? 'visible' : 'hidden'};
    }

    getVisibleOrNone(judgement) {
        return {display: judgement ? 'visible' : 'none'};
    }

    stringToInteger(string) {
        switch (string) {
            case 'A':
                return 0;
            case 'B':
                return 1;
            case 'C':
                return 2;
            case 'D':
                return 3;
            case 'E':
                return 4;
            case 'F':
                return 5;
            case 'G':
                return 6;
            case 'H':
                return 7;
            case 'I':
                return 8;
            case 'J':
                return 9;
            case 'K':
                return 10;
            default:
                return 101;
        }
    }

    integerToString(integer) {
        switch (integer) {
            case 0:
                return 'A';
            case 1:
                return 'B';
            case 2:
                return 'C';
            case 3:
                return 'D';
            case 4:
                return 'E';
            case 5:
                return 'F';
            case 6:
                return 'G';
            case 7:
                return 'H';
            case 8:
                return 'I';
            case 9:
                return 'J';
            default:
                return 'Z';
        }
    }

}

if (configer.DEBUG_MODE) {
    (async () => {
            // const util = new Utiller();
            // const after = util.getTimeStampAfterCondition(undefined, {days: 0, minutes: -20, second: 3})
            // const duration = util.getDurationOfMillionSec(after);
            // console.log(duration)
            // console.log(util.getTimeFormatOfDurationToDay(duration));
            // console.log(moment.duration(duration).asDays())
            // console.log(util.getCurrentTimeStamp());
            // console.log(moment('12312321312').valueOf())
        }
    )();
}
export default Utiller;
