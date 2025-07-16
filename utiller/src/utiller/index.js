import _ from "lodash";
import CryptoJS from "crypto-js";
import { configerer } from "configerer";
import ERROR from "../exceptioner";
import moment from "moment-timezone";
import { v4 } from "uuid";
import { count, generate } from "../words";
import { parse } from "node-html-parser";

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
     **/
    removeAttributeBy(object, predicate = (value) => _.isUndefined(value)) {
        for (const key in object) {
            if (predicate(object[key])) {
                delete object[key];
            }
        }
    }

    getNumberOfNormalize(value, defaultValue = 0) {
        if (_.isNumber(value))
            return value;
        try {
            const force = _.toNumber(value)
            return _.isNumber(force) && !isNaN(force) ? force : defaultValue;
        } catch (error) {
            Util.appendError(`448561684561 ${error.message}`)
        }
        return defaultValue;
    }

    getBooleanOfNormalize(value, defaultValue = false) {
        if (_.isBoolean(value))
            return value;

        if (_.isNumber(value) && _.isEqual(value, 1))
            return true;

        if (_.isNumber(value) && _.isEqual(value, 0))
            return true;

        try {
            const force = JSON.parse(_.toString(value).toLowerCase())
            return _.isBoolean(force) ? force : defaultValue;
        } catch (error) {
            Util.appendError(`448561684562 ${error.message}`)
        }
        return defaultValue;
    }


    getStringOfNormalize(value, defaultValue = '', trim = false) {
        if (_.isString(value))
            return trim ? _.trim(value) : value;
        try {
            const force = _.toString(value);
            return this.isOrEquals(force, '', 'undefined') ? defaultValue : trim ? _.trim(force) : force;
        } catch (error) {
            Util.appendError(`448616845453 ${error.message}`)
        }
        return defaultValue;
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

    /** 就是把 target 放到 condition 裡面處理, 然後取代原本的target
     *
     * condition2(condition1(target)) =>  為了應付 collection(path).where('age','>',11).orderBy('age');
     * */
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

    /** alwaysTheSame 就是產出的encrypt value會固定(適合用在欄位的key), 不然會產生隨機偏移量, 但皆不影響解譯 */
    getEncryptStringV2(texts, key = configerer.ENCRYPT_KEY, alwaysTheSame = false) {
        const maxLengthOfKey = 22;
        if (key.length > maxLengthOfKey)
            throw new ERROR(8010, _.size(key))
        /** 帶入偏移量, keyOfkeyOfCrypto 需要是長度為22的字串, 太獵奇了*/
        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");
        const keyOfCrypto = alwaysTheSame ? CryptoJS.enc.Base64.parse(`${key}${_.range(0, maxLengthOfKey - key.length).join('')}`) : key;
        return CryptoJS.AES.encrypt(JSON.stringify({content: texts}), keyOfCrypto, {iv: ivOfCrypto}).toString();
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

    getDecryptStringV2(ciphertext, key = configerer.ENCRYPT_KEY) {
        const maxLengthOfKey = 22;
        if (key.length > maxLengthOfKey)
            throw new ERROR(8010, _.size(key))

        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");
        try {
            const stringOfObj = CryptoJS.AES.decrypt(ciphertext, key, {iv: ivOfCrypto}).toString(CryptoJS.enc.Utf8)
            if (!_.isEmpty(stringOfObj.trim())) {
                const obj = JSON.parse(stringOfObj);
                return obj.content;
            }
        } catch (e) {
            /** 把問題給吃掉了, 也不能紀錄, 因為用了appendError*/
        }
        const stringOfObj = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Base64.parse(`${key}${_.range(0, maxLengthOfKey - key.length).join('')}`), {iv: ivOfCrypto}).toString(CryptoJS.enc.Utf8);
        const obj = JSON.parse(stringOfObj);
        return obj.content;
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
            n = len; // Handle n > arr.length case gracefully

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

    /** getPathOfReplaceLastDir('folder1/folder2/folder3', 'folder7') => 'folder1/folder2/folder7' */
    getPathOfReplaceLastDir(path, name) {
        const split = path.split('/');
        split.pop();
        split.push(name);
        return split.join('/');
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
     * console.log(utiller.getFolderNameOfFilePath(`das/asdiasjiosd/jif/d.js`)); //ans:'jif'
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
        return this.getShuffledArrayWithLimitCountHighPerformance(arr, n); // 使用已優化的版本
    }

    /** const items = [{ price: 10 }, { price: 120 }, { price: 230 }];
     console.log(findLowestPrice(items)); // 輸出: 10
     */
    findLowestValue = (items, key = 'price') => {
        // 提取價格並找出最小值
        const minPrice = _.minBy(items, key)[key];
        // 確保回傳的最低價為 integer 型態
        return Math.floor(minPrice);
    };

    /** const items = [{ price: 10 }, { price: 120 }, { price: 230 }];
     console.log(findLowestPrice(items)); // 輸出: 120
     */
    findHighestValue = (items, key = 'price') => {
        // 提取價格並找出最小值
        const maxPrice = _.maxBy(items, key)[key];

        // 確保回傳的最低價為 integer 型態
        return Math.floor(maxPrice);
    };

    /**
     * // 測試數據
     *     const items = [{ price: 10 }, { price: 120 }, { price: 230 }];
     *     console.log(getPriceRange(items)); // 輸出: $10 - $230
     * */
    getStringOfValueRange = (items, key = 'price', sign = '$') => {
        // 找出最小值和最大值
        const minV = _.minBy(items, key)[key];
        const maxV = _.maxBy(items, key)[key];
        // 判斷並返回字串
        return maxV === minV ? `$${minV}` : `${sign}${minV} - ${sign}${maxV}`;
    };


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
     * 優化版本：針對基於唯一 Key 的合併
     * @param {Array} major - 主要陣列
     * @param {Array} sub - 次要陣列
     * @param {string} key - 用於匹配的唯一鍵名 (e.g., 'id')
     * @returns {Array} - 合併後的新陣列
     *
     *
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
    getMergedArrayBy(major = [], sub = [], key) {
        if (!key || major.length === 0 || sub.length === 0) {
            // 如果沒有 key 或任一陣列為空，無法優化或無需合併，回傳 major 的淺拷貝
            return [...major];
        }

        // 1. 將 sub 陣列轉換為以 key 為鍵的 Map，時間複雜度 O(N)
        const subMap = new Map(sub.map(item => [item[key], item]));

        // 2. 遍歷 major 陣列，從 Map 中查找匹配項，時間複雜度 O(M)
        return major.map(majorItem => {
            const subItem = subMap.get(majorItem[key]);
            // 合併找到的 subItem 和 majorItem，majorItem 的屬性優先
            return { ...(subItem || {}), ...majorItem };
        });
        // 整體時間複雜度約為 O(M + N)
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

    getObject(key, value) {
        const object = {};
        object[key] = value;
        return object;
    }

    getStringOfCreditCardFormatted(string = 0) {
        const inputValue = string.replace(/\D/g, ''); // Remove all non-digit characters
        const result = inputValue.replace(/(\d{4})(?=\d)/g, '$1-'); // Add a dash every 4 digits
        return result.slice(0, 19);
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
        let result = '';
        const stack = [[collection, '']]; // 儲存 [項目, 目前的前綴]

        while (stack.length > 0) {
            const [current, prefix] = stack.pop();

            if (_.isArray(current)) {
                // 將陣列元素反向推入堆疊以保持順序
                for (let i = current.length - 1; i >= 0; i--) {
                    stack.push([current[i], prefix]); // 陣列元素不加前綴
                }
            } else if (_.isObject(current)) {
                // 將物件鍵值對反向推入堆疊
                const keys = Object.keys(current);
                for (let i = keys.length - 1; i >= 0; i--) {
                    const key = keys[i];
                    // 值推入堆疊，前綴包含當前鍵
                    stack.push([current[key], prefix + key + sign]);
                }
            } else {
                // 基本型別，添加到結果字串
                const valueString = _.trim(String(current)); // 確保轉為字串並去除頭尾空白
                if (valueString.length > 0) { // 避免添加空字串或只有空白的字串
                    result += (result.length > 0 ? sign : '') + prefix + valueString;
                } else if (prefix.length > 0 && result.length > 0) {
                    // 如果值為空但有前綴，且結果已非空，則添加分隔符
                    result += sign;
                } else if (prefix.length > 0 && result.length === 0) {
                    // 如果值為空但有前綴，且結果為空，則只添加前綴（去掉末尾的 sign）
                    result += prefix.endsWith(sign) ? prefix.slice(0, -sign.length) : prefix;
                }
            }
        }
        // 最後可能需要處理結尾多餘的 sign
        if (result.endsWith(sign)) {
            result = result.slice(0, -sign.length);
        }
        return result;
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

    /**
     * 得到slice array 從指定的index
     * console.log(utiller.getSliceArrayOfSpecificIndexes(['a','v','c','d'], 1, 2, 3));
     * [ 'v', 'c', 'd' ]
     * */
    getSliceArrayOfSpecificIndexes(array, ...indexes) {
        const items = [];
        const size = _.size(array);
        for (const index of indexes) {
            if (!_.isNumber(index))
                throw new ERROR(9999, `59941278 index should be number => ${index}, ${array}`);
            if (index > size - 1)
                throw new ERROR(9999, `5994123 index=>${index} is not valid, exceed than array size=${size}, ${array}`);
            items.push(_.nth(array, index));
        }
        return items;
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

    /**
     * 將items insert指定的index後方
     * modify origin array
     * 如果要insert to head, index 要給 -1
     * const array = [3, 4, 5];
     * utiller.insertToArray(array, -1, 'QQ', 'WW'); /** ['QQ','WW',3,4,5]
     * utiller.insertToArray(array, 1, 'QQ', 'WW'); /** [3,'QQ','WW',4,5]
     * utiller.insertToArray(array, 999, 'QQ', 'WW'); /**  [3,4,5,'QQ','WW']
     * */

    insertToArray = (array, index, ...items) => {
        if (!Array.isArray(array)) {
            throw new Error("First argument must be an array.");
        }
        // splice 的 index 是插入位置，原函式 index 是插入點的前一個位置
        // index = -1 應插入到開頭 (index 0)
        // index >= array.length 應插入到結尾
        const insertAt = Math.max(0, Math.min(index + 1, array.length));
        array.splice(insertAt, 0, ...items);
        // 注意：此函式直接修改了傳入的 array，行為與原函式不同（原函式隱式返回 undefined 但修改了 array）
        // 如果需要保持原函式返回 undefined 的行為，可以不加 return
        // 如果希望返回修改後的 array，可以 return array;
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

    isAndConditionOfUndefinedNullEmpty(...objs) {
        for (const obj of objs) {
            if (!this.isUndefinedNullEmpty(obj))
                return false;
        }
        return true;
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

    getCustomFormatOfDatePresent(ts, format = 'YY/MM') {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format(format)
    }

    /** 西元年 轉成 民國年
     * full = 是否打印出全名 民國 ＸＸ 年
     * */
    getStringOfYearADConvertToMinguoYear = (gregorianYear, full = false) => {
        const minguoYear = gregorianYear - 1911;
        if (minguoYear > 0) {
            return `${full ? '民國' : ''}${minguoYear}${full ? '年' : ''}`;
        } else {
            return `${full ? '民國' : ''}前${Math.abs(minguoYear)}${full ? '年' : ''}`;
        }
    };

    getSimpleDateYYMMDDFormat(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YY/MM/DD")
    }

    getSimpleTimeYYMMDDHHmmFormat(ts) {
        return moment(ts ? ts : this.getCurrentTimeStamp()).format("YY/MM/DD HH:mm")
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

    /**
     * 根據地區語系與時區輸出 yyyy/MM/dd hh:mm 時間字串
     * @param {Date | number | string} ts - 時間戳記、日期物件或字串
     * @param {string} location - 語系地區代碼（如 'zh-TW'、'en-US'）
     * @param {string} timezone - 時區（預設為 'Asia/Taipei'）
     * @param {boolean} use24Hour - 是否使用 24 小時制（預設 true）
     * @returns {string}
     */
     formatTimeByLocale(ts, location = "zh-TW", timezone = "Asia/Taipei", use24Hour = true) {
        // 設定 moment 語系
        moment.locale(location);

        // 轉換時區
        const m = moment(ts).tz(timezone);

        // 格式化字串
        const formatStr = use24Hour ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD hh:mm A";

        return m.format(formatStr);
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
     * Merge multiple arrays of objects based on a specific identifier key.
     * If objects have the same identifier, they will be merged,
     * with properties from later arrays overwriting earlier ones.
     *
     * const list1 = [{ id: '123', name: 'david' }];
     * const list2 = [{ id: '123', age: 13 }];
     * const list3 = [{ id: '456', name: 'alice' }];
     * console.log(mergeArrayBy('id', list1, list2, list3)); //[ { href: '123', name: 'david', age: 13 },{ href: '456', name: 'alice' } ]
     *
     * @param {string} identifier - The object property used to identify and merge items. Default is 'id'.
     * @param {...Array<Object>} array - Multiple arrays containing objects to merge.
     * @returns {Array<Object>} A new array with merged objects based on the identifier.
     */
    mergeArrayBy(identifier = 'id', ...array) {
        return Object.values(
          array.flat().reduce((acc, item) => {
              if (item[identifier]) acc[item[identifier]] = { ...(acc[item[identifier]] || {}), ...item };
              return acc;
          }, {})
        );
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

    /**
     * 將百分比轉換為浮點數
     * @param {string} percentage - 以百分比表示的字串，例如 "50%" 或 "12.5%"
     * @returns {number} - 對應的浮點數，例如 0.5 或 0.125
     */
    getNumberOfPercentageToFloat(percentage) {
        // 移除百分比符號
        let cleanedPercentage = percentage.replace('%', '');
        // 將字串轉換為浮點數並除以 100
        let floatNumber = parseFloat(cleanedPercentage) / 100;
        return floatNumber;
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

    getObjectOfArraySpecifyAttr(array, attr) {
        return this.toObjectWithAttributeKey(array, attr);
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
     * const array1 = [1, 2, 3, 4, 5];
     * const array2 = [3, 4, 5, 6, 7];
     * Output: [1, 2]
     * */
    getArrayOfInteraction(one, two) {
        return one.filter(element => !two.includes(element));
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
        if (!Array.isArray(array)) {
            throw new Error("First argument must be an array.");
        }
        const length = array.length;
        // 驗證索引範圍
        if (from < 0 || from >= length || to < 0 || to >= length) {
            console.warn("Invalid 'from' or 'to' index for getArrayOfMoveToSpecificIndexOptimized.");
            // 可以選擇拋出錯誤或返回原陣列的副本
            // throw new RangeError("Index out of bounds");
            return [...array]; // 返回副本
        }

        if (from === to) {
            return [...array]; // 位置相同，無需移動，返回副本
        }

        const copy = [...array]; // 創建副本
        const [item] = copy.splice(from, 1); // 從副本中移除元素
        copy.splice(to, 0, item); // 將元素插入到副本的新位置
        return copy; // 返回修改後的副本
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
     *  把指定的array item 放到頭尾
     *  const array = ['a','b','c','d'];
     *  console.log(util.getArrayOfMoveSpecificItemToAside(array,array[1]));
     *[ 'a', 'c', 'd', 'b' ]
     */
    getArrayOfMoveSpecificItemToAside(array, item, toTail = true) {
        const indexOfItem = _.indexOf(array, item);
        return this.getArrayOfMoveSpecificIndexToAside(array, indexOfItem, toTail);
    }

    /** 把指定的index放到頭尾
     *  const array = ['a','b','c','d'];
     console.log(util.getArrayOfMoveSpecificIndexToAside(array,3,false));
     [ 'd', 'a', 'b', 'c' ]
     **/
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
        return _.toUpper(CryptoJS.SHA256(checkValue).toString(CryptoJS.enc.Hex));
    }

    /** 把一段html文字轉換成類似document的結構 處理後再回傳文字

     const result = utiller.getStringOfHandleHtml(
     '<form id="_form_aiochk" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post"><input type="hidden" name="MerchantTradeNo" id="MerchantTradeNo" value="sO6E2IilSGYpCChDqrI2" /><input type="hidden" name="MerchantTradeDate" id="MerchantTradeDate" value="2022/07/02 05:16:32" />' +
     '<input type="hidden" name="TotalAmount" id="TotalAmount" value="350" /><input type="hidden" name="TradeDesc" id="TradeDesc" value="綠界第三方支付(明悅科技-線上支付)" /><input type="hidden" name="ItemName" id="ItemName" value="iphone13 pro x 2 = 200 元#iphone11 x 3 = 150 元#總價 350 元##※備註: 無備註內容" /><input type="hidden" name="ReturnURL" id="ReturnURL" value="https://us-central1-davidtu-dev.cloudfunctions.net/confirmedByByECPay" /><input type="hidden" name="ClientBackURL" id="ClientBackURL" value="https://www.google.com/" /><input type="hidden" name="ExpireDate" id="ExpireDate" value="1" /><input type="hidden" name="PaymentInfoURL" id="PaymentInfoURL" value="https://us-central1-davidtu-dev.cloudfunctions.net/paymentInfoByECPay" /><input type="hidden" name="ChoosePayment" id="ChoosePayment" value="ALL" /><input type="hidden" name="PlatformID" id="PlatformID" value="" /><input type="hidden" name="MerchantID" id="MerchantID" value="2000132" /><input type="hidden" name="InvoiceMark" id="InvoiceMark" value="N" /><input type="hidden" name="IgnorePayment" id="IgnorePayment" value="BARCODE#AndroidPay#ApplePay" /><input type="hidden" name="DeviceSource" id="DeviceSource" value="" /><input type="hidden" name="EncryptType" id="EncryptType" value="1" /><input type="hidden" name="PaymentType" id="PaymentType" value="aio" />' +
     '<input type="hidden" name="CheckMacValue" id="CheckMacValue" value="D55E9E48C6AB83C063E0E13AD1B8C2EE8FA6547A7D7FCB33860B532E97D808BC" /><script type="text/javascript">document.getElementById("_form_aiochk").submit();</script></form>'
     ,(document) => {
     const element = document.getElementById('CheckMacValue');
     element.setAttribute('value', '123456');
     })

     */
    getStringOfHandledHtml(htmlString, predicate = (document) => {
        console.log(document)
    }) {
        const document = parse(htmlString);
        predicate(document);
        return document.toString();
    }

    /** 會有物件在比較優先權，例如option = {id:1,photo:'url'} choice = {id, photo:'url'}
     *
     *  const selected = getSpecifyObjectBy([option.photo,choice.photo],(string) => !_.isEmpty(string))
     * */
    getSpecifyObjectBy(array, predicate) {
        for (const item of array) {
            if (predicate(item))
                return item;
        }
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

    /**
     console.log(generate());
     //output: 'army'

     console.log(generate(5));
     //output: ['army', 'beautiful', 'became', 'if', 'actually']

     console.log(generate({ minLength: 2 }));
     //output: 'hello'

     console.log(generate({ maxLength: 6 }));
     //output: 'blue'

     console.log(generate({ minLength: 5, maxLength: 5 }));
     //output : 'world'

     console.log(generate({ minLength: 11, maxLength: 10000 })); //maxLength limited to the longest possible word
     //output: 'environment'

     console.log(generate({ minLength: 10000, maxLength: 5 })); //minLength limited to the maxLength
     //output: 'short'

     console.log(generate({ min: 3, max: 10 }));
     //output: ['became', 'arrow', 'article', 'therefore']

     console.log(generate({ exactly: 2 }));
     //output: ['beside', 'between']

     console.log(generate({ min: 2, max: 3, seed: "my-seed" }));
     //output: ['plenty', 'pure']

     // this call will yield exactly the same results as the last since the same `seed` was used and the other inputs are identical
     console.log(generate({ min: 2, max: 3, seed: "my-seed" }));
     //output: ['plenty', 'pure']

     console.log(generate({ exactly: 5, join: " " }));
     //output: 'army beautiful became if exactly'

     console.log(generate({ exactly: 5, join: "" }));
     //output: 'armybeautifulbecameifexactly'

     console.log(generate({ exactly: 2, minLength: 4 }));
     //output: ['atom', 'window']

     console.log(generate({ exactly: 5, maxLength: 4 }));
     //output: ['army', 'come', 'eye', 'five', 'fur']

     console.log(generate({ exactly: 2, minLength: 3, maxLength: 3 }));
     //output: ['you, 'are']

     console.log(generate({ exactly: 3, minLength: 5, maxLength: 100000 }));
     //output: ['understanding', 'should', 'yourself']

     console.log(generate({ exactly: 5, wordsPerString: 2 }));
     //output: [ 'salt practical', 'also brief', 'country muscle', 'neighborhood beyond', 'grew pig' ]

     console.log(generate({ exactly: 5, wordsPerString: 2, separator: "-" }));
     //output: [ 'equator-variety', 'salt-usually', 'importance-becoming', 'stream-several', 'goes-fight' ]

     console.log(
     generate({
     exactly: 5,
     wordsPerString: 2,
     formatter: (word) => word.toUpperCase(),
     })
     );
     //output: [ 'HAVING LOAD', 'LOST PINE', 'GAME SLOPE', 'SECRET GIANT', 'INDEED LOCATION' ]

     console.log(
     generate({
     exactly: 5,
     wordsPerString: 2,
     formatter: (word, index) => {
     return index === 0
     ? word.slice(0, 1).toUpperCase().concat(word.slice(1))
     : word;
     },
     })
     );
     //output: [ 'Until smoke', 'Year strength', 'Pay knew', 'Fallen must', 'Chief arrow' ]

     */
    getRandomName(options = undefined) {
        return generate(options);
    }

    /**
     console.log(count());
     //output: 1952

     console.log(count({ minLength: 5 }));
     //output: 1318

     console.log(count({ maxLength: 7 }));
     //output: 1649

     console.log(count({ minLength: 5, maxLength: 7 }));
     */
    getRandomCount(options = undefined) {
        return count(options);
    }

    /**
     // 使用範例
     const birthDate = '2005-01-01';
     console.log(isOver18(birthDate)); // 會返回 true 或 false
     */
    isOverSpecificAge(birthDate, target = 18) {
        const age = moment().diff(moment(birthDate, 'YYYY-MM-DD'), 'years');
        return age >= target;
    }

    isValidEmail(email) {
        // 正規表達式，用於匹配常見的電子郵件格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidTaiwaneseID(idNumber) {
        // 正規表達式，用於匹配中華民國身分證號碼的格式
        const idRegex = /^[A-Z][1-2]\d{8}$/;

        // 檢查是否符合基本格式
        if (!idRegex.test(idNumber)) {
            return false;
        }

        // 檢查檢查碼
        const weight = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        const firstChar = idNumber.charCodeAt(0) - 65; // 將英文字母轉換為數字
        let sum = firstChar * 10 + parseInt(idNumber.slice(1));
        for (let i = 0; i < weight.length; i++) {
            sum += parseInt(idNumber.charAt(i + 1)) * weight[i];
        }
        return sum % 10 === 0;
    }

    validatePersonalInfoInput(name, email, idNumber, phoneNumber, birthday, ageOfQualify = 12) {
        // 檢查姓名
        if (name.length < 2) {
            return {
                valid: false,
                message: '姓名至少要兩個字'
            };
        }

        // 檢查電子郵件
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                valid: false,
                message: '電子郵件格式不正確'
            };
        }

        // 檢查身分證號碼 (這裡使用簡化的檢查，實際上還需要更詳細的驗證)
        const idRegex = /^[A-Z][1-2]\d{8}$/;
        if (!idRegex.test(idNumber)) {
            return {
                valid: false,
                message: '身分證號碼格式不正確'
            };
        }

        // 檢查手機號碼 (這裡以台灣手機號碼為例，09開頭，共10位數字)
        const phoneRegex = /^09\d{8}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return {
                valid: false,
                message: '手機號碼格式不正確'
            };
        }

        // 檢查生日和年齡
        if (this.isUndefinedNullEmpty(birthday))
            return {
                valid: false,
                message: `出生日期格式不正確`
            };

        const now = moment();
        const age = now.diff(birthday, 'years');
        if (age < ageOfQualify) {
            return {
                valid: false,
                message: `年齡不得小於 ${ageOfQualify} 歲`
            };
        }

        // 所有項目都通過檢查
        return {
            valid: true,
            message: '格式檢查通過'
        };
    }

    /**
     * // 測試範例
     *     const startTimestamp = 1683004800000; // 2023-05-01
     *     const endTimestamp = 1688160000000; // 2023-06-30
     *
     *     console.log(formatTimestampRangeWithMoment(startTimestamp, endTimestamp));
     * // 輸出：23/05/01 - 06/30
     *
     *     const startTimestampCrossYear = 1609459200000; // 2021-01-01
     *     const endTimestampCrossYear = 1640995200000; // 2022-01-01
     *
     *     console.log(formatTimestampRangeWithMoment(startTimestampCrossYear, endTimestampCrossYear));
     * // 輸出：21/01/01 - 22/01/01
     * */

    getStringOfFormatTimestampRange(startTimestamp, endTimestamp) {
        // 使用 moment 解析 timestamp
        const startDate = moment(startTimestamp);
        const endDate = moment(endTimestamp);

        // 格式化日期為 YY/MM/DD 格式
        const formatDate = (date) => date.format('YY/MM/DD');

        // 判斷是否跨年份
        const startYear = startDate.year();
        const endYear = endDate.year();

        if (startYear === endYear) {
            // 如果沒有跨年份，顯示 YY/MM/DD - MM/DD
            return `${formatDate(startDate)} - ${endDate.format('MM/DD')}`;
        } else {
            // 如果跨年份，顯示 YY/MM/DD - YY/MM/DD
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
    }

    /**
     * // 測試範例
     *     const startTimestamp = 1683004800000; // 2023-05-01
     *     const endTimestamp = 1688160000000; // 2023-06-30
     *     const weeklyMinutes = 180; // 每週上課 180 分鐘 (3 小時)
     *
     *     console.log(calculateClassTimeWithMoment(startTimestamp, endTimestamp, weeklyMinutes));
     * // 輸出：12小時
     *
     * console.log(utiller.getStringOfCalculateClassTime(utiller.convertDateToTimestamp('2024-09-15'),utiller.convertDateToTimestamp('2024-10-15'),60))
     *
     */
    getStringOfCalculateClassTime(startTimestamp, endTimestamp, weeklyMinutes) {
        // 使用 moment 解析 timestamp
        const startDate = moment(startTimestamp);
        const endDate = moment(endTimestamp);

        // 計算時間範圍內的天數
        const totalDays = endDate.diff(startDate, 'days') + 1; // 包含起始日
        const totalWeeks = Math.ceil(totalDays / 7); // 計算有幾週

        // 計算總上課時間（分鐘）
        const totalMinutes = totalWeeks * weeklyMinutes;

        // 將分鐘轉換為小時和分鐘
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // 判斷是否需要顯示分鐘
        if (minutes === 0) {
            return `${hours}小時`;
        } else {
            return `${hours}小時${minutes}分鐘`;
        }
    }

    /** // 測試範例
     const startTimestamp = 1683004800000; // 2023-05-01 00:00
     const endTimestamp = 1683040800000;   // 2023-05-01 10:00

     const totalMinutes = getNumberOfPeriodMinute(startTimestamp, endTimestamp);
     console.log(totalMinutes); // 輸出：600（相當於10個小時，600分鐘）
     */
    getNumberOfPeriodMinute(startTimestamp, endTimestamp) {
        // 使用 moment 解析 timestamp
        // 使用 moment 解析 timestamp 並只取時間的 hh:mm 部分
        const startTime = moment(startTimestamp).format('HH:mm');
        const endTime = moment(endTimestamp).format('HH:mm');

        // 使用 moment 重新將 hh:mm 轉換為完整的日期對象
        const startDate = moment(startTime, 'HH:mm');
        const endDate = moment(endTime, 'HH:mm');

        // 計算兩個時間之間的分鐘差距
        const durationInMinutes = moment.duration(endDate.diff(startDate)).asMinutes();
        return durationInMinutes;
    }

    /**
     * // Example usage
     * const date = '2024-07-25';
     * console.log(convertDateToTimestamp(date)); // Outputs the timestamp for 2024-07-25*/
    convertDateToTimestamp = (date) => {
        return moment(date).valueOf(); // valueOf() returns the timestamp in milliseconds
    };


    /**
     * const day = 1; // 週一
     *     const startTimestamp = 1683004800000; // 2023-05-01 00:00
     *     const endTimestamp = 1683019200000;   // 2023-05-01 04:00
     *     const formattedString = formatTimeRange(day, startTimestamp, endTimestamp);
     *     console.log(formattedString); // 輸出：週一 00:00-04:00
     */
    getStringOfWeekTime(day, startTimestamp, endTimestamp) {
        // 檢查 day 是否在 1 到 7 之間
        const daysOfWeek = {1: '週一', 2: '週二', 3: '週三', 4: '週四', 5: '週五', 6: '週六', 7: '週日'};
        if (day < 1 || day > 7) {
            throw new Error('day 必須在 1 到 7 之間');
        }

        // 使用 moment 將 timestamp 轉換為只保留 hh:mm 的格式
        const startTime = moment(startTimestamp).format('HH:mm');
        const endTime = moment(endTimestamp).format('HH:mm');

        // 組合結果並返回
        return `${daysOfWeek[day]} ${startTime}-${endTime}`;
    }

    /** 這個函式使用了正則表達式 \d+ 來匹配字串中的數字，並將其轉換為 number 型態。如果字串中沒有找到數字，則會回傳 null。
     *     console.log(extractNumber('NTD 320')); // 輸出: 320
     * */
    extractNumber(str) {
        // 使用正則表達式提取數字部分
        if (this.isUndefinedNullEmpty(str)) return -1
        const match = str.match(/\d+/);

        // 如果找到數字，轉換為數字型態並回傳
        return match ? Number(match[0]) : -1;
    }

    /** puppeteer 的 fetch function
     * 使用這個function的朋友必須安裝puppeteer:v23.6
     * dom => <p id='_id' class='_class'>innerText /p>
     * dom的物件型態為 CdpElementHandler
     * * */
    async fetchElementAttribute(dom, attr = 'innerText', defaultValue = '') {
        return await dom.evaluate((el) => el[attr]);
    }

    /** puppeteer 的 fetch function
     * 使用這個function的朋友必須安裝puppeteer:v23.6
     *
     * dom的物件型態為 CdpElementHandler
     * */
    async fetchElementAttributes(dom, stringOfTrait, defaultValue = '', ...attributes) {
        const element = await dom.$(stringOfTrait);
        if (!this.isUndefinedNullEmpty(element)) {
            try {
                return await element.evaluate((el, attributes) => {
                    if (attributes.length === 1) return el[attributes.shift()];
                    return {...attributes.map(attr => el[attr])} //或者 el.getAttribute('src') 更精確!
                }, attributes);
            } catch (error) {
                this.appendError(`1581532 ${stringOfTrait} fetch ${JSON.stringify(attributes)} fail, element is not found`);
                return defaultValue;
            }
        }
        return defaultValue
    }

    /** puppeteer 的 write dom function
     * 使用這個function的朋友必須安裝puppeteer:v23.6
     * attribute = {name:value}; // {value:'100000'}, {src:'http://123.com'}
     * dom的物件型態為 CdpElementHandler
     * */
    async writeElementAttributes(dom, stringOfTrait, ...attributes) {
        const element = await dom.$(stringOfTrait);
        if (!this.isUndefinedNullEmpty(element)) {
            await element.evaluate((element, attributes) => {
                attributes.map((attr) => {
                    const entries = Object.entries(attr);
                    const key = entries[0][0]; // 获取键 'name'
                    const value = entries[0][1]; // 获取值 'value'
                    element[key] = value;
                })
            }, attributes);
        } else this.appendError(`1231232 ${stringOfTrait} fetch ${JSON.stringify(attributes)} fail, element is not found`);
    }

    /** // 示例函數來測試運行時間
     async function exampleFunction() {
     return new Promise((resolve) => setTimeout(resolve, 3210)); // 模擬3.21秒延遲
     }

     // 測試 measureExecutionTime 函數
     measureExecutionTime(exampleFunction).then(result => {
     console.log(result); // 輸出：0小時 0分 3.210秒 (合計 3.210 秒)
     });

     */
    measureExecutionTime = async (fn, ...param) => {
        // 開始計時
        const startTime = Date.now();

        // 執行傳入的函數
        await fn(...param);

        // 結束計時
        const endTime = Date.now();

        // 計算總運行時間（毫秒）
        const durationInMilliseconds = endTime - startTime;

        // 使用 moment.duration 格式化為 hh:mm:ss.SSS
        const duration = moment.duration(durationInMilliseconds, 'milliseconds');

        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        const milliseconds = duration.milliseconds();

        // 計算總秒數（包含小數點）
        const totalSeconds = (durationInMilliseconds / 1000).toFixed(3);

        // 返回結果
        this.appendInfo(`${hours}小時 ${minutes}分 ${seconds}.${milliseconds.toString().padStart(3, '0')}秒 (合計 ${totalSeconds} 秒)`)
    }

    formatPriceWithCurrency = (number, locale) => {
        if (typeof number !== 'number' || typeof locale !== 'string') {
            throw new TypeError('Invalid input: number must be a number and locale must be a string.');
        }

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: new Intl.Locale(locale).maximize().currency || 'USD',
            minimumFractionDigits: 0 // 確保不顯示小數
        }).format(number);
    };

    formatPrice = (number, locale) => {
        if (typeof number !== 'number') {
            throw new TypeError('Invalid input: number must be a number.');
        }

        // 如果沒有傳入 locale，僅格式化數字
        if (!locale) {
            return number.toLocaleString('en-US'); // 預設使用美式數字格式
        }

        // 有傳入 locale，使用貨幣格式化
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: new Intl.Locale(locale).maximize().currency || 'USD',
            minimumFractionDigits: 0 // 確保不顯示小數
        }).format(number);
    };

    /**
     * 優化版本：根據元素類型選擇最高效的去重方式
     * @param {Array} array - 要去重的陣列
     * @param {string} [key] - (可選) 如果是物件陣列，指定用於判斷唯一的屬性鍵名
     * @returns {Array} - 去重後的數組
     *
     * // 使用範例
     * const strings = ['eee', 'aaa', 'bbb', 'ccc', 'bbb', 'ddd', 'eee'];
     * const objects = [
     *   { aa: 1, bb: 2 },
     *   { cc: 1, dd: 2 },
     *   { aa: 1, bb: 2 },
     *   { ee: 4, ff: 5 },
     *   { cc: 1, dd: 2 },
     * ];
     *
     * console.log(uniqueArray(strings)); // ['eee', 'aaa', 'bbb', 'ccc', 'ddd']
     * console.log(uniqueArray(objects)); // [{'aa': 1, 'bb': 2}, {'cc': 1, 'dd': 2}, {'ee': 4, 'ff': 5}]
     */
    getSliceArrayOfUnique(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }

        const firstElement = array[0];

        // 1. 處理物件陣列，且提供了 key
        if (_.isObject(firstElement) && key) {
            // 使用 Map 根據 key 去重，效率 O(N)
            const uniqueMap = new Map(array.map(item => [item[key], item]));
            return Array.from(uniqueMap.values());
        }
        // 2. 處理物件陣列，但未提供 key (或 key 無效)
        else if (_.isObject(firstElement)) {
            // 回退到 lodash 的深度比較，效率較低 O(N^2)
            console.warn("getSliceArrayOfUniqueOptimized: No key provided for object array, using potentially slow deep comparison.");
            return _.uniqWith(array, _.isEqual);
        }
        // 3. 處理基本型別陣列 (string, number, boolean, null, undefined, symbol)
        else {
            // 使用 Set 去重，效率 O(N)
            return Array.from(new Set(array));
        }
    }

    /**
     * Extract unique values of a specific key from an array of objects.
     * array = [ { valueOfType: 1 }, { valueOfType: 7, valueOfSubType: 6 }, { valueOfType: 1 } ];
       console.log(getUniqueValuesBy(array, 'valueOfType')); //[1, 7]
     *
     * @param {Array<Object>} array - The array of objects to process.
     * @param {string} key - The key to extract values from. Default is 'valueOfType'.
     * @returns {Array<any>} A deduplicated array of the extracted values.
     */
    getUniqueValuesBy(array, key = 'valueOfType') {
      return _.uniq(array.map(item => item[key]));
        }

     /**
      * ({key: 'color', label: '顏色', options: [  { value: 0, label: '紅' }, { value: 1, label: '白' }, { value: 2, label: '黑'}]},
      *  {key: 'size', label: '尺寸', options: [ { value: 0, label: 'S號' }, { value: 1, label: 'M號' }, { value: 2, label: 'L號' }]})
      *
      * [
      *   { trait: {color: 0, size: 0}, id: 'color_0_size_0', content: '紅｜S號' },
      *   { trait: {color: 0, size: 1}, id: 'color_0_size_1', content: '紅｜M號' },
      *   { trait: {color: 0, size: 2}, id: 'color_0_size_2', content: '紅｜L號' },
      *   { trait: {color: 1, size: 0}, id: 'color_1_size_0', content: '白｜S號' },
      *   { trait: {color: 1, size: 1}, id: 'color_1_size_1', content: '白｜M號' },
      *   { trait: {color: 1, size: 2}, id: 'color_1_size_2', content: '白｜L號' },
      * ]
      *
    /**
     * 生成所有組合並依照 value 遞增排序，並回傳指定格式
     * @param {Array} attributes - 屬性陣列
     * @returns {Array} - 格式化組合
     */
     generateCombinations(...attributes) {
        const keys = attributes.map(attr => attr.key); // 屬性順序
        const labelMap = _.keyBy(attributes, 'key');   // 用於 content 查 label

        // 把每個屬性的 options 提取成格式化陣列
        const optionArrays = attributes.map(attr =>
          attr.options.map(option => ({
              key: attr.key,
              value: option.value,
              label: option.label
          }))
        );

        // 計算笛卡兒積
        const cartesianProduct = _.reduce(optionArrays, (acc, curr) =>
            _.flatMap(acc, a => curr.map(b => [...a, b]))
          , [[]]);

        // 格式化每一筆組合
        const results = cartesianProduct.map(combination => {
            const trait = {};
            const idParts = [];
            const contentParts = [];

            for (const { key, value, label } of combination) {
                trait[key] = value;
                idParts.push(`${key}_${value}`);
                contentParts.push(`${label}`);
            }

            return {
                trait,
                id: idParts.join('_'),
                content: contentParts.join('｜')
            };
        });

        // 排序：依照屬性順序的 value 遞增（右邊 key 變化最快）
        return _.sortBy(results, item =>
          keys.map(key => item.trait[key])
        );
    }

    /**
     * 從路徑字串中擷取靜態片段（忽略以指定字元開頭的參數）
     * @param {string} path - 輸入的路徑字串
     * @param {string[]} rules - 要忽略的前綴符號規則，預設為 [':']
     * @returns {string[]} - 篩選後的靜態段落，例如 ['dionysus', 'variants']
     *
     * const samples = [
     *   '/dionysus/:pid/variants',
     *   './dionysus/*pid/variants/',
     *   '/shop/@category/:id'
     * ];
     * // 預設只忽略 ':'
     *
     * console.log(extractStaticSegments(samples[0])); // ['dionysus', 'variants']
     * // 忽略 ':' 與 '*'
     * console.log(extractStaticSegments(samples[1], [':', '*'])); // ['dionysus', 'variants']
     * // 忽略 ':' 與 '@'
     * console.log(extractStaticSegments(samples[2], [':', '@'])); // ['shop']
     *
     */
    extractStaticSegments(path, rules = [':']) {
        return path
          .trim()
          .replace(/^\.?\/*|\/*$/g, '') // 移除開頭 './' 或 '/'，結尾 '/'
          .split('/')
          .filter(segment =>
            segment &&
            !rules.some(rule => segment.startsWith(rule))
          );
    }


    /**
     * const array = [{ a: 1, b: 2, c: 3 }, { a: 1, b: 2, d: 4 }];
     * mutateRemoveKeys(array, ['b', 'c']);
     * console.log(array); // ➜ [ { a: 1 }, { a: 1, d: 4 } ]
     *
     * 移除指定 keys，並原地改動原始陣列
     * @param {Array<Object>} array - 要修改的原始 array
     * @param {Array<string>} keysToRemove - 要刪除的 key 清單
     */
     mutateRemoveKeys(array, keysToRemove) {
        _.forEach(array, (obj, index) => {
            const filtered = Object.fromEntries(
              Object.entries(obj).filter(([key]) => !keysToRemove.includes(key))
            );
            // 原地替換每個 object 的 key
            Object.keys(obj).forEach(k => delete obj[k]);
            Object.assign(obj, filtered);
        });
    }

    /**
     * const array = [{ a: 1, b: 2, c: 3 }, { a: 1, b: 2, d: 4 }];
     * const newArray = removeKeysFromArrayObjects(array, ['b', 'c']);
     *
     * console.log(newArray); // ➜ [ { a: 1 }, { a: 1, d: 4 } ]
     * console.log(array);    // ➜ 原始 array 不變
     *
     * 回傳一個新的 array，移除每個物件中的指定 keys
     * @param {Array<Object>} array - 原始資料陣列
     * @param {Array<string>} keysToRemove - 要移除的 key 名稱陣列
     * @returns {Array<Object>} - 新的 array（不改變原本的 array）
     */
    removeKeysFromArrayObjects(array, keysToRemove) {
        return _.map(array, obj =>
          Object.fromEntries(
            Object.entries(obj).filter(([key]) => !keysToRemove.includes(key))
          )
        );
    }


    /**
     * 將過長的文字裁切為「前段......後段」格式
     * @param {string} originalText - 原始文字內容
     * @param {number} maxLength - 最終輸出不得超過的總字數（含省略號）
     * @returns {string} - 處理後的顯示文字
     */
    formatTextWithEllipsis(originalText, maxLength) {
        const ellipsis = "......";
        const ellipsisLength = ellipsis.length;

        // 若文字本身就短，無需裁切
        if (_.size(originalText) <= maxLength) return originalText;

        // 若 maxLength 小於 ellipsis 自身長度，回傳空字串或提示錯誤
        if (maxLength <= ellipsisLength) return "";

        // 可用來切出前後字串的總長度
        const remainingLength = maxLength - ellipsisLength;

        // 前後平均切一半（如果是奇數則前段較短）
        const frontLength = Math.floor(remainingLength / 2);
        const backLength = remainingLength - frontLength;

        const front = _.truncate(originalText, {
            length: frontLength,
            omission: ""
        });

        const back = _.takeRight(originalText, backLength).join("");

        return `${front}${ellipsis}${back}`;
    }

    /**
     * const obj = {
     *   a: { idOfBooze: 1, checked: true },
     *   b: { idOfBooze: 2, checked: false },
     *   c: { idOfBooze: 3 }, // 無 checked
     *   d: { idOfBooze: 4, checked: true }
     * };
     *
     * getObjectBy(obj) ==> { b: { idOfBooze: 2, checked: false }, c: { idOfBooze: 3 } }
     *
     * 從物件中依條件過濾出符合條件的 key-value pair
     * @param {Object} obj - 原始物件
     * @param {Function} predict - 過濾條件函式，預設為 each.used === true
     * @returns {Object} - 符合條件的新物件
     */
    getObjectBy(obj,predict = (attr) => attr.checked !== true) {
        return _.fromPairs(
          _.toPairs(obj).filter(([_, value]) => predict(value))
        );
    }

    /**
     *
     const array = [
     { serial: 'A023' },
     { serial: 'Z001' },
     { serial: 'C002' },
     { serial: 'G123' },
     { serial: 'A001' },
     { serial: 'A999' }
     ];

     mutateBy(array, (item) => {
     const serial = item.serial;
     const match = serial.match(/^([A-Z]+)(\d+)$/i);
     const [letter, number] = match ? [match[1], parseInt(match[2], 10)] : [serial, 0];
     return [letter, number]; // 多層排序：先字母，再數字
     });
     *
     * [ { serial: 'A001' }, { serial: 'A023' }, { serial: 'A999' }, { serial: 'C002' }, { serial: 'G123' }, { serial: 'Z001' } ]
     *
     *
     * 通用的排序變異工具：依照 predict 提供的排序 key 對 array 進行原地排序(mutated)
     *
     * @param {Array} array - 要排序的陣列（會就地變異）
     * @param {Function} predict - 回傳排序 key（可以是陣列以支援多層排序）
     */
    mutateBy(array, predict = (item) => item) {
        const sorted = _.sortBy(array, predict);
        array.splice(0, array.length, ...sorted);
    }

    /**
     *
     * const array1 = ['a', 'b', 'c', null];
     * const array2 = ['b', '', 'd'];
     * const array3 = ['c', undefined, 'e'];
     * const result = findUniqueStrings(array1, array2, array3);
     * console.log(result); // ['a', 'd', 'e']
     *
     **/
    findUniqueStrings(...arrays) {
        const allStrings = _.flatten(arrays);
        const grouped = _.countBy(allStrings);

        return _.chain(grouped)
          .pickBy(count => count === 1)
          .keys()
          .compact() // 移除 null、undefined、''、0、false、NaN
          .value();
    }

    /**
     * 減少不必要的{}
     * 例如 array.map(each => {return {key,value}})
     **/
    getObjectOfSpecifyKey(value, key) {
        const object = {};
        object[key] = value;
        return object;
    }

    /**
     *
     * 參考第一個陣列（array1）；
     * 回傳所有其他陣列中：
     * 不在第一個陣列中的字串；
     * 只出現一次的字串（全體中只出現一次）；
     *
     * const array1 = ['apple', 'banana', 'cherry'];
     * const array2 = ['banana', '', 'date', null];
     * const array3 = ['apple', undefined, 'elderberry'];
     * const array4 = ['grape', '', 'honeydew', 'grape'];
     * const result = findUniqueNonReferenceStrings(array1, array2, array3, array4);
     * console.log(result); // ['date', 'elderberry', 'honeydew']
     *
     */
    findUniqueNonReferenceStrings(...arrays) {
        if (arrays.length === 0) return [];

        const [reference, ...rest] = arrays;
        const allExceptRef = _.flatten(rest);
        const counted = _.countBy(allExceptRef);

        return _.chain(counted)
          .pickBy((count, str) => count === 1 && !reference.includes(str))
          .keys()
          .compact() // 過濾掉 null, undefined, '' 等 falsy 值
          .value();
    }

    /**
     * 直接修改原本 array，將 object 移動到指定 index
     * @param {Array} array - 要修改的陣列
     * @param {Object} object - 要移動的物件
     * @param {number} index - 目標位置（預設為 0）
     * @returns {Array} 修改後的原陣列（in-place）
     */
    mutateIndexOfArrayItem = (array, object, index = 0) => {
        if (!Array.isArray(array) || !_.isObject(object)) return array;

        const currentIndex = _.findIndex(array, item => _.isEqual(item, object));
        if (currentIndex === -1) return array; // 找不到物件，直接回傳

        array.splice(currentIndex, 1); // 先移除原位置
        const targetIndex = _.clamp(index, 0, array.length);
        array.splice(targetIndex, 0, object); // 插入到新位置

        return array;
    };

    /**
     * 將指定 object 移動到 array 中的指定位置
     * @param {Array} array - 要操作的陣列
     * @param {Object} object - 要移動的目標物件
     * @param {number} index - 新的位置（預設為 0）
     * @returns {Array} 新的陣列
     */
    getArrayOfModifyObject2Index = (array, object, index = 0) => {
        if (!Array.isArray(array) || !_.isObject(object)) return array;

        const cloned = _.cloneDeep(array); // 深拷貝以避免原陣列被 mutate
        const currentIndex = _.findIndex(cloned, item => _.isEqual(item, object));
        if (currentIndex === -1) return array; // 沒找到物件就回傳原陣列

        // 移除原來位置
        cloned.splice(currentIndex, 1);

        // 插入到指定位置（修正越界 index）
        const targetIndex = _.clamp(index, 0, cloned.length);
        cloned.splice(targetIndex, 0, object);

        return cloned;
    };

     /**
     * const input = [
     *   { value: 'xx0132', label: 'A款' },
     *   { value: 'y1y123', label: 'B款' },
     *   { value: 'yy0123', label: 'C款' },
     *   { value: '', label: 'D款' },
     *   { value: null, label: 'E款' },
     *   { value: undefined, label: 'F款' },
     * ]
     *
     * const output = getArrayOfFillMissingValues(input)
     * console.log(output)
     * */
    getArrayOfFillMissingValues(array) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        const generateRandomValue = () =>
          _.times(6, () => _.sample(charset)).join('');

        const usedValues = new Set(array.map(item => item.value).filter(Boolean));

        return array.map(item => {
            if (_.isEmpty(item.value)) {
                let newValue;
                do {
                    newValue = generateRandomValue();
                } while (usedValues.has(newValue));

                usedValues.add(newValue);
                return { ...item, value: newValue };
            }
            return item;
        });
    }

    /**
     * 判斷是否為 Firestore 自動產生的 Document ID
     * @param {string} id - 欲檢查的字串
     * @returns {boolean}
     *
     * isFirestoreAutoId('Ab3dEFghiJKLmnPQrStu'); // ✅ true
     * isFirestoreAutoId('1234567890abcdefghij'); // ✅ true
     * isFirestoreAutoId('a-b-c-d-e-f-g-h-i-j');  // ❌ false（有非法字元）
     * isFirestoreAutoId('shortId');              // ❌ false（長度錯誤）
     * isFirestoreAutoId(null);                   // ❌ false（不是字串）
     */
    isFirestoreAutoId(id) {
        return _.isString(id) &&
          id.length === 20 &&
          /^[A-Za-z0-9]{20}$/.test(id);
    }

    /**
     * const origin = [
     *   { label: 'aa', value: 1203 },
     *   { label: 'cc', value: 1204 },
     *   { label: 'gg', value: 2 }
     * ];
     *
     * const latest = ['aa', 'bb', 'aa', 'dd'];
     * console.log(generateLabelValuePairsWithOrigin(origin, latest));
     * [
     *   { label: 'aa', value: 1203 },        // 來自 origin
     *   { label: 'bb', value: 843910 },      // 隨機唯一值
     *   { label: 'dd', value: 692384 }       // 隨機唯一值
     * ]
     *
     * 根據 latest 字串陣列建立 label/value 物件陣列。
     * 若 label 存在於 origin 中，則沿用 origin 的 value；
     * 若 label 不存在，則產生唯一隨機數值作為 value（value 不可重複）。
     *
     * @param {Array<{label: string, value: number}>} origin - 原始資料來源，包含已知 label 與對應的 value。
     * @param {Array<string>} latest - 最新輸入的 label 陣列，可能有重複或新值。
     * @returns {Array<{label: string, value: number}>} - 轉換完成的唯一 label/value 陣列。
     */
     generateLabelValuePairsWithOrigin = (
      origin = [
          { label: 'aa', value: 1203 },
          { label: 'cc', value: 1204 },
          { label: 'gg', value: 2 }
      ],
      latest = ['aa', 'bb']
    ) => {
        // 建立已使用過的 value 集合，避免重複
        const usedValues = new Set(origin.map(o => o.value));

        // 處理 latest label 清單
        return _.chain(latest)
          .uniq() // 1. 移除重複的 label（只保留唯一值）
          .map(label => {
              // 2. 嘗試從 origin 找出是否已存在該 label
              const originItem = _.find(origin, { label });

              if (originItem) {
                  // 3. 若存在，直接使用 origin 中的 value
                  return { label, value: originItem.value };
              }

              // 4. 若不存在，產生一個不重複的隨機 value
              let value;
              do {
                  // Firestore 可接受的整數範圍（可調整範圍）
                  value = _.random(2, 999999);
              } while (usedValues.has(value)); // 確保 value 唯一

              // 5. 記錄該值為已使用，避免後續重複
              usedValues.add(value);

              // 6. 回傳新的物件
              return { label, value };
          })
          .value(); // 7. 輸出處理完成的物件陣列
    };

    /**
     * 比對 values 是否出現在 sourceArray 的指定欄位中，並標記 flagKey 欄位
     *
     * @param {Array} values - 要比對的值陣列，例如: [1, 3]
     * @param {Array} sourceArray - 要處理的物件陣列
     * @param {string} [valueKey='value'] - 要比對的欄位名稱，預設為 'value'
     * @param {string} [flagKey='belong'] - 回傳中標記的欄位名稱，預設為 'belong'
     * @returns {Array} 處理後的陣列
     *           const B = [
     *               { value: 1, label: 'hi' },
     *               { value: 2, label: 'hii' },
     *               { value: 3, label: 'hiii' }
     *           ];
     *           console.log(utiller.getItemsOfMarkMatching( B,[1]))
     *           [
     *            { value: 1, label: 'hi', belong: true },
     *            { value: 2, label: 'hii', belong: false },
     *            { value: 3, label: 'hiii', belong: false }
     *          ]
     **/
    getItemsOfMarkMatching = (
      sourceArray= [],
      values= [],
      valueKey = 'value',
      flagKey = 'belong'
    ) => {
        const valuesSet = new Set(values); // 使用 Set 提高效能
        return _.map(sourceArray, (item) => ({
            ...item,
            [flagKey]: valuesSet.has(item[valueKey]),
        }));
    };

    /**
     * 將多維屬性陣列進行排列組合，輸出為組合 label 和 value。
     * @param {Array<Array<{label: string, value: string}>>} arrays - 多個陣列，每個陣列包含 {label, value}
     * @param {string} labelSeparator - 標籤用的分隔符號（預設為 '｜'）
     * @param {string} valueSeparator - 值用的分隔符號（預設為 '-'）
     * @returns {Array<{label: string, value: string}>}
     *
     * const arrays = [
     *   [
     *     { label: '紅', value: '1b' },
     *     { label: '黑', value: 'ca' }
     *   ],
     *   [
     *     { label: 'M號', value: 'f2' },
     *     { label: 'L號', value: 'q5' }
     *   ],
     *   [
     *     { label: '短袖', value: 's1' },
     *     { label: '長袖', value: 's2' }
     *   ]
     * ];
     * output
     * [
     *   { label: '紅｜M號｜短袖', value: '1b-f2-s1' },
     *   { label: '紅｜M號｜長袖', value: '1b-f2-s2' },
     *   { label: '紅｜L號｜短袖', value: '1b-q5-s1' },
     *   { label: '紅｜L號｜長袖', value: '1b-q5-s2' },
     *   { label: '黑｜M號｜短袖', value: 'ca-f2-s1' },
     *   { label: '黑｜M號｜長袖', value: 'ca-f2-s2' },
     *   { label: '黑｜L號｜短袖', value: 'ca-q5-s1' },
     *   { label: '黑｜L號｜長袖', value: 'ca-q5-s2' }
     * ]     *
     */
    /**
     * 產生排列組合（容忍空陣列，將非空單一陣列視為結果）
     * @param {Array<Array<{label: string, value: string}>>} arrays
     * @param {string} labelSeparator
     * @param {string} valueSeparator
     * @returns {Array<{label: string, value: string}>}
     */
    generateVariants = (arrays, labelSeparator = '｜', valueSeparator = '-') => {
        // 過濾掉空陣列
        const nonEmptyArrays = arrays.filter(arr => arr.length > 0);

        if (nonEmptyArrays.length === 0) return [];

        if (nonEmptyArrays.length === 1) {
            // 若只有一個非空陣列，回傳它（每項轉為 {label, value} 格式）
            return nonEmptyArrays[0].map(item => ({
                label: item.label,
                value: item.value
            }));
        }

        const combinations = _.reduce(
          nonEmptyArrays,
          (acc, curr) => _.flatMap(acc, a => curr.map(b => [...a, b])),
          [[]]
        );

        return combinations.map(comb => ({
            label: comb.map(item => item.label).join(labelSeparator),
            value: comb.map(item => item.value).join(valueSeparator)
        }));
    };

    /**
     * 對物件陣列中的 key 進行重新命名
     * @param {Array<Object>} arr - 原始資料陣列
     * @param  {...[string, string]} keyMappings - key 對應對照，例如 ['label', 'labelOfVariant']
     * @returns {Array<Object>}
     *
     * const originalVariants = [
     *   { label: '紅｜M號', value: '1b-f2' },
     *   { label: '紅｜L號', value: '1b-q5' }
     * ];
     *
     * renameKeysInArray(
     *   originalVariants,
     *   ['label', 'labelOfVariant'],
     *   ['value', 'valueOfVariant']
     * );
     *
     * outputs:
     *     [
     *       { labelOfVariant: '紅｜M號', valueOfVariant: '1b-f2' },
     *       { labelOfVariant: '紅｜L號', valueOfVariant: '1b-q5' }
     *     ]
     *
     */
    renameKeysInArray = (arr, ...keyMappings) => {
        const mapping = Object.fromEntries(keyMappings);
        return arr.map(item =>
          _.mapKeys(item, (value, key) => mapping[key] || key)
        );
    };

    /**
     * 將 array2 的對應項目合併到 array1 中（支援巢狀 idKey 路徑）
     * @param {Array<Object>} array1
     * @param {Array<Object>} array2
     * @param {string} idKey - 用來比對的 key（可為巢狀路徑，例如 'meta.id'）
     * @returns {Array<Object>} - 合併後的 array1
     *
     * const array1 = [
     *   { meta: { id: 'a1' }, name: 'Red' },
     *   { meta: { id: 'b2' }, name: 'Black' }
     * ];
     *
     * const array2 = [
     *   { meta: { id: 'a1' }, price: 200 },
     *   { meta: { id: 'b2' }, name: 'Black Special' }
     * ];
     *
     * const result = mergeById(array1, array2, 'meta.id');
     * console.log(result);
     */
    getArrayOfMergeBySpecificId = (array1, array2, idKey = 'id') => {
        if (!Array.isArray(array2)) return array1;
        const map2 = _.keyBy(array2, item => _.get(item, idKey));

        return array1.map(item => {
            const id = _.get(item, idKey);
            const match = map2[id];
            return match ? _.merge({}, item, match) : item;
        });
    };


}

if (configerer.DEBUG_MODE) {
    (async () => {
          // const utiller = new Utiller();
          //
          // const input = [
          //     { value: "", label: "A款" },
          //     { value: "", label: "B款" },
          //     { value: "", label: "C款" },
          //     { value: "", label: "D款" },
          //     { value: null, label: "E款" },
          //     { value: undefined, label: "F款" }
          // ];
          // const output = utiller.getArrayOfFillMissingValues(input);
          // console.log(output);
          //     const array1 = ['黑色', '綠色']
          //     const array2 = ['S', 'M']
          //     const array3 = ['長袖', '短袖']
          //     console.log(utiller.generateUidCombinations([array1,[]]));
              // console.log(utiller.decodeFromUid('6buR6ImyIHwgUyB8IOmVt-iilg'));
            // console.log(utiller.extractStaticSegments('/dionysus'));
            // const result = utiller.generateCombinations({key: 'color', label: '顏色', options: [  { value: 0, label: '紅' }, { value: 1, label: '白' }, { value: 2, label: '黑'}]},
            //   {key: 'size', label: '尺寸', options: [ { value: 0, label: 'S號' }, { value: 1, label: 'M號' }, { value: 2, label: 'L號' }]})
            // console.log(result)
            // const array = [ { valueOfType: 1 }, { valueOfType: 7, valueOfSubType: 6 }, { valueOfType: 1 } ];
            // console.log(utiller.getUniqueValuesBy(array, 'valueOfType')); //[1, 7]
            // const stringOfEncrypt = utiller.getEncryptStringV2('i am david');
            // console.log(`完成encrypt ==> `, stringOfEncrypt);
            // const answer = utiller.getDecryptStringV2(stringOfEncrypt);
            // console.log(`完成decrypt ==> `, answer);
            // const option = {id:1,photo:''}
            // const choice = {id:2, photo:'url'}
            // console.log(utiller.getSpecifyObjectBy([option.photo,choice.photo], _.isEmpty))
            // console.log(utiller.findLowestValue([{ price: 10 }, { price: 120 }, { price: 230 }]))
            // console.log(utiller.findHighestValue([{ price: 10 }, { price: 120 }, { price: 230 }]))
            // console.log(utiller.getStringOfValueRange([{ price: 10 }, { price: 120 }, { price: 230 }]))
            // console.log(utiller.getStringOfCalculateClassTime(utiller.convertDateToTimestamp('2024-09-15'),utiller.convertDateToTimestamp('2024-10-15'),60))
            // console.log(utiller.isOverSpecificAge('2000-01-05'))
            // console.log(utiller.getRandomCount());
            // console.log(utiller.getObject('dfsdf',232));
            // console.log(utiller.getStringOfYearADConvertToMinguoYear(2023,true));
            // console.log(utiller.getStringOfNormalize(-1234556,' ',false));
            // console.log(utiller.getSimpleTimeFormat());
            // console.log(utiller.getBooleanOfNormalize(-5,'default'))
            // const array = [3, 4, 5];
            // utiller.insertToArray(array, 999, 'QQ', 'WW');
            // console.log(array);
            // const array1 = [1, 2, 3, 4, 5];
            // const array2 = [3, 4, 5, 6, 7];
            // console.log(utiller.getArrayOfInteraction(array1, array2))
            // console.log(utiller.getStringOfNormalize(undefined, 'love'));
            // console.log(CryptoJS.SHA256('hashkey%3d5294y06jbispm5x9%26david%3d918%26hashiv%3dv77hokgq4kwxnnis').toString(CryptoJS.enc.Hex))
            // console.log(utiller.getSliceArrayOfSpecificIndexes(['a','v','c','d'], 4,2));
            // const aaa = {};
            // utiller.appendMapOfKeyArray(aaa, 'a', 11);
            // utiller.appendMapOfKeyArray(aaa, 'c', 13);
            // utiller.appendMapOfKeyArray(aaa, 'a', 23);
            // utiller.appendMapOfKeyArray(aaa, 'c', 'vsdd')
            // utiller.appendMapOfKeyArray(aaa, 'a', 'sd');
            // console.log(utiller.getECPayCheckMacValue('30'));
            // console.log(utiller.getTailStringSplitBy('325/2/32/1','/'))
            // const obj = {time :undefined,name: 'david'};
            // utiller.removeAttributeBy(obj);
            // console.log(obj);
            // console.log(utiller.getECPayCurrentTimeFormat(utiller.getTimeStampWithConditions({days: -1})))

            // nsertToArray = (array, _index, ...item) => {
            //     if (_.isEmpty(array)) {
            //         array.push(...item)
            //     } else if (_index > _.size(array) - 1) {
            //         throw new ERROR(9999, `4654361321 index is large than array size`)
            //     } else if (_index === 0) {
            //         /** push to head */
            //         const entity = _.slice(array, 0, array.length);
            //         array.length = 0
            //         array.push(...item, ...entity);
            //     } else if (_index === _.size(array) - 1) {
            //         /** push to tail */
            //         array.push(...item);
            //     } else {
            //         _index = _index + 1;
            //         /** 植樹問題拔 我想 */
            //         const initial = _.slice(array, 0, _index);
            //         const end = _.slice(array, _index, array.length);
            //         const combine = [...initial, ...item, ...end];
            //         array.length = 0;
            //         array.push(...combine);
            //     }
            // }
        }
    )();
}
export default Utiller;
