import libpath from "path";
import fs from "fs";
import fsp from "fs/promises";
import _ from "lodash";
import ChildProcess from "child_process";
import {configerer} from "configerer";
import Utiller from "./index";
import ERROR from '../exceptioner/index';
import pdf from 'pdf-parse';
import del, {type} from 'del';
import fse from 'fs-extra';
import prompt from 'prompt';

class NodeUtiller extends Utiller {

    /**================================= only in node.js ================================= */
    /** 是否把log message 存到 info.txt*/
    isPersistIntoLogFile = true;

    findSpecificFolderByPath(path, folderName) {
        const absolute = libpath.resolve(path);
        const parts = absolute.split(libpath.sep);
        while (parts.length) {
            const joined = libpath.join(...parts, folderName);
            if (fs.existsSync(joined)) return joined;
            parts.pop();
        }
        return null;
    }

    /** {numpages, numrender, info, text, version} */
    async getPDFText(path) {
        let dataBuffer = fs.readFileSync(path);
        return pdf(dataBuffer).then((data) => {
            return data;
        });
    }

    printf() {
        this.appendInfo('i can use in node.js only yo yo');
    }

    /**
     * 遞回的去找出folder每一個child file, 預設是全部檔案, 可以透過predicate做filter, 可以exclude 指定的 'folder name'
     *
     * predicate: predicate(pathInfo); predicate帶的參數是 pathInfo object
     *
     * excludes 忽略掉的資料夾名稱
     *
     * return [...{
     path: 'database/index.js',
     fileName: 'index',
     extension: 'js',
     dirName: database
     absolute: '/Users/davidtu/cross-achieve/mimi19up/mimi19up-scrapy/database/index.js'}
     ] */
    findFilePathBy(path, predicate = () => true, ...excludes) {
        if (!fs.existsSync(path)) return [];
        const result = [];
        const entries = fs.readdirSync(path, { withFileTypes: true });
        for (const entry of entries) {
            if (excludes.includes(entry.name)) continue;
            const fullPath = libpath.join(path, entry.name);
            if (entry.isDirectory()) {
                result.push(...this.findFilePathBy(fullPath, predicate, ...excludes));
            } else if (entry.isFile()) {
                const info = this.getPathInfo(fullPath);
                if (predicate(info)) result.push(info);
            }
        }
        return result;
    }

    /** 是一個存在的檔案 */
    isPathExist(path) {
        return fs.existsSync(path);
    }

    /** path = a/b/c/file.js , newName = 'two'
     * output => a/b/c/two.js
     * */
    renameFile(path, newName = "fileName") {
        if (!this.isFile(path) || !newName) {
            this.appendError(`renameFile 錯誤, path: ${path}, newName: ${newName}`);
            return;
        }
        const dir = libpath.dirname(path);
        const ext = libpath.extname(path);
        const newPath = libpath.join(dir, `${newName}${ext}`);
        fs.renameSync(path, newPath);
    }

    //todo 應該要改成class
    getPathInfo(path) {

        const absolute = libpath.resolve(path);
        const obj = {
            path,
            absolute,
            isFile: false,
            isDirectory: true,
            dirName: undefined,
            folderName: undefined,
            dirPath: undefined,
            folderPath: undefined,
            extension: undefined,
            fileName: undefined,
            fileNameExtension: undefined,
            lastModifiedTime: undefined,
            name: undefined,
        }

        if (this.isFile(absolute)) {
            obj['extension'] = absolute.split('\.').pop();
            const fileNameStrings = absolute.split('\/').pop().split('\.');
            fileNameStrings.pop()
            /** todo 要是遇到 asd.sdsd.js 就麻煩了 */
            obj['fileName'] = fileNameStrings.join('\.');
            obj['name'] = fileNameStrings.join('\.');
            obj['dirName'] = _.nth(absolute.split('\/'), -2);
            obj['folderName'] = _.nth(absolute.split('\/'), -2);
            obj['isFile'] = true;
            obj['dirPath'] = this.getFolderPathOfSpecificPath(absolute);
            obj['folderPath'] = this.getFolderPathOfSpecificPath(absolute);
            obj['isDirectory'] = false;
            obj['fileNameExtension'] = `${obj.fileName}.${obj.extension}`;
            obj['lastModifiedTime'] = this.getFileLastModifiedTime(absolute);
        }

        if (this.isDirectory(absolute)) {
            obj['dirName'] = absolute.split('\/').pop();
        }

        return obj;

    }

    /** return [...{path: ,fileName: ,extension: ,absolute: ,dirName:}]*/
    findFilePathByExtension = (rootpath, _extension = [], ...exclude) => {
        const reg = new RegExp(`^[^\.].+.(${_.join(_extension, '|')})$`);
        return this.findFilePathBy(rootpath, (item) => {
            return reg.test(item.fileNameExtension);
        }, ...exclude);
    }

    syncExecuteCommandLine(command) {
        const self = this;
        this.appendInfo(`執行腳本 ${command}`);
        ChildProcess.exec(`${command}`,
            (error, stdout, stderr) => {
                self.appendInfo(`${stdout}`);
                self.appendInfo(`${stderr}`);
                if (error !== null) {
                    self.appendError(`exec error: ${error}`);
                }
            });
    }

    executeCommandLine = async (command) => {
        const self = this;
        this.appendInfo(`執行腳本 ${command}`);
        return new Promise(function (resolve, reject) {
            ChildProcess.exec(command,
                (error, stdout, stderr) => {
                    self.appendInfo(`${stdout}`);
                    self.appendInfo(`${stderr}`);
                    if (error) {
                        self.appendError(`執行錯誤: ${error}`);
                        reject(error);
                        return;
                    }
                    resolve(stdout.trim());
                });
        });
    }

