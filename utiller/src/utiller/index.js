import CryptoJS from "crypto-js";
import { configerer } from "configerer";
import ERROR from "../exceptioner";
import { v4 } from "uuid";
import { parse } from "node-html-parser";


/**
 * dayjs-config (放在檔案最上方)
 */
import dayjs from 'dayjs';

// 1. 載入語系
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/en';

// 2. 載入插件
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

// 3. 擴充插件
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

// 4. 設定預設語系
dayjs.locale('zh-tw');

String.format = function() {
    let param = [];
    for (let i = 0, l = arguments.length; i < l; i++) {
        param.push(arguments[i]);
    }
    let statement = param[0]; // get the first element(the original statement)
    param.shift(); // remove the first element from array
    return statement.replace(/\{(\d+)\}/g, function(m, n) {
        return param[n];
    });
}

/**
 * npm_module之後每三個月要更新Granular Token
 * 到這裡申請新的token => https://www.npmjs.com/settings/davidtu/tokens/
 * vim ~/.npmrc
 * 更新=> //registry.npmjs.org/:_authToken=${npm_7a9n_xxxxxxxx} <-新token
 * npm publish --dry-run
 * 如果沒報錯 → Token 已生效，可以繼續 deploy。
 */
class Utiller {

    mapOfIdNTimeoutId = {}

    find(array, predicate) {
        if (!Array.isArray(array)) return undefined;
        for (let i = 0; i < array.length; i++) {
            if (predicate(array[i], i, array)) {
                return array[i];
            }
        }
        return undefined;
    }

    pullAt(array, indexes) {
        if (!Array.isArray(array)) return [];
        const indexArr = Array.isArray(indexes) ? indexes : Array.prototype.slice.call(arguments, 1).flat();
        const removed = [];
        const sortedIndexes = [...new Set(indexArr)].sort((a, b) => b - a);

        for (const index of sortedIndexes) {
            if (index >= 0 && index < array.length) {
                const extracted = array.splice(index, 1)[0];
                const originalPos = indexArr.indexOf(index);
                removed[originalPos] = extracted;
            }
        }
        return removed.filter(item => item !== undefined);
    }

