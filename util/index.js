import CryptoJS from 'crypto-js';
import Crypto from 'crypto';
import GlobalConfig from "../GlobalConfig";
import _ from "lodash";
import fs from "fs";
import EX from '../exception';

class Util {

    async syncDelay(delayInms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true);
            }, delayInms);
        });
    }

    async syncDelayRandom(min, max) {
        const random = this.getRandomValue(min, max);
        await this.syncDelay(random);
        return random;
    }

    getRandomHash() {
        const random = Crypto.randomBytes(30).toString('hex');
        return random;
    }

    getEncryptString(texts) {
        const encrypted = CryptoJS.AES.encrypt(texts, GlobalConfig.ENCRYPT_KEY).toString();
        return encrypted;
    }

    getDecryptString(ciphertext) {
        const decrypted = CryptoJS.AES.decrypt(ciphertext, GlobalConfig.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    getFirebaseFormattedString(texts) {
        return _.replace(texts, /[\.\#\$\[\]]/g, "-").trim();
    }

    formalizeNamesToArray(singerString) {
        let normalize = singerString;
        /** avoid this situation, 演唱：陳勢安、畢書盡 (Bii)   編曲：Jerry C */
        normalize = normalize.split(GlobalConfig.SEPARATE_TONE_SINGER)[0].trim();

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

    displayKeys(obj) {
        if (_.isUndefined(obj) || _.isEmpty(obj)) {
            if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
                console.error('object is Empty or Null');
        }
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(_.map(obj, (_obj) => this.getObjectKey(_obj)));
    }

    isSingerTypeRule(constraint) {

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

    appendInfo(data) {
        return this.appendFile(GlobalConfig.PATH_INFO_LOG, data);
    }

    appendError(data) {
        return this.appendFile(GlobalConfig.PATH_ERROR_LOG, data);
    }

    appendFile(path, data) {
        console.log(`LOG: ${JSON.stringify(data)}`);
        data = `${new Date()} ${JSON.stringify(data)}`;
        if (!fs.existsSync(path))
            fs.writeFileSync(path, data, err => {
                throw new EX(8001, err);
            });
        else
            fs.appendFileSync(path, `\n${data}`, err => {
                throw new EX(8001, err);
            });
    }

    showError(reason) {
        Util.appendInfo(reason)
    }

    getRandomValue(min, max) {
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
            return collection;
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
}

// if (GlobalConfig.DEBUG_MODE) {
//     const self = new Util();
// Util.appendInfo(self.getRandomHash())
// Util.appendInfo(self.getValueWithIntegerType(undefined))
// }

const singleton = new Util();
export default singleton;
