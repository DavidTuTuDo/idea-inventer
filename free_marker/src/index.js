import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import fs from 'fs';
import libpath from 'path';
import mustache from 'mustache';


/** author:明悅
 *  create time:Wed Mar 17 2021 13:17:01 GMT+0800 (Taipei Standard Time)
 */

const SIGN_OF_FUNCTION_START = `\/** -------------------- functions -------------------- **\/`;
const SIGN_OF_FIELD_START = `\/** -------------------- fields -------------------- **\/`;
const SIGN_OF_RESTFUL_API_START = `\/** -------------------- async api -------------------- **\/`;
const SIGN_OF_JSX_CONTENT = `<!-- jsx content -->`;


class CodegenNode {

    node;
    struct;
    path;
    name;
    view;
    type;
    style;
    extra;
    children;
    plural;
    title;
    url;
    parent;

    constructor(node) {
        this.node = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
    }

    hasTitle() {
        return (!_.isUndefined(this.title));
    }

    pure() {
        return this.node;
    }

    hasChildren() {
        return (_.isArray(this.children) && this.children.length > 0);
    }

    getChildren() {
        return _.isArray(this.children) ? this.children : [];
    }

    hasParent() {
        return this.parent !== undefined;
    }

    /** 會一直往上找parent 直到符合predicate,不然就回傳 undefined */
    getParentBy(predicate = (parent) => (true)) {
        let currentNode = parent;
        while (!!currentNode) {
            if (predicate(currentNode)) {
                return currentNode;
            }
            currentNode = currentNode.parent;
        }
        return undefined;
    }

    /** 為了組合出 uniq 的 view className */
    getParentNames() {
        const names = [];
        let currentNode = this.parent;
        while (!!currentNode) {
            /** 如果到達 struct 層級, 就停止了 */
            if (currentNode.struct)
                break;

            if (currentNode.name)
                names.push(currentNode.name)

            currentNode = currentNode.parent;
        }
        return _.reverse(names);
    }


    isArray() {
        return (this.type === 'array');
    }

    isArrayOrObject() {
        return this.isArray() || this.isObject()
    }

    isRootPath() {
        return this.path && _.isEqual(this.path, '/')
    }

    getClassName() {
        return _.upperFirst(this.name);
    }

    hasURL() {
        return !_.isEmpty(this.url);
    }

    isObject() {
        return (this.type === 'object');
    }

    getDefaultValueByType() {
        if (this.type === 'string') {
            return `''`;
        }

        if (this.type === 'array') {
            return `[]`;
        }

        if (this.type === 'object') {
            return `new ${_.upperFirst(this.name)}()`;
        }

        if (this.type === 'number') {
            return `-1`;
        }
    }

    getFunctionName() {
        return `get${_.upperFirst(this.name)}${this.plural ? this.plural : ''}`;
    }

    getArrayJSXFunctionName() {
        return Util.camel('render', this.name, 'view');
    }

    static enrich(node) {
        let involution = new CodegenNode(node);
        if (_.isArray(node)) {
            involution = [];
            for (const child of node) {
                child.parent = node;
                involution.push(this.enrich(child));
            }
        } else if (_.isObject(node)) {
            for (const key in node) {
                /** style ,extra 是個例外, 要排除掉*/
                if (Util.isOrEquals(key, 'style', 'extra', 'firebase', 'parent'))
                    involution[key] = node[key];
                else if (_.isObject(node[key]) || _.isArray(node[key])) {
                    const obj = node[key];
                    obj.parent = node;
                    involution[key] = this.enrich(obj);
                }

            }
        }
        return involution;
    }

}

class ClassGenerator {

    hasConstructor = false;
    hasExtends = false
    filePath = ``;
    classes = [];
    isSingletonFile = false;
    signature = true;

    constructor(path) {
        this.filePath = path;
        this.classes = [];

        if (!fs.existsSync(this.filePath)) {
            Util.persistByPath(path)
        }
        this.context = Util.getContextForRawFile(this.filePath).split('\n');
    }

