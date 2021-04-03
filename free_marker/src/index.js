import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import fs from 'fs';
import libpath from 'path';
import Moment from 'moment';
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
    children;
    plural;
    url;

    constructor(node) {
        this.node = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
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


    isArray() {
        return (this.type === 'array');
    }

    isArrayOrObject() {
        return this.isArray() || this.isObject()
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

        if (this.type === 'number') {
            return `-1`;
        }
    }

    getArrayJSXFunctionName() {
        return Util.camel('render', this.name + this.plural, 'view');
    }

    static enrich(node) {
        let involution = new CodegenNode(node);
        if (_.isArray(node)) {
            involution = [];
            for (const child of node) {
                involution.push(this.enrich(child));
            }
        } else if (_.isObject(node)) {
            for (const key in node) {
                /** style 是個例外, 要排除掉*/
                if (_.isEqual(key, 'style'))
                    involution[key] = node[key];
                else if (_.isObject(node[key]) || _.isArray(node[key]))
                    involution[key] = this.enrich(node[key]);
            }
        }
        return involution;
    }

}

class ClassGenerator {

    constructor(path) {
        this.filePath = path;
        this.classes = [];
        if (!fs.existsSync(this.filePath)) {
            Util.persistByPath(path)
        }
        this.context = Util.getContextForRawFile(this.filePath).split('\n');
    }