    iteratee(value) {
        if (typeof value === 'function') return value;
        if (value == null) return (v) => v;
        if (typeof value === 'string' || typeof value === 'number') {
            return (item) => item == null ? undefined : item[value];
        }
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return (item) => item != null && this.isEqual(item[value[0]], value[1]);
            }
            return (item) => {
                if (item == null) return false;
                for (const key in value) {
                    if (!this.isEqual(item[key], value[key])) return false;
                }
                return true;
            };
        }
        return (v) => v;
    }

    /**
     * 迭代陣列或物件，對每個元素執行 iteratee
     */
    each(collection, iteratee) {
        if (collection == null) return collection;
        const func = this.iteratee(iteratee);
        if (Array.isArray(collection) || typeof collection === 'string') {
            for (let i = 0; i < collection.length; i++) {
                if (func(collection[i], i, collection) === false) break;
            }
        } else {
            const keys = Object.keys(collection);
            for (let i = 0; i < keys.length; i++) {
                if (func(collection[keys[i]], keys[i], collection) === false) break;
            }
        }
        return collection;
    }

    /**
     * 過濾集合，返回 predicate 為 truthy 的元素陣列
     */
    filter(collection, predicate) {
        const result = [];
        if (collection == null) return result;
        const func = this.iteratee(predicate);
        this.each(collection, (value, index, coll) => {
            if (func(value, index, coll)) {
                result.push(value);
            }
        });
        return result;
    }

    /**
     * 獲取陣列的第一個元素
     */
    head(array) {
        return (array != null && array.length) ? array[0] : undefined;
    }

    /**
     * 找出目標值在陣列中的索引，找不到則回傳 -1
     */
    indexOf(array, value, fromIndex = 0) {
        if (array == null) return -1;
        const length = array.length;
        if (!length) return -1;
        let index = fromIndex < 0 ? Math.max(length + fromIndex, 0) : fromIndex;
        for (; index < length; index++) {
            if (array[index] === value || (array[index] !== array[index] && value !== value)) {
                return index;
            }
        }
        return -1;
    }

    /**
     * 檢查值是否為 undefined
     */
    isUndefined(value) {
        return value === undefined;
    }

    /**
     * 獲取陣列的最後一個元素
     */
    last(array) {
        const length = array == null ? 0 : array.length;
        return length ? array[length - 1] : undefined;
    }

    /**
     * 將字串的首字母轉換為小寫
     */
    lowerFirst(string) {
        const str = string == null ? '' : String(string);
        return str ? str.charAt(0).toLowerCase() + str.slice(1) : '';
    }

    /**
     * 創建一個陣列，值為原集合元素經 iteratee 處理後的結果
     */
    map(collection, iteratee) {
        const result = [];
        if (collection == null) return result;
        const func = this.iteratee(iteratee);
        this.each(collection, (value, index, coll) => {
            result.push(func(value, index, coll));
        });
        return result;
    }

    /**
     * 根據指定的屬性與排序方向排序集合
     */
    orderBy(collection, iteratees = [this.iteratee()], orders = []) {
        if (collection == null) return [];
        const arr = Array.isArray(collection) ? collection : Object.values(collection);
        const funcs = (Array.isArray(iteratees) ? iteratees : [iteratees]).map(i => this.iteratee(i));
        const dirs = (Array.isArray(orders) ? orders : [orders]).map(o => String(o).toLowerCase() === 'desc' ? -1 : 1);

        return [...arr].sort((a, b) => {
            for (let i = 0; i < funcs.length; i++) {
                const valA = funcs[i](a);
                const valB = funcs[i](b);
                if (valA > valB) return dirs[i] || 1;
                if (valA < valB) return -(dirs[i] || 1);
            }
            return 0;
        });
    }

    /**
     * 移除陣列中 predicate 回傳 truthy 的元素，並回傳被移除元素的陣列 (會改變原陣列)
     */
    remove(array, predicate) {
        const result = [];
        if (!Array.isArray(array)) return result;
        const func = this.iteratee(predicate);
        let i = 0;
        while (i < array.length) {
            if (func(array[i], i, array)) {
                result.push(array.splice(i, 1)[0]);
            } else {
                i++;
            }
        }
        return result;
    }

    /**
     * 獲取集合的長度或物件的可枚舉屬性數量
     */
    size(collection) {
        if (collection == null) return 0;
        if (typeof collection.length === 'number' && typeof collection !== 'function') {
            return collection.length;
        }
        if (typeof collection === 'object') {
            return Object.keys(collection).length;
        }
        return 0;
    }

    /**
     * 將字串整體轉換為大寫
     */
    toUpper(string) {
        const str = string == null ? '' : String(string);
        return str.toUpperCase();
    }

    /**
     * 創建一個剔除掉所有指定值的新陣列
     */
    without(array, ...values) {
        if (!Array.isArray(array)) return [];
        return array.filter(value => {
            for (let i = 0; i < values.length; i++) {
                if (value === values[i] || (value !== value && values[i] !== values[i])) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * upperFirst
     * 將字串的第一個字元轉換為大寫（其餘字元保持原樣）
     * @param {string} str
     * @returns {string}
     */
    upperFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * camelCase
     * 將字串轉換為小駝峰式命名 (camelCase)
     * 支援轉換空格、底線 (_) 與橫線 (-)
     * @param {string} str
     * @returns {string}
     */
    camelCase(str) {
        if (!str) return '';
        // 利用正規表達式拆解單字，支援駝峰、底線、橫線與連續大寫字等拆分
        const words = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
        if (!words) return '';

        return words
            .map((word, index) => {
                const lower = word.toLowerCase();
                // 第一個單字全小寫，後續單字首字母大寫
                return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
            })
            .join('');
    }

    /**
     * dropWhile
     * 從陣列前方開始檢查，當 predicate 回傳 true 時捨棄元素，
     * 直到遇到第一個回傳 false 的元素，然後回傳剩下的新陣列。
     * @param {Array} array
     * @param {Function} predicate
     * @returns {Array}
     */
    dropWhile(array, predicate) {
        if (!Array.isArray(array)) return [];
        let i = 0;
        while (i < array.length && predicate(array[i], i, array)) {
            i++;
        }
        return array.slice(i);
    }

    /**
     * dropRightWhile
     * 從陣列後方開始檢查，當 predicate 回傳 true 時捨棄元素，
     * 直到遇到第一個回傳 false 的元素，然後回傳剩下的新陣列。
     * @param {Array} array
     * @param {Function} predicate
     * @returns {Array}
     */
    dropRightWhile(array, predicate) {
        if (!Array.isArray(array)) return [];
        let i = array.length - 1;
        while (i >= 0 && predicate(array[i], i, array)) {
            i--;
        }
        return array.slice(0, i + 1);
    }

    /**
     * removeMutate (對應 lodash 的 _.remove)
     * 會改變原始陣列 (Mutate)！移除所有 predicate 回傳 true 的元素，
     * 並回傳一個包含所有被移除元素的新陣列。
     * @param {Array} array
     * @param {Function} predicate
     * @returns {Array} 被移除的元素陣列
     */
    removeMutate(array, predicate) {
        if (!Array.isArray(array)) return [];

        const removed = [];
        const indexesToRemove = [];

        // 第一步：先找出所有符合條件的元素與索引
        array.forEach((value, index) => {
            if (predicate(value, index, array)) {
                removed.push(value);
                indexesToRemove.push(index);
            }
        });

        // 第二步：從後往前刪除，避免前面的 splice 改變了後方元素的 index
        for (let i = indexesToRemove.length - 1; i >= 0; i--) {
            array.splice(indexesToRemove[i], 1);
        }

        return removed;
    }

    isBoolean(value) {
        // 1. 處理基本型別的布林值 (true 或 false)
        if (value === true || value === false) {
            return true;
        }

        // 2. 處理布林物件 (例如：new Boolean(false))
        return (
            value !== null &&
            typeof value === 'object' &&
            Object.prototype.toString.call(value) === '[object Boolean]'
        );
    }

    isObject(value) {
        // 在 JavaScript 中 typeof null 會是 'object'，所以必須先排除 null
        if (value === null) {
            return false;
        }

        // 只要是物件型態或是函式，在 Lodash 中都算 Object
        const type = typeof value;
        return type === 'object' || type === 'function';
    }

    toString(value) {
        // 1. null 或 undefined 轉換為空字串
        if (value == null) {
            return '';
        }

        // 2. 如果已經是字串，直接回傳
        if (typeof value === 'string') {
            return value;
        }

        // 3. 處理陣列：將陣列內的值遞迴轉換，最後組合成逗號分隔的字串
        if (Array.isArray(value)) {
            // 注意這裡使用 this.toString 來呼叫 Class 內的 method
            return value.map(other => this.toString(other)).join(',');
        }

        // 4. 處理 Symbol：原生的隱式轉換會報錯，必須明確呼叫 toString()
        if (typeof value === 'symbol') {
            return value.toString();
        }

        // 5. 轉換為字串
        const result = `${value}`;

        // 6. 處理 -0 邊界情況 (保留 '-0')
        return (result === '0' && (1 / value) === -Infinity) ? '-0' : result;
    }

    toNumber(value) {
        // 1. 如果已經是數字，直接回傳
        if (typeof value === 'number') {
            return value;
        }

        // 2. 處理 Symbol：安全回傳 NaN，避免報錯
        if (typeof value === 'symbol') {
            return NaN;
        }

        // 3. 處理物件：優先呼叫物件本身的 valueOf 方法取得原始值
        if (value !== null && typeof value === 'object') {
            const other = typeof value.valueOf === 'function' ? value.valueOf() : value;
            value = typeof other === 'object' ? `${other}` : other;
        }

        // 4. 處理字串：去除前後空白
        if (typeof value === 'string') {
            value = value.trim();
        }

        // 5. 最終轉換
        return Number(value);
    }

    isString(value) {
        // 1. 處理基本型別的字串 (絕大多數情況)
        if (typeof value === 'string') {
            return true;
        }

        // 2. 處理字串物件 (例如：new String('abc'))
        // 確保它是一個物件，且不是 null，並透過 toString 檢查內部標籤
        return (
            value !== null &&
            typeof value === 'object' &&
            Object.prototype.toString.call(value) === '[object String]'
        );
    }

    isNumber(value) {
        // 1. 處理基本型別的數字 (包含 NaN、Infinity)
        if (typeof value === 'number') {
            return true;
        }

        // 2. 處理數字物件 wrapper (例如：new Number(123))
        // 確保它是一個物件，且不是 null，並透過 toString 檢查內部標籤
        return (
            value !== null &&
            typeof value === 'object' &&
            Object.prototype.toString.call(value) === '[object Number]'
        );
    }

    isFunction(value) {
        // 涵蓋一般函式、非同步函式、生成器與 Proxy 物件
        if (!value) return false;
        const tag = Object.prototype.toString.call(value);
        return (
            tag === '[object Function]' ||
            tag === '[object AsyncFunction]' ||
            tag === '[object GeneratorFunction]' ||
            tag === '[object Proxy]'
        );
    }

    isEmpty(value) {
        // null 或 undefined 視為 empty
        if (value == null) return true;

        // 陣列、字串或類陣列物件 (帶有 length 屬性)
        if (Array.isArray(value) || typeof value === 'string' || typeof value.splice === 'function') {
            return value.length === 0;
        }

        // Map 或 Set
        if (value instanceof Map || value instanceof Set) {
            return value.size === 0;
        }

        // 物件 (判斷是否擁有可枚舉的 key)
        if (typeof value === 'object') {
            return Object.keys(value).length === 0;
        }

        // 數字、布林值等基本型別在 Lodash 中 isEmpty 回傳 true
        return true;
    }

    isEqual(a, b) {
        // 1. 處理基本型別與相同參考的物件 (包含 +0 與 -0 的精準判斷)
        if (a === b) {
            return a !== 0 || 1 / a === 1 / b;
        }

        // 2. 處理 NaN (在 JavaScript 中 NaN !== NaN，但在 isEqual 應為 true)
        if (a !== a && b !== b) return true;

        // 3. 如果其中一個為 null 或不是物件（且上方沒有 return），代表兩者不同
        if (a == null || b == null || (typeof a !== 'object' && typeof b !== 'object')) {
            return false;
        }

        // 4. 確認建構類型是否相同 (例如 Date, RegExp 等)
        const typeA = Object.prototype.toString.call(a);
        const typeB = Object.prototype.toString.call(b);
        if (typeA !== typeB) return false;

        // 5. 處理特殊物件類型
        switch (typeA) {
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b; // 轉為數字比對時間戳或布林值
            case '[object Number]':
                return a === +a ? a === +b : a !== a && b !== b;
            case '[object String]':
            case '[object RegExp]':
                return a === String(b);
        }

        // 6. 處理陣列 (遞迴)
        if (Array.isArray(a)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.isEqual(a[i], b[i])) return false; // 注意這裡使用 this.isEqual 呼叫 Class 內的 method
            }
            return true;
        }

        // 7. 處理一般物件 (遞迴)
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;

        for (let i = 0; i < keysA.length; i++) {
            const key = keysA[i];
            // 確保 b 也有這個 key，且對應的 value 深度相等
            if (!Object.prototype.hasOwnProperty.call(b, key) || !this.isEqual(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Deep merge objects
     */
    merge(target, ...sources) {
        if (!sources.length) return target;

        // 內部遞迴函式，攜帶 WeakSet 來記錄已經訪問過的物件
        const mergeDeep = (target, source, visited = new WeakSet()) => {
            // 確保 source 是物件或陣列
            if (source === null || typeof source !== 'object') return target;

            // 防止循環引用 (Circular Reference) 造成的無限迴圈
            if (visited.has(source)) return target;
            visited.add(source);

            for (const key in source) {
                // 忽略原型鏈上的屬性
                if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

                const sourceVal = source[key];
                const targetVal = target[key];

                if (this.isPlainObject(sourceVal)) {
                    // 來源是物件：若目標不是純物件，則初始化為空物件
                    if (!this.isPlainObject(targetVal)) {
                        target[key] = {};
                    }
                    mergeDeep(target[key], sourceVal, visited);

                } else if (Array.isArray(sourceVal)) {
                    // 來源是陣列：若目標不是陣列，則初始化為空陣列
                    if (!Array.isArray(targetVal)) {
                        target[key] = [];
                    }
                    mergeDeep(target[key], sourceVal, visited);

                } else if (sourceVal !== undefined) {
                    // Lodash 行為：不處理 undefined，但允許 null、字串、數字等直接覆寫
                    target[key] = sourceVal;
                }
            }
            return target;
        };

        // 依序將所有 source 合併進 target
        for (const source of sources) {
            mergeDeep(target, source);
        }

        return target;
    }

    /**
     * Deep clone object
     */
    cloneDeep(value, cache = new WeakMap()) {
        // 1. 處理基本型別 (Primitive types)、null 與 Function
        // 注意：Lodash 對單純的 Function 預設回傳 {}，但實務上回傳原本的 Function 參考更實用。
        if (value === null || typeof value !== 'object') {
            return value;
        }

        // 2. 處理循環參考 (Circular references)
        // 如果這個物件已經被複製過，直接回傳快取中的複本
        if (cache.has(value)) {
            return cache.get(value);
        }

        // 3. 根據物件類型進行相應的處理
        const type = Object.prototype.toString.call(value);
        let clone;

        switch (type) {
            case '[object Date]':
                return new Date(value.getTime());

            case '[object RegExp]':
                clone = new RegExp(value.source, value.flags);
                clone.lastIndex = value.lastIndex; // 保留正則的執行狀態
                return clone;

            case '[object Map]':
                clone = new Map();
                cache.set(value, clone); // 先放入快取，再處理內部結構，防止循環參考
                value.forEach((val, key) => {
                    // Lodash 會對 Map 的 key 和 value 都進行深拷貝
                    clone.set(this.cloneDeep(key, cache), this.cloneDeep(val, cache));
                });
                return clone;

            case '[object Set]':
                clone = new Set();
                cache.set(value, clone);
                value.forEach((val) => {
                    clone.add(this.cloneDeep(val, cache));
                });
                return clone;

            case '[object Array]':
                clone = new Array(value.length);
                cache.set(value, clone);
                value.forEach((val, index) => {
                    clone[index] = this.cloneDeep(val, cache);
                });
                return clone;

            case '[object Object]':
                // Object.create(Object.getPrototypeOf(value)) 可以保留原本 Class 的原型鏈 (Prototype)
                clone = Object.create(Object.getPrototypeOf(value));
                cache.set(value, clone);

                // Reflect.ownKeys 可以同時取得一般的字串 key 與 Symbol key
                Reflect.ownKeys(value).forEach((key) => {
                    clone[key] = this.cloneDeep(value[key], cache);
                });
                return clone;

            default:
                // 對於無法深拷貝的特殊型別 (如 WeakMap, Window, HTML元素等)，直接回傳原值或空物件
                return value;
        }
    }

    isPlainObject(value) {
        // 1. 排除 null 和非物件型別
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        // 2. 排除陣列、Map、Set、Date 等原生非純物件 (Lodash 會先做這層基本過濾)
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            return false;
        }

        // 3. 取得物件的原型
        const proto = Object.getPrototypeOf(value);

        // 4. 支援 Object.create(null) 的情況
        if (proto === null) {
            return true;
        }

        // 5. 確保它的原型是最基礎的 Object 原型 (解決跨 iframe 問題)
        let baseProto = proto;
        while (Object.getPrototypeOf(baseProto) !== null) {
            baseProto = Object.getPrototypeOf(baseProto);
        }

        return proto === baseProto;
    }

    /**
     * 處理連續重複字串的合併
     * @param {string[]} arr - 輸入的字串陣列
     * @returns {string[]} - 傳回合併連續重複項後的新陣列
     * * @example
     * // 範例一
     * const input1 = ['abc', 'abc', 'c', 'abc'];
     * compactConsecutive(input1);
     * // 輸出 => ['abc', 'c', 'abc']
     * * @example
     * // 範例二
     * const input2 = ['aa', 'bb', 'bb', 'c', 'dd', 'dd', 'dd', 'dd', 'c'];
     * compactConsecutive(input2);
     * // 輸出 => ['aa', 'bb', 'c', 'dd', 'c']
     */
    compactConsecutive = (arr) => {
        // 1. 確保傳入參數為陣列，避免程式崩潰
        if (!Array.isArray(arr)) return [];

        // 2. 移除陣列中連續且重複的元素
        return arr.filter((v, i, a) => i === 0 || v !== a[i - 1]);
    };

    /**
     * 刪除物件裡面特別的屬性，預設是刪除value為undefined
     **/
    removeAttributeBy(object, predicate = (value) => value === undefined) {
        for (const key in object) {
            if (predicate(object[key])) {
                delete object[key];
            }
        }
    }

    /**
     * 組合 HTTP URL 路徑
     *
     * @param {...string|number} segments - URL 的各個部分
     * @returns {string} 組合後的完整 URL
     *
     * @example
     * joinUrl('https://aa.com/', '/avce/', '12313/', '/re')
     * // 返回: 'https://aa.com/avce/12313/re'
     */
    getUrlPath(...segments) {
        return segments
            .filter(segment => segment != null && segment !== '') // 排除 null/undefined/空字串
            .map(segment => String(segment).replace(/^\/+|\/+$/g, '')) // 轉字串並去頭尾斜線
            .filter(segment => segment !== '') // 再次過濾只剩下斜線被清空的情境
            .join('/')
            .replace(/^(https?):\/(?!\/)/, '$1://');
    }


    /**
     * 清洗並攤平陣列 (Clean & Flatten Array)
     * * 將嵌套陣列（Nested Array）攤平成一維純文字陣列，
     * 並移除所有無意義的項（如：[], '', null, undefined）。
     * @param {Array} strings - 原始輸入陣列
     * @returns {Array} 處理後的一維字串陣列
     * @example
     *  輸入： [["A"], [], undefined, null, '', ["B"]]
     * 輸出： ["A", "B"]
     *
     */
    getStringsOfFlatten(strings = []) {
        return strings.flat()
            .filter(item => {            // 2. 過濾：移除無意義內容
                return item !== null &&
                    item !== undefined &&
                    item !== '';
            });
    }

    getNumberOfNormalize(value, defaultValue = 0) {
        if (typeof value === 'number' && !Number.isNaN(value))
            return value;
        try {
            const force = Number(value)
            return (typeof force === 'number' && !Number.isNaN(force)) ? force : defaultValue;
        } catch (error) {
            this.appendError(`448561684561 ${error.message}`)
        }
        return defaultValue;
    }

    getStringOfNormalize(value, defaultValue = '', trim = false) {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'string') return trim ? value.trim() : value;

        try {
            const force = String(value);
            return force === '' ? defaultValue : (trim ? force.trim() : force);
        } catch (error) {
            this.appendError(`448616845453 ${error.message}`)
        }
        return defaultValue;
    }

    isValidVersionOfString(versionName) {
        if (this.isUndefinedNullEmpty(versionName)) {
            return false;
        }

        const numbers = versionName.split('.');
        for (const number of numbers) {
            const toNum = Number(number);
            if (!(typeof (toNum) === "number" && !Number.isNaN(toNum)) || isNaN(toNum))
                return false;
        }
        return true;
    }

    getSeparatorOfUnique() {
        return '།།';
    }


    /** 1.0.1 => 1.0.2 */
    getStringOfVersionIncrement(stringOfVersion, delta = 1) {
        const numbers = stringOfVersion.split('.').map((each) => Number(each));
        const last = numbers.length - 1;
        numbers[last] = numbers[last] + delta;
        return numbers.join('.');
    }

    /**
     * 設定全域的 Day.js 語系。
     * 注意：在使用此函式切換語系前，必須先手動 import 對應的語系檔。
     * * @sample
     * setLocaleOfDate('zh-tw'); // 切換為繁體中文
     * console.log(dayjs().format('dddd')); // "星期一"
     * * @param {string} [locale='en'] - 語系代碼，常用：'zh-tw' (繁體), 'en' (英文)。
     * @returns {void}
     */
    setLocaleOfDate(locale = 'en') {
        /**
         * Day.js 語系代碼通常為小寫（如 zh-tw）。
         * 此處將參數轉為小寫以確保相容性。
         */
        dayjs.locale(locale.toLowerCase());
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
        return this.isEqual(this.getEnvironment(), 'prod');
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
     *  sample:
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
            if ((typeof (errorSimulator) === "function") && errorSimulator(param)) throw Error('force to made error happen');
            this.appendInfo(`after executed ===> i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds ${param ? `i hav params ===> ${param}` : ''}`);
            return { randomValue, symbol, param };
        } catch (error) {
            this.appendError(new Error(`asyncUnitTask() catch error ${error.message}`))
        } finally {
            this.appendInfo(`wow.... finally got you`);
        }

    }

    /**
     * 把敘述句和條件子句累加在一起，讓其變成一個合理的functional呼叫
     * condition2(condition1(target)) =>  為了應付 collection(path).where('age','>',11).orderBy('age');
     * */
    accumulate(target, conditions) {
        let beginning = target;
        for (const condition of conditions) {
            if (condition !== undefined && (typeof (condition) === "function")) {
                beginning = condition(beginning);
            }
        }
        return beginning
    }

    isOrEquals(target, ...several) {
        for (const each of several) {
            if (this.isEqual(target, each)) return true;
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
            if ((typeof (boo) === "boolean") && boo)
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
        if (array === null || array === undefined) return undefined;

        // 如果是物件且非陣列，轉為 value 陣列
        const target = (typeof array === "object" && !Array.isArray(array))
            ? Object.values(array)
            : array;

        return target.at(index % (target.length || 1));
    }

    /** 選一個exist的candidate回傳, 像是firebase 可以 idToken 又可以 oauthIdToken*/
    getExistOne(...candidates) {
        for (const candidate of candidates) {
            if (candidate)
                return candidate;
        }
    }

    /** '###string' =>  'string' */
    getStringOfDropHeadSign(string, sign) {
        let i = 0;
        // 直接用字串指標比對，遇到不是 sign 的字元就停下來
        while (i < string.length && string[i] === sign) {
            i++;
        }
        return string.slice(i);
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
        if (Array.isArray(collection)) {
            if (precisely)
                return (collection).findIndex((each) => this.isEqual(item, each)) > -1;
            else
                return (collection).indexOf(item) > -1;
        }
        if (this.isObject(item)) {
            return collection[item];
        }
        if ((typeof (collection) === "string")) {
            return collection.indexOf(item) > -1;
        }
        return false;
    }

    /** 就是比較_.isEqual(isEqual的註解很重要), 不是用address去判斷 */
    containsBy(array, item) {
        return (array).findIndex((each) => this.isEqual(each, item)) >= 0
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
        const keyStr = String(key);

        if (keyStr.length > maxLengthOfKey) throw new ERROR(8010, keyStr.length);

        // 文字應使用 Utf8.parse
        const ivOfCrypto = CryptoJS.enc.Utf8.parse("thisIsIVWeNeedToGenerateTheSameValue".substring(0, 16)); // AES IV 需剛好 16 bytes

        // 使用 padEnd 準確補齊至 22 長度 (此處 AES key length 由 CryptoJS 處理)
        const finalKeyStr = alwaysTheSame ? keyStr.padEnd(maxLengthOfKey, '0') : keyStr;
        const keyOfCrypto = alwaysTheSame ? CryptoJS.enc.Utf8.parse(finalKeyStr) : finalKeyStr;

        return CryptoJS.AES.encrypt(texts, keyOfCrypto, { iv: ivOfCrypto }).toString();
    }

    /** alwaysTheSame 就是產出的encrypt value會固定(適合用在欄位的key), 不然會產生隨機偏移量, 但皆不影響解譯 */
    getEncryptStringV2(texts, key = configerer.ENCRYPT_KEY, alwaysTheSame = false) {
        const maxLengthOfKey = 22;
        if (key.length > maxLengthOfKey)
            throw new ERROR(8010, (Array.isArray(key) ? key.length : (typeof (key) === "object" && key !== null ? Object.keys(key).length : String(key).length)))
        /** 帶入偏移量, keyOfkeyOfCrypto 需要是長度為22的字串, 太獵奇了*/
        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");
        const keyOfCrypto = alwaysTheSame ? CryptoJS.enc.Base64.parse(`${key}${Array.from({ length: maxLengthOfKey - key.length }, (_, i) => i).join('')}`) : key;
        return CryptoJS.AES.encrypt(JSON.stringify({ content: texts }), keyOfCrypto, { iv: ivOfCrypto }).toString();
    }

    getDecryptString(ciphertext, key = configerer.ENCRYPT_KEY) {
        const maxLengthOfKey = 22;
        const stringKey = String(key);

        if (stringKey.length > maxLengthOfKey) throw new ERROR(8010, stringKey.length);

        // IV 統一改用 Utf8
        const ivOfCrypto = CryptoJS.enc.Utf8.parse("thisIsIVWeNeedToGenerateTheSameValue".substring(0, 16));

        try {
            const value = CryptoJS.AES.decrypt(ciphertext, stringKey, { iv: ivOfCrypto }).toString(CryptoJS.enc.Utf8);
            if (value && value.trim().length > 0) return value;
        } catch (e) {
        }

        // 使用 padEnd 補齊
        const fallbackKeyStr = stringKey.padEnd(maxLengthOfKey, '0');
        const fallbackKey = CryptoJS.enc.Utf8.parse(fallbackKeyStr);

        return CryptoJS.AES.decrypt(ciphertext, fallbackKey, { iv: ivOfCrypto }).toString(CryptoJS.enc.Utf8);
    }

    getDecryptStringV2(ciphertext, key = configerer.ENCRYPT_KEY) {
        const maxLengthOfKey = 22;

        // 1. 安全地取得 key 的長度，避免下面重複計算
        let currentKeyLength = 0;
        if (Array.isArray(key)) {
            currentKeyLength = key.length;
        } else if (typeof key === "object" && key !== null) {
            currentKeyLength = Object.keys(key).length;
        } else {
            currentKeyLength = String(key).length;
        }

        if (currentKeyLength > maxLengthOfKey) {
            // 備註：保留你原本寫的 ERROR，若這不是你們自訂的全域類別，請改為 Error
            throw new ERROR(8010, currentKeyLength);
        }

        const ivOfCrypto = CryptoJS.enc.Base64.parse("thisIsIVWeNeedToGenerateTheSameValue");

        try {
            // 嘗試第一次解密
            const stringOfObj = CryptoJS.AES.decrypt(ciphertext, key, { iv: ivOfCrypto }).toString(CryptoJS.enc.Utf8);

            // 2. 修復：因為 .toString() 出來必定是字串，直接檢查是否有實質內容即可
            if (stringOfObj && stringOfObj.trim().length > 0) {
                const obj = JSON.parse(stringOfObj);
                return obj.content;
            }
        } catch (e) {
            /** 把問題給吃掉了, 也不能紀錄, 因為用了appendError*/
        }

        // 3. 第一次解密失敗或結果為空，進行第二次嘗試 (使用 padding 後的 key)
        const stringKey = String(key); // 確保轉為字串
        const paddingLength = maxLengthOfKey - stringKey.length;

        // 產生補齊用的數字字串 (例如缺 3 碼就會補上 '012')
        const paddingString = Array.from({ length: paddingLength }, (_, i) => i).join('');
        const fallbackKey = CryptoJS.enc.Base64.parse(`${stringKey}${paddingString}`);

        const stringOfObjFallback = CryptoJS.AES.decrypt(ciphertext, fallbackKey, { iv: ivOfCrypto }).toString(CryptoJS.enc.Utf8);
        const objFallback = JSON.parse(stringOfObjFallback);

        return objFallback.content;
    }

    getFirebaseFormattedString(texts) {
        return String(texts).replace(/[\.\#\$\[\]]/g, "-").trim();
    }

    formalizeNamesToArray(singerString) {
        let normalize = String(singerString || '');

        // 移除演唱、編曲這類標籤之後的部分
        normalize = normalize.split(configerer.SEPARATE_TONE_SINGER)[0].trim();

        // 替換特殊字元為 _
        normalize = normalize.replace(/[, \/#!$%\^&\*;:{}=_`、~()（）]/g, "_").trim();

        // Firebase 特殊字元轉換
        normalize = this.getFirebaseFormattedString(normalize);

        // 取代多個連續底線為單一底線，並同時使用 replace 拔除頭尾的底線
        normalize = normalize.replace(/_+/g, '_').replace(/^_+|_+$/g, '').trim();

        // 拆分並過濾掉可能的空字串
        return normalize
            .split('_')
            .map(word => String(word).trim())
            .filter(word => word !== '');
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
        if (!path) return '';
        const segments = String(path).split('/').pop().split('.');
        // 如果檔名沒有小數點（長度1），或是類似 .hiddenfile 這種開頭是點的情況
        return segments.length > 1 ? segments.pop() : '';
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
            return (splits).at(-2);
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
        // 1. split('/'): 將字串依 '/' 切成陣列
        // 2. slice(0, -1): 移除陣列最後一個元素（檔名）
        // 3. join('/'): 將陣列重新組合成字串
        const dirPath = String(path).split('/').slice(0, -1).join('/');
        return dirPath + (slash ? '/' : '');
    }

    /** path ==> /asd/cc/dfj/jei3.mp3 => */
    isPathEqualsFileType(path, type) {
        const extension = path.split('.').pop();
        return this.isEqual(extension, type);
    }

    /** 是一個/a/b/c.js 的檔案路徑 */
    isValidFilePath(path) {
        const extension = this.getExtensionFromPath(path);
        return (Array.isArray(extension) ? extension.length : (typeof (extension) === "object" && extension !== null ? Object.keys(extension).length : String(extension).length)) > 0;
    }

    /** 拿前面n個items */
    getArrayOfSize(array, n = 1) {
        return (array).slice(0, n);
    }

    getShuffledArrayWithLimitCount(arr, n) {
        return this.getShuffledArrayWithLimitCountHighPerformance(arr, n); // 使用已優化的版本
    }

    /** const items = [{ price: 10 }, { price: 120 }, { price: 230 }];
     console.log(findLowestPrice(items)); // 輸出: 10
     */
    findLowestValue = (items, key = 'price') => {
        // 提取價格並找出最小值
        const minPrice = (items).reduce((min, p) => p[key] < min[key] ? p : min, (items)[0])[key];
        // 確保回傳的最低價為 integer 型態
        return Math.floor(minPrice);
    };

    /** const items = [{ price: 10 }, { price: 120 }, { price: 230 }];
     console.log(findLowestPrice(items)); // 輸出: 120
     */
    findHighestValue = (items, key = 'price') => {
        // 提取價格並找出最小值
        const maxPrice = (items).reduce((max, p) => p[key] > max[key] ? p : max, (items)[0])[key];

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
        const minV = (items).reduce((min, p) => p[key] < min[key] ? p : min, (items)[0])[key];
        const maxV = (items).reduce((max, p) => p[key] > max[key] ? p : max, (items)[0])[key];
        // 判斷並返回字串
        return maxV === minV ? `$${minV}` : `${sign}${minV} - ${sign}${maxV}`;
    };


    /** ignore 就是黑名單的意思 */
    getRandomItemOfArray(array, ...ignores) {
        if (!Array.isArray(array)) throw new ERROR(9999, `why are you so stupid, typeof array should be array, not ==> ${array} `)
        const filter = (array).filter(v => !(ignores).includes(v));
        const target = (Array.isArray(filter) ? filter.length : (typeof (filter) === "object" && filter !== null ? Object.keys(filter).length : String(filter).length)) > 0 ? filter : array;
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
     * Util.getMergedArrayBy(
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
        let shuffled = [...(arr)].sort(() => Math.random() - 0.5);
        return shuffled[0];
    }

    getShuffledArray(arr) {
        let shuffled = [...(arr)].sort(() => Math.random() - 0.5);
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
        if (this.isObject(obj)) {
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
        if (this.isObject(obj)) {
            return Object.keys(obj)[0];
        }
        return '';
    }

    printf() {
        this.appendInfo('i can use in web || react.js');
    }

    isKeywordRule(constraint) {
        if ((constraint) === undefined || ((constraint) == null || (typeof (constraint) === "object" && Object.keys(constraint).length === 0) || (typeof (constraint) === "string" && (constraint).length === 0)))
            throw new Error('PARAMS CAN NOT BE EMPTY');

        if (!(typeof (constraint) === "string"))
            throw new Error('PARAMS SHOULD BE STRING');

        if (constraint.length > 20)
            throw new Error('EXCEED 20 WORDS IS NOT ALLOWED');
    }

    getItsKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    startsWith(string, keys = []) {
        if (string === null || string === undefined) return false;
        const keyArray = Array.isArray(keys) ? keys : [keys];
        return keyArray.some(k => String(string).startsWith(k));
    }

    getCallersName = () => {
        let callerName;
        try {
            throw new Error();
        } catch (e) {
            let re = /(\w+)@|at (\w+) \(/g, st = e.stack, m;
            re.exec(st), m = re.exec(st);
            if (!(m) === null)
                callerName = m[1] || m[2];
        }

        if (String('asyncGeneratorStep').startsWith(callerName)) callerName = '';
        return (callerName);
    }

    replaceAll(string, patten, to) {
        if (string === null || string === undefined) return '';
        // 現代 JS 原生支援 replaceAll，不需要自己包裝 RegExp
        return String(string).replaceAll(patten, to);
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
        const index = (array).indexOf(current);
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

            if (Array.isArray(current)) {
                // 將陣列元素反向推入堆疊以保持順序
                for (let i = current.length - 1; i >= 0; i--) {
                    stack.push([current[i], prefix]); // 陣列元素不加前綴
                }
            } else if (this.isObject(current)) {
                // 將物件鍵值對反向推入堆疊
                const keys = Object.keys(current);
                for (let i = keys.length - 1; i >= 0; i--) {
                    const key = keys[i];
                    // 值推入堆疊，前綴包含當前鍵
                    stack.push([current[key], prefix + key + sign]);
                }
            } else {
                // 基本型別，添加到結果字串
                const valueString = String(String(current).trim()); // 確保轉為字串並去除頭尾空白
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
            if (!((info[attr]) == null || (typeof (info[attr]) === "object" && Object.keys(info[attr]).length === 0) || (typeof (info[attr]) === "string" && (info[attr]).length === 0))) {
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
            indexOfLatest = (array).findIndex((x, i) => i >= indexOfLatest + 1 && (predicate)(x, i));
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
        const size = (Array.isArray(array) ? array.length : (typeof (array) === "object" && array !== null ? Object.keys(array).length : String(array).length));
        for (const index of indexes) {
            if (!(typeof (index) === "number" && !Number.isNaN(index)))
                throw new ERROR(9999, `59941278 index should be number => ${index}, ${array}`);
            if (index > size - 1)
                throw new ERROR(9999, `5994123 index=>${index} is not valid, exceed than array size=${size}, ${array}`);
            items.push((array).at(index));
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
        return (context).findIndex((per) => {
            return this.isEqual(per.trim(), stmt);
        });
    }

    /** 去掉文字裡討厭的換行*/
    toOneLineString(string) {
        if (string === null || string === undefined) return '';
        return String(string).replace(/\n/g, '');
    }

    ttoSpaceLessString(string) {
        if (string === null || string === undefined) return '';
        return String(string).replace(/\s/g, '');
    }

    toNewLineLessString(string) {
        /** 這樣寫也可以 string.split('').map((each) => each.trim()).join(''); */
        return String(string).split('\n').map((each) => String(each).trim()).join('')
    }

    exist(obj) {
        return !(obj) === null && !(obj) === undefined;
    }

    isUndefinedNullEmpty(obj) {
        const first = obj === undefined || obj === null;
        const second = (typeof (obj) === "string") || (Array.isArray(obj) || this.isObject(obj)) ? ((obj) == null || (typeof (obj) === "object" && Object.keys(obj).length === 0) || (typeof (obj) === "string" && (obj).length === 0)) : false;
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
            predict(segment, (segments).indexOf(segment), segments);
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

        const chars = Array.from(string);

        // 從右邊開始檢查，只要「不等於」predicate 就丟棄
        const afterArray = this.dropRightWhile(chars, (char) => {
            return char !== predicate;
        });

        const after = afterArray.join('');

        // 如果結果是空字串 (代表整個字串都沒有 predicate)，就回傳原字串
        return after === '' ? string : after;
    }

    /** 讓字串開頭不可以是 predicate, ex: `,, \n\t\s i'm good today?` => `i'm good today?` */
    getNormalizedStringNotStartWith(string, ...predicates) {
        // 假設 this.toCDB 已實作
        string = this.toCDB(string);

        // 1. 將字串轉為字元陣列，這樣才能通過 dropWhile 的 Array.isArray 檢查
        const chars = Array.from(string);

        // 2. 呼叫 dropWhile，並傳入正確的 predicate callback
        const afterArray = this.dropWhile(chars, (char) => {
            return predicates.includes(char); // 檢查字元是否在要剔除的清單中
        });

        // 3. 將處理後的陣列轉回字串
        const after = afterArray.join('');

        // 4. 如果處理後變成空字串，就回傳空字串 (不建議回傳原 string，否則原本全都是 '.' 的字串會原封不動被退回)
        return after;
    }

    /** 讓字串開頭不可以是 predicate, ex: `,, \n\t\s i'm good today?` => `\n\t\s i'm good today` */
    getNormalizedStringNotEndWith(string, ...predicates) {
        // 假設 this.toCDB 已實作
        string = this.toCDB(string);

        // 1. 將字串轉為字元陣列
        const chars = Array.from(string);

        // 2. 呼叫 dropRightWhile，並傳入 predicate 判斷函式
        const afterArray = this.dropRightWhile(chars, (char) => {
            return predicates.includes(char);
        });

        // 3. 轉回字串
        return afterArray.join('');
    }

    /**
     * 取得 ISO 8601 格式的日期字串 (YYYY-MM-DD)
     * @sample
     * getTodayTimeFormat(1733630000000) // "2024-12-08"
     * @param {number|string|Date} [ts] - 時間戳記、日期字串或物件，不傳則取目前時間
     * @returns {string} 格式化後的日期 (例如：2025-12-08)
     */
    getTodayTimeFormat(ts) {
        /**
         * dayjs() 初始化：
         * 若 ts 為空，自動取當前系統時間 (valueOf)
         */
        return dayjs(ts || this.getCurrentTimeStamp()).format("YYYY-MM-DD");
    }

    /**
     * 根據自定義格式輸出日期字串
     * @sample
     * getCustomFormatOfDatePresent(1733630000000, 'YY/MM') // "24/12"
     * @param {number|string|Date} [ts] - 時間戳記、日期字串或物件
     * @param {string} [format='YY/MM'] - 自定義格式化代碼
     * @returns {string} 格式化後的日期字串
     */
    getCustomFormatOfDatePresent(ts, format = 'YY/MM') {
        return dayjs(ts || this.getCurrentTimeStamp()).format(format);
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


    /**
     * 將時間戳記格式化為 YY/MM/DD 字串 (例如：24/12/08)
     * * @sample
     * // 1. 傳入特定時間戳
     * getSimpleDateYYMMDDFormat(1733630000000) // "24/12/08"
     * * @sample
     * // 2. 不傳入參數 (預設取當前時間)
     * getSimpleDateYYMMDDFormat() // "25/12/08" (假設今天是 2025 年)
     * * @param {number|string|Date} [ts] - 欲格式化的時間戳記、日期字串或日期物件
     * @returns {string} 格式化後的簡短日期字串 (YY/MM/DD)
     */
    getSimpleDateYYMMDDFormat(ts) {
        /**
         * dayjs() 初始化說明：
         * 1. 若 ts 為空，dayjs() 會取當前系統時間。
         * 2. dayjs 支援 Unix 毫秒戳、ISO 8601 字串及原生 Date 物件。
         * 3. 格式化 YY 代表年份後兩位，MM 為月份補零，DD 為日期補零。
         */
        return dayjs(ts || this.getCurrentTimeStamp()).format("YY/MM/DD");
    }

    getSimpleTimeYYMMDDHHmmFormat(ts) {
        return dayjs(ts || this.getCurrentTimeStamp()).format("YY/MM/DD HH:mm");
    }

    getECPayCurrentTimeFormat(ts) {
        return dayjs(ts || this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm:ss");
    }

    getCurrentTimeFormatV2(ts) {
        return dayjs(ts || this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm:ss");
    }

    getCurrentTimeFormatYMDHM(ts) {
        return dayjs(ts || this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm");
    }

    getCurrentTimeFormatYMDHMS(ts) {
        return dayjs(ts || this.getCurrentTimeStamp()).format("YYYY/MM/DD HH:mm:ss");
    }

    /** 取得 YYY-MM-DD-HH-mm-ss */
    getCurrentTimeFormat(ts) {
        return dayjs(ts || this.getCurrentTimeStamp()).format("YYYY-MM-DD-HH-mm-ss");
    }

    getCurrentMillionSecTimeFormat(ts) {
        // SSS 是毫秒格式
        return dayjs(ts || undefined).format("YYYY-MM-DD-HH-mm-ss-SSS");
    }

    /**
     * 判斷基準時間是否位於指定的起始時間與結束時間之間
     * * @sample
     * // 判斷今天是否在 2024 到 2026 之間
     * isBetweenTimeStamp(1733630000000, '2024-01-01', '2026-01-01') // true
     * * @param {number|string|Date} target - 欲檢查的基準時間
     * @param {number|string|Date} min - 起始範圍 (包含)
     * @param {number|string|Date} max - 結束範圍 (包含)
     * @returns {boolean}
     */
    isBetweenTimeStamp(target = this.getCurrentTimeStamp(), min, max) {
        /**
         * 注意：需先執行 dayjs.extend(isBetween)
         * Day.js 預設包含 [min, max] (兩側皆包含)
         * 如果要調整包含邏輯 (如不包含端點)，可傳入第四個參數，例如 '()' 代表排除兩端
         */
        return dayjs(target).isBetween(min, max);
    }

    /**
     * 判斷基準時間是否 早於 指定時間
     * @param {number|string|Date} target - 基準時間
     * @param {number|string|Date} time - 對比時間
     * @returns {boolean}
     */
    isBeforeTimeStamp(target = this.getCurrentTimeStamp(), time) {
        // 核心功能，直接調用
        return dayjs(target).isBefore(time);
    }

    /**
     * 判斷基準時間是否 晚於 指定時間
     * @param {number|string|Date} target - 基準時間
     * @param {number|string|Date} time - 對比時間
     * @returns {boolean}
     */
    isAfterTimeStamp(target = this.getCurrentTimeStamp(), time) {
        // 核心功能，直接調用
        return dayjs(target).isAfter(time);
    }

    /**
     * 根據地區語系與時區輸出 yyyy/MM/dd hh:mm 時間字串
     * @param {Date | number | string} ts - 時間戳記、日期物件或字串
     * @param {string} location - 語系地區代碼（如 'zh-tw'、'en'）
     * @param {string} timezone - 時區（如 'Asia/Taipei'）
     * @param {boolean} use24Hour - 是否使用 24 小時制（預設 true）
     * @returns {string} 格式化後的日期字串
     */
    formatTimeByLocale(ts, location = "zh-tw", timezone = "Asia/Taipei", use24Hour = true) {
        /** * Day.js 的語系代碼通常為小寫 (例如 zh-tw)
         * 將傳入的 location 強制轉為小寫以符合 dayjs 規範
         */
        const normalizedLocale = location.toLowerCase();

        /** * 定義格式化字串
         * HH: 24 小時制 (00-23)
         * hh: 12 小時制 (01-12)
         * A:  顯示 AM / PM
         */
        const formatStr = use24Hour ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD hh:mm A";

        /**
         * 鏈式調用邏輯：
         * 1. dayjs(ts): 初始化時間物件 (若 ts 為空則預設現在時間)
         * 2. .tz(timezone): 根據指定的時區名稱進行轉換 (例如轉換為台北時間)
         * 3. .locale(normalizedLocale): 設定該實例顯示的語系語言
         * 4. .format(formatStr): 輸出最終格式化字串
         */
        return dayjs(ts)
            .tz(timezone)
            .locale(normalizedLocale)
            .format(formatStr);
    }


    /**
     * 根據給定條件增減時間並獲得新的時間戳記
     * * @sample
     * // 1. 增加 2 個月又 3 天
     * getTimeStampWithConditions({ months: 2, days: 3 }, 1643434497341)
     * // 2022-01-29 08:14 + 2m 3d -> 2022-04-01 08:14 (timestamp)
     * * @sample
     * // 2. 減少 5 小時
     * getTimeStampWithConditions({ hours: -5 })
     * // (目前時間) - 5小時
     * * @sample
     * // 3. 複雜調整：增加 1 年，減少 30 分鐘
     * getTimeStampWithConditions({ years: 1, minutes: -30 }, "2023-01-01")
     * * @param {Object} param - 增減的時間單位物件
     * @param {number} [param.years=0] - 增減年份
     * @param {number} [param.months=0] - 增減月份
     * @param {number} [param.days=0] - 增減天數
     * @param {number} [param.hours=0] - 增減小時
     * @param {number} [param.minutes=0] - 增減分鐘
     * @param {number} [param.seconds=0] - 增減秒數
     * @param {number|string|Date} target - 基準時間，預設為當前時間 (毫秒)
     * @returns {number} 13 位數 Unix 毫秒時間戳記 (valueOf)
     */
    getTimeStampWithConditions(param = {
        days: 0, months: 0, years: 0,
        minutes: 0, seconds: 0, hours: 0
    }, target = dayjs().valueOf()) {
        /**
         * Day.js 是 Immutable (不可變) 的。
         * 每次呼叫 .add() 都會回傳一個全新的實例，因此需要 base 接收回傳值。
         */
        let base = dayjs(target);

        // Day.js 的 .add 方法原生支援傳入負數 (即代表減法)
        Object.entries(param).forEach(([unit, value]) => {
            if (value !== 0) {
                /** * 迭代執行時間增減
                 * @sample base.add(2, 'months')
                 */
                base = base.add(value, unit);
            }
        });

        return base.valueOf();
    }

    /**
     * 根據給定條件增減時間並獲得新的時間戳記
     * @param {Object} param - 增減的時間單位物件 (e.g., { months: 2, days: 3 })
     * @param {number|string|Date} target - 基準時間，預設為當前時間
     * @returns {number} 13 位數 Unix 毫秒時間戳記
     */
    getTimeStampWithConditions(param = {
        days: 0, months: 0, years: 0,
        minutes: 0, seconds: 0, hours: 0
    }, target = dayjs().valueOf()) {
        let base = dayjs(target);
        // Day.js 的 add 支持負數，且不可變 (Immutable)，需重新賦值
        Object.entries(param).forEach(([unit, value]) => {
            if (value !== 0) {
                base = base.add(value, unit);
            }
        });
        return base.valueOf();
    }

    /**
     * 將 yyyy/MM/dd HH:mm:ss 字串格式轉換為時間戳記
     * @param {string} string - 時間字串
     * @returns {number} 毫秒時間戳記
     */
    getTimeStampByStringFormat(string) {
        return this.getTimeStampFromSpecificFormat(string, 'YYYY/MM/DD HH:mm:ss');
    }

    /**
     * 根據指定格式將字串解析為時間戳記
     * @param {string} string - 時間字串
     * @param {string} format - 解析格式
     * @returns {number} 毫秒時間戳記
     */
    getTimeStampFromSpecificFormat(string, format = 'YYYY/MM/DD HH:mm:ss') {
        // 需要 customParseFormat 插件
        return dayjs(string, format).valueOf();
    }

    /**
     * 針對 ECPay 格式的時間字串轉換為時間戳記
     */
    getTimeStampFromECPayStringFormat(string) {
        return this.getTimeStampFromSpecificFormat(string, 'YYYY/MM/DD HH:mm:ss');
    }

    /**
     * 將持續時間 (Duration) 轉化為 HH小時mm分鐘ss秒SSS 格式
     * @param {number} durationMs - 持續時間 (毫秒)
     * @returns {string}
     */
    getTimeFormatOfDurationToMillionSecond(durationMs) {
        // 使用 .utc() 確保基準點為 0，避免時區偏移 (台北會多 8 小時)
        return dayjs.utc(durationMs).format("HH小時mm分鐘ss秒SSS");
    }

    /**
     * 將持續時間 (Duration) 轉化為 HH小時mm分鐘ss秒 格式
     */
    getTimeFormatOfDurationToSecond(durationMs) {
        return dayjs.utc(durationMs).format("HH小時mm分鐘ss秒");
    }

    /**
     * 將持續時間 (Duration) 轉化為 DD天HH小時mm分鐘ss秒
     * 注意：Dayjs 的格式化 DD 代表日期。若超過 31 天，建議改用 duration 插件
     */
    getTimeFormatOfDurationToDay(durationMs) {
        return dayjs.utc(durationMs).format("DD天HH小時mm分鐘ss秒");
    }

    /**
     * 取得中文格式的本地化時間 (例如：2022年1月29日星期六 08:00)
     * @param {number} ts - 毫秒時間戳
     */
    getChineseTimeFormat(ts) {
        return dayjs(ts).format("LLLL");
    }

    /** 取得持續時間對應的分鐘數 (不滿一分會有小數) */
    getMinuteFormatOfDuration(ds) {
        return dayjs.duration(ds).asMinutes();
    }

    /** 取得持續時間對應的秒數 */
    getSecondFormatOfDuration(ds) {
        return dayjs.duration(ds).asSeconds();
    }

    /** 取得持續時間對應的天數 */
    getDayFormatOfDuration(ds) {
        return dayjs.duration(ds).asDays();
    }

    /**
     * 計算目標時間與當前時間之間的毫秒差 (絕對值)
     * @param {string|number|Date} dateOrTimeStamp
     * @returns {number} 毫秒差
     */
    getDurationOfMillionSec(dateOrTimeStamp) {
        const now = dayjs();
        const target = dayjs(dateOrTimeStamp);

        // 計算差異 (diff)，回傳毫秒數
        // .diff 預設會處理順序問題，若 target < now 則回傳負值
        const diffMs = Math.abs(now.diff(target));
        return diffMs;
    }

    getCurrentTimeStamp() {
        return dayjs().valueOf();
    }

    isStringContainInLines(context, key) {
        for (let each of String(context).split('\n')) {
            if (this.has(each, key))
                return true;
        }
        return false;
    }

    camel(...words) {
        return this.camelCase(words.join('_'));
    }

    upperCamel(...words) {
        return this.upperFirst(this.camel(...words))
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
            if (content && Array.isArray(content)) {
                content.push(item)
            } else {
                obj[key] = [item];
            }
        }
        return obj;
    }

    isEmptyString(string) {
        if (string === null || string === undefined) return true;
        return this.isEqual(String(string).trim(), '');
    }

    /**
     * * 合併邏輯：如同 Lodash 的 _.merge，後面的參數會覆蓋或合併前面的參數，優先級越高。
     *
     * @sample
     * const a = { x: 1, y: { z: 10 } };
     * const b = { x: 2, y: { w: 20 } };
     * const c = { x: 3, y: { z: 30 } };
     * * merO(a, b, c)
     * // 返回一個新的物件：
     * // {
     * //   x: 3, // 被最後的 c 取代
     * //   y: {
     * //     z: 30, // 被最後的 c 取代
     * //     w: 20  // 被 b 新增
     * //   }
     * // }
     * // 且 a、b、c 保持不變。
     *
     * @returns {Object} - 一個包含合併結果的全新物件。
     */
    merO = (...objs) => {
        return this.merge(...objs)
    };

    /**
     * 執行不可變 (Immutable) 的深層物件合併。
     * * 此函式旨在：
     * 1. 確保第一個傳入的物件 (baseObject) 不被修改 (不動性)。
     * 2. 利用 Lodash 的深層合併特性，遞迴地合併巢狀物件。
     *
     * * 合併邏輯：如同 Lodash 的 _.merge，後面的參數會覆蓋或合併前面的參數，優先級越高。
     *
     * @sample
     * const a = { x: 1, y: { z: 10 } };
     * const b = { x: 2, y: { w: 20 } };
     * const c = { x: 3, y: { z: 30 } };
     * * merO(a, b, c)
     * // 返回一個新的物件：
     * // {
     * //   x: 3, // 被最後的 c 取代
     * //   y: {
     * //     z: 30, // 被最後的 c 取代
     * //     w: 20  // 被 b 新增
     * //   }
     * // }
     * // 且 a、b、c 保持不變。
     *
     * @param {...Object} objs - 任意數量的物件，第一個物件作為基礎，後續物件為覆蓋來源。
     * @returns {Object} - 一個包含合併結果的全新物件。
     */
    merO4 = (...objs) => {
        // 檢查參數，如果沒有物件，則返回空物件
        if (objs.length === 0) {
            return {};
        }

        // 取得作為基礎（Target）的第一個物件
        const baseObject = objs[0];

        // 取得所有用於覆蓋的來源物件 (Source)，使用 slice(1) 排除第一個物件
        const sources = objs.slice(1);

        // --- 確保不動性 (Immutability) 的關鍵步驟 ---

        // 1. 對基礎物件進行深層複製 (Deep Clone)
        // 這是確保原始的 baseObject 及其所有巢狀屬性都不會被修改的關鍵。
        const clonedTarget = structuredClone(baseObject);

        // 2. 執行深層合併 (Deep Merge)
        // 將所有來源物件 (sources) 依序合併到這個新的複製體 (clonedTarget) 中。
        return this.merge(clonedTarget, ...sources);
    }

    syncSetTimeout(func, ms, callback = () => {
    }) {
        (function sync(done) {
            if (!done) {
                setTimeout(function() {
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
        // 1. 將字串轉為字元陣列，讓 dropWhile 可以處理
        const pathChars = Array.from(pathName);

        return this.dropWhile(pathChars, (each, index) => {
            // 當 index 超過 rootName 長度時，rootName[index] 是 undefined
            // 此時 each === undefined 會是 false，就會停止丟棄，保留剩下的字元
            return each === rootName[index];
        }).join('');
    }

    /**
     * mutated;
     const arr = [0,1,2,3,4,5,6,7,8];
     dropItemsByIndex(arr,1,3);
     this.appendInfo(arr); [ 0, 4, 5, 6, 7, 8 ]
     */
    dropItemsByIndex(array, from, end) {
        this.removeMutate(array, (value, index, array) => (end >= index && index >= from));
    }

    isEven(n) {
        return n % 2 === 0;
    }

    isOdd(n) {
        return Math.abs(n % 2) === 1;
    }

    /** react js Util */
    getVisibleOrHidden(judgement) {
        return { visibility: judgement ? 'visible' : 'hidden' };
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
        return { display: judgement ? flex ? 'flex' : 'inherit' : 'none' };
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
     * console.log(Util.toObjectMap(sample, {to: 'newName', from: 'name',func:(p) => (p+'yaya')}));
     * result : [ { newName: 'ayaya' }, { newName: 'byaya' } ]
     */
    toObjectMap(array, ...rules) {
        const newbies = []
        for (const each of array) {
            const object = {}
            for (const rule of rules) {
                const func = rule.func ? rule.func : (stmt) => stmt;
                object[rule.to] = this.isUndefinedNullEmpty(rule.from) || !this.isObject(each) ? func(each) : func(each[rule.from]);
            }
            newbies.push(object);
        }
        return newbies;
    }

    /**
     * sample:
     const array = [{aa: '1'},{ aa: '2'}, {aa: '3'}];
     const object = {aa: '1', bb: '2', cc: '3'};
     Util.exeAll(object,(each) => each + 1)
     Util.exeAll(array,(each) => {each.aa = each.aa + 1});
     console.log(object);  // { aa: '11', bb: '21', cc: '31' }
     console.log(array); // [ { aa: '11' }, { aa: '21' }, { aa: '31' } ]
     * 把collection 裏面的物件執行一下,會mutate本身*/
    exeAll(collection, ...funcs) {

        if (Array.isArray(collection)) {
            for (const each of collection) {
                for (const func of funcs) {
                    func(each);
                }
            }
            /** 陣列專屬邏輯 */
        } else if (this.isObject(collection)) {
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
     console.log(Util.getIntersectionObject(obj1,obj2)) => { b: 4 }
     */
    getIntersectionObject(objOfMajor, objOfMinor) {
        return this.getObjectWhile(objOfMajor, objOfMinor, ((major, minor, key) => minor[key] !== undefined));
    }

    /** 找出兩個object,相同的屬性
     sample:
     const obj1 = {a:1,b:4,c:3};
     const obj2 = {b:3};
     console.log(Util.getIntersectionObject(obj1,obj2)) => { a: 1, c: 3 }
     */
    getDifferenceObject(objOfMajor, objOfMinor) {
        return this.getObjectWhile(objOfMajor, objOfMinor, ((major, minor, key) => minor[key] === undefined));
    }

    /**
     *
     const obj1 = {b:4,c:2};
     const obj2 = {b:4,c:3};
     const obj3 = {a:1,b:4,c:3};
     console.log(Util.isObjectContainAndEqual(obj1,obj3)) false
     console.log(Util.isObjectContainAndEqual(obj1,obj3)) true
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
        if (!(typeof (string) === "string")) {
            throw new ERROR(9999, `445115,type should be string but ==> ${typeof string}`)
        }
        const segments = string.split(separator);
        segments.pop();
        return segments.join(separator);
    }

    /** 把 /a/v/c/d => /v/c/d */
    getStringOfShift(string, separator) {
        if (!(typeof (string) === "string")) {
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
                return { exists: true, sign };
            }
        }
        return { exists: false };
    }

    /** others returns  [{logic:true|false,message:'oops'}]
     *  */
    constraintOfParam(collection, type, ...others) {
        let result = false;
        const validOfOthersCondition = ((others) == null || (typeof (others) === "object" && Object.keys(others).length === 0) || (typeof (others) === "string" && (others).length === 0)) ? true : this.and(...others.map(each => each.logic));

        switch (type) {
            case 'array':
                if (Array.isArray(collection) && validOfOthersCondition)
                    result = true;
                break;
            case 'object':
                if (this.isObject(collection) && validOfOthersCondition)
                    result = true;
                break;
            case 'string':
                if ((typeof (collection) === "string") && validOfOthersCondition)
                    result = true;
                break;
            case 'number':
                if ((typeof (collection) === "number" && !Number.isNaN(collection)) && validOfOthersCondition)
                    result = true;
                break;
            case 'other':
                if (validOfOthersCondition)
                    return true
        }

        const stringOfRules = ((others) == null || (typeof (others) === "object" && Object.keys(others).length === 0) || (typeof (others) === "string" && (others).length === 0)) ? '' : `, ${others.map(each => each.message).join(' | ')}`

        if (result === false) {
            throw new ERROR(9999, `7474423 type should be ${type} but get '${typeof type}' ${stringOfRules} `)
        }
    }

    /**
     const array = _.range(0, 50).map((each) => `index Of each`);
     console.log('origin: ==> ', array.length) //origin: ==>  50
     const result = Util.getSliceArrayWithMutate(array, 10);
     console.log('after: ==> ', result.length, ' | ', array.length) //after: ==>  10  |  40
     */
    getSliceArrayWithMutate(array, n) {
        const slice = this.removeMutate(array, (each, index) => index < n);
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
     console.log(Util.getArrayOfMoveToSpecificIndex(array,1,0));const array = [0,1,2,3,4,5,6,7];
     console.log(Util.getArrayOfMoveToSpecificIndex(array,1,0));
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
     console.log(Util.getArrayOfMoveItemToSpecificIndex(array,array[1],0));
     //[ 'b', 'a', 'c', 'd' ]
     * */
    getArrayOfMoveItemToSpecificIndex(array, item, indexOfDestination) {
        const indexOfItem = (array).indexOf(item);
        return this.getArrayOfMoveToSpecificIndex(array, indexOfItem, indexOfDestination);
    }

    /**
     *  把指定的array item 放到頭尾
     *  const array = ['a','b','c','d'];
     *  console.log(Util.getArrayOfMoveSpecificItemToAside(array,array[1]));
     *[ 'a', 'c', 'd', 'b' ]
     */
    getArrayOfMoveSpecificItemToAside(array, item, toTail = true) {
        const indexOfItem = (array).indexOf(item);
        return this.getArrayOfMoveSpecificIndexToAside(array, indexOfItem, toTail);
    }

    /** 把指定的index放到頭尾
     *  const array = ['a','b','c','d'];
     console.log(Util.getArrayOfMoveSpecificIndexToAside(array,3,false));
     [ 'd', 'a', 'b', 'c' ]
     **/
    getArrayOfMoveSpecificIndexToAside(array, index, toTail = true) {
        const indexOfLast = (Array.isArray(array) ? array.length : (typeof (array) === "object" && array !== null ? Object.keys(array).length : String(array).length)) - 1;
        return this.getArrayOfMoveToSpecificIndex(array, index, toTail ? indexOfLast : 0);
    }

    getECPayCheckMacValue(data, hashKey = '5294y06JbISpM5x9', hashIV = 'v77hoKGq4kWxNNIS') {
        const clone = structuredClone(data);
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
        return CryptoJS.SHA256(checkValue).toString(CryptoJS.enc.Hex).toUpperCase();
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
    getStringOfHandledHtml(htmlString, predicate = (document) => true) {
        const document = parse(htmlString);
        predicate(document);
        return document.toString();
    }

    /** 會有物件在比較優先權，例如option = {id:1,photo:'url'} choice = {id, photo:'url'}
     *
     *  const selected = getSpecifyObjectBy([option.photo,choice.photo],(string) => !((string) == null || (typeof (string) === "object" && Object.keys(string).length === 0) || (typeof (string) === "string" && (string).length === 0)))
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
     *                     {'id': (value) => (typeof (value) === "string")},
     *                     {'num': (v) => (typeof (v) === "number" && !Number.isNaN(v))},
     *                     {items: (v) => Array.isArray(v)}
     *                  ])
     *   // =>true
     */
    validatePayloadObjectValid(content, rules = [], idOfError = this.getRandomHash(10)) {
        if (this.isUndefinedNullEmpty(content)) {
            throw new ERROR(9999, `${idOfError} content(pay-load) is undefined || empty`);
        }

        for (const rule of rules) {
            if ((typeof (rule) === "string")) {
                if (this.isUndefinedNullEmpty(content[rule])) {
                    throw new ERROR(9999, `${idOfError} ATTRIBUTE:'${rule}' is not Exist`);
                }
            } else if (this.isObject(rule)) {
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
        return String(string).split(sign).shift();
    }

    getTailStringSplitBy(string, sign = this.getSeparatorOfUnique()) {
        return String(string).split(sign).pop();
    }

    /** 把array根據indexes分割成slices(array)
     * array = [0,1,2,3,4,5,6,7]
     * indexes = [0,3,5,7];
     * return [... [array1(0,3) ],[array2(3,5)],[array3(5,7)] ],
     * */
    getSlicesByIndexes(array = [], indexes = []) {
        const slices = [];
        indexes.forEach((each, index, arrayOfIndexes) => {
            if (this.isEqual(index, indexes.length - 1))
                return false;

            const slice = (array).slice(each, indexes[index + 1]);
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
            indexOfLatest = (array).findIndex((x, i) => i >= indexOfLatest + 1 && (predicate)(x, i));
            if (indexOfLatest > -1) {
                indexes.push(indexOfLatest);
            } else {
                hasIndex = false;
            }
        }
        return indexes;
    }

    /**
     * 判斷是否超過指定年齡
     * * @sample
     * // 假設今天是 2025-12-08
     * const birthDate = '2005-01-01';
     * isOverSpecificAge(birthDate, 18); // 返回 true
     * * @param {string | number | Date} birthDate - 出生日期 (建議格式 'YYYY-MM-DD')
     * @param {number} target - 目標年齡 (預設為 18)
     * @returns {boolean} 是否大於等於目標年齡
     */
    isOverSpecificAge(birthDate, target = 18) {
        /**
         * .diff(comparedDate, unit)
         * 第一個參數：要對比的日期物件
         * 第二個參數：計算單位 (此處使用 'years')
         * 預設會無條件捨去 (Floor)，非常適合計算足歲
         */
        const age = dayjs().diff(dayjs(birthDate), 'years');

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

    /**
     * 驗證個人資料輸入欄位格式（姓名、郵件、身分證、電話、生日年齡）
     * @param {string} name - 姓名
     * @param {string} email - 電子郵件
     * @param {string} idNumber - 身分證字號
     * @param {string} phoneNumber - 手機號碼
     * @param {string|Date} birthday - 出生日期
     * @param {number} [ageOfQualify=12] - 限制年齡 (預設 12 歲)
     * @returns {Object} { valid: boolean, message: string }
     */
    validatePersonalInfoInput(name, email, idNumber, phoneNumber, birthday, ageOfQualify = 12) {
        // 檢查姓名
        if (name.length < 2) {
            return { valid: false, message: '姓名至少要兩個字' };
        }

        // 檢查電子郵件
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: '電子郵件格式不正確' };
        }

        // 檢查身分證號碼 (簡化驗證)
        const idRegex = /^[A-Z][1-2]\d{8}$/;
        if (!idRegex.test(idNumber)) {
            return { valid: false, message: '身分證號碼格式不正確' };
        }

        // 檢查台灣手機號碼 (09開頭，10位數字)
        const phoneRegex = /^09\d{8}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return { valid: false, message: '手機號碼格式不正確' };
        }

        // 檢查生日
        if (!birthday || birthday === "") {
            return { valid: false, message: `出生日期格式不正確` };
        }

        // 計算年齡
        const now = dayjs();
        const age = now.diff(dayjs(birthday), 'years');
        if (age < ageOfQualify) {
            return { valid: false, message: `年齡不得小於 ${ageOfQualify} 歲` };
        }

        return { valid: true, message: '格式檢查通過' };
    }

    /**
     * 格式化時間戳記範圍，若同年則簡化顯示
     * @sample formatTimestampRange(1683004800000, 1688160000000) => "23/05/01 - 06/30"
     * @param {number} startTimestamp - 開始時間戳
     * @param {number} endTimestamp - 結束時間戳
     * @returns {string} 格式化範圍字串
     */
    getStringOfFormatTimestampRange(startTimestamp, endTimestamp) {
        const startDate = dayjs(startTimestamp);
        const endDate = dayjs(endTimestamp);

        const formatDate = (date) => date.format('YY/MM/DD');

        const startYear = startDate.year();
        const endYear = endDate.year();

        if (startYear === endYear) {
            // 同年：YY/MM/DD - MM/DD
            return `${formatDate(startDate)} - ${endDate.format('MM/DD')}`;
        } else {
            // 跨年：YY/MM/DD - YY/MM/DD
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
    }

    /**
     * 根據起訖日期與每週分鐘數，計算總上課時數
     * @param {number} startTimestamp - 開始時間戳
     * @param {number} endTimestamp - 結束時間戳
     * @param {number} weeklyMinutes - 每週上課分鐘數
     * @returns {string} (e.g., "12小時30分鐘")
     */
    getStringOfCalculateClassTime(startTimestamp, endTimestamp, weeklyMinutes) {
        const startDate = dayjs(startTimestamp);
        const endDate = dayjs(endTimestamp);

        // 計算總天數（包含起始日）
        const totalDays = endDate.diff(startDate, 'days') + 1;
        // 計算總週數
        const totalWeeks = Math.ceil(totalDays / 7);

        const totalMinutes = totalWeeks * weeklyMinutes;

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return minutes === 0 ? `${hours}小時` : `${hours}小時${minutes}分鐘`;
    }

    /**
     * 計算單日內兩個時間點的分鐘差距 (僅比較 HH:mm)
     * @sample getNumberOfPeriodMinute(ts1, ts2) => 600
     * @param {number} startTimestamp - 開始時間
     * @param {number} endTimestamp - 結束時間
     * @returns {number} 分鐘數
     */
    getNumberOfPeriodMinute(startTimestamp, endTimestamp) {
        // 先轉為 HH:mm 字串格式
        const startTime = dayjs(startTimestamp).format('HH:mm');
        const endTime = dayjs(endTimestamp).format('HH:mm');

        /**
         * 注意：需使用 customParseFormat 插件解析 'HH:mm'
         * 解析後會預設為今日的該時間點
         */
        const startDate = dayjs(startTime, 'HH:mm');
        const endDate = dayjs(endTime, 'HH:mm');

        // 計算分鐘差距 (使用 duration 插件)
        return dayjs.duration(endDate.diff(startDate)).asMinutes();
    }

    /**
     * 將日期字串或物件轉換為 13 位毫秒時間戳
     * @param {string|Date} date - 日期
     * @returns {number}
     */
    convertDateToTimestamp = (date) => {
        return dayjs(date).valueOf();
    };

    /**
     * 組合星期幾與起訖時間字串
     * @sample
     * const result = getStringOfWeekTime(1, 1683004800000, 1683019200000);
     * // 輸出: "週一 00:00-04:00"
     * * @param {number} day - 星期幾 (1: 週一, 2: 週二, ..., 7: 週日)
     * @param {number|string|Date} startTimestamp - 開始時間戳記
     * @param {number|string|Date} endTimestamp - 結束時間戳記
     * @returns {string} 格式化後的星期與時間範圍字串 (例如：週一 00:00-04:00)
     * @throws {Error} 當 day 不在 1 到 7 之間時拋出錯誤
     */
    getStringOfWeekTime(day, startTimestamp, endTimestamp) {
        // 星期對照表
        const daysOfWeek = {
            1: '週一', 2: '週二', 3: '週三', 4: '週四',
            5: '週五', 6: '週六', 7: '週日'
        };

        // 檢查參數有效性
        if (day < 1 || day > 7) {
            throw new Error('day 必須在 1 到 7 之間');
        }

        /**
         * 使用 Day.js 格式化時間：
         * HH: 24 小時制 (00-23)
         * mm: 分鐘 (00-59)
         */
        const startTime = dayjs(startTimestamp).format('HH:mm');
        const endTime = dayjs(endTimestamp).format('HH:mm');

        // 返回最終組合字串
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
                    return { ...attributes.map(attr => el[attr]) } //或者 el.getAttribute('src') 更精確!
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

    /**
     * 測量函數的執行時間，並將結果格式化為易讀的時分秒字串。
     * * @sample
     * // 示例函數：模擬 3.21 秒延遲
     * async function exampleFunction() {
     * return new Promise((resolve) => setTimeout(resolve, 3210));
     * }
     * * measureExecutionTime(exampleFunction).then(result => {
     * console.log(result.zh_TW); // 輸出：0小時 0分 3.210秒 (合計 3.210 秒)
     * });
     * * @param {Function} fn - 欲測量的非同步或一般函數。
     * @param {...*} param - 傳遞給該函數的參數。
     * @returns {Promise<{second: string, zh_TW: string}>}
     * second: 總秒數（字串，保留三位小數）。
     * zh_TW: 格式化後的中文執行時間描述。
     */
    measureExecutionTime = async (fn, ...param) => {
        // 1️⃣ 開始計時 (Unix 毫秒時間戳)
        const startTime = Date.now();

        // 2️⃣ 執行傳入的函數
        await fn(...param);

        // 3️⃣ 結束計時並計算總毫秒差
        const endTime = Date.now();
        const durationInMilliseconds = endTime - startTime;

        /** * 4️⃣ 使用 Dayjs Duration 插件處理時間差
         * 注意：需確保已載入 dayjs.extend(duration)
         */
        const dur = dayjs.duration(durationInMilliseconds);

        // 取得各時間單位
        const hours = Math.floor(dur.asHours()); // 使用 asHours 取總小時數 (整數)
        const minutes = dur.minutes();           // 取得該小時內的剩餘分鐘數
        const seconds = dur.seconds();           // 取得該分鐘內的剩餘秒數
        const milliseconds = dur.milliseconds(); // 取得該秒內的剩餘毫秒數

        // 計算總秒數（包含三位小數點）
        const totalSeconds = (durationInMilliseconds / 1000).toFixed(3);

        // 返回結構化結果
        return {
            second: totalSeconds,
            zh_TW: `${hours}小時 ${minutes}分 ${seconds}.${milliseconds.toString().padStart(3, '0')}秒 (合計 ${totalSeconds} 秒)`
        };
    };

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
        if (this.isObject(firstElement) && key) {
            // 使用 Map 根據 key 去重，效率 O(N)
            const uniqueMap = new Map(array.map(item => [item[key], item]));
            return Array.from(uniqueMap.values());
        }
        // 2. 處理物件陣列，但未提供 key (或 key 無效)
        else if (this.isObject(firstElement)) {
            // 回退到 lodash 的深度比較，效率較低 O(N^2)
            console.warn("getSliceArrayOfUniqueOptimized: No key provided for object array, using potentially slow deep comparison.");
            return array.filter((item, index) => array.findIndex(other => this.isEqual(item, other)) === index);
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
        return Array.from(new Set(array.map(item => item[key])));
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
        const labelMap = attributes.reduce((acc, attr) => {
            acc[attr.key] = attr;
            return acc;
        }, {});

        // 把每個屬性的 options 提取成格式化陣列
        const optionArrays = attributes.map(attr =>
            attr.options.map(option => ({
                key: attr.key,
                value: option.value,
                label: option.label
            }))
        );

        // 計算笛卡兒積
        const cartesianProduct = optionArrays.reduce((acc, curr) =>
                acc.flatMap(a => curr.map(b => [...a, b]))
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
        return [...results].sort((a, b) => {
            for (const key of keys) {
                if (a.trait[key] > b.trait[key]) return 1;
                if (a.trait[key] < b.trait[key]) return -1;
            }
            return 0;
        });
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
        array.forEach((obj, index) => {
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
        return array.map(obj =>
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

        // 1. 強制轉為字串，避免 Number 或 Object 沒有 .length 和 .slice() 導致崩潰
        const text = String(originalText);

        // 2. 若文字本身就短，無需裁切
        if (text.length <= maxLength) return text;

        // 3. 若 maxLength 小於 ellipsis 自身長度，回傳空字串
        if (maxLength <= ellipsisLength) return "";

        // 4. 計算並裁切
        const remainingLength = maxLength - ellipsisLength;
        const frontLength = Math.floor(remainingLength / 2);
        const backLength = remainingLength - frontLength;

        const front = text.slice(0, frontLength);
        const back = text.slice(-backLength); // 若 backLength 為 0，這裡依然安全，因為前面邏輯確保了 remainingLength 至少為 1

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
    getObjectBy(obj, predict = (attr) => attr.checked !== true) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) => predict(value))
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
        const sorted = [...array].sort((a, b) => {
            const ka = predict(a);
            const kb = predict(b);
            if (Array.isArray(ka) && Array.isArray(kb)) {
                for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
                    if (ka[i] > kb[i]) return 1;
                    if (ka[i] < kb[i]) return -1;
                }
                return 0;
            }
            return ka > kb ? 1 : (ka < kb ? -1 : 0);
        });
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
        const allStrings = arrays.flat();
        const grouped = allStrings.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(grouped)
            .filter(([_, count]) => count === 1)
            .map(([key, _]) => key)
            .filter(Boolean);
    }

    /**
     * 使用 ES10+ 和 Lodash，將短句子轉換為潛在的搜尋關鍵字陣列。
     * 策略：1. 提取英文單字 2. 提取規格/色號詞組 3. 清理中文 4. 窮舉中文 N-gram 5. 去重和過濾
     * @param {string} sentence - 原始字串。
     * @param {number} [maxLength=50] - 允許的最大字串長度。
     * @param {number} [maxNgramLength=4] - N-gram 的最大長度，預設為 4。
     * @returns {string[]} - 潛在關鍵字陣列（至少 2 個字/中文字）。
     */
    generateUniversalKeywords = (sentence, maxLength = 50, maxNgramLength = 4) => {
        if (!sentence || typeof sentence !== 'string') {
            return [];
        }

        let textToProcess = sentence.trim();
        let keywords = []; // 最終所有關鍵字的集合

        // 參數安全檢查 (確保 N-gram 長度至少為 2)
        maxNgramLength = Math.max(2, maxNgramLength);

        // 警告/截斷邏輯
        if (textToProcess.length > maxLength) {
            console.warn(`警告：輸入字串長度為 ${textToProcess.length}，已根據 maxLength: ${maxLength} 截斷。`);
            textToProcess = textToProcess.substring(0, maxLength);
        }

        // --- 步驟 1: 提取完整英文單字 (SACHIA, sachia, Sachia) ---
        const englishWords = textToProcess.match(/[a-zA-Z]+/g) || [];

        englishWords.forEach(word => {
            if (word.length >= 2) {
                keywords.push(word.toUpperCase());
                keywords.push(word.toLowerCase());
                const capitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                keywords.push(capitalized);
            }
        });

        // --- 步驟 2: 提取規格、數量和色號關鍵字 (12W, 10ml, 10色, 1號) ---
        const specKeywordsRegex = /\b[0-9]+[a-zA-Z]{1,4}\b|\b[0-9]{1,3}(w|ml|g|oz|k)\b|[\u4e00-\u9fa5a-zA-Z0-9]{1,4}(色|號)[\u4e00-\u9fa5a-zA-Z0-9]{0,2}/gi;

        const specKeywords = (textToProcess.match(specKeywordsRegex) || [])
            .filter(k => k.length >= 2)
            .map(k => k.toLowerCase());

        keywords.push(...specKeywords);

        // --- 步驟 3: 清理和標準化 (用於 N-gram 提取) ---

        let cleanText = textToProcess.toLowerCase();

        // 1. 將所有提取過的規格詞彙（數字+單位/字母）替換為空格
        cleanText = cleanText
            .replace(/[0-9]+([\u4e00-\u9fa5a-z]{1,4}|[\/\-\~\\])/g, ' ')
            .replace(/\b[a-z]{1,4}\b/g, ' ')
            .replace(/\b[0-9]{1,3}\b/g, ' ');

        // 2. 移除通用詞和符號
        cleanText = cleanText
            .replace(/[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]/g, ' ')
            .replace(/系列|一組|單色|多款|套組|全套|專用|迷你|頂級|高品質|超閃|奢華|最新|款式|新款|超亮|的|與|和|閃|美甲/g, ' ')
            .replace(/\s+/g, '') // **移除所有空格**
            .trim();

        // --- 步驟 4: 窮舉所有 >= 2 個字的 N-gram 詞組 (針對純中文) ---
        const minLength = 2;
        // maxNgramLength 現在是從參數傳入的

        for (let len = minLength; len <= maxNgramLength; len++) {
            for (let i = 0; i <= cleanText.length - len; i++) {
                const keyword = cleanText.substring(i, i + len);
                keywords.push(keyword);
            }
        }

        // --- 步驟 5: 標準化、去重和過濾 ---
        const finalKeywords = keywords
            .filter(k => k.length >= 2)
            .filter(k => k.length > 2 || !/^[\u4e00-\u9fa5a-z0-9]$/.test(k))
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort();

        return finalKeywords;
    };

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
        const allExceptRef = rest.flat();
        const counted = allExceptRef.reduce((acc, str) => {
            acc[str] = (acc[str] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counted)
            .filter(([str, count]) => count === 1 && !reference.includes(str))
            .map(([str]) => str)
            .filter(Boolean);
    }

    /**
     * 直接修改原本 array，將 object 移動到指定 index
     * @param {Array} array - 要修改的陣列
     * @param {Object} object - 要移動的物件
     * @param {number} index - 目標位置（預設為 0）
     * @returns {Array} 修改後的原陣列（in-place）
     */
    mutateIndexOfArrayItem = (array, object, index = 0) => {
        if (!Array.isArray(array) || !this.isObject(object)) return array;

        const currentIndex = (array).findIndex((x, i) => i >= object && (item => this.isEqual(item)(x, i)));
        if (currentIndex === -1) return array; // 找不到物件，直接回傳

        array.splice(currentIndex, 1); // 先移除原位置
        const targetIndex = Math.min(Math.max(index, 0), array.length);
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
        if (!Array.isArray(array) || !this.isObject(object)) return array;

        const cloned = structuredClone(array); // 深拷貝以避免原陣列被 mutate
        const currentIndex = (cloned).findIndex((x, i) => i >= object && (item => this.isEqual(item)(x, i)));
        if (currentIndex === -1) return array; // 沒找到物件就回傳原陣列

        // 移除原來位置
        cloned.splice(currentIndex, 1);

        // 插入到指定位置（修正越界 index）
        const targetIndex = Math.min(Math.max(index, 0), cloned.length);
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
            Array.from({ length: 8 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');

        const usedValues = new Set(array.map(item => item.value).filter(Boolean));

        return array.map(item => {
            if (((item.value) == null || (typeof (item.value) === "object" && Object.keys(item.value).length === 0) || (typeof (item.value) === "string" && (item.value).length === 0))) {
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
        return (typeof (id) === "string") &&
            id.length === 20 &&
            /^[A-Za-z0-9]{20}$/.test(id);
    }

    getAutoIdOfFirestore() {
        return this.getRandomHashV2(20);
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
        return Array.from(new Set(latest))
            .map(label => {
                // 2. 嘗試從 origin 找出是否已存在該 label
                const originItem = origin.find(o => o.label === label);

                if (originItem) {
                    // 3. 若存在，直接使用 origin 中的 value
                    return { label, value: originItem.value };
                }

                // 4. 若不存在，產生一個不重複的隨機 value
                let value;
                do {
                    // Firestore 可接受的整數範圍（可調整範圍）
                    value = Math.floor(Math.random() * (999999999 - 2 + 1)) + 2;
                } while (usedValues.has(value)); // 確保 value 唯一

                // 5. 記錄該值為已使用，避免後續重複
                usedValues.add(value);

                // 6. 回傳新的物件
                return { label, value };
            });
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
        sourceArray = [],
        values = [],
        valueKey = 'value',
        flagKey = 'belong'
    ) => {
        const valuesSet = new Set(values); // 使用 Set 提高效能
        return (sourceArray).map((item) => ({
            ...item,
            [flagKey]: valuesSet.has(item[valueKey])
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

        const combinations = nonEmptyArrays.reduce(
            (acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])),
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
            Object.fromEntries(Object.entries(item).map(([key, value]) => [mapping[key] || key, value]))
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
    getArrayOfMergeBySpecificId = (array1, array2, idKey = "id") => {
        if (!Array.isArray(array2)) return array1;
        const map2 = array2.reduce((acc, item) => {
            acc[item[idKey]] = item;
            return acc;
        }, {});

        return array1.map(item => {
            const id = item[idKey];
            const match = map2[id];
            return match ? this.merge({}, item, match) : item;
        });
    };

    /**
     * 將人讀的時間範圍字串轉換為緊湊的時間戳區間字串。
     * * @sample
     * const result = getStringOfConvertTimeRange('2025/08/18(一)｜16:00-17:00');
     * console.log(result);
     * // 輸出: '202508181600-202508181700'
     * * @param {string} input - 輸入字串，格式為 "YYYY/MM/DD(週)｜HH:mm-HH:mm"
     * @returns {string} 轉換後的字串，格式為 "YYYYMMDDHHmm-YYYYMMDDHHmm"
     */
    getStringOfConvertTimeRange(input) {
        /**
         * 1️⃣ 解析輸入字串
         * split('｜') => ["2025/08/18(一)", "16:00-17:00"]
         */
        const [datePart, timeRange] = input.split('｜');

        /** 2️⃣ 取得日期部分: 取括號前的字串 "2025/08/18" */
        const dateStr = datePart.split('(')[0];

        /** 3️⃣ 拆分起訖時間: ["16:00", "17:00"] */
        const [start, end] = timeRange.split('-');

        /** * 4️⃣ 定義內部格式化邏輯
         * 使用 customParseFormat 插件解析 YYYY/MM/DD HH:mm
         */
        const formatDate = (time) =>
            dayjs(`${dateStr} ${time}`, 'YYYY/MM/DD HH:mm').format('YYYYMMDDHHmm');

        // 返回最終組合結果
        return `${formatDate(start)}-${formatDate(end)}`;
    }

    /**
     * 將特定日期字串轉換為當日開始或結束的 14 位數時間戳記格式
     * * @sample
     * // 1. 取得當日 00:00:00 的數字格式
     * getTSOfSpecificDate("2025/08/18(一)", { end: false });
     * // 輸出: 20250818000000
     * * @sample
     * // 2. 取得當日 23:59:59 的數字格式
     * getTSOfSpecificDate("2025/08/18(一)", { end: true });
     * // 輸出: 20250818235959
     * @param {string} dateStr - 輸入日期字串，格式為 "YYYY/MM/DD(週)"
     * @param {Object} options - 配置選項
     * @param {boolean} [options.end=false] - 是否取當日結束時間 (23:59:59)
     * @returns {number} 14 位數的時間整數 (YYYYMMDDHHmmss)
     */
    getTSOfSpecificDate(dateStr, { end = false } = {}) {
        /**
         * 1️⃣ 解析字串：取括號前的 "YYYY/MM/DD"
         * 2️⃣ 使用 customParseFormat 解析為 dayjs 物件
         */
        const baseDate = dayjs(dateStr.split("(")[0], "YYYY/MM/DD");

        /**
         * 3️⃣ 根據選項切換至當日起始或結束點
         * 注意：.startOf() 與 .endOf() 會回傳新物件，符合不可變原則
         */
        const resultDate = end ? baseDate.endOf("day") : baseDate.startOf("day");

        /**
         * 4️⃣ 格式化並轉為數字
         * 格式: YYYYMMDDHHmmss (14位數)
         */
        return Number(resultDate.format("YYYYMMDDHHmmss"));
    }

    /**
     * 檢查是否為 HTTPS 網址
     * @param {string} url
     * @returns {boolean}
     */
    isHttpsURL(url) {
        if (!(typeof (url) === "string")) return false;

        try {
            const decoded = decodeURIComponent(url.trim());
            const parsed = new URL(decoded);

            return parsed.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    /**
     * 將百分比數值轉換為小數形式。
     *
     * @example
     * toPercentageDecimal(100);     // 1
     * toPercentageDecimal(97);      // 0.97
     * toPercentageDecimal('97');    // 0.97
     * toPercentageDecimal('97%');   // 0.97
     * toPercentageDecimal('10 %');  // 0.1
     * toPercentageDecimal('abc');   // 1  （非數字字串時，回傳 1）
     *
     * @param {number|string} num - 百分比值，可包含 "%" 符號或字串格式。
     * @returns {number} - 轉換後的小數值，若轉換失敗則回傳 1。
     */
    toPercentageDecimal = (num) => {
        if (num == null) return 1;

        // 若輸入為字串，先移除 "%" 符號與多餘空白
        if ((typeof (num) === "string")) {
            num = num.replace(/%/g, '').trim();
        }

        // 轉換為數字
        const parsed = Number(num);

        // 若不是有限數字，回傳預設值 1
        if (!Number.isFinite(parsed)) return 1;

        // 四捨五入到小數點第 10 位
        return Number(Math.round(parsed / 100 + "e" + 10) + "e-" + 10);
    };

    /**
     * 🧩 產生合法變數命名的唯一亂碼代碼對照表（支援自訂長度）
     *
     * 將輸入的字串陣列轉換成：
     * 1️⃣ 合法變數命名 key（以 this.camelCase() 處理）
     * 2️⃣ 對應唯一亂碼代碼（預設長度 3，第一字母必須為英文字母）
     * 3️⃣ 若 key 重複，拋出錯誤並指出是哪個 key 重複
     *
     * @param {string[]} array - 要轉換的字串陣列
     * @param {number} [length=3] - 代碼長度（預設為 3，最小為 2）
     * @returns {Object} 回傳一個 JSON 物件
     */
    generateUniqueCodeMap(array, length = 3) {
        if (length < 2) {
            throw new Error("代碼長度最少必須為 2。");
        }

        const usedCodes = new Set();
        const usedKeys = new Set();

        /**
         * 產生合法變數代碼（指定長度亂碼）
         * 第1字母：a-zA-Z
         * 其餘字元：a-zA-Z0-9
         */
        const generateRandomCode = () => {
            const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const chars = letters + "0123456789";
            let code;

            do {
                // 第一個字母必須是英文
                code = letters[Math.floor(Math.random() * letters.length)];
                // 其餘字元隨機取
                for (let i = 1; i < length; i++) {
                    code += chars[Math.floor(Math.random() * chars.length)];
                }
            } while (usedCodes.has(code));

            usedCodes.add(code);
            return code;
        };

        return array.reduce((acc, currentString) => {
            // 依照註解需求，呼叫 class 內部的 camelCase 方法轉換字串
            const key = this.camelCase(currentString);

            if (usedKeys.has(key)) {
                throw new Error(`23125453 Duplicate key detected: "${key}"`);
            }

            usedKeys.add(key);
            acc[key] = generateRandomCode();

            return acc;
        }, {});
    }

    /**
     *     無條件進位的公式
     *     multiplyCeil(1.24, 3);        // => 4
     *     multiplyCeil(1.24, 3, 1);     // => 3.8
     *     multiplyCeil(1.24, 3, 2);     // => 3.72
     */
    getNumberOfMultiplyCeil = (a, b, precision = 0) => {
        const factor = Math.pow(10, precision);
        return Math.ceil(a * b * factor) / factor;
    };

    /**
     * 根據百分比計算價格變化後的金額(折扣後的總金額)。
     *
     * @param {number} price - 原始價格。
     * @param {number} percentage - 百分比（例如 10 表示 10%）。
     * @param {boolean} [discount=false] - 是否為折扣模式。
     *    - true：表示減價（例如 10% 折扣 → 價格 * (1 - 0.1)）
     *    - false：表示加價（例如 10% 加成 → 價格 * (1 + 0.1)）
     * @returns {number} - 計算後的金額，並取「向上取整」結果。
     *
     * 範例：
     * getPriceOfPercentageBehavior(100, 10, true)  → 90
     * getPriceOfPercentageBehavior(100, 10, false) → 110
     */
    getPriceOfPercentageBehavior(price, percentage, discount = false) {
        // 將百分比（例如 10）轉為小數（0.1）
        const decimal = this.toPercentageDecimal(percentage);

        // 根據是否為折扣，決定乘上 (1 - 0.1) 或 (1 + 0.1)
        // 並呼叫 getNumberOfMultiplyCeil 進行乘法後向上取整
        return this.getNumberOfMultiplyCeil(price, discount ? 1 - decimal : 1 + decimal);
    }

    getFeeOfDiscount(origin, percentage) {
        return Math.round((origin) * (this.toPercentageDecimal(percentage)));
    }

    /**
     * 📦 mergeArrayByKey(array)
     * ---------------------------------------
     * 將陣列中相同 key 的物件進行「巢狀合併」，並直接 mutate 原陣列內容。
     *
     * ✅ 特點：
     * - 自動合併相同 key 的物件內容（深層合併）
     * - 不建立新陣列，會直接修改傳入的 array
     * - 適用於需要整併設定、狀態、表單資料等情境
     *
     * 🧩 範例：
     * ```js
     * const array = [
     *   { a: { b: { c: 2 } } },
     *   { b: { d: { g: 1 } }, a: { b: { y: 1 }, h: { e: 1 } } }
     * ];
     *
     * ArrayHelper.mergeArrayByKey(array);
     *
     * console.log(array);
     * // 👉 [ { a: { b: { c: 2, y: 1 }, h: { e: 1 } } }, { b: { d: { g: 1 } } } ]
     * ```
     *
     * @param {Array<Object>} array - 需被合併的物件陣列
     * @returns {Array<Object>} - 回傳同一個（已被 mutate 的）陣列
     */
    mergeArrayByKey(array) {
        if (!Array.isArray(array)) return array;

        // 收集所有 key 的合併結果
        const resultMap = {};

        for (const obj of array) {
            if (!(typeof obj === 'object' && obj !== null && obj.constructor === Object)) continue;
            for (const [key, value] of Object.entries(obj)) {
                if (!resultMap[key]) {
                    resultMap[key] = structuredClone(value);
                } else {
                    this.merge(resultMap[key], value);
                }
            }
        }

        // 清空原陣列（mutate）
        array.length = 0;

        // 重建結構
        Object.entries(resultMap).forEach(([key, value]) => {
            array.push({ [key]: value });
        });

        return array;
    }

    /**
     * 將時間字串解析為物件，回傳 {startDate, startTime, endDate, endTime}
     *
     * 支援格式：
     * 1. '2025/11/10 (一)｜13:00-15:00'
     *    => { startDate:'2025/11/10', startTime:'13:00', endDate:'2025/11/10', endTime:'15:00' }
     *
     * 2. '2025/11/10 (一) 13:00 - 2025/11/12 (三) 15:00'
     *    => { startDate:'2025/11/10', startTime:'13:00', endDate:'2025/11/12', endTime:'15:00' }
     *
     * @param {string} input - 欲解析的時間字串
     * @returns {{startDate: string, startTime: string, endDate: string, endTime: string}} 解析後的時間物件
     *
     * @example
     * getObjectOfStartEndDateTime('2025/11/10 (一)｜13:00-15:00');
     * // => { startDate:'2025/11/10', startTime:'13:00', endDate:'2025/11/10', endTime:'15:00' }
     *
     * @example
     * getObjectOfStartEndDateTime('2025/11/10 (一) 13:00 - 2025/11/12 (三) 15:00');
     * // => { startDate:'2025/11/10', startTime:'13:00', endDate:'2025/11/12', endTime:'15:00' }
     */
    getObjectOfStartEndDateTime(input) {
        if (!input || typeof input !== 'string') {
            return { startDate: '', startTime: '', endDate: '', endTime: '' };
        }

        // 將全形符號與多餘空白轉換為標準形式
        const cleaned = input
            .replace(/｜/g, ' ')
            .replace(/－/g, '-') // 全形破折號轉半形
            .replace(/\s+/g, ' ')
            .trim();

        // 跨日期格式 (例：2025/11/10 13:00 - 2025/11/12 15:00)
        const crossDatePattern =
            /(\d{4}\/\d{1,2}\/\d{1,2})(?:\s*\([^)]*\))?\s*(\d{2}:\d{2})\s*-\s*(\d{4}\/\d{1,2}\/\d{1,2})(?:\s*\([^)]*\))?\s*(\d{2}:\d{2})/;

        // 同日期格式 (例：2025/11/10 13:00 - 15:00)
        const sameDatePattern =
            /(\d{4}\/\d{1,2}\/\d{1,2})(?:\s*\([^)]*\))?\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/;

        let startDate, startTime, endDate, endTime;

        if (crossDatePattern.test(cleaned)) {
            [, startDate, startTime, endDate, endTime] = cleaned.match(crossDatePattern);
        } else if (sameDatePattern.test(cleaned)) {
            [, startDate, startTime, endTime] = cleaned.match(sameDatePattern);
            endDate = startDate;
        } else {
            return { startDate: '', startTime: '', endDate: '', endTime: '' };
        }

        // 將日期時間轉為可比較的 Date 物件
        const start = new Date(`${startDate} ${startTime}`);
        const end = new Date(`${endDate} ${endTime}`);

        if (end < start) {
            throw new Error(`End time cannot be earlier than start time: ${input}`);
        }

        return { startDate, startTime, endDate, endTime };
    }

    /**
     * 根據行程資訊生成 Google Calendar 的「新增行程」動態連結。
     * * @sample
     * const link = generateGoogleCalendarLink({
     * title: "吉他課",
     * startDate: "2025/11/10",
     * startTime: "14:00",
     * endDate: "2025/11/10",
     * endTime: "16:00",
     * location: "台北市大安區",
     * details: "記得帶譜"
     * });
     * // 回傳: https://calendar.google.com/calendar/r/eventedit?text=...
     *
     * @param {object} event - 行程物件。
     * @param {string} event.title - 行程主題。
     * @param {string} event.startDate - 開始日期 (YYYY/MM/DD)。
     * @param {string} event.startTime - 開始時間 (HH:mm)。
     * @param {string} event.endDate - 結束日期 (YYYY/MM/DD)。
     * @param {string} event.endTime - 結束時間 (HH:mm)。
     * @param {string} [event.location] - 地點/地址 (可選)。
     * @param {string} [event.details] - 描述/備註 (可選)。
     * @returns {string} Google Calendar 的新增連結 URL 字串。
     */
    generateGoogleCalendarLink = ({
                                      title, startDate, startTime, endDate, endTime, location, details
                                  }) => {
        /** Google Calendar URL 要求的時間格式 */
        const googleFormat = 'YYYYMMDDTHHmmss';

        /** * 使用 Day.js 解析自定義格式日期並轉換為字串
         * 例如: 20251110T140000
         */
        const startDateTime = dayjs(`${startDate} ${startTime}`, 'YYYY/MM/DD HH:mm').format(googleFormat);
        const endDateTime = dayjs(`${endDate} ${endTime}`, 'YYYY/MM/DD HH:mm').format(googleFormat);

        /** 使用瀏覽器內建的 URLSearchParams 處理字串編碼 */
        const params = new URLSearchParams();

        if (title) params.append('text', title);

        /** 組合日期範圍: [起始時間]/[結束時間] */
        if (startDateTime && endDateTime) {
            params.append('dates', `${startDateTime}/${endDateTime}`);
        }

        if (details) params.append('details', details);
        if (location) params.append('location', location);

        /** * ctz: 設定時區 (台北)
         * trp: 設定為忙碌狀態 (true)
         */
        params.append('ctz', 'Asia/Taipei');
        params.append('trp', 'true');

        return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
    };

    /**
     * 根據課程資訊生成 TimeTree 的行事曆新增連結。
     * 若部分參數為空值，則不加入連結中。
     *
     * @param {object} event - 行程物件。
     * @param {string} event.title - 行程主題。
     * @param {string} event.startDate - 開始日期 (YYYY/MM/DD)。
     * @param {string} event.startTime - 開始時間 (HH:MM)。
     * @param {string} event.endDate - 結束日期 (YYYY/MM/DD)。
     * @param {string} event.endTime - 結束時間 (HH:MM)。
     * @param {string} [event.location] - 地點/地址。
     * @param {string} [event.memo] - 描述/備註 (TimeTree 使用 'memo')。
     * @returns {string} TimeTree 行事曆新增連結。
     */
    generateTimeTreeLink = ({
                                title,
                                startDate,
                                startTime,
                                endDate,
                                endTime,
                                location,
                                memo
                            }) => {
        const params = new URLSearchParams();

        if (title) params.append('title', title);
        if (startDate) params.append('start_date', startDate.replace(/\//g, '-'));
        if (startTime) params.append('start_time', startTime);
        if (endDate) params.append('end_date', endDate.replace(/\//g, '-'));
        if (endTime) params.append('end_time', endTime);
        if (location) params.append('location', location);
        if (memo) params.append('memo', memo);

        return `https://timetreeapp.com/plans/new?${params.toString()}`;
    };

    /**
     * 根據行程資訊生成符合 RFC 5545 規範的 iCalendar (.ics) 檔案內容。
     * * @sample
     * const icsData = generateIcsContent({
     * title: "鋼琴課程",
     * startDate: "2024/12/25",
     * startTime: "14:00",
     * endDate: "2024/12/25",
     * endTime: "15:00",
     * location: "台北市大安區",
     * details: "記得帶樂譜"
     * });
     *
     * @param {object} event - 行程物件。
     * @param {string} event.title - 行程主題。
     * @param {string} event.startDate - 開始日期 (YYYY/MM/DD)。
     * @param {string} event.startTime - 開始時間 (HH:mm)。
     * @param {string} event.endDate - 結束日期 (YYYY/MM/DD)。
     * @param {string} event.endTime - 結束時間 (HH:mm)。
     * @param {string} [event.location] - 地點/地址 (可選)。
     * @param {string} [event.details] - 描述/備註 (可選)。
     * @returns {string} 遵循 iCalendar 規範的 \r\n 換行字串內容。
     */
    generateIcsContent = ({
                              title,
                              startDate,
                              startTime,
                              endDate,
                              endTime,
                              location,
                              details
                          }) => {
        // 設定目標時區
        const tzid = 'Asia/Taipei';
        const icsFormat = 'YYYYMMDDTHHmmss';

        /** * 使用 dayjs.tz 解析特定時區的時間字串並格式化。
         * 注意：輸入字串格式需符合 YYYY/MM/DD HH:mm
         */
        const startDateTime = dayjs.tz(`${startDate} ${startTime}`, 'YYYY/MM/DD HH:mm', tzid).format(icsFormat);
        const endDateTime = dayjs.tz(`${endDate} ${endTime}`, 'YYYY/MM/DD HH:mm', tzid).format(icsFormat);

        /** DTSTAMP 通常要求 UTC 時間並以 Z 結尾 */
        const stamp = dayjs().utc().format(icsFormat) + 'Z';

        /** 產生唯一辨識碼 UID */
        const uid = Date.now().toString(36) + Math.random().toString(36).substring(2, 5) + '@gemini-app.com';

        /**
         * 根據 ICS 規範進行特殊字元跳脫 (Escape)
         * 避免標點符號與換行符號破壞文件結構
         */
        const escapeIcs = (text) =>
            (text || "")
                .replace(/\\/g, '\\\\')
                .replace(/,/g, '\\,')
                .replace(/;/g, '\\;')
                .replace(/\n/g, '\\n');

        // 開始構建文件行
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Gemini AI//NONSGML v1.0//EN',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${stamp}`
        ];

        /** 寫入帶有時區標籤的時間欄位 */
        if (startDateTime) lines.push(`DTSTART;TZID=${tzid}:${startDateTime}`);
        if (endDateTime) lines.push(`DTEND;TZID=${tzid}:${endDateTime}`);

        if (title) lines.push(`SUMMARY:${escapeIcs(title)}`);
        if (location) lines.push(`LOCATION:${escapeIcs(location)}`);
        if (details) lines.push(`DESCRIPTION:${escapeIcs(details)}`);

        lines.push('END:VEVENT', 'END:VCALENDAR');

        // iCalendar 要求使用 CRLF (\r\n) 作為換行符
        return lines.join('\r\n');
    };


    /**
     * 根據行程物件，生成所有主要的行事曆新增連結 (Google, TimeTree, iCalendar/ICS)。
     * @param {object} event - 行程物件。
     * @param {string} event.title - 行程主題。
     * @param {string} event.startDate - 開始日期 (YYYY/MM/DD)。
     * @param {string} event.startTime - 開始時間 (HH:MM)。
     * @param {string} event.endDate - 結束日期 (YYYY/MM/DD)。
     * @param {string} event.endTime - 結束時間 (HH:MM)。
     * @param {string} event.location - 地點/地址。
     * @param {string} event.details - 描述/備註。
     * @returns {{google: string, timeTree: string, ics: string}} 包含所有連結的物件。
     */
    generateAllCalendarLinks = (event) => {
        // 1. Google Calendar Link
        const googleLink = this.generateGoogleCalendarLink(event);

        // 2. TimeTree Link
        // TimeTree 使用 'memo' 參數，因此將 event.details 映射到 memo
        const timeTreeEvent = { ...event, memo: event.details };
        const timeTreeLink = this.generateTimeTreeLink(timeTreeEvent);

        // 3. iCalendar (ICS) Link (Data URI 格式，用於 iOS/Outlook/下載)
        const icsContent = this.generateIcsContent(event);
        const icsLink = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

        return {
            google: googleLink,
            timeTree: timeTreeLink,
            ics: icsLink // iCalendar 連結
        };
    };


    /** ============== 排課系統公式 開始 ============== */

    /**
     * /const arrayWithDup = [
     *   { idOfBooze: "A111", idOfVariant: "V001", period: "202508151400-202508151500" },
     *   { idOfBooze: "B222", idOfVariant: "V002", period: "202508151600-202508151700" },
     *   { idOfBooze: "A111", idOfVariant: "V001", period: "202508161400-202508161500" }, // 🔁 與第一筆 PK 相同
     *   { idOfBooze: "B222", idOfVariant: "V003", period: "202508171600-202508171700" },
     *   { idOfBooze: "A111", idOfVariant: "V004", period: "202508181400-202508181500" }
     *
     * ];
     * const result = getFilteredPeriods(arrayWithDup, "B222"); console.log(result);
     *   [ "202508151400-202508151500", "202508181400-202508181500" ]
     * 1. 刪掉所有 idOfBooze = "B222" 的項目
     * 2. idOfBooze和idOfVariant為PK， 重複的只保留一組
     * 3. 回傳filter array,(反查出哪些課程重複會用到其他資訊)
     * */
    getFilteredHeraPeriods(arr, idOfCurrentBooze) {
        if (!Array.isArray(arr)) return [];

        // 用來記錄已經出現過的唯一鍵 (PK)
        const seenKeys = new Set();

        return arr
            // 1️⃣ 刪掉 idOfBooze 等於目標值的項目
            .filter(item => item.idOfBooze !== idOfCurrentBooze)
            // 2️⃣ 根據 idOfBooze + idOfVariant 進行去重（只留第一筆）
            .filter(item => {
                const pk = `${item.idOfBooze}_${item.idOfVariant}`;
                if (seenKeys.has(pk)) {
                    return false; // 已經存在，過濾掉
                }
                seenKeys.add(pk); // 第一次見到，記錄下來並保留
                return true;
            })
            // 3️⃣ 過濾掉沒有 period 的項目（避免 undefined 或空值），並保留完整物件 💡
            .filter(item => item && item.period);
    }

    /**
     * 檢查新任務與既有任務是否有時間衝突。
     * * @sample
     * const newTask = { content: "2025/08/15 (週五)｜14:00-16:00" };
     * const existingTasks = [
     * { period: "202508151530-202508151700" }, // 🔁 與新任務重疊 15:30-16:00
     * { period: "202508151600-202508151800" }  // ✅ 剛好接續，不構成衝突
     * ];
     * checkPeriodConflict(newTask, existingTasks, 1);
     * // 回傳: { conflict: true, items: [{ period: "202508151530-202508151700" }] }
     * @param {Object} newTask - 新任務物件，content 格式: "YYYY/MM/DD (週)｜HH:mm-HH:mm"
     * @param {Array} existingTasks - 既有任務陣列，每個元素需有 period 屬性: "yyyymmddHHmm-yyyymmddHHmm"
     * @param {number} [resourceCount=1] - 可同時承載的最大任務數量 (資源量)
     * @returns {Object} { conflict: boolean, items: Array } - 是否衝突及衝突清單
     */
    checkPeriodConflict(newTask, existingTasks, resourceCount = 1) {
        // 1️⃣ 解析 timeSlot 拆成日期與時間範例
        // 分割 content: "2024/09/15 (週日)｜14:00-16:00"
        const [datePart, timePart] = newTask.content.split('｜');
        // 取得日期字串: "2024/09/15"
        const dateStr = datePart.split(' ')[0];
        const [startTimeStr, endTimeStr] = timePart.split('-');

        /** * 解析新任務的起訖點。
         * dayjs 預設不支援 YYYY/MM/DD，需搭配 customParseFormat 插件。
         */
        const start = dayjs(`${dateStr} ${startTimeStr}`, 'YYYY/MM/DD HH:mm');
        const end = dayjs(`${dateStr} ${endTimeStr}`, 'YYYY/MM/DD HH:mm');

        // 2️⃣ 篩選出時間重疊的任務
        const conflictItems = existingTasks.filter(task => {
            const [pStartStr, pEndStr] = task.period.split('-');

            // 解析既有任務的時間戳字串: "202508151530"
            const pStart = dayjs(pStartStr, 'YYYYMMDDHHmm');
            const pEnd = dayjs(pEndStr, 'YYYYMMDDHHmm');

            /**
             * 衝突判斷演算法 (Overlap Detection):
             * (StartA < EndB) 且 (EndA > StartB) 代表有交集。
             * 若 A 的結束點等於 B 的開始點，此公式結果為 false (不衝突)。
             */
            return start.isBefore(pEnd) && end.isAfter(pStart);
        });

        // 3️⃣ 判斷衝突數量是否超過資源上限
        const conflict = conflictItems.length >= resourceCount;

        return {
            conflict,
            items: conflictItems // 回傳具體的衝突項目以便前端提示或反查
        };
    }

    /**
     * @param {Array<Object>} current - 要更新的目標陣列
     * @param {Array<Object>} reference - 用來替換屬性的參照陣列
     * @returns {Array<Object>} - 更新後的陣列
     *
     * const current = [{ value: 1, label: 'one' }, { value: 2, label: 'two' }];
     * const reference = [{ value: 1, label: 'ㄧ', type: 'a' }, { value: 2, label: '二', type: 'b' }, { value: 3, label: '三' }, { value: 3, label: '四' }];
     * const latest = updateArrayByReference(current, reference);
     * console.log(latest);
     *  預期輸出:
     *  [
     *    { value: 1, label: 'ㄧ', type: 'a' },
     *    { value: 2, label: '二', type: 'b' }
     *  ]
     */
    getArrayOfMappingRef = (current, reference) => {
        // 使用 _.map 迭代 current 陣列，為每個物件建立一個新物件
        return (current).map((currentObj) => {
            // 使用 _.find 在 reference 陣列中尋找與 currentObj.value 相同的物件
            const referenceObj = reference.find(r => r.value === currentObj.value);
            // 如果找到對應的參考物件，則使用 _.merge 來合併它們
            // _.merge 會將 referenceObj 的屬性覆蓋到 currentObj 上
            // 否則，返回原始的 currentObj
            return referenceObj ? this.merge({}, currentObj, referenceObj) : currentObj;
        });
    };

    /**
     * 檢查多個鍵 (authorId 和 teamId)
     * const result2 = areAllValuesTheSameOnKeys(items, 'authorId', 'teamId');
     * console.log(`檢查 authorId 和 teamId: ${result2}`); // 輸出: true (A, T1 都相同)
     */
    areAllValuesTheSameOnKeys = (array, ...keys) => {
        // 處理邊界情況：陣列為空、只有一個元素，或沒有指定任何鍵時，直接返回 true
        if (!array || array.length <= 1 || keys.length === 0) {
            return true;
        }

        // 依序檢查每個傳入的 keyName
        for (const keyName of keys) {

            // 確保第一個元素有所需的鍵，避免不必要的檢查
            // 使用 ES10 可選鏈 (Optional Chaining)
            const firstValue = array[0]?.[keyName];

            // 使用 _.every 檢查陣列中所有元素，確保其值與第一個元素的值相同
            const isCurrentKeySame = array.every((item) => {
                return item[keyName] === firstValue;
            });

            // 只要發現有一個鍵的值不相同，立即返回 false
            if (!isCurrentKeySame) {
                return false;
            }
        }

        // 如果所有鍵都通過了檢查，則返回 true
        return true;
    };


    /**
     * 移除陣列中重複的元素，並以指定的 'key' 欄位作為唯一識別鍵 (Primary Key)。
     * 規則：當 'key' 欄位的值重複時，只保留在陣列中出現的第一個元素。
     *
     * @param {Array<Object>} data - 包含物件的輸入陣列，每個物件應包含指定的 'key' 欄位。
     * @param {string} key - 用於判斷唯一性的物件屬性名稱（例如：'href', 'id', 'email'）。
     * @returns {Array<Object>} - 經過去重處理後的新陣列 (不會修改原始陣列)。
     * @example
     * // 範例輸入資料
     * const inputData = [
     * { href: 'avb', title: '123' },
     * { href: 'avc', title: '321' },
     * { href: 'avb', title: '213' } // 重複的 'avb'，會被捨棄
     * ];
     * // 呼叫函數
     * const uniqueData = removeDuplicatesByKeyES11(inputData, 'href');
     * // 輸出結果:
     * // [
     * //   { href: 'avb', title: '123' },
     * //   { href: 'avc', title: '321' }
     * // ]
     */
    getArrayOfUniqBy = (data, key) => {
        if (!Array.isArray(data)) {
            console.error("Input must be an array.");
            return [];
        }

        if (typeof key !== 'string' || key.length === 0) {
            console.error("Key must be a non-empty string.");
            // 如果 key 無效，返回原陣列的副本
            return [...data];
        }

        // 1. 使用 Array.prototype.reduce 迭代陣列
        // 2. 使用 Map 作為累積器 (accumulator)，它的鍵 (Key) 追蹤唯一性，值 (Value) 儲存物件。
        const uniqueMap = data.reduce((map, currentItem) => {
            const keyValue = currentItem[key];

            // Map.prototype.has() 檢查鍵是否存在
            // 由於 reduce 是從頭到尾迭代，我們只在 Map 中沒有該鍵時才設置它。
            // 這確保了重複鍵的情況下，只有第一個遇到的值會被保留。
            if (!map.has(keyValue)) {
                // Map.prototype.set() 儲存 item，同時 Map 會保持插入順序
                map.set(keyValue, currentItem);
            }
            return map;
        }, new Map());

        // 3. 使用 Array.from 配合 Map.prototype.values() 提取所有值
        // Map 的 values() 方法會按照元素插入的順序返回，從而生成最終的去重陣列。
        return Array.from(uniqueMap.values());
    };

    // testOfConflict() {
    //     // ===== 測試資料 =====
    //     const newTask = {
    //         timeSlot: "2025/08/20 (三)｜16:00-17:00", // 格式: YYYY/MM/DD (週)｜HH:mm-HH:mm
    //         id: "JOB001",
    //         description: "安裝冷氣"
    //     };
    //
    //     const existingTasks = [
    //         { id: "T001", period: "202508151400-202508151500" },
    //         { id: "T002", period: "202508151600-202508151700" },
    //         { id: "T003", period: "202508161400-202508161500" },
    //         { id: "T004", period: "202508171600-202508171700" },
    //         { id: "T005", period: "202508201630-202508201700" }, // 衝突
    //         { id: "T006", period: "202508201645-202508201700" }  // 衝突
    //     ];
    //
    //     // 測試：一人資源
    //     console.log(this.checkPeriodConflict(newTask, existingTasks, 1));
    //     /*
    //     {
    //       conflict: true,
    //       items: [
    //         { id: 'T005', period: '202508201630-202508201700' },
    //         { id: 'T006', period: '202508201645-202508201700' }
    //       ]
    //     }
    //     */
    //
    //     // 測試：兩人資源
    //     console.log(this.checkPeriodConflict(newTask, existingTasks, 2));
    //     /*
    //     {
    //       conflict: false,
    //       items: [
    //         { id: 'T005', period: '202508201630-202508201700' },
    //         { id: 'T006', period: '202508201645-202508201700' }
    //       ]
    //     }
    //     */
    // }
    /** ============== 排課系統公式 結束 ============== */

    /**
     * @typedef {Array<*>} Collection - 任何元素的陣列集合。
     * @typedef {(item: *, index: number, collection: Collection) => Promise<any>} ItemTask - 對集合中的單個項目執行的非同步任務函式。
     */

    /**
     * 異步並行處理集合中的每個項目，並等待所有任務完成。
     * @param {Collection} collection - 要處理的元素陣列。預設為空陣列 []。
     * @param {ItemTask} task - 必須是一個非同步函式 (async function)。對集合中的每個元素執行一次。
     * @returns {Promise<Array<any>>} - 一個 Promise，解析為所有並行任務的結果陣列。
     * @throws {Error} - 如果 task 參數不是一個 async function，則拋出錯誤。
     */
    execute4Tasks = async (collection = [], task) => {
        // 1. 檢查 task 是否存在且為函式
        if (!task || typeof task !== 'function') {
            throw new Error('Task function is required and must be a function.');
        }

        // 2. 檢查 task 是否為 async function
        // 在 JavaScript 中，可以透過 constructor.name 屬性來判斷函式類型
        if (task.constructor.name !== 'AsyncFunction') {
            throw new Error('Task function must be an asynchronous function (async function) to ensure proper Promise handling.');
        }

        // 3. 處理空集合
        if (collection.length === 0) {
            return Promise.resolve([]);
        }

        // Promise.all 等待 collection.map 生成的所有 Promise 都完成
        return await Promise.all(collection.map(async (child, index) => {
            // 由於 task 已經被保證是 async 函式，我們不需要 await task()，但為了與原始碼保持一致，可以保留。
            // return await task(child, index, collection);
            // 更簡潔且等效的寫法：
            return task(child, index, collection);
        }));
    }

    /**
     * 異步並行處理集合中的每個項目，並等待所有任務完成（無論成功或失敗）。
     * 類似 Promise.allSettled，每個結果都會回傳其執行狀態。
     *
     * @param {Collection} collection - 要處理的元素陣列。預設為空陣列 []。
     * @param {ItemTask} task - 必須是一個非同步函式 (async function)。對集合中的每個元素執行一次。
     * @returns {Promise<Array<{ status: 'fulfilled', value: any } | { status: 'rejected', reason: any }>>}
     *          - 一個 Promise，解析為所有任務的結果狀態陣列。
     * @throws {Error} - 如果 task 參數不是一個 async function，則拋出錯誤。
     */
    execute4Settled = async (collection = [], task) => {
        // 1. 檢查 task 是否存在且為函式
        if (!task || typeof task !== 'function') {
            throw new Error('Task function is required and must be a function.');
        }

        // 2. 檢查 task 是否為 async function
        if (task.constructor.name !== 'AsyncFunction') {
            throw new Error('Task function must be an asynchronous function (async function) to ensure proper Promise handling.');
        }

        // 3. 處理空集合
        if (collection.length === 0) {
            return Promise.resolve([]);
        }

        // 4. Promise.allSettled：無論成功或失敗都會回傳結果
        return await Promise.allSettled(
            collection.map((child, index) =>
                task(child, index, collection)
            )
        );
    };

    /**
     * 把檔案大小，找個最適當的表是法aka
     * 格式化位元組數為人類可讀的 KB/MB/GB 格式
     */
    getReadableOfFileS = (bytes, decimals = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    /**
     * 將儲存容量字串轉換為位元組 (Bytes) 數值
     * * @param {string|number} input - 容量字串，如 '2.3KB', '3.78MB', '4mb', '3.33kb', '2.2456GB'
     * @returns {number} - 轉換後的 Byte 數值
     * @throws {Error} - 當格式不符或單位無法識別時拋出錯誤
     * * @example
     * parseStorageSize('3MB');        // 回傳: 3145728
     * parseStorageSize('4mb');        // 回傳: 4194304
     * parseStorageSize('3.33kb');     // 回傳: 3409.92
     * parseStorageSize('1b');         // 回傳: 1 (若 1b 代表 1 Byte)
     * parseStorageSize('2.2456GB');   // 回傳: 2411183374.336
     * parseStorageSize('10K');        // 回傳: 10240
     */
    getNumOfFileS = (input) => {
        // 1. 基本類型檢查與格式化
        if (input === null || input === undefined) {
            throw new Error('輸入不能為空');
        }

        // 統一轉大寫並去除兩端空格
        const str = String(input).toUpperCase().trim();

        // 2. 正規表達式拆分：
        // (\d+(\.\d+)?) -> 第一群組：數字（支援整數或小數）
        // \s* -> 允許數字與單位間有空格
        // ([A-Z]*)      -> 第二群組：單位字母（A-Z）
        const match = str.match(/^(\d+(\.\d+)?)\s*([A-Z]*)$/);

        if (!match) {
            throw new Error(`[Invalid Format] 無法解析：'${input}'。請確保格式如 '5MB'`);
        }

        const value = parseFloat(match[1]);
        const unit = match[3];

        // 3. 定義單位倍率對照表 (ES11 可使用指數運算子 **)
        // 根據標準：B=1, K=1024, M=1024^2, G=1024^3, T=1024^4
        const unitMap = {
            '': 1,
            'B': 1,
            'K': 1024,
            'KB': 1024,
            'M': 1024 ** 2,
            'MB': 1024 ** 2,
            'G': 1024 ** 3,
            'GB': 1024 ** 3,
            'T': 1024 ** 4,
            'TB': 1024 ** 4
        };

        // 4. 驗證單位合法性
        // 使用 in 運算子檢查 Key 是否存在
        if (!(unit in unitMap)) {
            throw new Error(`[Unknown Unit] 未知的容量單位：'${unit}'`);
        }

        // 5. 回傳計算結果
        return value * unitMap[unit];
    }

    /**
     * 萬用函數檢查：支援 ES5, ES6+, Async, Generator
     * 解決特定環境下 async function 被轉譯為 object 的問題
     * @param {any} p - 欲檢查的變數
     * @returns {boolean}
     */
    isCallable = (p) => {
        // 1. 快速判斷：90% 的情況下 typeof 最快且有效
        if (typeof p === 'function') return true;

        // 2. 深度判斷：處理被轉譯 (Babel) 後可能變成 object 的 async 函數
        if (p && typeof p === 'object') {
            const type = Object.prototype.toString.call(p);
            const isFunctionTag = [
                '[object Function]',
                '[object AsyncFunction]',
                '[object GeneratorFunction]'
            ].includes(type);

            if (isFunctionTag) return true;

            // 3. 鴨子類型檢查：如果具備 call 與 apply，視為可執行對象
            return typeof p.call === 'function' && typeof p.apply === 'function';
        }
        return false;
    }

    /**
     * 判斷參數是否為 Promise 實體
     * 如果帶入的是尚未執行的 async function，則拋出錯誤提醒開發者
     * 通用於 ES5 ~ ES2026
     * @param {any} p 待檢查的參數
     * @returns {boolean}
     */
    isP = (p) => {
        if (!p) return false;

        // 1. 偵測開發者錯誤：帶入的是「Async 函式本身」而非「執行後的結果」
        const type = Object.prototype.toString.call(p);
        const isAsyncFunction =
            type === '[object AsyncFunction]' ||
            (typeof p === 'function' && p.constructor?.name === 'AsyncFunction');

        if (isAsyncFunction) {
            throw new Error(
                `[isPromise Error]: You passed an AsyncFunction instead of a Promise. ` +
                `Did you forget to execute it? (e.g., use 'isPromise(task())' instead of 'isPromise(task)')`
            );
        }

        // 2. 檢查標準 Promise 物件
        if (type === '[object Promise]' || p instanceof Promise) {
            return true;
        }

        // 3. 檢查 Thenable 物件 (廣義 Promise, 包含 Bluebird, jQuery.Deferred 等)
        // 必須排除掉 function 本身（因為有些 function 可能帶有 then 屬性但不是 Promise）
        // 但要保留 object 形式的 Thenable
        return (
            (typeof p === 'object' || typeof p === 'function') &&
            typeof p.then === 'function'
        );
    };


    /** 瘋掉，不知道為什麼task.then()會讓函式執行到一半，然後異常死掉後(沒執行到最後一行)，導致loading bar跑不完，只好正規的做好以下任務
     * @param task 要執行的非同步事件[promise | async func()]
     * @param thenDo 如果有行為要在then之後執行，必須是function|promise
     * @param catahDo 如果有行為要在catch之後執行，必須是function|promise
     * @param finallyDo 如果有行為要在catch之後執行，必須是function|promise
     * @param ignore 發生錯誤時，而且沒有代入時要不要顯示錯誤
     **/
    exeAsyncT = (task, { thenDo, catchDo, finallyDo, ignore = false } = {}) => {
        // 1. 確保 task 本身是 Promise
        if (!this.isP(task)) {
            console.error("Task validation failed:", task);
            throw new Error(`[exeAsyncT]: task must be a Promise. Did you forget to call the async function?`);
        }

        // 2. 封裝處理邏輯，使其支援鏈接 (Chaining)
        // 這裡回傳 Promise 確保外部也可以 await 它
        return task
            .then(async (result) => {
                if (this.isCallable(thenDo)) {
                    // 使用 await 確保不管是 Async 還是普通 Function 回傳 Promise 都能被等待
                    await thenDo(result);
                }
            })
            .catch(async (error) => {
                if (this.isCallable(catchDo)) {
                    await catchDo(error);
                } else if (!ignore) {
                    console.error("[exeAsyncT Catch]:", error);
                    throw error;
                }
            })
            .finally(async () => {
                if (this.isCallable(finallyDo)) {
                    await finallyDo();
                }
            });
    };

}

if (configerer.DEBUG_MODE) {
    (async () => {
            const utiller = new Utiller();
            console.log(utiller.isEmpty('dhjnsjdnfjdsknfkjds'));
            // console.log(utiller.camelCase(`youarecvsking`))
            // console.log('qqqq => ',utiller.isEqual('a','v'));

            // console.log(utiller.getRelativePath('/free_marker/src/exam/web/src/base/AlertDialog.js','/free_marker/src/exam/web'));
            // console.log(utiller.getNormalizedStringNotStartWith('...31231', '.'))
            // console.log(utiller.getNormalizedStringNotEndWith('.3123111', '1'))
            // console.log(utiller.getNormalizedStringEndWith('.31234111', '4'))
            // console.log(utiller.getUrlPath('https://a','123','/123ko/','/gfd'));
            // console.log(utiller.getUrlPath('123','/123ko/','/gfd'));
            // console.log(utiller.toPercentageDecimal(30))
            // console.log(utiller.getPriceOfPercentageBehavior(60,30, false));
            // console.log(utiller.generateAllCalendarLinks(utiller.getObjectOfStartEndDateTime('2025/11/10 ｜ 13:00 - 15:00')));
            // console.log(utiller.generateUniversalKeywords('刻在我心底的名字'))
            // console.log(utiller.getTSOfSpecificDate('2025/08/18(一)'))
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
            // console.log(utiller.getSpecifyObjectBy([option.photo,choice.photo], Util.isEmpty))
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
            //     if (((array) == null || (typeof (array) === "object" && Object.keys(array).length === 0) || (typeof (array) === "string" && (array).length === 0))) {
            //         array.push(...item)
            //     } else if (_index > (Array.isArray(array) ? array.length : (typeof (array) === "object" && array !== null ? Object.keys(array).length : String(array).length)) - 1) {
            //         throw new ERROR(9999, `4654361321 index is large than array size`)
            //     } else if (_index === 0) {
            //         /** push to head */
            //         const entity = (array).slice(0, array.length);
            //         array.length = 0
            //         array.push(...item, ...entity);
            //     } else if (_index === (Array.isArray(array) ? array.length : (typeof (array) === "object" && array !== null ? Object.keys(array).length : String(array).length)) - 1) {
            //         /** push to tail */
            //         array.push(...item);
            //     } else {
            //         _index = _index + 1;
            //         /** 植樹問題拔 我想 */
            //         const initial = (array).slice(0, _index);
            //         const end = (array).slice(_index, array.length);
            //         const combine = [...initial, ...item, ...end];
            //         array.length = 0;
            //         array.push(...combine);
            //     }
            // }
        }
    )();
}
export default Utiller;