    appendField(fieldName, defaultValue, macros = []) {
        const stmt = [];
        for (const m of macros) {
            stmt.push(`\n`);
            stmt.push(`@${m}`);
        }
        stmt.push(`\n`);
        stmt.push(`${fieldName} = ${defaultValue};`);
        stmt.push(`\n`);
        Util.insertToArray(this.context, this.getIndexOfFieldSign(), ...stmt);
    }

    appendSeparator(sep) {
        const stmt = [];
        stmt.push('\n');
        stmt.push(sep);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmt);
    }

    /**
     *
     * @param functionName
     * @param params, string[]
     * @param macros, string[]
     * @param contents, triple dot
     *
     */
    appendFunction(functionName, params = [], macros = [], ...contents) {
        /** 應該要檢查file 沒有class的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push(`\n`);
        for (const m of macros) {
            stmt.push(`\n`);
            stmt.push(`@${m}`);
        }
        stmt.push(`\n`);
        stmt.push(`${functionName}(${_.isEmpty(params) ? '' : params.join(' ,')}) {`);
        for (let content of contents) {
            stmt.push(`\n`);
            stmt.push(`${content}`);
        }
        stmt.push(`\n`);
        stmt.push(`}`);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmt)
    }


    appendConstructor(...stmt) {
        this.hasConstructor = true;
        this.appendFunction('constructor', ['props'],
            [], this.hasExtends ? 'super(props)' : '', ...stmt);
    }

    getIndexOf(stmt) {
        return _.findIndex(this.context, (per) => {
            return _.isEqual(per, stmt);
        });
    }

    /** extendz:{name,from}*/
    appendClass(className, extendz, ...macros) {
        /** 應該要檢查file is not empty 的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push('\n');
        stmt.push('\n');
        for (const macro of macros) {
            stmt.push('\n');
            stmt.push(`@${macro}`);
        }
        stmt.push('\n');
        if (_.isObject(extendz)) {
            this.appendImport(extendz.name, extendz.from);
            stmt.push(`class ${className}${extendz ? ` extends ${extendz.name}` : ' '} {`);
        } else {
            stmt.push(`class ${className}${extendz ? ` extends ${extendz}` : ' '} {`);
        }

        stmt.push(`\n`);
        stmt.push(SIGN_OF_FIELD_START);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_FUNCTION_START);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_RESTFUL_API_START);
        stmt.push(`\n`);
        stmt.push(`}`);
        stmt.push(`\n`);

        this.context.push(...stmt);
        this.classes.push(className);
        this.hasExtends = !!extendz;
    }

    hasClass() {
        return _.size(this.classes) >= 1;
    }

    async persist() {
        const stmts = [];
        if (_.size(this.classes) === 1) {
            if (this.isSingletonFile) {
                stmts.push(`export default new ${this.classes.pop()}()`);
            } else {
                stmts.push(`export default ${this.classes.pop()}`);
            }

        } else if (_.size(this.classes) > 1) {
            stmts.push(`export { ${this.classes.map((clazz => `${clazz} as ${clazz}`)).join(',')}}`);
        }

        if (!this.hasConstructor && this.hasClass()) {
            this.appendConstructor();
        }

        this.appendInClassTail(stmts);
        if (this.signature)
            this.appendInClassHead(`/** this code are generated, modify is no sense. \n\tauthor:David Tu, \n\temail:freshingmoon0725@gmail.com \n\tupdateTime:${Util.getCurrentTimeFormat()} \n*/`, false);

        Util.appendFile(this.filePath, _.join(this.context, ''), true, true);
        await Util.executeCommandLine(`cd ${libpath.resolve('.')} &&  npx prettier --write ${libpath.resolve(this.filePath)}`)
    }

    /** import `${parts}` from `${from}`*/
    appendImport(parts, from) {
        this.appendInClassHead(`import ${parts} from '${from}'`);
    }

    appendInClassHead(stmt, needSemicolon = true) {
        const stmts = [];
        stmts.push(`${stmt}${needSemicolon ? ';' : ''}`);
        stmts.push('\n');
        Util.insertToArray(this.context, 0, ...stmts);
    }

    appendInClassTail(stmt) {
        const stmts = [];
        stmts.push(stmt);
        stmts.push('\n');
        this.context.push(...stmts);
    }

    getClasses() {
        return this.classes;
    }

    /** this is not allow to growing */
    getIndexOfRestfulApiSign() {
        return this.getIndexOf(SIGN_OF_RESTFUL_API_START);
    }

    getIndexOfFunctionSign() {
        return this.getIndexOf(SIGN_OF_FUNCTION_START);
    }

    getIndexOfFieldSign() {
        return this.getIndexOf(SIGN_OF_FIELD_START);
    }

    insertBatchLinesIntoFunctionSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...lines);
    }

    insertBatchLinesIntoRestfulApiSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfRestfulApiSign(), ...lines);
    }

    insertBatchLinesIntoFieldSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfFieldSign(), ...lines);
    }

    insertBatchLines(lines) {
        Util.insertToArray(this.context, 0, ...lines);
    }


    setSingleton(singleton = true) {
        this.isSingletonFile = singleton;
    }

    needSignature(need) {
        this.signature = need;
    }
}

class BaseBuilder {

    defaultPath;
    /** 例如 component builder 的 defaultPath => /{genRootPath}/src/component */
    rootPath;
    /** 很多時候要放在根目錄, 所以就在建構句 把它保留起來 */
    classBuilder;

    constructor(defaultPath = './gen') {
        this.rootPath = defaultPath;
        this.defaultPath = defaultPath;
    }

    appendMustacheFile(templateFileName, destFileName, param = {}) {
        Util.appendFile(
            libpath.resolve(destFileName),
            this.getStringFromMustache(templateFileName, param),
            true,
            true);
    }

    setDefaultPath(path) {
        this.defaultPath = path;
    }

    appendDefaultPath(...path) {
        this.defaultPath = libpath.join(this.defaultPath, ...path);
    }

    getStringFromMustache(templateFileName, variable) {
        return mustache.render(Util.getContextForRawFile(`./template/${templateFileName}`), this.getMustacheRenderValues(variable));
    }

    getMustacheRenderValues = ({
                                   fieldName,
                                   defaultValue,
                                   fieldUrl,
                                   functionName,
                                   className,
                                   projectName,
                                   projectVersion,
                                   projectDescription,
                                   fieldClass,
                               }) => {
        return {
            fieldName: _.lowerFirst(fieldName),
            functionName: functionName ? functionName : _.upperFirst(fieldName),
            defaultValue,
            fieldUrl,
            className,
            projectName,
            projectVersion,
            projectDescription,
            fieldClass,
        }
    }

    /** 找到目錄下的folder,是這用來gen stores的 index file,有點偷懶, 應該要從source去組合出來 */
    getGenUnion(...folder) {
        let path = libpath.join(this.rootPath, 'src', ...folder)

        return _.filter(Util.getChildPathByPath(path),
            each => each.isDirectory).map(each => each.dirName);
    }

    getGenStores() {
        return this.getGenUnion(`store`);
    }

    getGenComponent() {
        return this.getGenUnion(`component`);
    }
}

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super(props);
        this.classBuilder =
            this.appendDefaultPath('src', 'store');
    }

    getFunctionsDependOnFieldType({fieldName, type, defaultValue, fieldClass}) {
        const functions = this.getStringFromMustache(`store_${type}.js`, {
            fieldName,
            defaultValue,
            fieldClass
        })
        return functions;
    }

    getFunctionsOfRemoteApi({fieldName, type, fieldUrl}) {
        const functions = this.getStringFromMustache(`http_restful.js`, {
            fieldName,
            fieldUrl,
        })
        return functions;
    }

    async buildIndexFiles() {
        /** 產生 store的index file */
        const stores = this.getGenStores();
        this.base = Util.persistByPath(libpath.join(this.defaultPath, `store.js`));

        const baseGenerator = new ClassGenerator(this.base);
        baseGenerator.appendClass(`BaseStore`);
        for (const store of stores) {
            baseGenerator.appendImport(_.upperFirst(store), `./${store}`);
        }
        baseGenerator.appendConstructor(...stores.map(child => `this.${child} = new ${_.upperFirst(child)}()`))
        await baseGenerator.persist();

        const indexGenerator = new ClassGenerator(libpath.join(this.defaultPath, `index.js`));
        indexGenerator.appendClass(`Store`, {name: `BaseStore`, from: './store'});
        indexGenerator.appendConstructor();
        await indexGenerator.persist();
    }

    async buildBaseStore(node) {

        const folderName = _.toLower(node.name);
        const baseClassName = 'Base' + _.upperFirst(folderName) + 'Store';
        const indexClassName = _.upperFirst(folderName) + 'Store';
        const baseGenerator = new ClassGenerator(libpath.join(this.defaultPath, folderName, `${baseClassName}.js`));
        const indexGenerator = new ClassGenerator(libpath.join(this.defaultPath, folderName, `index.js`))

        baseGenerator.appendClass(baseClassName, {name: `BaseStore`, from: '../../base/BaseStore'});
        baseGenerator.appendInClassHead(`import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction} from "mobx"`)
        baseGenerator.appendInClassHead(`import {utiller as Util, exceptioner as ERROR} from 'utiller'`);

        const propsStmt = [];
        if (node.hasChildren()) {

            for (const child of node.getChildren()) {
                const propStmt = [];
                const fieldName = child.name + (child.plural ? child.plural : '');
                const defaultValue = child.getDefaultValueByType();
                baseGenerator.appendField(fieldName, defaultValue, ['observable']);
                baseGenerator.insertBatchLinesIntoFunctionSection(
                    this.getFunctionsDependOnFieldType(
                        {
                            fieldName: _.upperFirst(fieldName),
                            type: child.type,
                            defaultValue,
                            fieldClass: child.getClassName(),
                        }));
                propStmt.push(`if(obj && obj.${fieldName})`);
                if (child.isArray()) {
                    propStmt.push(`this.${fieldName}.push(...obj.${fieldName}.map(each => new ${_.upperFirst(child.name)}(each)))`);
                    baseGenerator.appendInClassHead(`import ${_.upperFirst(child.name)} from '../${child.name}'`)
                    await this.buildBaseStore(child)
                } else if (child.isObject()) {
                    baseGenerator.appendInClassHead(`import ${_.upperFirst(child.name)} from '../${child.name}'`)
                    propStmt.push(`this.${fieldName} = new ${_.upperFirst(child.name)}(obj.${fieldName})`);
                    await this.buildBaseStore(child)
                } else {
                    propStmt.push(`this.${fieldName} = obj.${fieldName}`);
                }
                propsStmt.push(...propStmt);
            }

        }
        if (node.hasURL()) {
            baseGenerator.insertBatchLinesIntoRestfulApiSection(this.getFunctionsOfRemoteApi({
                    fieldName: node.name,
                    type: node.type,
                    fieldUrl: node.url
                })
            );
        }
        baseGenerator.appendFunction(`initial`, ['obj'], [], ...propsStmt);
        baseGenerator.appendConstructor(`makeObservable(this)`, `if(props !== undefined) this.initial(props)`);
        await baseGenerator.persist();

        indexGenerator.appendClass(`${indexClassName}`, {name: baseClassName, from: `./${baseClassName}`});
        await indexGenerator.persist();

    }
}


class ComponentBuilder extends BaseBuilder {

    hasRenderFunction = false;
    classNames = [];
    componentDidMountStmt = [];

    constructor(props) {
        super(props);
        this.appendDefaultPath('src', 'component');
    }

    appendStmtIntoComponentDidMount(...stmt) {
        this.componentDidMountStmt.push(...stmt);
    }

    async buildBaseComponent(node) {
        const baseClassName = `Base${_.upperFirst(node.name)}Component`;
        const className = `${_.upperFirst(node.name)}Component`;
        const folderName = node.name;

        const baseGenerator = new ClassGenerator(libpath.join(this.defaultPath, folderName, `${baseClassName}.js`));
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */

        baseGenerator.appendClass(baseClassName, {
            name: 'BaseComponent',
            from: '../../base/BaseComponent'
        });
        baseGenerator.appendInClassHead(`import React from 'react'`)
        baseGenerator.appendInClassHead(`import {Paper, Button, Typography, Card} from '@material-ui/core'`);
        baseGenerator.appendInClassHead(`import '../app.css'`);
        this.appendRenderViewFunctions(node.struct, baseGenerator);

        if (node.hasTitle()) {
            baseGenerator.appendField(`stringOfPageTitle`, `"${node.title}"`)
            this.appendStmtIntoComponentDidMount(`document.title = this.stringOfPageTitle`);
        }

        baseGenerator.appendFunction('componentDidMount',
            [], [], `super.componentDidMount()`, ...this.componentDidMountStmt);

        /** index.js */
        const indexGenerator = new ClassGenerator(libpath.join(this.defaultPath, folderName, `index.js`));
        indexGenerator.appendClass(className, {
            name: baseClassName,
            from: `./${baseClassName}`
        }, `inject('${node.name}')`, `observer`);
        indexGenerator.appendImport(`{observer, inject}`, `mobx-react`);


        await indexGenerator.persist();
        await baseGenerator.persist();
        return this.classNames;
    }

    /**
     * {
     *      tag:'tag',
     *      props:{...name:object},
     *      contents:['cotent1','content2']
     *      children: ['ccc'],
     * }
     *
     * ////////////// sample: ///////////////
     praam :{
            tag: node.view,
            props: { style: {height: 80},className:'className' }, ### means not single quatation
            contents: [`console.log()`,`console.error()`],
            children:['children']
        }

     * output:
     <Paper
     {...children}
     style={{ height: 80 }}
     className={"className"} >
     {console.log()}
     {console.error()}
     </Paper>
     */

    getJSXStrings(param) {
        function normalize(value) {
            if (_.isString(value) && _.startsWith(value, `###`)) {
                return `{${Util.getStringOfDropHeadSign(value, `#`)}}`;
            }

            if (_.isBoolean(value)) {
                return `{${_.toString(value)}}`;
            }
            return `{${JSON.stringify(value)}}`;
        }

        const props = param.props;
        const contents = param.contents ? param.contents : [];
        const children = param.children ? param.children : [];

        const stmt = [];
        stmt.push(`<${param.tag}`);
        stmt.push('\n');

        for (const child of children) {
            stmt.push(`{...${child}}`);
            stmt.push('\n');
        }

        for (const propName in props) {
            stmt.push(`${propName}=${normalize(props[propName])}\n`);
            if (_.isEqual(propName, 'className')) {
                this.storesClassName(props[propName]);
            }
        }

        stmt.push(`>`);
        stmt.push('\n');

        for (const content of contents) {
            stmt.push(`${content}`);
            stmt.push('\n');
        }

        stmt.push(SIGN_OF_JSX_CONTENT);
        stmt.push('\n\n');
        stmt.push(`</${param.tag}>`);
        stmt.push('\n\n');
        return stmt;
    }

    /** classNames is memory value */
    storesClassName(name) {
        this.classNames.push(name);
    }

    getJSXStringsByNode(node, ...contents) {
        const keyValue = node.getChildren().map(each => `\$\{${node.name}.${each.name}\}`).join('');
        const parentName = Util.camel(...node.getParentNames(), node.name, node.view);
        const className = _.upperFirst(parentName);

        const props = {
            className,
            style: node.style
        };

        if (!_.isEmpty(keyValue)) {
            props.key = '###' + '`' + keyValue + '`';
        }

        const origin = this.getJSXStrings({
            tag: node.view,
            props,
            contents: [...contents],
        });

        if (node.wrap) {
            props.className = `${className}WrapDiv`;
            if (!_.isEmpty(keyValue))
                props.key = '###' + '`' + keyValue + 'Wrap' + '`';
            delete props.style;
            return this.getJSXStrings({
                tag: 'div',
                props,
                contents: [...origin],
            })
        }
        return origin;
    }

    getJSXStringsByStruct(node, builder) {
        const childstmt = [];

        for (const child of node.getChildren()) {
            const functionName =
                `get${_.upperFirst(node.name)}${_.upperFirst(child.name)}${child.plural ? child.plural : ''}`;

            if (child.isArray()) {
                childstmt.push(`\n{this.${functionName}(${node.name})
                .map((each) => this.${child.getArrayJSXFunctionName()}(each))}\n`);

                builder.appendFunction(functionName, [`${node.name}`], [],
                    `return ${node.name}.${child.getFunctionName()}()`);

            } else if (child.isObject()) {
                childstmt.push(`\n{this.${child.getArrayJSXFunctionName()}(this.${functionName}(${node.name}))}\n`);

                builder.appendFunction(functionName, [`${node.name}`], [],
                    `return ${node.name}.${child.getFunctionName()}()`);
            } else {
                childstmt.push(...this.getJSXStringsByNode(child,
                    `{this.${functionName}(${_.lowerCase(node.name)})}`));

                builder.appendFunction(functionName, [`${node.name}`], [],
                    `return ${node.name}.${child.getFunctionName()}()`);
            }
        }
        return this.getJSXStringsByNode(node, ...childstmt);
    }

    removeJSXSign(stmt) {
        _.remove(stmt, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
    }

    appendRenderViewFunctions(node, builder) {

        function normalize(...strings) {
            const self = strings;
            _.remove(self, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
            return `return ( ${self.join('')})`;
        }

        if (!this.hasRenderFunction) {
            builder.appendFunction('render', [], [],
                `const ${_.lowerCase(node.name)} = this.props.${_.lowerCase(node.name)};\n\n`,
                normalize(...this.getJSXStringsByStruct(node, builder)));
            this.hasRenderFunction = true;
        }

        for (const child of node.getChildren()) {
            if (child.isArrayOrObject()) {
                builder.appendFunction(child.getArrayJSXFunctionName(), [`${_.lowerCase(child.name)}`], [],
                    normalize(...this.getJSXStringsByStruct(child, builder)));
                this.appendRenderViewFunctions(child, builder);
            }
        }
    }

    getComponentClassBody(className) {
        return mustache.render(Util.getContextForRawFile('./template/component.js'), this.getMustacheRenderValues({className}))
    }
}

class AppBuilder
    extends ComponentBuilder {

    constructor(props) {
        super(props);
        /** 印為繼承component */
        this.appendDefaultPath('../');
    }

    async buildWebpackNPackageJson(obj) {
        this.appendMustacheFile('package.json', libpath.join(this.rootPath, `package.json`), {
            projectName: obj.name,
            projectVersion: obj.version,
            projectDescription: obj.description
        });
        this.appendMustacheFile('webpack.config.js', libpath.join(this.rootPath, `webpack.config.js`));
        this.appendMustacheFile('babel.config.js', libpath.join(this.rootPath, `babel.config.js`));
    }

    async buildHtmlIndexFile() {
        const path = Util.persistByPath(libpath.join(this.rootPath, 'dist'));
        this.appendMustacheFile('index.html', libpath.join(path, 'index.html'));
    }

    async buildConfig(node) {
        const baseConfigGenerator = new ClassGenerator(libpath.join(this.defaultPath, `config`, `BaseConfig.js`));
        baseConfigGenerator.appendClass(`BaseConfig`);
        baseConfigGenerator.appendField(`firebase`, JSON.stringify(node.firebase));
        await baseConfigGenerator.persist();

        const indexConfigGenerator = new ClassGenerator(libpath.join(this.defaultPath, `config`, `index.js`));
        indexConfigGenerator.appendClass(`Config`, {name: `BaseConfig`, from: './BaseConfig'});
        indexConfigGenerator.setSingleton(true);
        await indexConfigGenerator.persist();
    }

    async buildAppIndexFiles(obj) {
        const appGenerator = new ClassGenerator(libpath.join(this.defaultPath, `app.js`));
        const indexGenerator = new ClassGenerator(libpath.join(this.defaultPath, `index.js`));
        appGenerator.appendImport(`{Provider}`, `mobx-react`);
        appGenerator.appendImport(` ReactDOM`, `react-dom`);
        appGenerator.appendImport(`{Route, Router, Switch}`, `react-router-dom`);
        appGenerator.appendImport(`{RouterStore, syncHistoryWithStore}`, `mobx-react-router`);
        appGenerator.appendImport(`{createBrowserHistory}`, `history`);
        appGenerator.appendImport(`React`, `react`);
        appGenerator.appendImport(`Store`, `./store`);

        appGenerator.appendClass(`BaseApp`);
        appGenerator.appendFunction(`mount`, [], [],
            `ReactDOM.render(this.getRenderView(),
                    document.getElementById('app'))`);
        appGenerator.appendField(`store`, `new Store()`);
        appGenerator.appendField(`history`, `syncHistoryWithStore(createBrowserHistory(), new RouterStore())`);

        for (const component of this.getGenComponent()) {
            appGenerator.appendInClassHead(`import ${_.upperFirst(component)} from './component/${component}'`);
        }

        const childrenStmt = [];
        for (const component of obj.components) {
            const renderStmts = this.getJSXStrings({
                    tag: _.upperFirst(component.name),
                    props: {...component.extra},
                    children: ['props'],
                }
            );
            this.removeJSXSign(renderStmts);


            childrenStmt.push(...this.getJSXStrings({
                tag: `Route`,
                props: {
                    exact: component.isRootPath() ? true : undefined,
                    path: component.path,
                    render: `###(props) =>
                     ${renderStmts.join('')}`,
                    /** component: `###${_.upperFirst(component.name)}`, */
                },
            }))
        }
        const switchStmt = this.getJSXStrings({
            tag: 'Switch',
            contents: [...childrenStmt]
        });

        const routerStmt = this.getJSXStrings({
            tag: 'Router',
            props: {history: `###this.history`},
            contents: [...switchStmt]
        })

        const providerStmt = this.getJSXStrings({
            tag: 'Provider',
            props: {
                ...Util.array2Obj(
                    this.getGenStores().map(store => {
                            const obj = {};
                            obj[`${store}`] = `###this.store.${store}`
                            return obj;
                        }
                    )
                )
            },
            contents: [...routerStmt]
        })

        const whole = providerStmt;
        this.removeJSXSign(whole);
        appGenerator.appendFunction(`getRenderView`, [], [], `return (${whole.join('')})`)
        indexGenerator.appendClass(`App`, {name: `BaseApp`, from: `./app`});
        indexGenerator.appendInClassTail(`new App().mount()`);
        indexGenerator.appendInClassTail(`module.hot.accept()`);
        await indexGenerator.persist();
        await appGenerator.persist();
    }

    async buildBaseClasses() {
        Util.copyFromFolderToDestFolder('./base', libpath.join(this.defaultPath, `base`));
    }

    /** {[...{component,names}], stubPath} */
    async buildCSSFile(classNames, stubPath) {
        /** 先把舊的整理過, 除掉 comment的字樣line */
        const origins = [];
        if (fs.existsSync(stubPath)) {
            const stub = Util.getContextForRawFile(stubPath).split('\n');
            _.remove(stub,
                (each) => (_.startsWith(each, '/** ') ||
                    _.isEqual(each.trim(), '')))
            origins.push(...(stub.join('').split('}')))
            /** 移除掉最後一個,因為split */
            origins.pop();
        }

        const generator = new ClassGenerator(libpath.join(this.defaultPath, 'component', `app.css`));
        for (const className of classNames) {
            generator.appendInClassTail(`/** => ${className.component.name} component used <= */\n\n`);
            for (const name of className.names) {
                /** 注意!! 是用 remove,會mutate 原本的 array */
                const origin = _.remove(origins, (each) => _.startsWith(each, `.${name} {`))

                if (origin.length > 1)
                    throw new ERROR(7003, `origin ==> ${Util.deepFlat(origin)}`)

                generator.appendInClassTail(_.isEmpty(origin) ? `.${name} { /** style */ }\n\n` : `${origin[0]}}\n\n`);
            }
        }

        if (origins.length > 0) {
            generator.appendInClassTail(`/** ======== not used ========= */\n\n`);
            for (const lasting of origins) {
                generator.appendInClassTail(`${lasting} }\n\n`);
            }
        }


        generator.needSignature(false);
        await generator.persist();
    }
}

class ProjectIndexFilePersistHandler {

    genRootPath;
    genSrcPath;

    sourcePath;
    sourceSrcPath;

    constructor(props) {
        this.sourcePath = props.sourcePath;
        this.sourceSrcPath = libpath.join(this.sourcePath, 'src');
        this.genRootPath = props.genRootPath;
        this.genSrcPath = libpath.join(this.genRootPath, 'src');

    }

    persistBaseFiles() {
        try {
            for (const file of Util.findFilePathBy(`../gen/src/base`)) {
                if (Util.isEmptyFile(file.absolute)) {
                    Util.appendInfo(`${file.absolute} is empty file, do not copy`)
                    return false;
                }

            }

            Util.copyFromFolderToDestFolder(
                `../gen/src/base`,
                `./base`
            )
            console.log(`persist base files succeed`);
            return false;
        } catch (error) {
            /** 偷懶 hack */
            console.error(error);
        }

    }

    keepIndexFiles(...exclude) {
        const files = Util.findFilePathBy(this.genSrcPath,
            (each) => {
                return Util.isOrEquals(each.fileNameExtension, `index.js`, `app.css`)
            },
            'node_modules')

        for (const file of files) {
            if (_.isEqual('', Util.getContextForRawFile(file.path).trim())) {
                Util.appendInfo(`path ${file.path} is empty file, file would not persist`);
                return
            }
            if (Util.has(exclude, file.fileNameExtension)) continue;
            const from = file.absolute;
            const dest = libpath.join(this.sourceSrcPath, from.split(`src`).pop());
            Util.persistByPath(dest);
            Util.copySingleFile(from, dest, '', true);
            console.log(`persist ${from} succeed`);
        }
    }

    overrideIndexFiles(...exclude) {
        for (const file of Util.findFilePathBy(this.sourceSrcPath)) {
            if (Util.has(exclude, file.fileNameExtension)) continue;

            const from = file.absolute;
            const dest = libpath.join(this.genSrcPath, from.split(`src`).pop());
            Util.copySingleFile(from, dest, '', true);
        }

    }


}

export {
    ClassGenerator as ClassGenerator
}

if (configer.DEBUG_MODE) {
    (async () => {

            const genRootPath = `./../gen`;
            const sourcePath = './src/exam';


            new ProjectIndexFilePersistHandler({genRootPath, sourcePath}).keepIndexFiles()
            new ProjectIndexFilePersistHandler({genRootPath, sourcePath}).persistBaseFiles();

            const source = CodegenNode.enrich(require(libpath.resolve(libpath.join(sourcePath, `source.js`))).default);
            await Util.cleanChildFiles(genRootPath, (each) => true, 'node_modules');
            const totalClassNames = [];
            for (let component of source.components) {
                await new StoreBuilder(genRootPath).buildBaseStore(component.struct);
                const names = await new ComponentBuilder(genRootPath).buildBaseComponent(component);
                totalClassNames.push({component, names});
            }

            /** 因為 用到 method getGenStores(),stores 要等 gen出來才知道, 必須放在這邊 */
            await new StoreBuilder(genRootPath).buildIndexFiles();
            await new AppBuilder(genRootPath).buildAppIndexFiles(source);
            await new AppBuilder(genRootPath).buildHtmlIndexFile();
            await new AppBuilder(genRootPath).buildConfig(source);
            await new AppBuilder(genRootPath).buildWebpackNPackageJson(source);
            await new AppBuilder(genRootPath).buildBaseClasses();
            await new AppBuilder(genRootPath).buildCSSFile(totalClassNames, libpath.join(sourcePath, 'src', 'style', 'app.css'));

            new ProjectIndexFilePersistHandler({genRootPath, sourcePath}).overrideIndexFiles(`app.css`);

            if (!fs.existsSync(libpath.join(genRootPath, `node_modules`)))
                await Util.executeCommandLine(`cd ${genRootPath} && npm install`);
        }
    )();
}