    appendField(fieldName, defaultValue, macro = []) {
        const stmt = [];
        for (const m of macro) {
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
     * @param param, string[]
     * @param macro, string[]
     * @param contents, triple dot
     */
    appendFunction(functionName, param = [], macro = [], ...contents) {
        /** 應該要檢查file 沒有class的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push(`\n`);
        for (const m of macro) {
            stmt.push(`\n`);
            stmt.push(`@${m}`);
        }
        stmt.push(`\n`);
        stmt.push(`${functionName}(${_.isEmpty(param) ? '' : param.join(' ,')}) {`);
        for (let content of contents) {
            stmt.push(`\n`);
            stmt.push(`${content};`);
        }
        stmt.push(`\n`);
        stmt.push(`}`);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmt)
    }

    getIndexOf(stmt) {
        return _.findIndex(this.context, (per) => {
            return _.isEqual(per, stmt);
        });
    }

    appendClass(className, extend, ...macros) {
        /** 應該要檢查file is not empty 的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push('\n');
        stmt.push('\n');
        stmt.push('\n');
        for (const macro of macros) {
            stmt.push('\n');
            stmt.push(`@${macro}`);
        }
        stmt.push(`class ${className}${extend ? ` extends ${extend}` : ' '} {`);
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
    }

    async persist() {
        const stmts = [];
        if (_.size(this.classes) === 1) {
            stmts.push(`export default ${this.classes.pop()}`);
        } else if (_.size(this.classes) > 1) {
            stmts.push(`export { ${this.classes.map((clazz => `${clazz} as ${clazz}`)).join(',')}}`);
        }
        this.appendInClassTail(stmts);
        this.appendInClassHead(`/** this code are generated, modify is no sense. \n\tauthor:David Tu, \n\temail:freshingmoon0725@gmail.com \n\tupdateTime:${Util.getCurrentTimeFormat()} \n*/`, false);

        Util.appendFile(this.filePath, _.join(this.context, ''), true, true);
        await Util.executeCommandLine(`cd ${libpath.resolve('.')} &&  npx prettier --write ${libpath.resolve(this.filePath)}`)
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


}

class BaseBuilder {

    constructor(defaultPath = './gen') {
        this.defaultPath = defaultPath;
    }

    setDefaultPath(path) {
        this.defaultPath = path;
    }

    appendDefaultPath(path) {
        this.defaultPath = libpath.join(this.defaultPath, path);
    }

    getFunctionsFromMustache(templateFileName, variable) {
        return mustache.render(Util.getContextForRawFile(`./template/${templateFileName}`), this.getMustacheRenderValues(variable));
    }

    getMustacheRenderValues = ({fieldName, defaultValue, fieldUrl, functionName, className}) => {
        return {
            fieldName: _.toLower(fieldName),
            functionName: functionName ? functionName : _.upperFirst(fieldName),
            defaultValue,
            fieldUrl,
            className,
        }
    }


}

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super(props);
        this.classBuilder =
            this.appendDefaultPath('store');
    }

    getFunctionsDependOnFieldType(fieldName, type, defaultValue) {
        const functions = this.getFunctionsFromMustache(`store_${type}.js`, {
            fieldName,
            defaultValue
        })
        return functions;
    }

    getFunctionsOfRemoteApi(fieldName, type, fieldUrl) {
        const functions = this.getFunctionsFromMustache(`http_restful_${type}.js`, {
            fieldName,
            fieldUrl
        })
        return functions;
    }

    async buildBaseStore(node) {

        const folderName = _.toLower(node.name);
        const baseClassName = _.upperFirst(folderName) + 'BaseStore';
        const indexClassName = _.upperFirst(folderName) + 'Store';
        const pathBase = Util.persistByPath(libpath.join(this.defaultPath, folderName, `${baseClassName}.js`));
        const pathIndex = Util.persistByPath(libpath.join(this.defaultPath, folderName, `index.js`));
        const baseGenerator = new ClassGenerator(pathBase);
        const indexGenerator = new ClassGenerator(pathIndex)

        baseGenerator.appendClass(baseClassName, 'BaseStore');
        baseGenerator.appendFunction('constructor', ['props'], [], 'super(props)', 'makeAutoObservable(this)');
        baseGenerator.appendInClassHead(`import {makeAutoObservable, action, observable, comparer, computed, autorun, runInAction} from "mobx"`)
        baseGenerator.appendInClassHead(`import {utiller as Util, exceptioner as ERROR} from 'utiller'`);
        baseGenerator.appendInClassHead(`import BaseStore from '../base/BaseStore'`)

        if (node.hasChildren()) {
            for (const child of node.children) {
                const fieldName = child.name + (child.plural ? child.plural : '');
                const defaultValue = child.getDefaultValueByType();
                baseGenerator.appendField(fieldName, defaultValue);
                baseGenerator.insertBatchLinesIntoFunctionSection(this.getFunctionsDependOnFieldType(_.upperFirst(fieldName), child.type, defaultValue));
                if (child.url) {
                    baseGenerator.insertBatchLinesIntoRestfulApiSection(this.getFunctionsOfRemoteApi(fieldName, child.type, child.url));
                }

                if (child.type === 'array' || child.type === 'object') {
                    baseGenerator.appendInClassHead(`import ${_.upperFirst(child.name)} from '../${child.name}'`)
                    await this.buildBaseStore(child)
                }
            }
        }
        indexGenerator.appendClass(`${indexClassName}`, `${baseClassName}`);
        indexGenerator.appendFunction('constructor', ['prop'], [], 'super(prop)')
        indexGenerator.appendInClassHead(`import ${baseClassName} from './${baseClassName}'`);
        await indexGenerator.persist();
        await baseGenerator.persist();

    }
}

class ComponentBuilder extends BaseBuilder {

    hasRenderFunction = false;

    constructor(props) {
        super(props);
        this.appendDefaultPath('component');
    }

    async buildBaseComponent(node) {
        const baseClassName = `${_.upperFirst(node.name)}BaseComponent`;
        const className = `${_.upperFirst(node.name)}Component`;
        const folderName = node.name;
        const basePath = Util.persistByPath(libpath.join(this.defaultPath, folderName, `${baseClassName}.js`));
        const indexPath = Util.persistByPath(libpath.join(this.defaultPath, folderName, `index.js`));

        const baseGenerator = new ClassGenerator(basePath);
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */

        baseGenerator.appendClass(baseClassName, 'BaseComponent', `observer`, `inject('${node.name}')`);
        baseGenerator.appendInClassHead(`import BaseComponent from '../../base/BaseComponent'`);
        baseGenerator.appendInClassHead(`import React from 'react'`)
        baseGenerator.appendInClassHead(`import {observer, inject} from 'mobx-react'`);
        baseGenerator.appendInClassHead(`import {Paper, Button, Typography, Card} from '@material-ui/core'`);
        baseGenerator.appendFunction(`constructor`, ['props'], [], 'super(props)');
        this.appendRenderViewFunctions(node.struct, baseGenerator);

        /** index.js */
        const indexGenerator = new ClassGenerator(indexPath);
        indexGenerator.appendInClassHead(`import ${baseClassName} from './${baseClassName}'`);
        indexGenerator.appendClass(className, baseClassName);

        await indexGenerator.persist();
        await baseGenerator.persist();
    }

    /**
     * {
     *      tag:'tag',
     *      props:{...name:object},
     *      contents:['cotent1','content2']
     * }
     *
     * ////////////// sample: ///////////////
     praam :{
            tag: node.view,
            props: { style: {height: 80},className:'className' },
            contents: [`console.log()`,`console.error()`]
        }

     * output:
     <Paper
     style={{ height: 80 }}
     className={"className"} >
     {console.log()}
     {console.error()}
     </Paper>
     */
    getJSXStrings(param) {

        const props = param.props;
        const contents = param.contents ? param.contents : [];

        const stmt = [];
        stmt.push(`<${param.tag}`);
        stmt.push('\n');

        for (const propName in props) {
            stmt.push(`${propName}={${JSON.stringify(props[propName])}}`);
            stmt.push('\n');
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

    getJSXStringsByNode(node, ...contents) {
        return this.getJSXStrings({
            tag: node.view,
            props: {className: node.name, style: node.style},
            contents: contents,
        })
    }

    getJSXStringsByStruct(node) {
        const childstmt = [];
        for (const child of node.getChildren()) {
            if (child.isArray()) {
                childstmt.push(`\n{this.${child.getArrayJSXFunctionName()}()}\n`);
            } else if (child.isObject()) {
                childstmt.push(...this.getJSXStringsByStruct(child));
            } else {
                childstmt.push(...this.getJSXStringsByNode(child));

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
                normalize(...this.getJSXStringsByStruct(node)));
            this.hasRenderFunction = true;
        }

        for (const child of node.getChildren()) {
            if (child.isArrayOrObject()) {
                builder.appendFunction(child.getArrayJSXFunctionName(), [], [],
                    normalize(...this.getJSXStringsByStruct(child)));
                this.appendRenderViewFunctions(child, builder);
            }
        }
    }

    getComponentClassBody(className) {
        return mustache.render(Util.getContextForRawFile('./template/component.js'), this.getMustacheRenderValues({className}))
    }
}

class AppBuilder extends ComponentBuilder {

    constructor(props) {
        super(props);
        this.setDefaultPath('./gen');
    }

    async buildAppIndexFiles(obj) {
        const path = Util.persistByPath(libpath.join(this.defaultPath, `/App.js`));
        const appGenerator = new ClassGenerator(path);
        appGenerator.appendInClassHead(`import {Provider} from 'mobx-react'`);
        appGenerator.appendInClassHead(`import ReactDOM from 'react-dom'`);
        appGenerator.appendInClassHead(`import {Route, BrowserRouter as Router, Switch} from "react-router-dom"`);
        appGenerator.appendInClassHead(`import {RouterStore, syncHistoryWithStore} from "mobx-react-router"`);
        appGenerator.appendInClassHead(`import {createBrowserHistory} from "history"`);
        appGenerator.appendInClassHead(`const history = syncHistoryWithStore(createBrowserHistory(), new RouterStore())`);

        const childrenStmt = [];
        for (const component of obj.components) {
            childrenStmt.push(...this.getJSXStrings({
                tag: `Route`,
                props: {path: component.path, component: component.name},
            }))
        }
        const switchStmt = this.getJSXStrings({
            tag: 'Switch',
            contents: [...childrenStmt]
        });
        this.removeJSXSign(switchStmt);
        appGenerator.appendInClassTail(switchStmt.join(''));
        await appGenerator.persist();
    }

}

export {ClassGenerator as ClassGenerator}

if (configer.DEBUG_MODE) {
    (async () => {
            const obj = require('./source.js').default;
            await Util.cleanChildFiles('./gen', (each) => true, 'base');

            await new AppBuilder().buildAppIndexFiles(obj);
            for (let _component of obj.components) {
                let component = CodegenNode.enrich(_component);
                await new StoreBuilder().buildBaseStore(component.struct);
                await new ComponentBuilder().buildBaseComponent(component);
            }
            Util.copyFromFolderToDestFolder('./base', './gen/base');

        }
    )();
}
