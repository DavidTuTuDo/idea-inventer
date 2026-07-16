import libpath from "path";
import fs from "fs";
import fsp from "fs/promises";
import ChildProcess from "child_process";
import {configerer} from "configerer";
import Utiller from "./index";
import ERROR from '../exceptioner/index';
import del from 'del';
import fse from 'fs-extra';
import inquirer from 'inquirer';

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
            obj['dirName'] = (absolute.split('\/')).at(-2);
            obj['folderName'] = (absolute.split('\/')).at(-2);
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
        const reg = new RegExp(`^[^\.].+.(${(_extension).join('|')})$`);
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

        const paths = this.findFilePathBy(path, (each) => this.isEqual(each.fileNameExtension, 'package.json'), ...ex)
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

    /**
     * from : './template/sample.babel.config.js'
     * dest : '/template' 或是 '/template/newFileName.js'
     * fileName: 'fileName.extension' (可選)
     * force : 強制覆蓋
     */
    copySingleFile(from, dest, fileName, force = false) {
        // 1. 決定初步的 destination 路徑
        let destination = (fileName && fileName.trim()) ? libpath.join(dest, fileName) : dest;

        // 2. 修復 EISDIR：如果 destination 是一個已存在的「資料夾」，自動補上來源檔名
        if (fs.existsSync(destination) && fs.statSync(destination).isDirectory()) {
            const originalFileName = libpath.basename(from);
            destination = libpath.join(destination, originalFileName);
        }

        // 3. 檢查檔案是否已存在，若存在且不強制覆蓋則報錯
        if (fs.existsSync(destination) && !force) {
            throw new ERROR(8006, destination);
        }

        // 4. (安全防護) 確保目的地的父資料夾存在，否則會報 ENOENT 找不到路徑錯誤
        const destDir = libpath.dirname(destination);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // 5. 執行複製
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
        const paths = this.findFilePathBy(path, (each) => this.isEqual(each.fileNameExtension, 'package.json'), 'node_modules');
        for (let path of paths) {
            try {
                if (!this.isEqual(path.dirName, '..'))
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
        fs.copyFileSync('./template/sample.terser.config.js', `${dirPath}/terser.config.js`);

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
            const indexOfRunManager = (splited).findIndex((line) => this.has(line, 'name="RunManager'));
            this.insertToArray(splited, indexOfRunManager,
                `<configuration name="${packageName}" 
        type="NodeJSConfigurationType" 
        path-to-node="$USER_HOME$/.nvm/versions/node/v20.19.5/bin/node" 
        node-parameters="--require @babel/register" 
        path-to-js-file="${libpath.resolve(dirPath)}/src/index.js" 
        working-dir="${libpath.resolve(dirPath)}" >`,
                `    <envs>`,
                `        <env name="self_debug" value="true" />`,
                `        <env name="is_node" value="true" />`,
                `    </envs>`,
                `    <method v="2" />`,
                `</configuration>`);

            const indexOfList = (splited).findIndex((line) => this.isEqual(String(line).trim(), `<list>`), indexOfRunManager);
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
        return datas.map((data) => (this.isJson(data) || this.isObject(data) || Array.isArray(data)) ? this.deepFlat(data) : data).join(' ,')
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

    /** 重複讀取file IO時，要用這個方式，不然IO太吃資源了
     *  重要！！！！！cache可能會導致node.js的 stack memory爆掉
     * */
    async readFileContentByPath(path, cache = {}) {
        return cache[path] ?? (cache[path] = await fsp.readFile(path, 'utf-8'));
    }

    singleFileTemplatify(path = './') {
        const all = this.findFilePathByExtension(path, ['js'], 'node_modules');
        for (const file of all) {
            const content = this.getFileContextInRaw(file.absolute).trim();
            if (((content) == null || (typeof (content) === "object" && Object.keys(content).length === 0) || (typeof (content) === "string" && (content).length === 0))) {
                this.appendInfo(file.fileName, file.absolute);
                const className = this.isEqual(file.fileName, 'index') ? file.dirName : file.fileName;
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

    registerGitPushOnExit(moduleName, version) {
        if (!this.packagesBumped) {
            this.packagesBumped = [];
        }
        this.packagesBumped.push(`${moduleName}@${version}`);

        if (this.gitPushListenerRegistered) return;
        this.gitPushListenerRegistered = true;

        process.once('beforeExit', async () => {
            if (process.env.GITHUB_ACTIONS === 'true') return;
            try {
                this.appendInfo(`[Git Push on Exit] Detecting changes to commit for: ${this.packagesBumped.join(', ')}`);
                await this.executeCommandLine('git add **/package.json **/template/*');
                const commitMsg = `chore: bump version for ${this.packagesBumped.join(', ')}`;
                const hasChanges = await this.executeCommandLine('git diff --cached --name-only').then(out => out.trim().length > 0).catch(() => false);
                if (hasChanges) {
                    this.appendInfo(`[Git Push on Exit] Committing: ${commitMsg}`);
                    await this.executeCommandLine(`git commit -m "${commitMsg}"`);
                    this.appendInfo(`[Git Push on Exit] Pushing to github master...`);
                    await this.executeCommandLine('git push github master');
                    this.appendInfo(`[Git Push on Exit] Push success!`);
                } else {
                    this.appendInfo(`[Git Push on Exit] No changes to commit.`);
                }
            } catch (err) {
                this.appendError(`[Git Push on Exit] Failed: ${err.message}`);
            }
        });
    }

    /** 用來pack lib_project, 不然其他import lib_project的專案會無法讀懂es6
     * release folder 會被自動ignore到
     * exclude 裡面可以放專案名稱, 例如 free_marker,question_update */
    async generatePackage(path = './', deployToNPMServer = false, forceInstallNodeModule = true, ...exclude) {
        let packagejsons = this.findFilePathByExtension(path, ['json'], 'node_modules', 'release');
        packagejsons = (packagejsons).filter((each) => this.isEqual(each.fileName, 'package'));
        packagejsons = packagejsons.map((each) => this.getFolderPathOfSpecificPath(each.absolute));

        for (const path of packagejsons) {
            if (this.isAndEquals(...exclude.map((projectName) => () => !this.has(path, projectName)))) {
                /** 產生去掉if(debug) { command } 字樣的 */
                const tempFolderPath = await this.generateTempFolderWithCleanSrc(path);

                /** 產生release資料夾 */
                await this.deleteSelfByPath(libpath.join(path, 'release'), true);
                const release = this.persistByPath(libpath.join(path, 'release'))
                /** 利用babel 產生出 es5相容性高的src file */
                await this.executeCommandLine(`cd ${path} && babel ./temp --out-dir ./release/lib --config-file ./babel.config.js`);
                // Step 2: Terser
                const terserConfig = require(libpath.join(path, './terser.config.js'));
                const terserArgs = this.getStringOfTerserCommandLine(terserConfig);

                // ✅ find 會自動遞迴查找所有子目錄下的 .js 文件
                // . 表示當前目錄及其所有子目錄
                await this.executeCommandLine(`cd ${path}/release/lib && find . -type f -name "*.js" -exec terser {} -o {} ${terserArgs} \\;`);

                const pathOfPackageJson = libpath.join(path, 'package.json');
                try {

                    const indexFileName = 'sample.npm.module.index.js'
                    /** 複製公版的index.js */
                    this.copySingleFile(`/Users/davidtu/cross-achieve/legacy/idea-inventer/utiller/template/${indexFileName}`,
                        release, 'index.js', true);

                    /** 將公版的index.js也terser一波 */
                    const filePath = `${path}/release/index.js`;
                    await this.executeCommandLine(`terser ${filePath} -o ${filePath} ${terserArgs}`);

                    /** template就是樣板的概念 */
                    const templatePath = libpath.join(path, 'template');
                    if (this.isPathExist(templatePath)) {
                        await this.copyFromFolderToDestFolder(
                            templatePath,
                            this.persistByPath(libpath.join(release, 'template')));
                    }
                    if (deployToNPMServer && process.env.GITHUB_ACTIONS !== 'true') {
                        /** 升級package.json的版號 */
                        const {moduleName, version} = await this.upgradePackageJsonVersion(pathOfPackageJson);

                        /** 把所有樣板的版號都提升 */
                        await this.updateVersionOfTemplate(moduleName, version);

                        /** 註冊結束時自動 Git push */
                        this.registerGitPushOnExit(moduleName, version);
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
                        if (process.env.GITHUB_ACTIONS === 'true') {
                            await this.executeCommandLine(`cd ${release} && npm publish --provenance`);
                        } else {
                            this.appendInfo(`[Local Build] Skip local publish. Commits will be pushed to GitHub to trigger CI/CD publishing.`);
                        }
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

    /**
     * 將 Terser 配置對象轉換為命令行參數字符串
     *
     * 此函數會讀取 terser.config.js 的配置，並生成對應的 CLI 參數
     * 用於在 shell 命令中執行 terser
     *
     * @param {Object} terserConfig - Terser 配置對象（來自 terser.config.js）
     * @param {Object} terserConfig.compress - 壓縮選項
     * @param {boolean} terserConfig.compress.drop_console - 是否移除 console
     * @param {boolean} terserConfig.compress.drop_debugger - 是否移除 debugger
     * @param {number} terserConfig.compress.passes - 壓縮遍數（1-3）
     * @param {boolean} terserConfig.compress.dead_code - 是否移除死代碼
     * @param {boolean} terserConfig.compress.unused - 是否移除未使用的變數
     * @param {boolean} terserConfig.mangle - 是否混淆變數名
     * @param {Object} terserConfig.format - 格式化選項
     * @param {boolean} terserConfig.format.beautify - 是否美化代碼
     * @param {string|boolean} terserConfig.format.comments - 註解處理方式
     * @param {number} terserConfig.format.indent_level - 縮排層級
     *
     * @returns {string} Terser 命令行參數字符串
     *
     * @example
     * const config = {
     *     compress: { drop_console: true, drop_debugger: true, passes: 2 },
     *     mangle: true,
     *     format: { beautify: false, comments: false }
     * };
     * const args = getStringOfTerserCommandLine(config);
     * // 返回: "--compress drop_console=true,drop_debugger=true,passes=2 --mangle --no-comments"
     */
    getStringOfTerserCommandLine = (terserConfig) => {
        // 用於存儲所有命令行參數的數組
        const args = [];

        // ========================================================================
        // 處理 compress 選項（壓縮相關配置）
        // ========================================================================
        if (terserConfig.compress) {
            // 用於存儲所有 compress 子選項的數組
            const compressOpts = [];

            // 移除所有 console.* 語句
            // 例如：console.log(), console.warn(), console.error() 等
            if (terserConfig.compress.drop_console) {
                compressOpts.push('drop_console=true');
            }

            // 移除所有 debugger 語句
            if (terserConfig.compress.drop_debugger) {
                compressOpts.push('drop_debugger=true');
            }

            // 設置壓縮遍數（1-3）
            // passes=1: 快速壓縮（推薦開發環境）
            // passes=2: 平衡壓縮（推薦生產環境）
            // passes=3: 最大壓縮（體積要求極高時使用）
            if (terserConfig.compress.passes) {
                compressOpts.push(`passes=${terserConfig.compress.passes}`);
            }

            // 移除永遠不會執行的代碼（死代碼）
            // 例如：if (false) { ... } 或 return 後的代碼
            if (terserConfig.compress.dead_code) {
                compressOpts.push('dead_code=true');
            }

            // 移除未使用的變數和函數
            // 幫助減少最終打包體積
            if (terserConfig.compress.unused) {
                compressOpts.push('unused=true');
            }

            // 如果有任何 compress 選項，將它們組合成一個 --compress 參數
            // 格式：--compress option1=value1,option2=value2,...
            if (compressOpts.length > 0) {
                args.push(`--compress ${compressOpts.join(',')}`);
            }
        }

        // ========================================================================
        // 處理 mangle 選項（變數名混淆）
        // ========================================================================
        // mangle: true  → 混淆變數名（longVariableName → a）
        // mangle: false → 保持原始變數名
        if (terserConfig.mangle === true) {
            args.push('--mangle');
        }
        // 注意：如果 mangle: false，則不添加任何參數（默認不混淆）

        // ========================================================================
        // 處理 format 選項（代碼格式化）
        // ========================================================================
        if (terserConfig.format) {

            // 是否美化代碼（保持縮排和換行）
            // beautify: true  → 代碼易讀，有格式
            // beautify: false → 壓縮成一行，體積更小
            if (terserConfig.format.beautify === true) {
                args.push('--beautify');
            }

            // 處理註解的保留方式
            if (terserConfig.format.comments === false) {
                // comments: false → 移除所有註解
                // 使用 --no-comments 而不是 --comments false
                // 因為 --no-comments 在所有 Terser 版本中都更可靠
                args.push('--no-comments');

            } else if (terserConfig.format.comments === 'all') {
                // comments: 'all' → 保留所有註解
                args.push('--comments all');

            } else if (terserConfig.format.comments) {
                // comments: /正則/ 或其他字符串 → 只保留匹配的註解
                // 例如：comments: /@license|@preserve/
                // 用引號包裹以防止 shell 解析問題
                args.push(`--comments "${terserConfig.format.comments}"`);
            }
            // 注意：如果 comments 未設置，則使用 Terser 默認行為

            // 設置縮排層級（只在 beautify: true 時有效）
            // 例如：indent_level: 4 表示使用 4 個空格縮排
            if (terserConfig.format.indent_level) {
                args.push(`--format indent_level=${terserConfig.format.indent_level}`);
            }
        }

        // ========================================================================
        // 返回組合後的命令行參數字符串
        // ========================================================================
        // 使用空格將所有參數連接起來
        // 例如："--compress drop_console=true --mangle --no-comments"
        return args.join(' ');
    }

    /** 用來更新樣板裡面的模組版本 */
    async updateVersionOfTemplate(dependency, newVersion) {

        const paths = [
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/free_marker/template/admin.package.json.mustache',
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/free_marker/template/web.package.json.mustache',
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/free_marker/template/functions.package.json.mustache',
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/utiller/template/sample.package.json',
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/free_marker/package.json'
        ];

        for (const path of paths) {
            if (this.isPathExist(path)) {
                console.log('🦴正在修改以下 path的版本 => ',path)
                let succeedOfPersistFile = false;
                const json = this.getJsonObjByFilePath(path);
                if (json && json.dependencies && json.dependencies[dependency]) {
                    json.dependencies[dependency] = `^${newVersion}`
                    try {
                        await this.writeJsonThanPrettier(path, json);
                        succeedOfPersistFile = true;
                    } catch (error) {
                        succeedOfPersistFile = false;
                    }
                }
                if (!succeedOfPersistFile) {
                    await this.updateFileOfSpecificLine(path,
                        (line) => `       "${dependency}":"^${newVersion}"${String(String(line).trim()).endsWith(',') ? ',' : ''}`,
                        (each) => String(String(each).trim()).startsWith(`"${dependency}"`));
                }
                console.log('💯成功修改以下 path的版本 => ',path)
            }

        }
        // console.log(`離開updateVersionOfTemplate()的迴圈`)

        await this.copyFromFolderToDestFolder(
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/utiller/template/',
            '/Users/davidtu/cross-achieve/legacy/idea-inventer/newp/template/',
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
        await this.prettier(pathOfFile);
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
        // 1. 如果路徑不存在，直接視為空檔案
        if (!this.isPathExist(path)) {
            return true;
        }

        // 2. 取得檔案內容（只呼叫一次，節省效能）
        const content = this.getFileContextInRaw(path);

        // 3. 如果內容是 null 或 undefined
        if (content == null) {
            return true;
        }

        // 4. 如果內容是字串，去除前後空白後檢查長度
        if (typeof content === "string") {
            return content.trim().length === 0;
        }

        // 5. 如果內容是物件（陣列也屬於物件），檢查是否有 key
        if (typeof content === "object") {
            return Object.keys(content).length === 0;
        }

        // 6. 若非以上情況，則視為非空
        return false;
    }

    isEmptyFolder(path) {
        return fs.readdirSync(path).length === 0;
    }

    /**
     * @param {string} path 檔案路徑
     * @param {number} width 寬度限制 (default: 250)
     * @param {string[]} extensions 要剝離處理的模板副檔名陣列 (default: ['.mustache'])
     */
    async prettier(path, width = 250, extensions = ['.mustache']) {
        const fullPath = libpath.resolve(path);
        const rootPath = libpath.resolve('.');

        // 1. 尋找檔案是否符合傳入的任一副檔名
        const matchedExt = extensions.find(ext => path.endsWith(ext));

        let targetPath = fullPath;
        let isTemplate = !!matchedExt;

        try {
            if (isTemplate) {
                // 2. 移除結尾副檔名 (例如: aaa.json.mustache -> aaa.json)
                // 使用 escape 處理點符號，並確保只匹配結尾 ($)
                const escapedExt = matchedExt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`${escapedExt}$`);
                targetPath = fullPath.replace(regex, '');

                // 3. 暫時重新命名
                await fs.rename(fullPath, targetPath);
            }

            // 4. 執行 Prettier
            // --ignore-unknown: 遇到不支援的副檔名會跳過而不噴錯
            await this.executeCommandLine(
                `cd "${rootPath}" && npx prettier --write "${targetPath}" --print-width ${width} --ignore-unknown`
            );

        } catch (error) {
            console.error(`Prettier 執行錯誤 [${path}]:`, error.message);
        } finally {
            // 5. 還原檔名：無論 Prettier 成功與否，都要確保改回原本的副檔名
            if (isTemplate && targetPath !== fullPath) {
                try {
                    // 先確認 targetPath 檔案真的存在（避免 rename 報錯）
                    await fs.access(targetPath);
                    await fs.rename(targetPath, fullPath);
                } catch (e) {
                    // 如果 targetPath 不存在，可能是 rename 失敗或檔案遺失，不執行還原
                }
            }
        }
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
        if (this.isEqual('json', this.getPathInfo(path).extension)) {
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
        if (this.isEqual('json', this.getPathInfo(path).extension)) {
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
        if (this.isEqual(this.getExtensionFromPath(path), 'js')) {
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
            if (!this.isObject(attr)) {
                throw new ERROR(9999, `4984651 attr is not object, which is 'type=${typeof attr} => ${attr}'`)
            }
            const key = this.getObjectKey(attr);
            const value = this.getObjectValue(attr);
            const contents = this.getFileContextInRaw(path).split(`\n`);
            const index = (contents).findIndex((each) => String(String(each).trim()).startsWith(`${key}`));
            /** 故意空4格 */
            contents[index] = `    ${key}: '${value}',`;
            this.appendFile(path, contents.join(`\n`), true, true);
        }
        return attrs;
    }

    /**
     * 將原本的 prompt config 格式轉換為 inquirer 格式
     * @param {Array} configs
     * @returns {Array} Inquirer 格式的問卷配置
     */
     transformConfigs = (configs) => {
        return configs.map(cfg => ({
            type: 'input', // 預設為輸入框
            name: cfg.name,
            message: cfg.description || cfg.name, // 將 description 對應到 message
            validate: (input) => {
                // 對應原本的 require: true
                if (cfg.require && !input.trim()) {
                    return `${cfg.name} is required!`;
                }
                return true;
            }
        }));
    };

    /**
     * 改進後的 getAnswerFromPromptQ
     * @param {Array} configs - 預設帶入單一配置的陣列
     */
    getAnswerFromPromptQ = async (configs = [{
        name: 'name',
        require: true,
        description: 'type the name',
    }]) => {
        const questions = this.transformConfigs(configs);
        return inquirer.prompt(questions);
    }

    /**
     * 陣列選擇工具函式
     * @param {Array<{name: string, path: string}>} projects - 專案列表陣列
     * @description
     * 1. 檢查傳入的陣列裡 是否有重複的 name 或 path。
     * 2. 提供互動式勾選選單（支援空白鍵選擇、A鍵全選）。
     * 3. 回傳使用者勾選的專案物件陣列。
     * @limitations
     * - 僅支援 Node.js 環境（需安裝 inquirer）。
     * - projects 必須為非空陣列，且每個項目必須包含 name 與 path 屬性。
     * @samples
     * projects = [
     *             {
     *                 name:'悅耳',
     *                 path:'./project-yueh-voice'
     *             },{
     *                 name:'悅考',
     *                 path:'./project-kh-high'
     *             },{
     *                 name:'悅譜',
     *                 path:'./project-yueh-pu'
     *             },
     *         ]
     */
     interactionByTerminalQ = async (projects) => {
        const MONITOR_PATH = './temp/monitor.json';
        let timeoutId = null; // 用來存放計時器 ID

        // 1. 檢查重複性
        const names = projects.map(p => p.name);
        const paths = projects.map(p => p.path);

        if (new Set(names).size !== names.length || new Set(paths).size !== paths.length) {
            console.error(`\x1b[31m錯誤: 偵測到重複的名稱或路徑，請檢查資料來源。\x1b[0m`);
            process.exit(1);
        }

        // 讀取快取資料
        let cachedData = null;
        try {
            const fileContent = await fsp.readFile(MONITOR_PATH, 'utf-8');
            cachedData = JSON.parse(fileContent);
        } catch (err) {
            // 檔案不存在或讀取失敗則忽略
        }

        const choices = projects.map(p => ({
            name: `${p.name} (${p.path})`,
            value: p
        }));

        // 定義 Inquirer 任務
        const promptTask = async () => {
            const answers = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'selectedProjects',
                    message: '請選擇要執行的子項 (15秒內未操作將使用上次紀錄):',
                    choices: choices,
                    validate: (answer) => answer.length >= 1 || '請至少選擇一個子項！'
                }
            ]);
            return answers.selectedProjects;
        };

        // 定義超時任務
        const timeoutTask = () => new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
                if (cachedData && cachedData.selectedProjects) {
                    console.log('\n\x1b[33m[Timeout] 15秒未操作，自動載入上一次的選擇項目...\x1b[0m');
                    // 注意：在 Timeout 時，若 Inquirer 還在跑，可能需要強制關閉介面
                    // 但 Node.js 中 Promise.race 無法直接殺掉 inquirer，通常建議讓使用者知道已自動跳轉
                    resolve(cachedData.selectedProjects);
                } else {
                    reject(new Error('Timeout: 沒有上次紀錄可供載入'));
                }
            }, 15000);
        });

        try {
            const finalSelection = await Promise.race([promptTask(), timeoutTask()]);

            // 【關鍵修復】: 只要 race 有結果了，就清除計時器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // 儲存結果並回傳
            const saveData = {
                updateTime: Date.now(),
                selectedProjects: finalSelection
            };

            const dir = libpath.dirname(MONITOR_PATH);
            await fsp.mkdir(dir, { recursive: true }); // 確保資料夾存在
            await fsp.writeFile(MONITOR_PATH, JSON.stringify(saveData, null, 2));

            return finalSelection;
        } catch (error) {
            // 出錯也要記得清除，避免遺留 log
            if (timeoutId) clearTimeout(timeoutId);
            console.error('\x1b[31m執行失敗:\x1b[0m', error?.message ?? '未知錯誤');
            return [];
        }
    };

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
            return (context.split('\n')[0]);
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
            if (!match || (Array.isArray(match) ? match.length : (typeof (match) === "object" && match !== null ? Object.keys(match).length : String(match).length)) < 3) return false;/** ['const bear = true','bear','true',index: 0,input: 'const bear = true', groups:undefined] */
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
            // const utiller = new NodeUtiller();
            // await utiller.generatePackage('../databazer', true)
            // const answer = await utiller.getAnswerFromPromptQ()
            // console.log(`it really workkks => `,answer)
            // console.log(utiller.joinRespectingDot('/usr', 'local', 'bin'));

        }
    )();
}

export default NodeUtiller;