    /** '/a/b/c.js' 把它變成真的 */
    persistByPath(targetPath) {
        const isAbsolute = libpath.isAbsolute(targetPath);
        const parts = targetPath.split('/').filter(Boolean);
        const lastPart = parts[parts.length - 1];
        const isFile = libpath.extname(lastPart) !== '';  // ← 正規判斷副檔名

        let current = isAbsolute ? libpath.sep : '';

        for (let i = 0; i < parts.length; i++) {
            current = libpath.join(current, parts[i]);

            if (!fs.existsSync(current)) {
                if (i === parts.length - 1 && isFile) {
                    // 最後一個而且是檔案 → 建檔案
                    fs.writeFileSync(current, '');
                } else {
                    // 其他 → 建資料夾
                    fs.mkdirSync(current, { recursive: false });
                }
            }
        }
        return libpath.resolve(targetPath);
    }

    /**
     * filter:function, 就filter,(path) => {要就true}
     * override: boolean, 要不要override檔案:default true;
     * preserveTimestamps : boolean, 要不要保留原始檔案的時間, 不然就是cp的時間,default true;
     * */
    async copyFromFolderToDestFolder(from, dest, override = true, preserveTimestamps = false, filter = () => true) {
        if (!fs.existsSync(from) || !fs.existsSync(from))
            throw new ERROR(8009, `${from} or ${dest} is not exist!`);

        this.appendInfo(`正在複製ing ${from}/* => ${dest}/* succeed`);
        fse.copySync(from, dest, {preserveTimestamps, override, filter})
        this.appendInfo(`複製成功 ${from}/* => ${dest}/* succeed`);
    }

    /** remove all under dir */
    cleanAllFiles(dir) {
        if (this.isDirectory(dir)) {
            this.appendInfo(`準備清除底下的所有 ${dir}`);
            fse.emptyDirSync(dir)
            this.appendInfo(`成功清除底下的所有 ${dir}`);
        }
    }

    /** 刪掉自己, force能夠強制刪除 自己root_dir 以外的path */
    async deleteSelfByPath(path, force) {
        if (fs.existsSync(path)) {
            this.appendInfo(`準備刪掉 ${path},{force:${force}}`);
            await del(path, {force});
            this.appendInfo(`成功刪掉了 ${path}`);
        }
    }

    async deleteFileOrFolder(path) {
        this.appendInfo(`刪掉了 ${path}`);
        await del(path)
    }

    /** 刪掉自己目錄內的孩子, force能夠強制刪除 自己root_dir 以外的path,保留folder的記體體位置 */
    async deleteChildByPath(path, force = false) {
        const pathes = this.getChildPathByPath(path);
        for (const path of pathes) {
            await this.deleteSelfByPath(path.absolute, force);
        }
    }

    /** 取得folder底下的file counts*/
    getFileCountsOfFolder(path) {
        if (this.isDirectory(path)) {
            return fs.readdirSync(path).length
        }
        return -1;
    }


