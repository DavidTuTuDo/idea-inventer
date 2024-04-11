import _ from "lodash";
import CryptoJS from "crypto-js";
import {configerer} from "configerer";
import ERROR from '../exceptioner';
import moment from "moment";
import 'moment-timezone';
import {v4} from "uuid";

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

    mapOfIdNTimeoutId = {}/**   Key : idOfSetTimout */

    /** '1.九.1' => false
     *  '1.2.3' => true
     * */

    /**
     * 刪除物件裡面特別的屬性，預設是刪除value為undefined
     *
     * */
    removeAttributeBy(object, predicate = (value) => _.isUndefined(value)) {
        for (const key in object) {
            if (predicate(object[key])) {
                delete object[key];
            }
        }
    }

    isValidVersionOfString(versionName) {
        if (this.isUndefinedNullEmpty(versionName)) {
            return false;
        }

        const numbers = versionName.split('.');
        for (const number of numbers) {
            const toNum = _.toNumber(number);
            if (!_.isNumber(toNum) || isNaN(toNum))
                return false;
        }
        return true;
    }

    getSeparatorOfUnique() {
        return '།།';
    }

    /** 1.0.1 => 1.0.2 */
    getStringOfVersionIncrement(stringOfVersion, delta = 1) {
        const numbers = stringOfVersion.split('.').map((each) => _.toNumber(each));
        const last = numbers.length - 1;
        numbers[last] = numbers[last] + delta;
        return numbers.join('.');
    }

    setLocaleOfMoment(locale = 'en') {
        moment.locale(locale);
    }

    getUuidOfV4() {
        return v4();
    }


    constructor() {
        this.init();
        this.env = 'dev';
    }


    performActionWithoutTimingIssue(task = () => true, wait = 10) {
        this.syncDelay(wait).then(() => task())
    }


    /**
     * 執行為了避免沒意義的任務重複執行, 像是search 輸入關鍵字後, 不應該每次onchange就呼叫一次建議列表, 應該等到打完後500ms後在去 執行搜尋任務
     * */
    executeTimeoutTask(functionOfAsyncTask, ms = 1000, id = this.getRandomHash(), ...params) {
        const self = this;
        const idOfCurrentTimeoutTask = this.mapOfIdNTimeoutId[id];
        if (idOfCurrentTimeoutTask)
            clearTimeout(idOfCurrentTimeoutTask)

        const idOfTimeoutTask = setTimeout(async (...param) => {
            await functionOfAsyncTask()
            delete self.mapOfIdNTimeoutId[id];
        }, ms, ...params)
        self.mapOfIdNTimeoutId[id] = idOfTimeoutTask;
    }

    printLogMessage(message, error = false, ...infos) {
        if (!this.isProductionEnvironment()) {
            if (error) {
                this.appendError(message, ...infos)
            } else {
                this.appendInfo(message, ...infos)
            }
        }
    }

    init() {
        // this.enrichZhTw();
    }

    setEnvironment(env) {
        this.env = env;
    }

    getEnvironment = () => {
        return this.env;
    }

    isProductionEnvironment = () => {
        return _.isEqual(this.getEnvironment(), 'prod');
    }

    appendInfo(...logs) {
        if (this.isProductionEnvironment()) return;
        console.log(...logs);
    }

    appendError(...logs) {
        if (this.isProductionEnvironment()) return;
        console.error(...logs);
    }

    async syncDelay(delayInms = 2000) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(delayInms);
            }, delayInms);
        });
    }

    /**
     * sample:
     *
     *  string = `@desktop: ~"only screen and (min-width: 600px) and (max-width: 1680px)";`;
     *  rule = '@[desktop|mobile|desktop]';
     *  return true | false
     *
     */
    startWithRegex(string = '', rule = '.') {
        let pattern = new RegExp(`^${rule}`, 'i');
        return (pattern.test(string));
    }

    /** this is used for unit test,
     * param 是給 runInBackground 用的 => param */
    asyncUnitTaskFunction = (millionSec = 2000, _funparam = "預設的param", errorSimulator) => async (param = this.getRandomHash(10)) => {
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

    test = (word) => {
        return async () => {
            await Util.syncDelay(3000);
            console.log('經過了三秒')
            await Util.syncDelay(4000);
            console.log('經過了四秒')
            await Util.syncDelay(5000);
            console.log('經過了五秒')
            await Util.syncDelay(6000);
            console.log('經過了六秒')
            return `3423809432804 ${word}`
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

    /** 取得reg match 第一個項目, 不然好煩呀 */
    getStringOfHeadMatch(string, regex, flag = 'g') {
        const result = string.match(new RegExp(regex, flag));
        return this.isUndefinedNullEmpty(result) ? undefined : result[0]
    }

    or(...booleans) {
        for (const boo of booleans) {
            if (_.isBoolean(boo) && boo)
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

    /**
     *
     * const array = [1,2,3,4,5,6,7,8];
     *  nth(array, -9)
     *  // => 8
     * */
    nth(array, index = -1) {
        return _.nth(array, index % _.size(array));
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
     *  如果是string, 就檢查有沒有包含
     *  precisely 就是用findIndex,去比較value
     *
     *  */
    has(collection, item, precisely = false) {
        if (_.isArray(collection)) {
            if (precisely)
                return _.findIndex(collection, (each) => _.isEqual(item, each)) > -1;
            else
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

    /** 就是比較_.isEqual(isEqual的註解很重要), 不是用address去判斷 */
    containsBy(array, item) {
        return _.findIndex(array, (each) => _.isEqual(each, item)) >= 0
    }

    /** (Parentheses) */
    getStringOfInsideParentheses(string, rule = `.`) {
        return this.getStringOfRule(string, rule, '(', ')');
    }

    /** [Brackets] */
    getStringOfInsideBrackets(string, rule = `.`) {
        return this.getStringOfRule(string, rule, '[', ']');
    }

    /** {Braces} */
    getStringOfInsideBraces(string, rule = `.`) {
        return this.getStringOfRule(string, rule, '{', '}');
    }

    /** rules 只抓文字 [\\w] |*/
    getStringOfRule(string, rule = `.`, left = '{', right = '}') {
        return this.getStringOfHeadMatch(string, `(?<=\\${left})${rule}+?(?=\\${right})`)
    }

    getRandomHash(length = 20) {
        const randomBytes = CryptoJS.lib.WordArray.random(length);
        const base64String = CryptoJS.enc.Base64.stringify(randomBytes);
        // 根據需要調整格式
        return base64String.substring(0, length);
    }

    getRandomHashV2(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

    /** alwaysTheSame 就是產出的encrypt value會固定(適合用在欄位的key), 不然會產生隨機偏移量, 但皆不影響解譯 */
    getEncryptString(texts, key = configerer.ENCRYPT_KEY, alwaysTheSame = false) {
        const maxLengthOfKey = 22;
        if (key.length > maxLengthOfKey)
            throw new ERROR(8010, _.size(key))
        /** 帶入偏移量, keyOfkeyOfCrypto 需要是長度為22的字串, 太獵奇了*/
        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");
        const keyOfCrypto = alwaysTheSame ? CryptoJS.enc.Base64.parse(`${key}${_.range(0, maxLengthOfKey - key.length).join('')}`) : key;
        return CryptoJS.AES.encrypt(texts, keyOfCrypto, {iv: ivOfCrypto}).toString();
    }

    getDecryptString(ciphertext, key = configerer.ENCRYPT_KEY) {
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
        normalize = normalize.split(configerer.SEPARATE_TONE_SINGER)[0].trim();

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

    getFileNameFromPath(path, extension = false) {
        const segments = path.split('/');
        const target = segments.pop();
        return extension ? target : target.split('.').shift();
    }

    /** http://wnj.cdji/david.mp3 => david.mp3 */
    getFileNameExtensionFromPath(path) {
        const name = path.split('/').pop()
        return name;
    }

    /** http://wnj.cdji/david.mp3 => mp3 */
    getExtensionFromPath(path) {
        const name = path.split('/').pop()
        const segments = name.split('.');
        return _.size(segments) > 1 ? segments.pop() : '';
    }

    /** ../folderName/fileName.xxx  => ./folderName */
    getFolderPathOfSpecificPath(path) {
        const split = path.split('/');
        split.pop();
        return split.join('/');
    }

    /**
     * 取得folderName
     *
     * console.log(utiller.getFolderNameOfFilePath(`das/asdiasjiosd/jif/d.js`)); // jif
     *
     * */
    getFolderNameOfFilePath(path) {
        if (this.isValidFilePath(path)) {
            const splits = path.split('/');
            return _.nth(splits, -2);
        } else {
            throw new ERROR(9999, `64255615 path is not valid '${path}'`)
        }
    }

    /** absolute=> /acc/bbv/{target}/index.js 檢查有沒有在他下面 */
    isUnderTargetPath(absolute, target) {
        const segments = absolute.split('/');
        return this.has(segments, target);
    }

    /** 取得檔案的目錄, path => c://folderName/fileName.js to c://folderName */
    getFileDirPath(path, slash = true) {
        return _.join(_.initial(_.split(path, '/')), '/') + (slash ? '/' : '');
    }

    /** path ==> /asd/cc/dfj/jei3.mp3 => */
    isPathEqualsFileType(path, type) {
        const extension = path.split('.').pop();
        return _.isEqual(extension, type);
    }

    /** 是一個/a/b/c.js 的檔案路徑 */
    isValidFilePath(path) {
        const extension = this.getExtensionFromPath(path);
        return _.size(extension) > 0;
    }

    /** 拿前面n個items */
    getArrayOfSize(array, n = 1) {
        return _.take(array, n);
    }

    getShuffledArrayWithLimitCount(arr, n) {
        let shuffled = _.shuffle(arr);
        return _.take(shuffled, n);
    }

    /** ignore 就是黑名單的意思 */
    getRandomItemOfArray(array, ...ignores) {
        if (!_.isArray(array)) throw new ERROR(9999, `why are you so stupid, typeof array should be array, not ==> ${array} `)
        const filter = _.without(array, ...ignores);
        const target = _.size(filter) > 0 ? filter : array;
        const item = this.getShuffledArrayWithLimitCount(target, 1);
        return item.length > 0 ? item[0] : undefined;
    }

    /**
     *  const aaa = {};
     *  utiller.appendMapOfKeyArray(aaa, 'a', 11);
     *  utiller.appendMapOfKeyArray(aaa, 'c', 13);
     *  utiller.appendMapOfKeyArray(aaa, 'a', 23);
     *  utiller.appendMapOfKeyArray(aaa, 'c', 'vsdd')
     *  utiller.appendMapOfKeyArray(aaa, 'a', 'sd');
     *  console.log(aaa);
     *  // { a: [ 11, 23, 'sd' ], c: [ 13, 'vsdd' ] }
     * */
    appendMapOfKeyArray(object, key, ...value) {
        if (this.isUndefinedNullEmpty(object[key])) {
            object[key] = [...value]
        } else {
            object[key].push(...value);
        }
    }

    /**
     * util.getMergedArrayBy(
     [{id: 123, name: 'david'}, {id: 321, name: 'Joe'}],
     [{id: 321, age: 13}, {id: 123, age: 30}],
     'id')
     *
     * result:
     [
     { id: 123, age: 30, name: 'david' },
     { id: 321, age: 13, name: 'Joe' }
     ]
     *
     */
    getMergedArrayBy(major = [], sub = [], predicate) {
        /** predicate可以只帶入屬性質 */
        if (_.isString(predicate)) {
            const attribute = predicate;
            predicate = (item1, item2) => _.isEqual(item1[attribute], item2[attribute]);
        } else {
            predicate = _.isFunction(predicate) ? predicate : () => true;
        }
        return major.map(item1 => ({
            ..._.find(sub, (item2) => predicate(item1, item2)),
            ...item1
        }));
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
        this.appendInfo('i can use in web || react.js');
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

    /** pattern => {from:'㊟',to:'注'}, {from:'\\(土\\)',to:'(土)'}*/
    replaceAllWithSets(string = '', ...patterns) {
        let after = string;
        for (const pattern of patterns) {
            if (this.isOrEquals(undefined, pattern.from, pattern.to)) {
                throw ERROR(9999, `from or to can't be empty`);
            }
            after = this.replaceAll(after, pattern.from, pattern.to);
        }
        return after
    }

    /** 就是用address去找出current index(比較內文要用findIndex),然後取代之
     * array = ['a','b','c'];
     * current = array[1] === 'b'
     * latest = 'd'
     *
     * return ['a','d','c']
     * */
    replaceArrayByContentIndex(array, current, latest) {
        const index = _.indexOf(array, current);
        array[index] = latest;
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

    /** 如果有優先順序的值,需要檢查是否isUndefinedEmpty,這樣程式邏輯就不用一直 if else switch */
    getValueOfPriority(...compares) {
        for (const compare of compares) {
            if (!this.isUndefinedNullEmpty(compare))
                return compare;
        }
        return undefined;
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

    /** 用_.findIndex(比較內文的方式) 去找出array裡所有符合條件的 */
    findIndexes(array, predicate) {
        const indexes = [];
        let hasIndex = true;
        let indexOfLatest = 0;
        while (hasIndex) {
            indexOfLatest = _.findIndex(array, predicate, indexOfLatest + 1);
            if (indexOfLatest > -1) {
                indexes.push(indexOfLatest);
            } else {
                hasIndex = false;
            }
        }
        return indexes;
    }

    /** 找到關鍵字所有的index */
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

    /** 比較內文, 不是只比較 memory address */
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
        /** 這樣寫也可以 string.split('').map((each) => each.trim()).join(''); */
        return _.split(string, '').map((each) => _.trim(each)).join('')
    }

    toNewLineLessString(string) {
        /** 這樣寫也可以 string.split('').map((each) => each.trim()).join(''); */
        return _.split(string, '\n').map((each) => _.trim(each)).join('')
    }

    exist(obj) {
        return !_.isNull(obj) && !_.isUndefined(obj);
    }

    isUndefinedNullEmpty(obj) {
        const first = obj === undefined || obj === null;
        const second = _.isString(obj) || (_.isArray(obj) || _.isObject(obj)) ? _.isEmpty(obj) : false;
        return first || second;
    }

    isOrConditionOfUndefinedNullEmpty(...objs) {
        for (const obj of objs) {
            if (this.isUndefinedNullEmpty(obj))
                return true;
        }
        return false;
    }

    /** this method mutates segments */
    getStringHandledByEachLine(string, predict = (segment, index, segments) => true, separator = '\n') {
        const segments = string.split(separator);
        for (const segment of segments) {
            predict(segment, _.indexOf(segments, segment), segments);
        }
        return segments.join(separator);
    }

    getSegmentsOfEachLine(string) {
        return string.split('\n');
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

    /** 讓字串開頭不可以是 predicate, ex: `,, \n\t\s i'm good today?` => `\n\t\s i'm good today` */
    getNormalizedStringNotEndWith(string, ...predicate) {
        string = this.toCDB(string);
        const after = _.join(_.dropRightWhile(string, (each) => this.has(predicate, each)), '');
        return _.isEmpty(after) ? string : after;
    }

    /** 取得 YYYY-MM-DD */
    getTodayTimeFormat(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YYYY-MM-DD")
    }

    getECPayCurrentTimeFormat(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm:ss")
    }

    getCurrentTimeFormatV2(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm:ss")
    }

    getCurrentTimeFormatYMDHM(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm")
    }

    getCurrentTimeFormatYMDHMS(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm:ss")
    }

    /** 取得 YYY-MM-DD-HH-mm-ss */
    getCurrentTimeFormat(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YYYY-MM-DD-HH-mm-ss")
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
    getTimeStampWithConditions(param = {
        days: 0,
        months: 0,
        years: 0,
        minutes: 0,
        seconds: 0,
        hours: 0,
    }, target = this.getCurrentTimeStamp()) {
        let base = moment(target);
        for (const each in param) {
            const number = param[each];
            const unit = each;
            if (number > 0) {
                base = base.add(number, unit);
            }

            if (number < 0) {
                base = base.subtract(Math.abs(number), unit);
            }
        }
        return base.valueOf();
    }

    /** 把 YYYY-MM-DD HH:mm:ss 轉換成 timestamp
     * 請注意 DD HH 之間有一個空格
     * */
    getTimeStampByStringFormat(string) {
        return this.getTimeStampFromSpecificFormat(string, 'YYYY/MM/DD HH:mm:ss').valueOf();
    }

    getTimeStampFromSpecificFormat(string, format = 'YYYY/MM/DD HH:mm:ss') {
        return moment(string, format).valueOf();
    }

    getTimeStampFromECPayStringFormat(string) {
        return this.getTimeStampFromSpecificFormat(string, 'YYYY/MM/DD HH:mm:ss').valueOf();
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
        return moment.duration(ds).asMinutes();
    }

    getSecondFormatOfDuration(ds) {
        return moment.duration(ds).asSeconds();
    }

    getDayFormatOfDuration(ds) {
        return moment.duration(ds).asDays();
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

    getVisibleOrNone(judgement, flex = false) {
        return {display: judgement ? flex ? 'flex' : 'inherit' : 'none'};
    }

    stringToInteger(string) {
        string = _.toUpper(string);
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
            case 'L':
                return 11;
            case 'M':
                return 12;
            case 'N':
                return 13;


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
            case 10:
                return 'K';
            case 11:
                return 'L';
            case 12:
                return 'M';
            case 13:
                return 'N';
            default:
                return 'Z';
        }
    }

    /**
     * const sample = [{name: 'a'}, {name: 'b'}];
     *
     * rules => {to:'newKeyName', from: 'name', func: (stmt) => stmt}
     * to指的是新的屬性名稱, from指的就是sample物件裏面要被取代的原屬性(這裡是指name),如果屬性的的value(string,number).表示each的內容就是value. func就可以把再包一層邏輯
     *
     * sample:
     * const sample = [{name: 'a'}, {name: 'b'}];
     * console.log(util.toObjectMap(sample, {to: 'newName', from: 'name',func:(p) => (p+'yaya')}));
     * result : [ { newName: 'ayaya' }, { newName: 'byaya' } ]
     */
    toObjectMap(array, ...rules) {
        const newbies = []
        for (const each of array) {
            const object = {}
            for (const rule of rules) {
                const func = rule.func ? rule.func : (stmt) => stmt;
                object[rule.to] = this.isUndefinedNullEmpty(rule.from) || !_.isObject(each) ? func(each) : func(each[rule.from]);
            }
            newbies.push(object);
        }
        return newbies;
    }

    /**
     * sample:
     const array = [{aa: '1'},{ aa: '2'}, {aa: '3'}];
     const object = {aa: '1', bb: '2', cc: '3'};
     util.exeAll(object,(each) => each + 1)
     util.exeAll(array,(each) => {each.aa = each.aa + 1});
     console.log(object);  // { aa: '11', bb: '21', cc: '31' }
     console.log(array); // [ { aa: '11' }, { aa: '21' }, { aa: '31' } ]
     * 把collection 裏面的物件執行一下,會mutate本身*/
    exeAll(collection, ...funcs) {

        if (_.isArray(collection)) {
            for (const each of collection) {
                for (const func of funcs) {
                    func(each);
                }
            }
            /** 陣列專屬邏輯 */
        } else if (_.isObject(collection)) {
            for (const each in collection) {
                for (const func of funcs) {
                    collection[each] = func(collection[each])
                }
            }
            /** 物件專屬邏輯 */
        } else {
            throw new ERROR(9999, `7841212 type can't be array or object`)
        }
        return collection;
    }

    getObjectWhile(major, minor, predicate = (target) => true) {
        const collection = {};
        for (const key in major) {
            if (predicate(major, minor, key)) {
                collection[key] = major[key];
            }
        }
        return collection;
    }

    /** 找出兩個object,相同的屬性
     sample:
     const obj1 = {a:1,b:4,c:3};
     const obj2 = {b:3};
     console.log(util.getIntersectionObject(obj1,obj2)) => { b: 4 }
     */
    getIntersectionObject(objOfMajor, objOfMinor) {
        return this.getObjectWhile(objOfMajor, objOfMinor, ((major, minor, key) => minor[key] !== undefined));
    }

    /** 找出兩個object,相同的屬性
     sample:
     const obj1 = {a:1,b:4,c:3};
     const obj2 = {b:3};
     console.log(util.getIntersectionObject(obj1,obj2)) => { a: 1, c: 3 }
     */
    getDifferenceObject(objOfMajor, objOfMinor) {
        return this.getObjectWhile(objOfMajor, objOfMinor, ((major, minor, key) => minor[key] === undefined));
    }

    /**
     *
     const obj1 = {b:4,c:2};
     const obj2 = {b:4,c:3};
     const obj3 = {a:1,b:4,c:3};
     console.log(util.isObjectContainAndEqual(obj1,obj3)) false
     console.log(util.isObjectContainAndEqual(obj1,obj3)) true
     targetObject 是數量比較小那個
     */
    isObjectContainAndEqual(targetObject, mainObject) {
        let equal = true;
        for (const key in targetObject) {
            if (mainObject[key] === undefined || mainObject[key] !== targetObject[key]) {
                equal = false;
                break;
            }
        }
        return equal;
    }

    /** 把 /a/v/c/d => /a/v/c/ */
    getStringOfPop(string, separator) {
        if (!_.isString(string)) {
            throw new ERROR(9999, `445115,type should be string but ==> ${typeof string}`)
        }
        const segments = string.split(separator);
        segments.pop();
        return segments.join(separator);
    }

    /** 把 /a/v/c/d => /v/c/d */
    getStringOfShift(string, separator) {
        if (!_.isString(string)) {
            throw new ERROR(9999, `445116,type should be string but ==> ${typeof string}`)
        }
        const segments = string.split(separator);
        segments.shift();
        return segments.join(separator);
    }

    /**
     * array = [{name:'david',id:'kfgijifd'},{name:'serena',id:'kdffof'}....]
     * attrKeyOfPK = 'id'
     * result => { kfgijifd: {name:'david',id:'kfgijifd'}, kdffof:{name:'serena',id:'kdffof'} }
     * */
    toObjectWithAttributeKey(array, attrKeyOfPK) {
        const object = {}
        for (const each of array) {
            const pk = each[attrKeyOfPK];
            if (this.isUndefinedNullEmpty(pk)) {
                throw new ERROR(9999, `48157232 pk can't be empty => '${pk}'`);
            }
            object[pk] = each;
        }
        return object;
    }

    /**
     * 用來檢查string是否包含字元
     * string = '|C    G/B|'
     * signs = ['/','$']
     * return ==> {exist:true,sign:'/'}
     *
     * @param string
     * @param signs
     * @returns {{exists: boolean}|{sign: *, exists: boolean}}
     */
    getStateOfStringContainsSign(string, ...signs) {
        for (const sign of signs) {
            if (this.has(string, sign)) {
                return {exists: true, sign};
            }
        }
        return {exists: false};
    }

    /** others returns  [{logic:true|false,message:'oops'}]
     *  */
    constraintOfParam(collection, type, ...others) {
        let result = false;
        const validOfOthersCondition = _.isEmpty(others) ? true : this.and(...others.map(each => each.logic));

        switch (type) {
            case 'array':
                if (_.isArray(collection) && validOfOthersCondition)
                    result = true;
                break;
            case 'object':
                if (_.isObject(collection) && validOfOthersCondition)
                    result = true;
                break;
            case 'string':
                if (_.isString(collection) && validOfOthersCondition)
                    result = true;
                break;
            case 'number':
                if (_.isNumber(collection) && validOfOthersCondition)
                    result = true;
                break;
            case 'other':
                if (validOfOthersCondition)
                    return true
        }

        const stringOfRules = _.isEmpty(others) ? '' : `, ${others.map(each => each.message).join(' | ')}`

        if (result === false) {
            throw new ERROR(9999, `7474423 type should be ${type} but get '${typeof type}' ${stringOfRules} `)
        }
    }

    /**
     const array = _.range(0, 50).map((each) => `index Of each`);
     console.log('origin: ==> ', array.length) //origin: ==>  50
     const result = util.getSliceArrayWithMutate(array, 10);
     console.log('after: ==> ', result.length, ' | ', array.length) //after: ==>  10  |  40
     */
    getSliceArrayWithMutate(array, n) {
        const slice = _.remove(array, (each, index) => index < n);
        return slice;
    }

    /**
     *
     * 把array裏面的'指定index' 移動到 '特定index'
     *
     const array = [0,1,2,3,4,5,6,7];
     console.log(util.getArrayOfMoveToSpecificIndex(array,1,0));const array = [0,1,2,3,4,5,6,7];
     console.log(util.getArrayOfMoveToSpecificIndex(array,1,0));
     [
     1, 0, 2, 3,
     4, 5, 6, 7
     ]
     |-------如果有paginate, 有可能讓功能錯亂-------|
     */
    getArrayOfMoveToSpecificIndex(array, from, to) {
        /* #move - Moves an array item from one position in an array to another.
           Note: This is a pure function so a new array will be returned, instead
           of altering the array argument.
          Arguments:
          1. array     (String) : Array in which to move an item.         (required)
          2. moveIndex (Object) : The index of the item to move.          (required)
          3. toIndex   (Object) : The index to move item at moveIndex to. (required)
        */
        const item = array[from];
        const length = array.length;
        const diff = from - to;

        if (diff > 0) {
            // move left
            return [
                ...array.slice(0, to),
                item,
                ...array.slice(to, from),
                ...array.slice(from + 1, length)
            ];
        } else if (diff < 0) {
            // move right
            const targetIndex = to + 1;
            return [
                ...array.slice(0, from),
                ...array.slice(from + 1, targetIndex),
                item,
                ...array.slice(targetIndex, length)
            ];
        }
        return array;
    }

    /** 把array裏面的項目移動到指定的index
     *
     *  const array = ['a','b','c','d'];
     console.log(util.getArrayOfMoveItemToSpecificIndex(array,array[1],0));
     //[ 'b', 'a', 'c', 'd' ]
     * */
    getArrayOfMoveItemToSpecificIndex(array, item, indexOfDestination) {
        const indexOfItem = _.indexOf(array, item);
        return this.getArrayOfMoveToSpecificIndex(array, indexOfItem, indexOfDestination);
    }

    /**
     *
     *  把指定的array item 放到頭尾
     *
     *  const array = ['a','b','c','d'];
     *  console.log(util.getArrayOfMoveSpecificItemToAside(array,array[1]));
     *[ 'a', 'c', 'd', 'b' ]
     */
    getArrayOfMoveSpecificItemToAside(array, item, toTail = true) {
        const indexOfItem = _.indexOf(array, item);
        return this.getArrayOfMoveSpecificIndexToAside(array, indexOfItem, toTail);
    }

    /** 把指定的index放到頭尾
     *
     *  const array = ['a','b','c','d'];
     console.log(util.getArrayOfMoveSpecificIndexToAside(array,3,false));
     [ 'd', 'a', 'b', 'c' ]
     * */
    getArrayOfMoveSpecificIndexToAside(array, index, toTail = true) {
        const indexOfLast = _.size(array) - 1;
        return this.getArrayOfMoveToSpecificIndex(array, index, toTail ? indexOfLast : 0);
    }

    getECPayCheckMacValue(data, hashKey = '5294y06JbISpM5x9', hashIV = 'v77hoKGq4kWxNNIS') {
        const clone = _.cloneDeep(data);
        delete clone.CheckMacValue;
        const keys = Object.keys(clone).sort((l, r) => l > r ? 1 : -1);
        let checkValue = '';
        for (const key of keys) {
            checkValue += `${key}=${clone[key]}&`
        }
        checkValue = `HashKey=${hashKey}&${checkValue}HashIV=${hashIV}`; // There is already an & in the end of checkValue
        checkValue = encodeURIComponent(checkValue).toLowerCase();
        checkValue = checkValue.replace(/%20/g, '+')
            .replace(/%2d/g, '-')
            .replace(/%5f/g, '_')
            .replace(/%2e/g, '.')
            .replace(/%21/g, '!')
            .replace(/%2a/g, '*')
            .replace(/%28/g, '(')
            .replace(/%29/g, ')')
            .replace(/%20/g, '+');

        /** checkValue = Crypto.createHash('sha256').update(checkValue).digest('hex');
         * 之前用crypto做出來的，後來crypto-browsify多年沒有更新，所以都要用CryptoJS處理 2024/03/12
         * */
        checkValue = CryptoJS.SHA256(checkValue).toString(CryptoJS.enc.Hex)
        checkValue = checkValue.toUpperCase();
        return checkValue;
    }

    /**
     * @param content = object
     * @param rules {KEY:predicate} | 'KEY', rules如果只放字串, rule = KEY就代表這個欄位不得為isUndefinedEmpty(), 如果是物件 => {key:predicate}
     * @param idOfError 用在每個呼叫的method, 有個stack trace的概念
     *
     *
     *   console.log(utiller.validatePayloadObjectValid({a: 3, b: 4}, ['a',{b:(value) => value > 5}]));
     *   //ATTRIBUTE:'b' is not valid of custom rule
     *
     *   utiller.validatePayloadObjectValid({id: 'djksaio', num: 3, items: [1, 2, 3]},
     *                 [
     *                     {'id': (value) => _.isString(value)},
     *                     {'num': (v) => _.isNumber(v)},
     *                     {items: (v) => _.isArray(v)}
     *                  ])
     *   // =>true
     */
    validatePayloadObjectValid(content, rules = [], idOfError = this.getRandomHash(10)) {
        if (this.isUndefinedNullEmpty(content)) {
            throw new ERROR(9999, `${idOfError} content(pay-load) is undefined || empty`);
        }

        for (const rule of rules) {
            if (_.isString(rule)) {
                if (this.isUndefinedNullEmpty(content[rule])) {
                    throw new ERROR(9999, `${idOfError} ATTRIBUTE:'${rule}' is not Exist`);
                }
            } else if (_.isObject(rule)) {
                const key = this.getObjectKey(rule);
                const predicate = this.getObjectValue(rule);
                if (!predicate(content[key])) {
                    throw new ERROR(9999, `${idOfError} ATTRIBUTE:'${key}' is not valid of custom rule`);
                }
            }
        }
        return true;
    }

    /**
     * 做個總和
     *
     const result = utiller.getArrayOfSummarizeBy([{name:'david',count:5},{name:'nina',count:3},{name:'david',count:3},{name:'joe',count:3},{name:'joe',count:4}]
     ,'name','count');
     console.log(result);
     [
     { name: 'david', count: 8 },
     { name: 'nina', count: 3 },
     { name: 'joe', count: 7 }
     ]
     *
     */
    getArrayOfSummarizeBy(array, keyOfId, keyOfSum) {
        const obj = {};
        for (const item of array) {
            const key = item[keyOfId];
            if (obj[key] !== undefined) {
                obj[key] = obj[key] + item[keyOfSum]
            } else {
                obj[key] = item[keyOfSum];
            }
        }

        const items = [];
        for (const key in obj) {
            const _obj = {};
            _obj[keyOfId] = key;
            _obj[keyOfSum] = obj[key];
            items.push(_obj);
        }
        return items;
    }

    getHeadStringSplitBy(string, sign = this.getSeparatorOfUnique()) {
        return _.split(string, sign).shift();
    }

    getTailStringSplitBy(string, sign = this.getSeparatorOfUnique()) {
        return _.split(string, sign).pop();
    }

    /** 把array根據indexes分割成slices(array)
     * array = [0,1,2,3,4,5,6,7]
     * indexes = [0,3,5,7];
     * return [... [array1(0,3) ],[array2(3,5)],[array3(5,7)] ],
     * */
    getSlicesByIndexes(array = [], indexes = []) {
        const slices = [];
        _.each(indexes, (each, index, arrayOfIndexes) => {
            if (_.isEqual(index, indexes.length - 1))
                return false;

            const slice = _.slice(array, each, indexes[index + 1]);
            slices.push(slice);
        })
        return slices;
    }

    /** 用_.findIndex(比較內文的方式) 去找出array裡所有符合條件的
     * array = [-2, -1, 65, -4, 77]
     * predicate = (item) => item > 1;
     * return [3,5]
     * */
    findIndexes(array, predicate) {
        const indexes = [];
        let hasIndex = true;
        let indexOfLatest = 0;
        while (hasIndex) {
            indexOfLatest = _.findIndex(array, predicate, indexOfLatest + 1);
            if (indexOfLatest > -1) {
                indexes.push(indexOfLatest);
            } else {
                hasIndex = false;
            }
        }
        return indexes;
    }
}

if (configerer.DEBUG_MODE) {
    (async () => {
            const utiller = new Utiller();
            const aaa = {};
            // utiller.appendMapOfKeyArray(aaa, 'a', 11);
            // utiller.appendMapOfKeyArray(aaa, 'c', 13);
            // utiller.appendMapOfKeyArray(aaa, 'a', 23);
            // utiller.appendMapOfKeyArray(aaa, 'c', 'vsdd')
            // utiller.appendMapOfKeyArray(aaa, 'a', 'sd');

            // console.log(utiller.getECPayCheckMacValue('30'));
            // console.log(utiller.getTailStringSplitBy('325/2/32/1','/'))
            const obj = {time :undefined,name: 'david'};
            utiller.removeAttributeBy(obj);
            console.log(obj);

            // console.log(utiller.getECPayCurrentTimeFormat(utiller.getTimeStampWithConditions({days: -1})))
        }
    )();
}
export default Utiller;
