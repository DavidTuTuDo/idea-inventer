import libpath from "path";
import fs from "fs";
import _ from "lodash";
import ChildProcess from "child_process";
import {configerer} from "configerer";
import Utiller from "./index";
import ERROR from '../exceptioner/index';
import pdf from 'pdf-parse';
import del, {type} from 'del';
import fse from 'fs-extra';
import prompt from 'prompt';
import {parse} from 'node-html-parser';

class NodeUtiller extends Utiller {

    /**================================= only in node.js ================================= */
    /** 是否把log message 存到 info.txt*/
    isPersistIntoLogFile = true;


    findSpecificFolderByPath(path, folderName) {
        const absolute = libpath.resolve(path);
        const splited = absolute.split('/');
        while (!fs.existsSync(`${splited.join('/')}/${folderName}`) && splited.length > 0) {
            splited.pop();
        }
        return `${splited.join('/')}/.idea`;
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
    findFilePathBy = (path, predicate = (each) => true, ...excludes) => {
        if (!fs.existsSync(path)) return [];
        const list = fs.readdirSync(path)
        const files = [];
        for (let item of list) {
            if (_.includes(excludes, item)) continue
            const currentpath = libpath.join(path, item);
            if (fs.lstatSync(currentpath).isDirectory()) {
                files.push(...this.findFilePathBy(currentpath, predicate, ...excludes));
            } else if (fs.lstatSync(currentpath).isFile()) {
                const pathInfo = this.getPathInfo(currentpath);
                if (predicate(pathInfo)) {
                    files.push(pathInfo);
                }
            } else {
                throw new ERROR(8003, item, currentpath)
            }
        }
        return files
    }

    /** 是一個存在的檔案 */
    isPathExist(path) {
        return fs.existsSync(path);
    }

    /** path = a/b/c/file.js , newName = 'two'
     * output => a/b/c/two.js
     * */
    renameFile(path, newName = 'fileName') {
        if (!this.isPathExist(path) || !this.isFile(path)) {
            this.appendError(`984521 path not exist or not a file path:${path}`);
            return;
        }
        if (_.isEmpty(newName)) {
            this.appendError('984522,new name is empty');
            return;
        }
        const next = libpath.join(this.getFileDirPath(path), `${newName}.${this.getExtensionFromPath(path)}`)
        fs.renameSync(path, next);
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
        }

        if (this.isFile(absolute)) {
            obj['extension'] = absolute.split('\.').pop();
            const fileNameStrings = absolute.split('\/').pop().split('\.');
            fileNameStrings.pop()
            /** 要是遇到 asd.sdsd.js 就麻煩了 */
            obj['fileName'] = fileNameStrings.join('\.');
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
    persistByPath(path) {
        const dirs = _.split(path, '\/');
        for (let index = 0; index < dirs.length; index++) {
            let currentPath = (_.join(_.take(dirs, index + 1), '/'))
            /** 避免 /Users/davidtu/cross-achieve/ 這種狀況, 字串首是slash */
            if (currentPath === '') continue;
            let currentDir = _.nth(dirs, index);
            let hasExtension = this.has(currentDir, '.') && !_.isEmpty(currentDir.split('.').pop());
            try {
                if (!fs.existsSync(currentPath)) {
                    if (hasExtension) {
                        fs.openSync(currentPath, 'wx');
                    } else {
                        fs.mkdirSync(currentPath);
                    }
                }
            } catch (error) {
                throw new ERROR(8008, `currentPath => ${currentPath}`, error);
            }
        }
        return libpath.resolve(path);
    }

    /**
     * filter:function, 就filter,(path) => {要就true}
     * override: boolean, 要不要override檔案:default true;
     * preserveTimestamps : boolean, 要不要保留原始檔案的時間, 不然就是cp的時間,default true;
     * */
    copyFromFolderToDestFolder(from, dest, override = true, preserveTimestamps = false, filter = () => true) {
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
        return _.filter(this.getChildPathByPath(path), each => each.isDirectory).map((path) => path.dirName);
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

        const destination = (_.isString(fileName) && !_.isEmpty(fileName)) ? libpath.join(dest, fileName) : dest;
        if (fs.existsSync(destination) && !force)
            throw new ERROR(8006, destination);

        fs.copyFileSync(from, destination);
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
        return this.isOrEquals(file.extension, `svg`, `png`, `jpg`, `jpeg`);
    }

    /** 把內容都抹掉each 是 fileName, ex:index.js*/
    async cleanChildFiles(path, predicate = (each) => true, ...exclude) {
        if (fs.existsSync(path)) {
            const files = this.findFilePathBy(path, predicate, ...exclude);
            for (const file of files) {
                if (this.isImageFile(file)) continue;
                this.cleanFileContent(file.absolute);
                this.appendInfo(`成功 cleanChildFiles() -> '${file.path}'`)
            }
            await this.syncDelay(1);
            return files;
        }
        return false;
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
        path-to-node="$USER_HOME$/.nvm/versions/node/v14.4.0/bin/node" 
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

    disableLogMessagePersistent() {
        this.isPersistIntoLogFile = false;
    }

    appendLog(path, messages, error = false) {
        if (!this.isProductionEnvironment()) {
            error ? console.error(...messages) : console.log(...messages);
        }

        if (this.isPersistIntoLogFile) {
            const messageOfSpecificLog = `${this.getCurrentTimeFormat()} ${error ? `ERROR` : `LOG`} : ${this.getLogString(messages)}`;
            this.appendFile(path, messageOfSpecificLog);
        }
    }

    getLogString(datas) {
        return datas.map((data) => (this.isJson(data) || _.isObject(data) || _.isArray(data)) ? this.deepFlat(data) : data).join(' ,')
    }

    /** 如果file不存在,就會產生file,force_delete 可以強制刪除cache file*/
    appendFile(path, data, newlineOnceFileNotEmpty = true, forceDelete = false) {
        let options = err => {
            throw new ERROR(8001, err);
        };

        if (!this.isValidFilePath(path)) {
            throw new ERROR(9999, `不是個合法的file路徑 ==> '' ${path} ''`);
        }

        if (forceDelete) {
            this.cleanFileContent(path);
            newlineOnceFileNotEmpty = false;
            this.persistByPath(path);
        } else if (this.isEmptyFile(path)) {
            newlineOnceFileNotEmpty = false;
        }

        fs.appendFileSync(path, `${newlineOnceFileNotEmpty ? '\n' : ''}${data}`, options);
    }

    /** 常常要把JSON的內容印出來，所以這個很方便 */
    async persistJsonFilePrettier(path, object, ignoreP = false) {
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

    /** 保守的複製檔案, 如果檔案比較舊, 或是檔案是空的, 就放棄copy行為 */
    copySingleFileConservative(pathOfDestinationFolder, latestFile) {
        if (this.isEmptyFile(latestFile.absolute)) {
            this.appendInfo(`${latestFile.absolute} is empty file, ignore copy behavior`);
            return;
        }

        if (!fs.existsSync(pathOfDestinationFolder)) {
            this.appendInfo(`${pathOfDestinationFolder} is not exist, easy to override`);
        } else if (fs.existsSync(pathOfDestinationFolder) &&
            this.getFileLastModifiedTime(pathOfDestinationFolder) > latestFile.lastModifiedTime) {
            this.appendInfo(`${pathOfDestinationFolder} is the latest, ignore this run`);
            return;
        }

        this.persistByPath(this.getFolderPathOfSpecificPath(pathOfDestinationFolder));
        this.copySingleFile(latestFile.absolute, pathOfDestinationFolder, undefined, true);
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
                        this.copyFromFolderToDestFolder(
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
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/admin.package.json',
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/web.package.json',
            '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template/functions.package.json',
            '/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/sample.package.json',
        ];
        for (const path of paths) {
            if (this.isPathExist(path)) {
                const json = this.getJsonObjByFilePath(path);
                if (json && json.dependencies && json.dependencies[dependency]) {
                    json.dependencies[dependency] = `^${newVersion}`
                    await this.writeJsonThanPrettier(path, json);
                }
            }
        }
        this.copyFromFolderToDestFolder(
            '/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/',
            '/Users/davidtu/cross-achieve/high/idea-inventer/newp/template/',
            true, true)
    }

    async writeJsonThanPrettier(path, json) {
        this.writeFileInJSON(path, json);
        await this.prettier(path);
    }

    /** 用來豐富package.json的功能 */
    async enrichEachPackageJson(path) {
        const jsons = this.findFilePathByExtension(path, ['json'], 'gen', 'node_modules', 'release');
        const packages = _.filter(jsons, (each) =>
            _.isEqual(each.fileName, 'package') ||
            _.isEqual(each.fileName, 'admin.package') ||
            _.isEqual(each.fileName, 'web.package') ||
            _.isEqual(each.fileName, 'functions.package')
        )
        for (const path of packages) {
            const json = this.getJsonObjByFilePath(path.absolute);
            const script = json.scripts ? json.scripts : {};
            script['updateConfigerer'] = "npm update configerer --save";
            await this.writeJsonThanPrettier(path.absolute, json);
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
        return !this.isPathExist(path) || _.isEqual('', this.getFileContextInRaw(path).trim())
    }

    isEmptyFolder(path) {
        return fs.readdirSync(path).length === 0;
    }

    /** 把檔案弄得好看一點
     * width 是指一行能塞下多少的字元
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
        const stats = fs.statSync(path);
        return stats.mtimeMs;
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
    async reWriteJsonAttribute(path, ...attrs) {
        if (_.isEqual('json', this.getPathInfo(path).extension)) {
            const json = this.getJsonObjByFilePath(path);
            for (const attr of attrs) {
                if (!_.isObject(attr)) {
                    throw new ERROR(9999, `84451515 attr is not object, which is 'type=${typeof attr} => ${attr}'`)
                }
                json[this.getObjectKey(attr)] = this.getObjectValue(attr);
            }

            await this.writeJsonThanPrettier(path, json)
            return {version: json.version, moduleName: json.name};
        } else {
            throw new ERROR(9999, `reWriteJsonAttribute() => path is not package.json, which is ${path}`)
        }
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
    async generateTempFolderWithCleanSrc(path) {
        this.appendInfo('generateTempFolderWithCleanSrc', path);
        const sourceFile = libpath.join(path, 'src');
        const tempFolderPath = libpath.join(path, 'temp');
        if (fs.existsSync(sourceFile)) {
            this.appendInfo('generateTempFolderWithCleanSrc', 'source', sourceFile);
            this.persistByPath(tempFolderPath)
            this.copyFromFolderToDestFolder(sourceFile, tempFolderPath);
            for (const file of this.findFilePathBy(tempFolderPath)) {
                const tempFilePath = file.absolute;
                const stmts = this.getFileContextInRaw(tempFilePath).split(`\n`).map((line) => _.trim(line));
                /** 找出if (configerer) 當作start */
                const indexOfStart = _.findIndex(stmts, (stmt) => _.startsWith(stmt, `if (configerer.DEBUG_MODE)`));
                /** 找出 } 當作 end */
                const indexOfEnd = _.findLastIndex(stmts, (stmt) => _.isEqual(stmt, `}`));
                if (indexOfEnd > 0 && indexOfStart > 0 && indexOfEnd > indexOfStart) {
                    /** 刪除掉 if(configerer.DEBUG) {...........} */
                    this.dropItemsByIndex(stmts, indexOfStart, indexOfEnd);
                    this.appendFile(tempFilePath, _.join(stmts, `\n`), true, true);
                    await this.executeCommandLine(`cd ${libpath.resolve(`${this.getFileDirPath(tempFilePath)}`)} &&
                         npx prettier --write ${tempFilePath}`)
                }
            }
        }
        return tempFolderPath;
    }

    /**
     * from, destination
     *
     * 讓file content清除後,在寫入資料, 避免destined file address改變*/
    rewriteFile2File(from, destination) {
        const content = this.getFileContextInRaw(from);
        if (_.isEmpty(content))
            throw new ERROR(9999, `${from} 內容為空值, ***rewrite功能會避免空值覆蓋, 這是一個設計`)

        this.appendFile(destination, content, true, true);
        this.appendInfo(`rewrite from:${from} => dest:${destination} succeed`);
    }

    /**
     * 把一段html文字轉換成類似document的結構 處理後再回傳文字

     // const result = utiller.getStringOfHandleHtml('<form id="_form_aiochk" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post"><input type="hidden" name="MerchantTradeNo" id="MerchantTradeNo" value="sO6E2IilSGYpCChDqrI2" /><input type="hidden" name="MerchantTradeDate" id="MerchantTradeDate" value="2022/07/02 05:16:32" />' +
     //     '<input type="hidden" name="TotalAmount" id="TotalAmount" value="350" /><input type="hidden" name="TradeDesc" id="TradeDesc" value="綠界第三方支付(明悅科技-線上支付)" /><input type="hidden" name="ItemName" id="ItemName" value="iphone13 pro x 2 = 200 元#iphone11 x 3 = 150 元#總價 350 元##※備註: 無備註內容" /><input type="hidden" name="ReturnURL" id="ReturnURL" value="https://us-central1-davidtu-dev.cloudfunctions.net/confirmedByByECPay" /><input type="hidden" name="ClientBackURL" id="ClientBackURL" value="https://www.google.com/" /><input type="hidden" name="ExpireDate" id="ExpireDate" value="1" /><input type="hidden" name="PaymentInfoURL" id="PaymentInfoURL" value="https://us-central1-davidtu-dev.cloudfunctions.net/paymentInfoByECPay" /><input type="hidden" name="ChoosePayment" id="ChoosePayment" value="ALL" /><input type="hidden" name="PlatformID" id="PlatformID" value="" /><input type="hidden" name="MerchantID" id="MerchantID" value="2000132" /><input type="hidden" name="InvoiceMark" id="InvoiceMark" value="N" /><input type="hidden" name="IgnorePayment" id="IgnorePayment" value="BARCODE#AndroidPay#ApplePay" /><input type="hidden" name="DeviceSource" id="DeviceSource" value="" /><input type="hidden" name="EncryptType" id="EncryptType" value="1" /><input type="hidden" name="PaymentType" id="PaymentType" value="aio" />' +
     //     '<input type="hidden" name="CheckMacValue" id="CheckMacValue" value="D55E9E48C6AB83C063E0E13AD1B8C2EE8FA6547A7D7FCB33860B532E97D808BC" /><script type="text/javascript">document.getElementById("_form_aiochk").submit();</script></form>'
     //     , (document) => {
     //         const element = document.getElementById('CheckMacValue');
     //         element.setAttribute('value', '123456');
     //     })
     */
    getStringOfHandledHtml(string, predicate = (document) => {
        console.log(document)
    }) {
        const document = parse(string);
        predicate(document);
        return document.toString();
    }

}

if (configerer.DEBUG_MODE) {
    (async () => {
            // const utiller = new NodeUtiller();
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
            // await new NodeUtiller().generatePackage('../utiller',false);
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