    async reinstallNodeModules(path = '../', ...exclude) {
        const ex = [...exclude, 'node_modules', 'utiller', 'configerer'];
        /** utiller 不能刪掉,不然就爆了, configer是他的依賴也不能刪 */

        const paths = this.findFilePathBy(path, (each) => _.isEqual(each.fileNameExtension, 'package.json'), ...ex)
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

    /** 拿到目錄下的資料夾列表 */
    getNamesOfFolderChild(path) {
        return this.getChildPathByPath(path).filter(p => p.isDirectory).map(p => p.dirName);
    }

    /** 從給的path 找到 one level 的 file/dir Path */
    getChildPathByPath(_path) {
        try {
            const files = fs.readdirSync(_path);
            return files.map((file) => this.getPathInfo(libpath.join(_path, file)));
        } catch (error) {
            throw new ERROR(8002, error);
        }
    }

    /** from :'./template/sample.babel.config.js
     *  destDir : '/template'
     *  fileName: 'fileName.extension' => 如果fileName 是 empty ,dest就是必須包含新檔名
     *  force 就是強制覆蓋他啦
     * */
    copySingleFile(from, dest, fileName, force = false) {
        const destination = (fileName && fileName.trim()) ? libpath.join(dest, fileName) : dest;
        if (fs.existsSync(destination) && !force) {
            throw new ERROR(8006, destination);
        }
        fs.copyFileSync(from, destination);
    }

    ensureFolderExists(folderPath) {
        const resolved = libpath.resolve(folderPath);
        if (fs.existsSync(resolved)) return;

        fs.mkdirSync(resolved, { recursive: true });
    }

    getNodeEnvVariable(key, defaultValue = undefined) {
        const value = process.env[key]
        return value === undefined ? defaultValue : value;
    }

    isDirectory(path) {
        if (!this.isPathExist(path)) return false;
        return fs.lstatSync(path).isDirectory();
    }

    isFile(path) {
        if (!this.isPathExist(path)) return false;
        return fs.lstatSync(path).isFile();
    }

    isImageFile(file) {
        return ["svg", "png", "jpg", "jpeg"].includes(file.extension);
    }

    /** 把內容都抹掉each 是 fileName, ex:index.js*/
    async cleanChildFiles(path, predicate = () => true, ...exclude) {
        if (!fs.existsSync(path)) return false;

        const files = this.findFilePathBy(path, predicate, ...exclude);
        const nonImages = files.filter(file => !this.isImageFile(file));

        await Promise.allSettled(
          nonImages.map(file => {
              this.cleanFileContent(file.absolute);
              this.appendInfo(`成功 cleanChildFiles() -> '${file.path}'`);
              return Promise.resolve();
          })
        );

        return files;
    }

    /** 將檔案清除乾淨, 但不刪掉檔案, 這樣hot reload的監聽才不會遺失*/
    cleanFileContent(path) {
        this.syncDeleteFile(path)
        /** 太浪費時間了
         * fs.truncateSync(path, 0);
         this.appendInfo(`${path} 內容被清除！`);
         * */
    }

    async syncWithExistPackage(path = '../') {
        /** 產生shell_script_腳本 */
        const paths = this.findFilePathBy(path, (each) => _.isEqual(each.fileNameExtension, 'package.json'), 'node_modules');
        for (let path of paths) {
            try {
                if (!_.isEqual(path.dirName, '..'))
                    this.insertShellCommand(configerer.BASE_SHELL_SCRIPT,
                        `cd_${path.dirName}`,
                        `cd ${this.getFolderPathOfSpecificPath(path.absolute)}`)
            } catch (error) {
                this.appendInfo(error.message);
            }
        }
    }

    async packageTemplatify(path, packageName) {
        const existFolders = this.getChildPathByPath(path).map((each) => each.absolute.split('\/').pop());
        if (this.has(existFolders, packageName)) {
            throw new ERROR(8004, ` packageName ===> '${packageName}'`)
        }
        const dirPath = `${path}/${packageName}`

        /** 1.產生package folder */
        fs.mkdirSync(dirPath);

        /** 2.要有babel.config.js? */
        fs.copyFileSync('./template/sample.babel.config.js', `${dirPath}/babel.config.js`);

        /** 3.要有package,json */
        const packagejson = this.getJsonObjByFilePath('./template/sample.package.json');
        packagejson['name'] = packageName;
        this.writeFileInJSON(`${dirPath}/package.json`, packagejson);

        /** 4.要在 src/${index.js}, dir/index.js */
        this.persistByPath(`${dirPath}/src`);
        const classBase = String.format(this.getFileContextInRaw(`./template/sample.src.index.js`), packageName, '明悅', new Date());
        fs.writeFileSync(`${dirPath}/src/index.js`, classBase);

        /** 6.要產生webstorm run case? */
        const ideaWorkspacePath = `${this.findSpecificFolderByPath(dirPath, '.idea')}/workspace.xml`;

        /** 7.要產生cd script 腳本 **/
        this.insertShellCommand(configerer.BASE_SHELL_SCRIPT, `cd_${packageName}`, `cd ${libpath.resolve(dirPath)}`)

        if (fs.existsSync(ideaWorkspacePath)) {
            const workspace = this.getFileContextInRaw(ideaWorkspacePath);
            const splited = workspace.split('\n');
            const indexOfRunManager = _.findIndex(splited, (line) => this.has(line, 'name="RunManager'));
            this.insertToArray(splited, indexOfRunManager,
                `<configuration name="${packageName}" 
        type="NodeJSConfigurationType" 
        path-to-node="$USER_HOME$/.nvm/versions/node/v18.19.1/bin/node" 
        node-parameters="--require @babel/register" 
        path-to-js-file="${libpath.resolve(dirPath)}/src/index.js" 
        working-dir="${libpath.resolve(dirPath)}" >`,
                `    <envs>`,
                `        <env name="self_debug" value="true" />`,
                `        <env name="is_node" value="true" />`,
                `    </envs>`,
                `    <method v="2" />`,
                `</configuration>`);

            const indexOfList = _.findIndex(splited, (line) => _.isEqual(_.trim(line), `<list>`), indexOfRunManager);
            this.insertToArray(splited, indexOfList, `  <item itemvalue="Node.js.${packageName}" />`)
            fs.writeFileSync(ideaWorkspacePath, splited.join('\n'));
        } else {
            this.appendError(`${ideaWorkspacePath} not exist`)
        }
        await this.executeCommandLine(`cd ${libpath.resolve(dirPath)} && npm install`);
        this.appendInfo(`build ${packageName} succeed!`);
    }

    appendInfo(...messages) {
        return this.appendLog(configerer.PATH_INFO_LOG, messages, false);
    }

    appendError(...messages) {
        return this.appendLog(configerer.PATH_ERROR_LOG, messages, true);
    }

    appendLog(path, messages, isError = false) {
        const msg = `${this.getCurrentTimeFormat()} ${isError ? 'ERROR' : 'LOG'} : ${messages.map(this.stringifyLog).join(' ,')}`;
        if (!this.isProductionEnvironment()) {
            isError ? console.error(...messages) : console.log(...messages);
        }
        if (this.isPersistIntoLogFile) {
            this.appendFile(path, msg);
        }
    }

    stringifyLog(data) {
        return typeof data === 'object' ? JSON.stringify(data) : String(data);
    }

    /** 如果file不存在,就會產生file,force_delete 可以強制刪除cache file*/
    appendFile(filePath, data, newline = true, forceDelete = false) {
        try {
            const resolvedPath = libpath.resolve(filePath); // <<--- 正規化路徑
            if (forceDelete && fs.existsSync(resolvedPath)) fs.unlinkSync(resolvedPath);
            if (!fs.existsSync(resolvedPath)) this.persistByPath(resolvedPath);
            const content = `${newline ? '\n' : ''}${data}`;
            fs.appendFileSync(resolvedPath, content);
        } catch (err) {
            throw new ERROR(8001, err);
        }
    }

    disableLogMessagePersistent() {
        this.isPersistIntoLogFile = false;
    }

    getLogString(datas) {
        return datas.map((data) => (this.isJson(data) || _.isObject(data) || _.isArray(data)) ? this.deepFlat(data) : data).join(' ,')
    }

    /** 常常要把JSON的內容印出來，所以這個很方便 */
    async persistJsonFilePrettier(path, object, ignoreP = false) {
        path = libpath.resolve(path);
        this.appendFile(path, JSON.stringify(object), true, true);
        if (!ignoreP) await this.prettier(path, 120);
    }

    /** 快速把資料結構印出來看 */
    printCollectionToFile(collection) {
        const fileName = `./logs/__temp_${this.getCurrentTimeFormat()}.txt`;
        this.persistByPath(`./logs/`);
        this.appendFile(fileName, this.deepFlat(collection, ` \n\n, `));
        this.appendInfo(`collectionToFile succeed, file name ==> ${fileName}`);
    }

    /** 重複讀取file IO時，要用這個方式，不然IO太吃資源了 */
    async readFileContentByPath(path, cache) {
        return cache[path] ?? (cache[path] = await fsp.readFile(path, 'utf-8'));
    }

    singleFileTemplatify(path = './') {
        const all = this.findFilePathByExtension(path, ['js'], 'node_modules');
        for (const file of all) {
            const content = this.getFileContextInRaw(file.absolute).trim();
            if (_.isEmpty(content)) {
                this.appendInfo(file.fileName, file.absolute);
                const className = _.isEqual(file.fileName, 'index') ? file.dirName : file.fileName;
                fs.writeFileSync(file.absolute, String.format(this.getFileContextInRaw(`.
            /template/s
            ample.src.index.js`), className, '明悅', new Date()));
            }
        }
    }

    isFileEmpty(path) {
        const content = this.getFileContextInRaw(path);
        return !content || !content.trim();
    }

    /** 保守的複製檔案, 如果檔案比較舊, 或是檔案是空的, 就放棄copy行為 */
    copySingleFileConservative(destPath, latestFile) {
        const { absolute, lastModifiedTime } = latestFile;

        // 先確認檔案是否為空
        if (!this.isPathExist(absolute) || this.isFileEmpty(absolute)) {
            this.appendInfo(`${absolute} is empty file, ignore copy behavior`);
            return;
        }

        const destExists = fs.existsSync(destPath);

        // 如果目的檔案存在且比來源更新，則跳過
        if (destExists && this.getFileLastModifiedTime(destPath) > lastModifiedTime) {
            this.appendInfo(`${destPath} is the latest, ignore this run`);
            return;
        }

        if (!destExists) {
            this.appendInfo(`${destPath} does not exist, safe to copy.`);
        }

        // 確保目的路徑存在（遞迴建立）
        this.ensureFolderExists(libpath.dirname(destPath));

        // 強制複製
        this.copySingleFile(absolute, destPath, undefined, true);
    }

    syncDeleteFile(path) {
        if (fs.existsSync(path))
            fs.unlinkSync(path);
    }

    getFileContextInJSON(path) {
        try {
            if (fs.existsSync(path)) {
                return JSON.parse(fs.readFileSync(path, 'utf-8'))
            }
        } catch (error) {
            throw new ERROR(9999, error.message);
        }
        return {};
    }

    /** 讀取path,然後用utf-8的方式 */
    getFileContextInRaw(path) {
        if (!fs.existsSync(path))
            return '';

        return fs.readFileSync(path, 'utf-8');
    }

    writeFileInJSON(path, param) {
        let data = JSON.stringify(param, null, 2);
        fs.writeFileSync(path, data);
    }

    /** 用來pack lib_project, 不然其他import lib_project的專案會無法讀懂es6
     * release folder 會被自動ignore到
     * exclude 裡面可以放專案名稱, 例如 free_marker,question_update */
    async generatePackage(path = './', deployToNPMServer = false, forceInstallNodeModule = true, ...exclude) {
        let packagejsons = this.findFilePathByExtension(path, ['json'], 'node_modules', 'release');
        packagejsons = _.filter(packagejsons,
            (each) => _.isEqual(each.fileName, 'package'));
        packagejsons = packagejsons.map((each) => this.getFolderPathOfSpecificPath(each.absolute));

        for (const path of packagejsons) {
            if (this.isAndEquals(...exclude.map((projectName) => () => !this.has(path, projectName)))) {
                /** 產生去掉if(debug) { command } 字樣的 */
                const tempFolderPath = await this.generateTempFolderWithCleanSrc(path);

                /** 產生release資料夾 */
                const release = this.persistByPath(libpath.join(path, 'release'))

                /** 利用babel 產生出 es5相容性高的src file */
                await this.executeCommandLine(`cd ${path} && npx babel ./temp --out-dir ./release/lib`);

                const pathOfPackageJson = libpath.join(path, 'package.json');
                try {

                    const indexFileName = 'sample.npm.module.index.js'
                    /** 複製公版的index.js */
                    this.copySingleFile(`/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/${indexFileName}`,
                        release, 'index.js', true);

                    /** template就是樣板的概念 */
                    const templatePath = libpath.join(path, 'template');
                    if (this.isPathExist(templatePath)) {
                        await this.copyFromFolderToDestFolder(
                            templatePath,
                            this.persistByPath(libpath.join(release, 'template')));
                    }
                    if (deployToNPMServer) {
                        /** 升級package.json的版號 */
                        const {moduleName, version} = await this.upgradePackageJsonVersion(pathOfPackageJson);

                        /** 把所有樣板的版號都提升 */
                        await this.updateVersionOfTemplate(moduleName, version);
                    }

                    /** 把package.json release放進去 */
                    this.copySingleFile(pathOfPackageJson, libpath.join(release, 'package.json'),
                        undefined, true);

                    /** 安裝一個沒有devDependency 的node_module */
                    if (forceInstallNodeModule || !this.isPathExist(libpath.join(release, 'node_module'))) {
                        await this.executeCommandLine(`cd ${release} && yarn install --production`);
                    } else {
                        this.appendInfo(`ignore node-module install behavior`);
                    }

                    this.appendInfo(`build ${path} succeed`);

                    /** 部署到 local server*/
                    if (deployToNPMServer) {
                        /** 升級package.json的版號 */
                        await this.executeCommandLine(`cd ${release} &&  npm publish`);
                        /** await this.executeCommandLine(`cd ${release} &&  npm publish --registry http://localhost:4873`) */
                    }
                } catch (error) {
                    await this.deleteSelfByPath(release, true);
                    throw new ERROR(9999, `generatePackage 報錯, ${error.message}`);
                } finally {
                    await this.deleteSelfByPath(tempFolderPath, true);
                }
            }
        }
    }

    /** 用來更新樣板裡面的模組版本 */
    async updateVersionOfTemplate(dependency, newVersion) {

        const paths = [
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/admin.package.json.mustache',
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/web.package.json.mustache',
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/functions.package.json.mustache',
            '/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/sample.package.json',
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/package.json'
        ];

        for (const path of paths) {
            if (this.isPathExist(path)) {
                let succeedOfPersistFile = false;
                const json = this.getJsonObjByFilePath(path);
                if (json && json.dependencies && json.dependencies[dependency]) {
                    json.dependencies[dependency] = `^${newVersion}`
                    try {
                        await this.writeJsonThanPrettier(path, json);
                        succeedOfPersistFile = true;
                    } catch (error) {
                        succeedOfPersistFile = true;
                    }
                }
                if (!succeedOfPersistFile) {
                    await this.updateFileOfSpecificLine(path,
                        (line) => `   "${dependency}":"^${newVersion}"${_.endsWith(_.trim(line), ',' ? ',' : '')}`,
                        (each) => _.startsWith(_.trim(each), `"${dependency}"`));
                }
            }
        }
        await this.copyFromFolderToDestFolder(
            '/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/',
            '/Users/davidtu/cross-achieve/high/idea-inventer/newp/template/',
            true, true)

    }


    /** 把一份文件split(\n)，然後透過predicate找出特定的line，再replace成contentOfUpdated
     *
     * 例如一份package.json
     * utiller:1.0.1 => utiller:1.0.1
     *
     * */
    async updateFileOfSpecificLine(pathOfFile, contentOfUpdated = (line) => 'updated', predicate = (line) => true) {
        const context = this.getFileContextInRaw(pathOfFile);
        const lines = context.split('\n');
        const index = lines.findIndex(predicate);
        if (index === -1) return; // 無匹配行則略過
        lines[index] = contentOfUpdated(lines[index]);
        this.appendFile(pathOfFile, lines.join('\n'), true, true);
    }


    async writeJsonThanPrettier(path, json) {
        this.writeFileInJSON(path, json);
        await this.prettier(path);
    }

    /** 用來豐富package.json的功能 */
    async enrichEachPackageJson(rootPath) {
        const validNames = new Set(['package', 'admin.package', 'web.package', 'functions.package']);

        const jsonFiles = this.findFilePathByExtension(rootPath, ['json'], 'gen', 'node_modules', 'release');

        const packageFiles = jsonFiles.filter(file => validNames.has(file.fileName));

        if (packageFiles.length === 0) return;

        for (const { absolute } of packageFiles) {
            const json = this.getJsonObjByFilePath(absolute);

            json.scripts ||= {};
            json.scripts.updateConfigerer = 'npm update configerer --save';

            await this.writeJsonThanPrettier(absolute, json);
        }
    }


    insertShellCommand(shellPath = configerer.BASE_SHELL_SCRIPT, alias, command) {
        if (this.isStringContainInLines(this.getFileContextInRaw(shellPath), alias)) {
            throw new ERROR(8007, `alias ${alias} is exist`);
        } else {
            const line = `alias ${alias}='${command}'`
            this.appendFile(shellPath, line);
        }
    }

    getAdminCredential() {
        return this.getJsonObjByFilePath(
            '/Users/davidtu/cross-achieve/mimi/idea-inventer/firebaser/key/mimi19up-firebase-adminsdk.json')
    }

    isEmptyFile(path) {
        return !this.isPathExist(path) || _.isEmpty(this.getFileContextInRaw(path).trim())
    }

    isEmptyFolder(path) {
        return fs.readdirSync(path).length === 0;
    }

    /** 把檔案弄得好看一點
     * width 是指一行能塞下多少的字元
     * preitter真的很花時間，所以做個enable
     * */
    async prettier(path, width = 200) {
        await this.executeCommandLine(`cd ${libpath.resolve('.')} &&  npx prettier --write ${libpath.resolve(path)} --print-width ${width}`)
    }

    /**
     * 檔案最後編輯時間！
     console.log('older ==> ',utiller.getFileLastModifiedTime('./folderOfTestUsage/history_older.js'));
     console.log('latest ==> ',utiller.getFileLastModifiedTime('./folderOfTestUsage/history_latest.js'));
     console.log('compare latestTime > olderTime ?? ==> ',utiller.getFileLastModifiedTime('./folderOfTestUsage/history_latest.js') > utiller.getFileLastModifiedTime('./folderOfTestUsage/history_older.js'));
     */
    getFileLastModifiedTime(path) {
        /**
         * console.log(`File Data Last Modified: ${stats.mtime}`);
         * console.log(`File Status Last Modified: ${stats.ctime}`);
         */
        return fs.statSync(path).mtimeMs;
    }

    getJsonObjByFilePath(path) {
        this.appendInfo(`ready to json path:${path}`)
        return JSON.parse(this.getFileContextInRaw(path));
    }

    /** increment version number,  回傳latest version, name */
    async upgradePackageJsonVersion(path) {
        if (_.isEqual('json', this.getPathInfo(path).extension)) {
            const json = this.getJsonObjByFilePath(path);
            json.version = this.getStringOfVersionIncrement(json.version);
            await this.writeJsonThanPrettier(path, json)
            return {version: json.version, moduleName: json.name};
        } else {
            throw new ERROR(8020, `path is not package.json, which is ${path}`)
        }
    }

    /** rewrite file of *.json with attributes => {version:'1.0.1'}, {name:'david'}
     *
     * console.log(await utiller.reWriteJsonAttribute(`./test.package.json`,{name:'ugly'},{version:'2.6.101'}));
     * */
    async reWriteJsonAttribute(filePath, ...attrs) {
        const { extension } = this.getPathInfo(filePath);

        if (extension !== 'json') {
            throw new ERROR(9999, `reWriteJsonAttribute() => path is not package.json, which is ${filePath}`);
        }

        // 驗證所有 attr 必須是 object
        const invalidAttr = attrs.find(attr => typeof attr !== 'object' || attr === null);
        if (invalidAttr) {
            throw new ERROR(
              9999,
              `84451515 attr is not object, which is 'type=${typeof invalidAttr} => ${invalidAttr}'`
            );
        }

        const json = this.getJsonObjByFilePath(filePath);

        for (const attr of attrs) {
            json[this.getObjectKey(attr)] = this.getObjectValue(attr);
        }
        await this.writeJsonThanPrettier(filePath, json);
        return { version: json.version, moduleName: json.name };
    }


    getVersionOfPackageJson(path) {
        return this.getAttributeValueOfJson(path, 'version', '1.0.0')
    }

    /** 取得*.json 裡面的file*/
    getAttributeValueOfJson(path, key, defaultValue = undefined) {
        if (_.isEqual('json', this.getPathInfo(path).extension)) {
            const json = this.getJsonObjByFilePath(path);
            return json[key] ?? defaultValue;
        } else {
            throw new ERROR(8020, `path is not package.json, which is ${path}`)
        }
    }

    /**  找到 js file 裡面宣告version的value ==> version:'1.0.60'} */
    getVersionOfJsFile(path) {
        return this.getAttributeValueOfJsFile(path, 'version', 'project without version notice')
    }

    /**  找到 js file 裡面宣告attribute的 value ==> 例:version:'1.0.60'} */
    getAttributeValueOfJsFile(path, key, defaultValue = undefined) {
        if (_.isEqual(this.getExtensionFromPath(path), 'js')) {
            const source = require(libpath.resolve(path)).default;
            return source[key] ?? defaultValue;
        } else {
            throw new ERROR(8020, `path is not js file, which is ${path}`)
        }
    }

    /** 更新js file裏面attribute
     * attr => {verison:1.0.32}
     * console.log(await utiller.rewriteAttributeOfSourceJs(`./test.source.js`, {name: 'ugly-tu'}, {version: '3.9.123'}));
     * */
    async rewriteAttributeOfSourceJs(path, ...attrs) {
        if (!this.isPathExist(path)) {
            throw new ERROR(9999, `4849813 ${path} is not exist`);
        }

        for (const attr of attrs) {
            if (!_.isObject(attr)) {
                throw new ERROR(9999, `4984651 attr is not object, which is 'type=${typeof attr} => ${attr}'`)
            }
            const key = this.getObjectKey(attr);
            const value = this.getObjectValue(attr);
            const contents = this.getFileContextInRaw(path).split(`\n`);
            const index = _.findIndex(contents, (each) => _.startsWith(_.trim(each), `${key}`));
            /** 故意空4格 */
            contents[index] = `    ${key}: '${value}',`;
            this.appendFile(path, contents.join(`\n`), true, true);
        }
        return attrs;
    }

    async getAnswerFromPromptQ(configs = [{
        name: 'name',
        require: true,
        description: 'type the name',
    }]) {
        prompt.start();
        return await prompt.get(configs);
    }

    /**
     * [{
     *         name: 'name',
     *         require: true,
     *         description: 'type the name',
     *     },{
     *         name: 'age',
     *         require: true,
     *         description: 'type the age',
     *     }]
     *
     * result:{ name: 'david', age: '18' }
     * */
    async getObjectFromPromptQ(...configs) {
        prompt.start()
        return await prompt.get(configs);
    }

    /** 產出一個/temp,然後把/src 複製過去, 再把裡面每一個file的 if(DEBUG)給去除掉,再加上prettier */
    /** 找出if (configerer) 當作start */
    /** 找出 } 當作 end */
    /** 刪除掉 if(configerer.DEBUG) {...........} */

    async generateTempFolderWithCleanSrc(basePath) {
        this.appendInfo('generateTempFolderWithCleanSrc', basePath);

        const sourceFile = libpath.join(basePath, 'src');
        const tempFolderPath = libpath.join(basePath, 'temp');

        if (!fs.existsSync(sourceFile)) return tempFolderPath;

        this.appendInfo('generateTempFolderWithCleanSrc', 'source', sourceFile);
        this.persistByPath(tempFolderPath);

        await this.copyFromFolderToDestFolder(sourceFile, tempFolderPath);

        const filePaths = this.findFilePathBy(tempFolderPath);

        for (const { absolute: tempFilePath } of filePaths) {
            const rawLines = this.getFileContextInRaw(tempFilePath).split('\n');
            const trimmedLines = rawLines.map(line => line.trim());

            const start = trimmedLines.findIndex(line => line.startsWith('if (configerer.DEBUG_MODE)'));
            const end = trimmedLines.lastIndexOf('}');

            if (start >= 0 && end > start) {
                // 移除 DEBUG 區塊
                rawLines.splice(start, end - start + 1);
                const updatedContent = rawLines.join('\n');

                this.appendFile(tempFilePath, updatedContent, true, true);

                // 美化代碼
                await this.executeCommandLine(
                  `cd ${libpath.dirname(tempFilePath)} && npx prettier --write "${tempFilePath}"`
                );
            }
        }
        return tempFolderPath;
    }


    /**
     * from, destination
     *
     * 讓file content清除後,在寫入資料, 避免to(destination) file address改變*/
    rewriteFile2File(from, to) {
        const content = this.getFileContextInRaw(from);
        if (!content.trim()) throw new ERROR(9999, `${from} 為空，避免覆蓋`);
        this.appendFile(to, content, true, true);
        this.appendInfo(`rewrite from:${from} => to:${to} 成功`);
    }

    /** 取得file第一行statement */
    getStringOfHeadOfFile(path) {
        if (this.isPathExist(path)) {
            const context = this.getFileContextInRaw(path)
            return _.head(context.split('\n'));
        }
        return '';
    }

    /** 因為code gen有很多要js file要執行 persistent, 沒有修改過{const edit = true}的index persist就不要理它 */
    isFileEditSucceed(filePath) {
        if (!this.isPathExist(filePath)) return false;

        const file = this.getPathInfo(filePath);
        const context = this.getFileContextInRaw(filePath).trim();

        if (context === '') {
            this.appendInfo(`74985465 path ${file.path} is empty file, file would not persist`);
            return false;
        }

        try {
            const firstLine = context.split('\n')[0];

            /**
             * const\s+：匹配 const 與其後至少一個空白。
             * ([a-zA-Z_]\w*)：匹配合法變數名稱（第一個字為英文字母或底線，其後可為英文字母、數字、底線）。
             * \s*=\s*：匹配等號兩邊的空白。
             * (true|false)：匹配布林值。
             * \s*;?：匹配可有可無的分號及其前空白。
             */
            const match = firstLine.match(/const\s+([a-zA-Z_]\w*)\s*=\s*(true|false)\s*;?/);
            if (!match || _.size(match) < 3) return false;/** ['const bear = true','bear','true',index: 0,input: 'const bear = true', groups:undefined] */
            const editValue = match[2] === 'true';
            if (editValue === true) {
                return true;
            }
        } catch (error) {
            this.appendError(`66445411 ${error.message}`);
            return false;
        }

        return false;
    }

    /**
     * 從絕對路徑中取出 "src/" 之後的部分（包含前置 /）
     * @param {string} fullPath - 完整的絕對檔案路徑
     * @param {string} folder - 針對/folder/之後作為split起點（預設為 src）
     * @returns {string} - 以 / 開頭、從 src/ 之後開始的相對路徑
     */
    getPathAfterSpecificFolder = (fullPath, folder = 'src') => {
        const parts = fullPath.split(libpath.sep);
        for (let i = parts.length - 1; i >= 0; i--) {
            if (parts[i] === folder) {
                return '/' + parts.slice(i + 1).join('/');
            }
        }
        return '';
    };

    /**
     * 從絕對路徑中取出 "src/" 之後的部分（包含前置 /）
     * @param {string} fullPath - 完整的絕對檔案路徑
     * @returns {string} - 以 / 開頭、從 src/ 之後開始的相對路徑
     */
    getPathAfterSrc = (fullPath) => {
        return this.getPathAfterSpecificFolder(fullPath);
    }

    /**
     * console.log(joinRespectingDot('./temp', 'scs', 'qqq', 'as.js'));
     * // ./temp/scs/qqq/as.js
     *
     * console.log(joinRespectingDot('temp', 'scs', 'qqq', 'as.js'));
     * // temp/scs/qqq/as.js
     *
     * console.log(joinRespectingDot('/usr', 'local', 'bin'));
     * // /usr/local/bin
     *
     * 讓./組合的path 不要因為join被拿掉 產生在本機根目錄 /src 的權限問題
     */
    joinRespectingDot(...args) {
        const shouldHaveDotSlash = args[0]?.startsWith('./');
        const cleanArgs = args[0]?.startsWith('./') ? [args[0].slice(2), ...args.slice(1)] : args;
        const joined = libpath.join(...cleanArgs);
        return shouldHaveDotSlash && !libpath.isAbsolute(joined) ? `./${joined}` : joined;
    }


}

if (configerer.DEBUG_MODE) {
    (async () => {
          // const match = 'const bear = true'.match(/const\s+([a-zA-Z_]\w*)\s*=\s*(true|false)\s*;?/);
          // console.log('is match ==> ', match);
          // const utiller = new NodeUtiller();
            // utiller.persistByPath('./a/b/c.js')
            // await utiller.persistJsonFilePrettier('./temp/one.json',{a:'v',b:'x'});
            // await utiller.updateFileOfSpecificLine('/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/admin.package.json.mustache',
            //     (item) => `"utiller":"^1.0.3"${_.endsWith(_.trim(item),',') ? ',': ''}`,(line) => _.startsWith( _.trim(line),`"firebase"`)
            //     )
            // console.log(utiller.isFileEditS
            // ucceed('/Users/davidtu/cross-achieve/high/idea-inventer/gen/dading/web/src/component/establish/index.js'));
            // console.log(await utiller.getObjectFromPromptQ({name:'order',require:true,description:'what u what'}));
            // console.log(utiller.getVersionOfJsFile(`./source.js`));
            // for(const index of _.range(1,100)){
            //
            // }
            // const result = utiller.getStringOfHandledHtml('<form id="_form_aiochk" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post"><input type="hidden" name="MerchantTradeNo" id="MerchantTradeNo" value="sO6E2IilSGYpCChDqrI2" /><input type="hidden" name="MerchantTradeDate" id="MerchantTradeDate" value="2022/07/02 05:16:32" />' +
            //     '<input type="hidden" name="TotalAmount" id="TotalAmount" value="350" /><input type="hidden" name="TradeDesc" id="TradeDesc" value="綠界第三方支付(明悅科技-線上支付)" /><input type="hidden" name="ItemName" id="ItemName" value="iphone13 pro x 2 = 200 元#iphone11 x 3 = 150 元#總價 350 元##※備註: 無備註內容" /><input type="hidden" name="ReturnURL" id="ReturnURL" value="https://us-central1-davidtu-dev.cloudfunctions.net/confirmedByByECPay" /><input type="hidden" name="ClientBackURL" id="ClientBackURL" value="https://www.google.com/" /><input type="hidden" name="ExpireDate" id="ExpireDate" value="1" /><input type="hidden" name="PaymentInfoURL" id="PaymentInfoURL" value="https://us-central1-davidtu-dev.cloudfunctions.net/paymentInfoByECPay" /><input type="hidden" name="ChoosePayment" id="ChoosePayment" value="ALL" /><input type="hidden" name="PlatformID" id="PlatformID" value="" /><input type="hidden" name="MerchantID" id="MerchantID" value="2000132" /><input type="hidden" name="InvoiceMark" id="InvoiceMark" value="N" /><input type="hidden" name="IgnorePayment" id="IgnorePayment" value="BARCODE#AndroidPay#ApplePay" /><input type="hidden" name="DeviceSource" id="DeviceSource" value="" /><input type="hidden" name="EncryptType" id="EncryptType" value="1" /><input type="hidden" name="PaymentType" id="PaymentType" value="aio" />' +
            //     '<input type="hidden" name="CheckMacValue" id="CheckMacValue" value="D55E9E48C6AB83C063E0E13AD1B8C2EE8FA6547A7D7FCB33860B532E97D808BC" /><script type="text/javascript">document.getElementById("_form_aiochk").submit();</script></form>'
            //     , (document) => {
            //         const element = document.getElementById('CheckMacValue');
            //         element.setAttribute('value', '123456');
            //     })
            // console.log(result);
            // console.log(utiller.getStringOfVersionIncrement('1.0.3'))
            // utiller.appendFile(`./test/2.js`, '2saads\n\nwqeadsdas', true, true);
            // utiller.rewriteFile2File('./test/2.js','./test/1.js');
            // console.log(uii.isValidFilePath('aa/cc/vv.ss'));
            // const path = uii.persistByPath('./one.js');
            // new NodeUtiller().renameFile(path, 'two');
            // await new NodeUtiller().cleanAllFiles('../testing_self/sample');
            // await new NodeUtiller().generatePackage('../utiller', true);
            // await new NodeUtiller().generatePackage('../databazer');
            // await new NodeUtiller().generatePackage('../linepayer');
            // await new NodeUtiller().generatePackage('../configerer');
            // await new NodeUtiller().generatePackage('../configerer');
            // await new NodeUtiller().generatePackage('../databazer');
            // await new NodeUtiller().enrichEachPackageJson('../');
            // await new NodeUtiller().upgradePackageJsonVersion('./package.json');
            // await new NodeUtiller().generatePackage('../linepay');
            // await new NodeUtiller().installEveryProject('../');
            // cthis.appendInfo((new NodeUtiller().getPathInfo('./').absolute);
            // this.appendInfo((new NodeUtiller().getFileLastModifiedTime(`./error_logs.txt`));
            // await new NodeUtiller().generateTempFolderWithCleanSrc('.');
            // await new NodeUtiller().generatePackage('./');
            // new NodeUtiller().appendInfo('ddsds',{ff:'2',cc:'tggresd'},[2,4,5,6,7,8,9])
            // console.log(process.env.keyword);
            // console.log(new NodeUtiller().getNodeEnvVariable('keyword'));
            // console.log(new NodeUtiller()
            //     .getFileNameExtensionFromPath('https://stackoverflow.com/questions/3916191/download-data-url-file/draw918.mp3'));
            // //


        }
    )();
}

export default NodeUtiller;
