import CryptoJS from 'crypto-js';
import Crypto from 'crypto';
import Configer from "configer";
import _ from "lodash";
import fs from "fs";
import ERROR from './exceptioner';
import libpath from 'path';
import process from 'child_process';
import del from 'del';

const pdf = require('pdf-parse');

class Index {

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

    async syncDelayRandom(min = 3000, max = 5000) {
        const random = this.getRandomValue(min, max);
        await this.syncDelay(random);
        return random;
    }

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
        const encrypted = CryptoJS.AES.encrypt(texts, Configer.ENCRYPT_KEY).toString();
        return encrypted;
    }

    getDecryptString(ciphertext) {
        const decrypted = CryptoJS.AES.decrypt(ciphertext, Configer.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    getFirebaseFormattedString(texts) {
        return _.replace(texts, /[\.\#\$\[\]]/g, "-").trim();
    }

    formalizeNamesToArray(singerString) {
        let normalize = singerString;
        /** avoid this situation, 演唱：陳勢安、畢書盡 (Bii)   編曲：Jerry C */
        normalize = normalize.split(Configer.SEPARATE_TONE_SINGER)[0].trim();

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

    displayKeys(obj) {
        if (_.isUndefined(obj) || _.isEmpty(obj)) {
            if (Configer.MODULE_MSG.SHOW_ERROR)
                console.error('object is Empty or Null');
        }
        if (Configer.MODULE_MSG.SHOW_SUCCEED)
            this.appendInfo(JSON.stringify(_.map(obj, (_obj) => this.getObjectKey(_obj))));
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
        return this.appendLog(Configer.PATH_INFO_LOG, data, false);
    }

    appendError(data) {
        return this.appendLog(Configer.PATH_ERROR_LOG, data, true);
    }

    appendLog(path, data, isError = false, caller = '') {
        const log = `${isError ? `ERROR` : `LOG`} : ${caller} ${this.isJson(data) ? this.deepFlat(data) : data}`;
        isError ? console.error(log) : console.log(log);
        const persistlog = `${new Date()} ${log}`;
        this.appendFile(path, persistlog);
    }

    /** if file not exist, automatic create it*/
    appendFile(path, data, force_delete) {
        let options = err => {
            throw new ERROR(8001, err);
        };

        if (force_delete) this.deleteFile(path);

        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, data, options);
        } else {
            fs.appendFileSync(path, `\n${data}`, options);
        }
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

    deleteFile(path) {
        if (fs.existsSync(path))
            fs.unlinkSync(path);
    }

    readFileInJSON(path) {
        try {
            if (fs.existsSync(path)) {
                return JSON.parse(fs.readFileSync(path, 'utf-8'))
            }
        } catch (error) {
            throw new ERROR(9999, error.message);
        }
        return {};
    }


    writeFileInJSON(path, param) {
        let data = JSON.stringify(param, null, 2);
        fs.writeFileSync(path, data);
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

    async getPDFText(path) {

        let dataBuffer = fs.readFileSync(path);
        return pdf(dataBuffer).then((data) => {

            return data;
        });
    }

    getChildPathByPath(_path) {
        try {
            const files = fs.readdirSync(_path);
            return files.map((file) => libpath.join(_path, file));
        } catch (error) {
            throw new ERROR(8002, error);
        }

    }

    readRawFile(path) {
        return fs.readFileSync(path, 'utf-8');
    }

    // 半形轉化為全形
    toDBC(txtstring) {
        var tmp = "";
        for (var i = 0; i < txtstring.length; i++) {
            if (txtstring.charCodeAt(i) == 32) {
                tmp = tmp + String.fromCharCode(12288);
            }
            if (txtstring.charCodeAt(i) < 127) {
                tmp = tmp + String.fromCharCode(txtstring.charCodeAt(i) + 65248);
            }
        }
        return tmp;
    }

    // 全形轉換為半形
    ToCDB(str) {
        var tmp = "";
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) == 12288) {
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

    persistByPath(path) {

        const dirs = _.split(path, '\/');

        for (let index = 0; index < dirs.length; index++) {
            let currentPath = (_.join(_.take(dirs, index + 1), '/'))
            let currentDir = _.nth(dirs, index);
            let hasExtension = this.has(currentDir, '.') && !_.isEmpty(currentDir.split('.').pop());

            if (!fs.existsSync(currentPath)) {
                if (hasExtension) {
                    fs.openSync(currentPath, 'wx');
                } else {
                    fs.mkdirSync(currentPath);
                }
            }
        }
    }

    indexesOf(arr, val) {
        const indexes = []
        let i = -1;
        while ((i = arr.indexOf(val, i + 1)) !== -1) {
            indexes.push(i);
        }
        return indexes;
    }

    /**
     * predicate: predicate(item);
     *
     * return [...{
    path: 'database/index.js',
    fileName: 'index',
    extension: 'js',
    dirName: database
    absolute: '/Users/davidtu/cross-achieve/mimi19up/mimi19up-scrapy/database/index.js'}
     ] */
    getFilePathBy = (path, predicate, ...excludes) => {
        const list = fs.readdirSync(path)
        const files = [];
        for (let item of list) {
            if (_.includes(excludes, item)) continue

            const currentpath = libpath.join(path, item);
            const extension = item.split('\.').pop();
            const fileName = item.split('\.').shift();
            const dirName = _.nth(currentpath.split('\/'), -2);
            if (fs.lstatSync(currentpath).isDirectory()) {
                files.push(...this.getFilePathBy(currentpath, predicate, ...excludes));
            } else if (fs.lstatSync(currentpath).isFile()) {

                if (predicate(_.trim(item))) {
                    files.push({
                        path: currentpath,
                        fileName,
                        extension,
                        dirName,
                        absolute: libpath.resolve(currentpath)
                    });
                }
            } else {
                throw new ERROR(8003, item, currentpath)
            }
        }
        return files

    }
    /** return [...{path: ,fileName: ,extension: ,absolute: ,dirName:}]*/
    getFilePathByExtension = (path, _extension = [], ...exclude) => {
        const reg = new RegExp(`^[^\.].+.(${_.join(_extension, '|')})$`);
        return this.getFilePathBy(path, (item) => {
            return reg.test(item);
        }, ...exclude);
    }

    async reinstall(...exclude) {
        const ex = [...exclude, 'node_modules', 'utiller', 'configer'];
        /** utiller 不能刪掉,不然就爆了, configer是他的依賴也不能刪 */
        const paths = this.getFilePathBy('./', (dir) => _.isEqual(dir, 'package.json'), ...ex)
        for (const _json of paths) {
            const path_module_root = this.getFileDirPath(_json.absolute);
            const path_gen_node_module = `${path_module_root}node_modules`;
            const path_lock_json = `${path_module_root}package-lock.json`;
            await del(path_lock_json)
            this.appendInfo(`刪掉了 ${path_lock_json}`);
            await del(path_gen_node_module);
            this.appendInfo(`刪掉了 ${path_gen_node_module}`);
        }

        for (const _json of paths) {
            const path_module_root = this.getFileDirPath(_json.absolute);
            const path_gen_node_module = `${path_module_root}node_modules`;
            if (!fs.existsSync(path_gen_node_module)) {
                await this.executeCommandLine(`cd ${path_module_root} && npm install`);
            }
        }

    }

    syncExecuteCommandLine(command) {
        this.appendInfo(`執行腳本 ${command}`);
        process.exec(`${command}`,
            (error, stdout, stderr) => {
                console.log(`${stdout}`);
                console.log(`${stderr}`);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
            });
    }


    executeCommandLine = async (command) => {

        this.appendInfo(`執行腳本 ${command}`);

        return new Promise(function (resolve, reject) {
            process.exec(command,
                (error, stdout, stderr) => {
                    console.log(`${stdout}`);
                    console.log(`${stderr}`);
                    if (error) {
                        this.appendError(`執行錯誤: ${error}`);
                        reject(error);
                        return;
                    }
                    resolve(stdout.trim());
                });
        });
    }

    getFileDirPath(path, slash = true) {
        return _.join(_.initial(_.split(path, '/')), '/') + (slash ? '/' : '');
        // return _.dropRightWhile(path,(char) => !_.isEqual(char,'/')).join('');

    }


    templatify() {
        const all = singleton.getFilePathByExtension('./', ['js'], 'node_modules');
        for (const file of all) {
            const content = this.readRawFile(file.absolute).trim();
            if (_.isEmpty(content)) {
                console.log(file.fileName, file.absolute);

                const utilpath = Array.from(libpath.resolve('./utiller'));
                /** 例如 a/b/c.js 有兩層,import 就要 ../../ */
                let level = _.countBy(_.dropWhile(Array.from(file.absolute),
                    (value, index, array) => _.nth(utilpath, index) === value))['/'];
                const className = _.isEqual(file.fileName, 'index') ? file.dirName : file.fileName;
                this.appendFile(file.absolute, `import utiller from '${level > 0 ? _.repeat('../', level) : './'}utiller'`);
                this.appendFile(file.absolute, `import Configer from '${level > 0 ? _.repeat('../', level) : './'}configer'`);
                this.appendFile(file.absolute, `import _ from 'lodash'`);
                this.appendFile(file.absolute, `import libpath from 'path'`);
                this.appendFile(file.absolute, `\n`);
                this.appendFile(file.absolute, `class ${className} {\n}`);
                this.appendFile(file.absolute, `if (Configer.DEBUG_MODE) {}`);
                this.appendFile(file.absolute, `export default ${className}`);

            }
        }
    }
}

const singleton = new Index();
export default singleton;

export {singleton as utiller, ERROR as exceptioner};

if (Configer.DEBUG_MODE) {
    // singleton.persistByPath('./cav/b/ccc/index.js');
    // singleton.templatify();
    // const pdfs = singleton.getFilePathByExtension('./', ['pdf'],'node_modules');
    // console.log(pdfs);

    // singleton.reinstall().then();
    // console.log('hihi')
    // singleton.reinstall('ExamingUI').then();
}

