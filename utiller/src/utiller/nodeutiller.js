import libpath from "path";
import fs from "fs";
import _ from "lodash";
import process from "child_process";
import {configer} from 'configer';
import Utiller from "./index";
import ERROR from '../exceptioner/index';
import pdf from 'pdf-parse';
import del from 'del';
import fse from 'fs-extra';
import BufferList from 'bl';


class NodeUtiller extends Utiller {

    /**================================= only in node.js ================================= */

    findSpecificFolderByPath(path, folderName) {
        const absolute = libpath.resolve(path);
        const splited = absolute.split('/');
        while (!fs.existsSync(`${splited.join('/')}/${folderName}`) && splited.length > 0) {
            splited.pop();
        }
        return `${splited.join('/')}/.idea`;
    }

    async getPDFText(path) {
        let dataBuffer = fs.readFileSync(path);
        return pdf(dataBuffer).then((data) => {
            return data;
        });
    }

    printf() {
        console.log('i can use in node.js only');
    }

    /**
     * predicate: predicate(pathInfo); predicate帶的參數是 pathInfo object
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

    //todo 應該要改成class
    getPathInfo(path) {
        const absolute = libpath.resolve(path);
        const obj = {
            path,
            absolute,
            isFile: false,
            isDirectory: true,
            dirName: undefined,
            extension: undefined,
            fileName: undefined,
            fileNameExtension: undefined,
        }

        if (this.isFile(absolute)) {
            obj['extension'] = absolute.split('\.').pop();
            const fileNameStrings = absolute.split('\/').pop().split('\.');
            fileNameStrings.pop()
            /** 要是遇到 asd.sdsd.js 就麻煩了 */
            obj['fileName'] = fileNameStrings.join('\.');
            obj['dirName'] = _.nth(absolute.split('\/'), -2);
            obj['isFile'] = true;
            obj['isDirectory'] = false;
            obj['fileNameExtension'] = `${obj.fileName}.${obj.extension}`;
        }

        if (this.isisDirectory(absolute)) {
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
        const self = this;
        this.appendInfo(`執行腳本 ${command}`);
        return new Promise(function (resolve, reject) {
            process.exec(command,
                (error, stdout, stderr) => {
                    console.log(`${stdout}`);
                    console.log(`${stderr}`);
                    if (error) {
                        self.appendError(`執行錯誤: ${error}`);
                        reject(error);
                        return;
                    }
                    resolve(stdout.trim());
                });
        });
    }

    /** 讀取path,然後用utf-8的方式 */
    getContextForRawFile(path) {
        if (!fs.existsSync(path))
            return '';

        return fs.readFileSync(path, 'utf-8');
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

        fse.copySync(from, dest, {preserveTimestamps, override, filter})
        this.appendInfo(`複製 ${from}/* => ${dest}/* succeed`);
    }


    /** 取得檔案的目錄, path => c://folderName/fileName.js to c://folderName */
    getFileDirPath(path, slash = true) {
        return _.join(_.initial(_.split(path, '/')), '/') + (slash ? '/' : '');

    }

    /** 刪掉自己, force能夠強制刪除 自己root_dir 以外的path */
    async deleteSelfByPath(path, force) {
        this.appendInfo(`準備刪掉 ${path},{force:${force}}`);
        await del(path, {force});
        this.appendInfo(`成功刪掉了 ${path}`);
    }


    /** 刪掉自己目錄內的孩子, force能夠強制刪除 自己root_dir 以外的path */
    async deleteChildByPath(path, force = false) {
        const pathes = this.getChildPathByPath(path);
        for (const path of pathes) {
            await this.deleteSelfByPath(path.absolute, force);
        }
    }

    async reinstallNodeModules(path = '../', ...exclude) {
        const ex = [...exclude, 'node_modules', 'utiller', 'configer'];
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
     *  fileName: 'fileName.extension' => 如果fileName 是 empty ,dest就是直接的路徑
     * */
    copySingleFile(from, dest, fileName, force = false) {

        const destination = _.isEmpty(fileName) ? dest : libpath.join(dest, fileName)
        if (fs.existsSync(destination) && !force)
            throw new ERROR(8006, destination);

        fs.copyFileSync(from, destination);
    }

    isisDirectory(path) {
        return fs.lstatSync(path).isDirectory();
    }

    isFile(path) {
        return fs.lstatSync(path).isFile();
    }

    /** 把內容都抹掉each 是 fileName, ex:index.js*/
    async cleanChildFiles(path, predicate = (each) => true, ...exclude) {
        if (fs.existsSync(path)) {
            const files = this.findFilePathBy(path, predicate, ...exclude);
            for (const file of files) {
                fs.truncate(file.absolute, 0, (result) => {
                    if (!_.isUndefined(result) && !_.isNull(result))
                        this.appendInfo(result)
                });
                this.appendInfo(`${file.absolute} 被清的乾乾淨淨！`);
            }
            await this.syncDelay(500);
            return files;
        }
        return false;
    }

    async syncWithExistPackage(path = '../') {
        /** 產生shell_script_腳本 */
        const paths = this.findFilePathBy(path, (each) => _.isEqual(each.fileNameExtension, 'package.json'), 'node_modules');
        for (let path of paths) {
            try {
                if (!_.isEqual(path.dirName, '..'))
                    this.insertShellCommand(configer.BASE_SHELL_SCRIPT,
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
        const packagejson = this.readFileInJSON('./template/sample.package.json');
        packagejson['name'] = packageName;
        this.writeFileInJSON(`${dirPath}/package.json`, packagejson);

        /** 4.要在 src/${index.js}, dir/index.js */
        this.persistByPath(`${dirPath}/src`);
        const classBase = String.format(this.getContextForRawFile(`./template/sample.src.index.js`), packageName, '明悅', new Date());
        fs.writeFileSync(`${dirPath}/src/index.js`, classBase);
        fs.copyFileSync(`./template/sample.index.js`, `${dirPath}/index.js`)

        /** 5 產生lib folder,並且產生 warning index.js */
        this.persistByPath(`${dirPath}/lib`);
        fs.writeFileSync(`${dirPath}/lib/index.js`, String.format(this.getContextForRawFile(`./template/sample.warning.index.js`), packageName));

        /** 6.要產生webstorm run case? */
        const ideaWorkspacePath = `${this.findSpecificFolderByPath(dirPath, '.idea')}/workspace.xml`;

        /** 7.要產生cd script 腳本 **/
        this.insertShellCommand(configer.BASE_SHELL_SCRIPT, `cd_${packageName}`, `cd ${libpath.resolve(dirPath)}`)

        if (fs.existsSync(ideaWorkspacePath)) {
            const workspace = this.getContextForRawFile(ideaWorkspacePath);
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

    appendInfo(data) {
        return this.appendLog(configer.PATH_INFO_LOG, data, false);
    }

    appendError(data) {
        return this.appendLog(configer.PATH_ERROR_LOG, data, true);
    }

    appendLog(path, data, isError = false, caller = '') {
        const log = `${isError ? `ERROR` : `LOG`} : ${caller} ${this.isJson(data) ? this.deepFlat(data) : data}`;
        isError ? console.error(log) : console.log(log);
        const persistlog = `${new Date()} ${log}`;
        this.appendFile(path, persistlog);
    }

    /** 如果file不存在,就會產生file,force_delete 可以強制刪除cache file*/
    appendFile(path, data, newLine = true, force_delete = false) {
        let options = err => {
            throw new ERROR(8001, err);
        };

        if (force_delete) this.syncDeleteFile(path);

        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, data, options);
        } else {
            fs.appendFileSync(path, `${newLine ? '\n' : ''}${data}`, options);
        }
    }

    singleFileTemplatify(path = './') {
        const all = this.findFilePathByExtension(path, ['js'], 'node_modules');
        for (const file of all) {
            const content = this.getContextForRawFile(file.absolute).trim();
            if (_.isEmpty(content)) {
                console.log(file.fileName, file.absolute);
                const className = _.isEqual(file.fileName, 'index') ? file.dirName : file.fileName;
                fs.writeFileSync(file.absolute, String.format(this.getContextForRawFile(`.
            /template/s
            ample.src.index.js`), className, '明悅', new Date()));
            }
        }
    }

    syncDeleteFile(path) {
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

    /** ../folderName/fileName.xxx  => ./folderName */
    getFolderPathOfSpecificPath(path) {
        const splited = path.split('/');
        splited.pop();
        return splited.join('/');
    }

    /** exclude 裡面可以放專案名稱, 例如 free_marker,question_update */
    async generatePackage(path = './', ...exclude) {
        let packagejsons = this.findFilePathByExtension(path, ['json'], 'node_modules');
        packagejsons = _.filter(packagejsons,
            (each) => _.isEqual(each.fileName, 'package') && this.has(this.getContextForRawFile(each.absolute), 'gen'));
        packagejsons = packagejsons.map((each) => this.getFolderPathOfSpecificPath(each.absolute));
        for (const path of packagejsons) {
            if (this.isAndEquals(... exclude.map((projectName) => () => !this.has(path, projectName)))) {
                await this.executeCommandLine(`
            cd ${path} && npm run gen`);
                this.appendInfo(`build ${path} succeed`);
            }
        }
    }

    insertShellCommand(shellPath = configer.BASE_SHELL_SCRIPT, alias, command) {
        if (this.isStringContainInLines(this.getContextForRawFile(shellPath), alias)) {
            throw new ERROR(8007, `alias ${alias} is exist`);
        } else {
            const line = `alias ${alias}='${command}'`
            this.appendFile(shellPath, line);
        }
    }

    getAdminCredential() {
        return JSON.parse(this.getContextForRawFile(
            '/Users/davidtu/cross-achieve/mimi/idea-inventer/firebaser/key/mimi19up-firebase-adminsdk.json'))
    }


    isEmptyFile(path) {
        return _.isEqual('', this.getContextForRawFile(path).trim())
    }


}

if (configer.DEBUG_MODE) {
}

export default NodeUtiller;
