import {configer} from "configer";
import {exceptioner as ERROR, utiller as Util} from 'utiller';
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
const SURE_TO_PERSIST_VERY_IMPORTANT = true;


class CodegenNode {

    node;

    outer;
    /** 搭配wrap服用的屬性, 可以放在wrap那一個圖層的效果 */
    props;
    /** 用在加上view額外的props,<div ...props/> */
    injectStyle;
    /** 如果有style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */
    contents;
    /** 放在<div>content</div>*/
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
    click;
    defaultValue;

    constructor(node) {
        this.node = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
    }

    needInjectStyle() {
        return !!this.injectStyle && this.injectStyle;
    }

    hasPath() {
        return !!this.path && !_.isEmpty( this.path );
    }

    getContents() {
        if (!!this.contents && _.isArray( this.contents )) {
            return this.contents
        }
        return [];
    }

    isOuter() {
        return !!this.outer && this.outer
    }

    isView() {
        return !!this.view;
    }

    isAttribute() {
        return !!this.type;
    }

    getViewProps() {
        if (!!this.props)
            return this.props;
        return {};
    }

    getClickParamStmt() {
        if (!this.isAttribute())
            return '';

        let object = '';
        if (this.type === 'array')
            object = this.name;
        else if (!_.isEmpty( this.getParentObject() )) {
            object = this.getParentObject().name;
        }

        if (!_.isEmpty( object )) {
            return `,object:${object}`;
        }
        return '';
    }


    hasTitle() {
        return (!_.isUndefined( this.title ));
    }

    pure() {
        return this.node;
    }

    hasChildren() {
        return (_.isArray( this.children ) && this.children.length > 0);
    }

    getChildren() {
        return _.isArray( this.children ) ? this.children : [];
    }

    hasParent() {
        return this.parent !== undefined;
    }

    isClickView() {
        return !!this.view && !!this.click;
    }

    getFunctionNameOfClicked() {
        return Util.camel( `on`, this.name, this.view, 'clicked' );
    }

    /** 得到 /username/${username}/id/${id} 這樣的字串 */
    getPathOfRouterString(){
        const params = this.getParamsOfPath();
        const path = [];
        for(const segment of this.path.split('/')) {
            if(_.startsWith(segment,':'))
                path.push(`\$\{${params.shift()}\}`);
            else
                path.push(segment);
        }
        return path.join('/');
    }

    /** /id/:id/userId/:id 把這種概念的param 給拉出來 */
    getParamsOfPath() {
        if (!this.hasPath()) return [];

        const params = [];
        for (const segment of this.path.split( '/' )) {
            if (_.startsWith( segment, ':' ))
                params.push( Util.getNormalizedStringNotStartWith( segment, ':' ) );
        }
        return params;
    }

    /** 會一直往上找parent 直到符合predicate,不然就回傳 undefined */
    getParentBy(predicate = (parent) => (true)) {
        let currentNode = parent;
        while (!!currentNode) {
            if (predicate( currentNode )) {
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
                names.push( currentNode.name )

            currentNode = currentNode.parent;
        }
        return _.reverse( names );
    }

    /** 因為array 的 child 如果找parent, 會是一個array的node, 沒有有用的資訊, 所以要再往上找*/
    getParentObject() {
        if (_.isArray( this.parent )) {
            return this.parent.parent;
        }
        return this.parent;
    }


    isArray() {
        return (this.type === 'array');
    }

    isArrayOrObject() {
        return this.isArray() || this.isObject()
    }

    isRootPath() {
        return this.path && _.isEqual( this.path, '/' )
    }

    getClassName() {
        return _.upperFirst( this.name );
    }

    hasURL() {
        return !_.isEmpty( this.url );
    }

    isObject() {
        return (this.type === 'object');
    }

    getDefaultValueByType() {
        if (this.defaultValue) {
            return JSON.stringify( this.defaultValue );
        }

        if (this.type === 'string') {
            return `''`;
        }

        if (this.type === 'array') {
            return `[]`;
        }

        if (this.type === 'object') {
            return `new ${_.upperFirst( this.name )}()`;
        }

        if (this.type === 'number') {
            return `-1`;
        }
    }

    getFunctionName() {
        return `get${_.upperFirst( this.name )}${this.plural ? this.plural : ''}`;
    }

    getFunctionNameOfSet() {
        if (this.isArray()) {
            return `push${_.upperFirst( this.name )}${this.plural}`;
        }
        return `set${_.upperFirst( this.name )}`;
    }

    getArrayJSXFunctionName() {
        return Util.camel( 'render', this.name, 'view' );
    }

    static enrich(node) {
        let involution = new CodegenNode( node );
        if (_.isArray( node )) {
            involution = [];
            for (const child of node) {
                child.parent = node;
                involution.push( this.enrich( child ) );
            }
        } else if (_.isObject( node )) {
            for (const key in node) {
                /** style ,extra 是個例外, 要排除掉*/
                if (Util.isOrEquals( key, 'contents', 'style', 'extra', 'firebase', 'parent', 'props' ))
                    involution[key] = node[key];
                else if (_.isObject( node[key] ) || _.isArray( node[key] )) {
                    const obj = node[key];
                    obj.parent = node;
                    involution[key] = this.enrich( obj );
                }
            }
        }
        return involution;
    }

}

class ClassGenerator {

    hasConstructor = false;
    constructorStmt = [];
    hasExtends = false
    filePath = ``;
    classes = [];
    isSingletonFile = false;
    signature = true;

    constructor(path) {
        this.filePath = path;
        this.classes = [];

        if (!fs.existsSync( this.filePath )) {
            Util.persistByPath( path )
        }
        this.context = Util.getContextForRawFile( this.filePath ).split( '\n' );
    }

    appendField(fieldName, defaultValue, macros = []) {
        const stmt = [];
        for (const m of macros) {
            stmt.push( `\n` );
            stmt.push( `@${m}` );
        }
        stmt.push( `\n` );
        stmt.push( `${fieldName} = ${defaultValue};` );
        stmt.push( `\n` );
        Util.insertToArray( this.context, this.getIndexOfFieldSign(), ...stmt );
    }

    appendSeparator(sep) {
        const stmt = [];
        stmt.push( '\n' );
        stmt.push( sep );
        Util.insertToArray( this.context, this.getIndexOfFunctionSign(), ...stmt );
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
        stmt.push( `\n` );
        for (const m of macros) {
            stmt.push( `\n` );
            stmt.push( `@${m}` );
        }
        stmt.push( `\n` );
        stmt.push( `${functionName}(${_.isEmpty( params ) ? '' : params.join( ' ,' )}) {` );
        for (let content of contents) {
            stmt.push( `\n` );
            stmt.push( `${content}` );
        }
        stmt.push( `\n` );
        stmt.push( `}` );
        Util.insertToArray( this.context, this.getIndexOfFunctionSign(), ...stmt )
    }


    appendConstructor(...stmt) {
        this.hasConstructor = true;
        this.constructorStmt.push(...stmt);
    }

    getIndexOf(stmt) {
        return _.findIndex( this.context, (per) => {
            return _.isEqual( per, stmt );
        } );
    }

    /** extendz:{name,from}*/
    appendClass(className, extendz, ...macros) {
        /** 應該要檢查file is not empty 的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push( '\n' );
        stmt.push( '\n' );
        for (const macro of macros) {
            stmt.push( '\n' );
            stmt.push( `@${macro}` );
        }
        stmt.push( '\n' );
        if (_.isObject( extendz )) {
            this.appendImport( extendz.name, extendz.from );
            stmt.push( `class ${className}${extendz ? ` extends ${extendz.name}` : ' '} {` );
        } else {
            stmt.push( `class ${className}${extendz ? ` extends ${extendz}` : ' '} {` );
        }

        stmt.push( `\n` );
        stmt.push( SIGN_OF_FIELD_START );
        stmt.push( `\n` );
        stmt.push( SIGN_OF_FUNCTION_START );
        stmt.push( `\n` );
        stmt.push( SIGN_OF_RESTFUL_API_START );
        stmt.push( `\n` );
        stmt.push( `}` );
        stmt.push( `\n` );

        this.context.push( ...stmt );
        this.classes.push( className );
        this.hasExtends = !!extendz;
    }


    hasClass() {
        return (_.size( this.classes )) >= 1;
    }

    async persist() {
        const stmts = [];
        if (_.size( this.classes ) === 1) {
            if (this.isSingletonFile) {
                stmts.push( `export default new ${this.classes[0]}()` );
            } else {
                stmts.push( `export default ${this.classes[0]}` );
            }

        } else if (_.size( this.classes ) > 1) {
            stmts.push( `export { ${this.classes.map( (clazz => `${clazz} as ${clazz}`) ).join( ',' )}}` );
        }

        if (this.hasClass()) {
            this.appendFunction( 'constructor', ['props'],
                [], this.hasExtends ? 'super(props)' : '', ...this.constructorStmt );
        }

        this.appendInClassTail( stmts );
        if (this.signature)
            this.appendInClassHead( `/** this code are generated, modify is no sense. \n\tauthor:David Tu, \n\temail:freshingmoon0725@gmail.com \n\tupdateTime:${Util.getCurrentTimeFormat()} \n*/`, false );

        Util.appendFile( this.filePath, _.join( this.context, '' ), true, true );
        await Util.executeCommandLine( `cd ${libpath.resolve( '.' )} &&  npx prettier --write ${libpath.resolve( this.filePath )}` )
    }

    /** import `${parts}` from `${from}`*/
    appendImport(parts, from) {
        this.appendInClassHead( `import ${parts} ${_.isEmpty( parts ) ? `` : `from`} '${from}'` );
    }

    appendInClassHead(stmt, needSemicolon = true) {
        const stmts = [];
        stmts.push( `${stmt}${needSemicolon ? ';' : ''}` );
        stmts.push( '\n' );
        Util.insertToArray( this.context, 0, ...stmts );
    }

    appendInClassTail(stmt) {
        const stmts = [];
        stmts.push( stmt );
        stmts.push( '\n' );
        this.context.push( ...stmts );
    }

    getClasses() {
        return this.classes;
    }

    /** this is not allow to growing */
    getIndexOfRestfulApiSign() {
        return this.getIndexOf( SIGN_OF_RESTFUL_API_START );
    }

    getIndexOfFunctionSign() {
        return this.getIndexOf( SIGN_OF_FUNCTION_START );
    }

    getIndexOfFieldSign() {
        return this.getIndexOf( SIGN_OF_FIELD_START );
    }

    insertBatchLinesIntoFunctionSection(lines) {
        Util.insertToArray( this.context, this.getIndexOfFunctionSign(), ...lines );
    }

    insertBatchLinesIntoRestfulApiSection(lines) {
        Util.insertToArray( this.context, this.getIndexOfRestfulApiSign(), ...lines );
    }

    insertBatchLinesIntoFieldSection(lines) {
        Util.insertToArray( this.context, this.getIndexOfFieldSign(), ...lines );
    }

    insertBatchLines(lines) {
        Util.insertToArray( this.context, 0, ...lines );
    }


    setSingleton(singleton = true) {
        this.isSingletonFile = singleton;
    }

    needSignature(need) {
        this.signature = need;
    }
}

class BaseBuilder {

    genPath;
    /** 例如 component builder 的 genPath => /{genRootPath}/src/component */
    genRootPath;
    /** 很多時候要放在根目錄, 所以就在建構句 把它保留起來 */
    classGenerator;

    constructor(defaultPath = './gen') {
        this.genRootPath = defaultPath;
        this.genPath = defaultPath;
    }

    appendMustacheFile(templateFileName, destFileName, param = {}) {
        Util.appendFile(
            libpath.resolve( destFileName ),
            this.getStringFromMustache( templateFileName, param ),
            true,
            true );
    }

    setDefaultPath(path) {
        this.genPath = path;
    }

    appendDefaultPath(...path) {
        this.genPath = libpath.join( this.genPath, ...path );
    }

    getStringFromMustache(templateFileName, variable) {
        return mustache.render( Util.getContextForRawFile( `./template/${templateFileName}` ), this.getMustacheRenderValues( variable ) );
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
            fieldName: _.lowerFirst( fieldName ),
            functionName: functionName ? functionName : _.upperFirst( fieldName ),
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
        let path = libpath.join( this.genRootPath, 'src', ...folder )

        return _.filter( Util.getChildPathByPath( path ),
            each => each.isDirectory ).map( each => each.dirName );
    }

    getGenStores() {
        return this.getGenUnion( `store` );
    }

    getGenComponent() {
        return this.getGenUnion( `component` );
    }
}

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super( props );
        this.appendDefaultPath( 'src', 'store' );
    }

    getFunctionsDependOnFieldType({fieldName, type, defaultValue, fieldClass}) {
        const functions = this.getStringFromMustache( `store_${type}.js`, {
            fieldName,
            defaultValue,
            fieldClass
        } )
        return functions;
    }

    getFunctionsOfRemoteApi({fieldName, type, fieldUrl}) {
        const functions = this.getStringFromMustache( `http_restful.js`, {
            fieldName,
            fieldUrl,
        } )
        return functions;
    }

    async buildIndexFiles() {
        /** 產生 store的index file */
        const stores = this.getGenStores();
        this.base = Util.persistByPath( libpath.join( this.genPath, `store.js` ) );

        const baseGenerator = new ClassGenerator( this.base );
        baseGenerator.appendClass( `BaseStore` );
        for (const store of stores) {
            baseGenerator.appendImport( _.upperFirst( store ), `./${store}` );
        }
        baseGenerator.appendConstructor( ...stores.map( child => `this.${child} = new ${_.upperFirst( child )}()` ) )
        await baseGenerator.persist();

        const indexGenerator = new ClassGenerator( libpath.join( this.genPath, `index.js` ) );
        indexGenerator.appendClass( `Store`, {name: `BaseStore`, from: './store'} );
        indexGenerator.appendConstructor();
        await indexGenerator.persist();
    }

    async buildBaseStore(node) {

        const folderName = _.toLower( node.name );
        const baseClassName = 'Base' + _.upperFirst( folderName ) + 'Store';
        const indexClassName = _.upperFirst( folderName ) + 'Store';
        const baseGenerator = new ClassGenerator( libpath.join( this.genPath, folderName, `${baseClassName}.js` ) );
        const indexGenerator = new ClassGenerator( libpath.join( this.genPath, folderName, `index.js` ) )

        baseGenerator.appendClass( baseClassName, {name: `BaseStore`, from: '../../base/BaseStore'} );
        baseGenerator.appendInClassHead( `import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction} from "mobx"` )
        baseGenerator.appendInClassHead( `import {utiller as Util, exceptioner as ERROR} from 'utiller'` );
        baseGenerator.appendFunction( `getName`, [], [], `return '${baseClassName}'` );
        const propsStmt = [];
        if (node.hasChildren()) {
            for (const child of node.getChildren()) {
                if (!child.isAttribute()) continue
                const propStmt = [];
                const fieldName = child.name + (child.plural ? child.plural : '');
                const defaultValue = child.getDefaultValueByType();
                baseGenerator.appendField( fieldName, defaultValue, ['observable'] );

                baseGenerator.insertBatchLinesIntoFunctionSection(
                    this.getFunctionsDependOnFieldType(
                        {
                            fieldName: _.upperFirst( fieldName ),
                            type: child.type,
                            defaultValue,
                            fieldClass: child.getClassName(),
                        } ) );
                propStmt.push( `if(obj && obj.${fieldName})` );
                if (child.isArray()) {
                    propStmt.push( `this.${child.getFunctionNameOfSet()}(...obj.${fieldName})` );
                    baseGenerator.appendInClassHead( `import ${_.upperFirst( child.name )} from '../${child.name}'` )
                    await this.buildBaseStore( child )
                } else if (child.isObject()) {
                    baseGenerator.appendInClassHead( `import ${_.upperFirst( child.name )} from '../${child.name}'` )
                    propStmt.push( `this.set${_.upperFirst( fieldName )}(obj.${fieldName})` );
                    await this.buildBaseStore( child )
                } else {
                    propStmt.push( `this.${child.getFunctionNameOfSet()}(obj.${fieldName})` );
                }
                propsStmt.push( ...propStmt );
            }
        }
        if (node.hasURL()) {
            baseGenerator.insertBatchLinesIntoRestfulApiSection( this.getFunctionsOfRemoteApi( {
                    fieldName: node.name,
                    type: node.type,
                    fieldUrl: node.url
                } )
            );
        }
        baseGenerator.appendFunction( `initial`, ['obj'], [], `super.initial(obj)`, ...propsStmt );
        baseGenerator.appendConstructor( `makeObservable(this)`, `this.initial(props)` );
        await baseGenerator.persist();

        indexGenerator.appendClass( `${indexClassName}`, {name: baseClassName, from: `./${baseClassName}`} );
        await indexGenerator.persist();

    }
}


class ComponentBuilder extends BaseBuilder {

    hasRootRenderViewFunction = false;
    classNames = [];
    componentDidMountStmt = [];

    constructor(props) {
        super( props );
        this.appendDefaultPath( 'src', 'component' );
    }

    appendStmtIntoComponentDidMount(...stmt) {
        this.componentDidMountStmt.push( ...stmt );
    }

    async buildBaseComponent(componentNode) {
        const baseClassName = `Base${_.upperFirst( componentNode.name )}Component`;
        const className = `${_.upperFirst( componentNode.name )}Component`;
        const folderName = componentNode.name;

        const baseGenerator = new ClassGenerator( libpath.join( this.genPath, folderName, `${baseClassName}.js` ) );
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */

        baseGenerator.appendClass( baseClassName, {
            name: 'BaseComponent',
            from: '../../base/BaseComponent'
        } );
        baseGenerator.appendInClassHead( `import React from 'react'` )
        baseGenerator.appendInClassHead( `import Style from '../../style'` )
        baseGenerator.appendInClassHead( `import {Paper, Button, Typography, Card} from '@material-ui/core'` );

        for (const param of componentNode.getParamsOfPath()) {
            baseGenerator.appendConstructor( `this.paramOf${_.upperFirst( param )}= this.props.match.params.${param}` );
            baseGenerator.appendConstructor( `console.log(this.paramOf${_.upperFirst( param )})` );
        }

        this.appendRenderViewFunctions( componentNode.struct, baseGenerator );

        if (componentNode.hasTitle()) {
            baseGenerator.appendField( `stringOfPageTitle`, `"${componentNode.title}"` )
            this.appendStmtIntoComponentDidMount( `document.title = this.stringOfPageTitle` );
        }

        baseGenerator.appendFunction( 'getStore', [], [],
            `return this.props.${componentNode.name}` )


        baseGenerator.appendFunction( 'componentDidMount',
            [], [], `super.componentDidMount()`, ...this.componentDidMountStmt );

        /** index.js */
        const indexGenerator = new ClassGenerator( libpath.join( this.genPath, folderName, `index.js` ) );
        indexGenerator.appendClass( className, {
            name: baseClassName,
            from: `./${baseClassName}`
        }, `inject('${componentNode.name}')`, `observer` );
        indexGenerator.appendImport( `{observer, inject}`, `mobx-react` );


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
            if (_.isString( value ) && _.startsWith( value, `###` )) {
                return `{${Util.getStringOfDropHeadSign( value, `#` )}}`;
            }

            if (_.isBoolean( value )) {
                return `{${_.toString( value )}}`;
            }
            return `{${JSON.stringify( value )}}`;
        }

        const props = param.props;
        const contents = param.contents ? param.contents : [];
        const children = param.children ? param.children : [];

        const stmt = [];
        stmt.push( `<${param.tag}` );
        stmt.push( '\n' );

        for (const child of children) {
            stmt.push( `{...${child}}` );
            stmt.push( '\n' );
        }

        for (const key in props) {
            if (!!!props[key]) continue

            if (_.isEqual( key, 'forEachObject' ))
                stmt.push( `{${props[key]}}` )
            else
                stmt.push( `${key}=${normalize( props[key] )}\n` );

            /** this is super hard-code */
            if (_.isEqual( key, 'className' )) {
                this.storesClassName( props[key] );
            }
        }

        stmt.push( `>` );
        stmt.push( '\n' );

        for (const content of contents) {
            stmt.push( `${content}` );
            stmt.push( '\n' );
        }

        stmt.push( SIGN_OF_JSX_CONTENT );
        stmt.push( '\n\n' );
        stmt.push( `</${param.tag}>` );
        stmt.push( '\n\n' );
        return stmt;
    }

    /** this is super hard-code */
    storesClassName(name) {
        this.classNames.push( name );
    }

    getJSXStringsByNode(generator, node, ...extraContents) {
        const keyValue = node.getChildren().map( each => `\$\{${node.name}.${each.name}\}` ).join( '' );
        const parentName = Util.camel( ...node.getParentNames(), node.name, node.isOuter() ? 'outer' : '', node.view, );
        const className = _.upperFirst( parentName );


        const props = {
            className,
            ...node.getViewProps(),
        };

        if (node.needInjectStyle()) {
            const param = node.getParentObject() ? node.getParentObject().name : '';
            props.style = `###{...this.getInjectStyleOf${_.upperFirst( node.name )}${_.upperFirst( node.view )}(${param}),...Style.${className}}`;
        } else {
            props.style = `###Style.${className}`;
        }

        if (node.isArray() && !_.isEmpty( keyValue )) {
            props.key = '###' + '`' + keyValue + '`';
        }

        if (node.isClickView()) {
            props.onClick =
                `###(param) => this.${node.getFunctionNameOfClicked()}({view:param${node.getClickParamStmt()}})`
        }

        const selfContent = node.getContents();

        const origin = this.getJSXStrings( {
            tag: node.view,
            props,
            contents: [...selfContent, ...extraContents],
        } );


        if (node.wrap) {
            const props = {className: `${className}WrapDiv`,}
            if (!_.isEmpty( keyValue ))
                props.key = '###' + '`' + keyValue + 'Wrap' + '`';
            return this.getJSXStrings( {
                tag: 'div',
                props,
                contents: [...this.getOuterChildJSXStrings( generator, node ), ...origin],
            } )
        }
        return origin;
    }

    getOuterChildJSXStrings(generator, node) {
        const stmt = [];
        for (const child of node.getChildren()) {
            if (child.isOuter())
                stmt.push( ...this.getJSXStringsByStruct( child, generator, false ) )
        }
        return stmt;
    }

    getJSXStringsByStruct(node, generator, notAllowOuterChild = true) {
        const childstmt = [];

        for (const child of node.getChildren()) {
            if (!child.isView()) continue;
            if (notAllowOuterChild && child.isOuter()) continue;

            const functionName =
                `get${_.upperFirst( node.name )}${_.upperFirst( child.name )}${child.plural ? child.plural : ''}`;


            if (child.hasChildren()) {
                if (child.isArray()) {
                    childstmt.push( `\n{this.${functionName}(${node.name})
                .map((each) => this.${child.getArrayJSXFunctionName()}(each))}\n` );

                    generator.appendFunction( functionName, [`${node.name}`], [],
                        `return ${node.name}.${child.getFunctionName()}()` );
                } else if (child.isObject()) {
                    childstmt.push( `\n{this.${child.getArrayJSXFunctionName()}(this.${functionName}(${node.name}))}\n` );

                    generator.appendFunction( functionName, [`${node.name}`], [],
                        `return ${node.name}.${child.getFunctionName()}()` );
                } else {
                    /** 當沒有type的屬性時,畫面也要可以做出結構 */
                    childstmt.push( ...this.getJSXStringsByStruct( child, generator, notAllowOuterChild ) )
                }
            } else {
                const content = [];

                if (child.isAttribute()) {
                    generator.appendFunction( functionName, [`${node.name}`], [],
                        `return ${node.name}.${child.getFunctionName()}()` );
                    content.push( `{this.${functionName}(${_.lowerCase( node.name )})}` );
                }

                childstmt.push( ...this.getJSXStringsByNode( generator, child, ...content ) );
            }


            if (child.isClickView()) {
                generator.appendFunction( child.getFunctionNameOfClicked(),
                    ['param'], [],
                    `console.error('${child.getFunctionNameOfClicked()} not override')`
                )
            }
        }

        return this.getJSXStringsByNode( generator, node, ...childstmt );
    }

    removeJSXSign(stmt) {
        _.remove( stmt, (each) => _.isEqual( each, SIGN_OF_JSX_CONTENT ) );
    }

    appendRenderViewFunctions(node, builder) {

        function normalize(...strings) {
            const self = strings;
            _.remove( self, (each) => _.isEqual( each, SIGN_OF_JSX_CONTENT ) );
            return `return ( ${self.join( '' )})`;
        }

        if (!this.hasRootRenderViewFunction) {
            builder.appendFunction( 'renderView', [], [],
                `const ${_.lowerCase( node.name )} = this.props.${_.lowerCase( node.name )};\n\n`,
                normalize( ...this.getJSXStringsByStruct( node, builder ) ) );
            this.hasRootRenderViewFunction = true;
        }

        for (const child of node.getChildren()) {
            if (child.isArrayOrObject()) {
                builder.appendFunction( child.getArrayJSXFunctionName(), [`${_.lowerCase( child.name )}`], [],
                    normalize( ...this.getJSXStringsByStruct( child, builder ) ) );
                this.appendRenderViewFunctions( child, builder );
            }
        }
    }

    getComponentClassBody(className) {
        return mustache.render( Util.getContextForRawFile( './template/component.js' ), this.getMustacheRenderValues( {className} ) )
    }
}

class AppBuilder extends ComponentBuilder {

    constructor(props) {
        super( props );
        /** 印為繼承component */
        this.appendDefaultPath( '../' );
    }

    async buildWebpackNPackageJson(sourceObj) {
        this.appendMustacheFile( 'package.json', libpath.join( this.genRootPath, `package.json` ), {
            projectName: sourceObj.name,
            projectVersion: sourceObj.version,
            projectDescription: sourceObj.description
        } );
        this.appendMustacheFile( 'webpack.config.js', libpath.join( this.genRootPath, `webpack.config.js` ) );
        this.appendMustacheFile( 'babel.config.js', libpath.join( this.genRootPath, `babel.config.js` ) );
    }

    async buildHtmlIndexAssetsFile() {
        const path = Util.persistByPath( libpath.join( this.genRootPath, 'dist' ) );
        this.appendMustacheFile( 'index.html', libpath.join( path, 'index.html' ) );
    }

    async buildRouterFile(sourceObj) {
        const baseRouterGenerator = new ClassGenerator( libpath.join( this.genPath, `router`, `BaseRouter.js` ) );
        baseRouterGenerator.appendClass( `BaseRouter` );
        for(const component of sourceObj.components) {
            if(!component.hasPath()) continue;
            baseRouterGenerator.appendFunction( Util.camel( 'goto', component.name, 'page' ), ['component', ...component.getParamsOfPath()],
                [],
                'const { history } = component.props',
                `history.push(\`${component.getPathOfRouterString()}\`)`,
            )
        }
        const indexRouterGenerator = new ClassGenerator( libpath.join( this.genPath, `router`, `index.js` ) );
        indexRouterGenerator.appendClass('Router',{name:`BaseRouter`, from:`./BaseRouter`});
        indexRouterGenerator.setSingleton(true);
        await indexRouterGenerator.persist();
        await baseRouterGenerator.persist();
    }

    async buildConfig(sourceObj) {
        const baseConfigGenerator = new ClassGenerator( libpath.join( this.genPath, `config`, `BaseConfig.js` ) );
        baseConfigGenerator.appendClass( `BaseConfig` );
        baseConfigGenerator.appendField( `firebase`, JSON.stringify( sourceObj.firebase ) );
        await baseConfigGenerator.persist();

        const indexConfigGenerator = new ClassGenerator( libpath.join( this.genPath, `config`, `index.js` ) );
        indexConfigGenerator.appendClass( `Config`, {name: `BaseConfig`, from: './BaseConfig'} );
        indexConfigGenerator.setSingleton( true );
        await indexConfigGenerator.persist();
    }

    async buildAppIndexFiles(sourceObj) {
        const appGenerator = new ClassGenerator( libpath.join( this.genPath, `app.js` ) );
        const indexGenerator = new ClassGenerator( libpath.join( this.genPath, `index.js` ) );
        appGenerator.appendImport( `{Provider}`, `mobx-react` );
        appGenerator.appendImport( ` ReactDOM`, `react-dom` );
        appGenerator.appendImport( `{Route, Router, Switch}`, `react-router-dom` );
        appGenerator.appendImport( `{RouterStore, syncHistoryWithStore}`, `mobx-react-router` );
        appGenerator.appendImport( `{createBrowserHistory}`, `history` );
        appGenerator.appendImport( `React`, `react` );
        appGenerator.appendImport( `Store`, `./store` );
        appGenerator.appendImport( ``, `./less` );
        appGenerator.appendClass( `BaseApp` );
        appGenerator.appendFunction( `mount`, [], [],
            `ReactDOM.render(this.getRenderView(),
                    document.getElementById('app'))` );
        appGenerator.appendField( `store`, `new Store()` );
        appGenerator.appendField( `history`, `syncHistoryWithStore(createBrowserHistory(), new RouterStore())` );
        appGenerator.appendField( `extraPages`, '[]' );
        appGenerator.appendFunction( `pushPage`, [`page`], [], `this.extraPages.push(page)` )
        appGenerator.appendFunction( `getExtraPages`, [], [],
            `/** --- push <Router /> in to pages */`, `return this.extraPages` );
        for (const component of this.getGenComponent()) {
            appGenerator.appendInClassHead( `import ${_.upperFirst( component )} from './component/${component}'` );
        }

        const childrenStmt = [];
        for (const component of sourceObj.components) {
            if (!component.hasPath()) continue;

            const renderStmts = this.getJSXStrings( {
                    tag: _.upperFirst( component.name ),
                    props: {...component.extra},
                    children: ['props'],
                }
            );
            this.removeJSXSign( renderStmts );

            childrenStmt.push( ...this.getJSXStrings( {
                tag: `Route`,
                props: {
                    exact: component.isRootPath() ? true : undefined,
                    path: component.path,
                    render: `###(props) =>
                     ${renderStmts.join( '' )}`,
                    /** component: `###${_.upperFirst(component.name)}`, */
                },
            } ) )
        }
        const switchStmt = this.getJSXStrings( {
            tag: 'Switch',
            contents: [...childrenStmt, `{this.getExtraPages()}`]
        } );

        const routerStmt = this.getJSXStrings( {
            tag: 'Router',
            props: {history: `###this.history`},
            contents: [...switchStmt]
        } )

        const providerStmt = this.getJSXStrings( {
            tag: 'Provider',
            props: {
                forEachObject: '...this.getStoreObject()'
            },
            contents: [...routerStmt]
        } )


        const whole = providerStmt;
        this.removeJSXSign( whole );
        appGenerator.appendFunction( 'getStoreObject', [], [],
            'const stores = {}',
            ...this.getGenStores().map( store => {
                return `stores['${store}'] = this.store.${store}`
            } ),
            'return stores'
        )
        appGenerator.appendFunction( `getRenderView`, [], [], `return (${whole.join( '' )})` )
        indexGenerator.appendClass( `App`, {name: `BaseApp`, from: `./app`} );
        indexGenerator.appendInClassTail( `new App().mount()` );
        indexGenerator.appendInClassTail( `module.hot.accept()` );
        await indexGenerator.persist();
        await appGenerator.persist();
    }

    async buildBaseClasses() {
        Util.copyFromFolderToDestFolder( './base', libpath.join( this.genPath, `base` ) );
    }

    async buildStyleFiles(classNames, sourcePath) {
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            let origins = {};
            const sourceFilePath = libpath.join( sourcePath, `src`, `style`, `${type}.style.js` )
            if (fs.existsSync( sourceFilePath )) {
                const obj = require( libpath.resolve( sourceFilePath ) ).default;
                origins = obj;
            }

            const generator = new ClassGenerator( libpath.join( this.genPath, 'style', `${type}.style.js` ) )
            generator.appendClass( `${_.upperFirst( type )}Style` );
            for (const className of classNames) {
                for (const name of className.names) {
                    if (!!origins[name]) {
                        generator.appendField( name, JSON.stringify( origins[name] ) );
                        delete origins[name];
                    } else {
                        generator.appendField( name, `{}` );
                    }
                }
                generator.insertBatchLinesIntoFieldSection( `\n\n/** following for ${className.component.name} */\n\n` )
                generator.setSingleton( true );
            }
            if (!_.isEmpty( origins )) {
                for (const name in origins) {
                    generator.appendField( name, JSON.stringify( origins[name] ) );
                }
                generator.insertBatchLinesIntoFieldSection( `\n\n/** following for unknown */\n\n` )
            }

            await generator.persist();
        }
    }

    /** {[...{component,names}], srcPath}
     * srcPath 就是 keep file 的根目錄
     * */
    async buildLessFile(classNames, srcPath) {
        /** 先把舊的整理過, 除掉 comment的字樣line */
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            const srcLessPath = libpath.join( srcPath, `src`, `less`, `${type}.less` )
            const lessAttriutesFromSrc = [];
            if (fs.existsSync( srcLessPath )) {
                const stub = Util.getContextForRawFile( srcLessPath ).split( '\n' );
                _.remove( stub,
                    (each) => (_.startsWith( each, '/** ' ) ||
                        _.isEqual( each.trim(), '' )) )
                lessAttriutesFromSrc.push( ...(stub.join( '' ).split( '}' )) )
                /** 移除掉最後一個,因為split */
                lessAttriutesFromSrc.pop();
            }

            const generator = new ClassGenerator( libpath.join( this.genPath, 'less', `${type}.less` ) );
            for (const className of classNames) {
                generator.appendInClassTail( `/** => following for ${className.component.name} component used <= */\n\n` );
                for (const name of className.names) {
                    /** 注意!! 是用 remove,會mutate 原本的 array */
                    const srcAttribute = _.remove( lessAttriutesFromSrc,
                        (each) => {
                            return _.startsWith( each, `.${name} {` ) || _.startsWith( each, `.${name}:` )
                        } )

                    if (srcAttribute.length > 1)
                        throw new ERROR( 7003, `origin ==> ${Util.deepFlat( srcAttribute )}` )

                    generator.appendInClassTail( _.isEmpty( srcAttribute ) ? `.${name} { /** style */ }\n\n` : `${srcAttribute[0]}}\n\n` );
                }
            }

            if (lessAttriutesFromSrc.length > 0) {
                generator.appendInClassTail( `/** ======== following for  ========= */\n\n` );
                for (const lasting of lessAttriutesFromSrc) {
                    generator.appendInClassTail( `${lasting} }\n\n` );
                }
            }

            generator.needSignature( false );
            await generator.persist();

            if (!fs.existsSync( libpath.join( srcPath, 'less', 'index.js' ) )) {
                this.appendMustacheFile( 'less.index.js',
                    Util.persistByPath( libpath.join( this.genPath, 'less', 'index.js' ) )
                );
                Util.appendInfo( `persist ./less/index.js succeed` );
            }
        }
    }
}

class ProjectIndexFilePersistHandler {

    genRootPath;
    genSrcPath;

    sourcePath;
    sourceSrcPath;

    constructor(props) {
        this.sourcePath = props.sourcePath;
        this.sourceSrcPath = libpath.join( this.sourcePath, 'src' );
        this.genRootPath = props.genRootPath;
        this.genSrcPath = libpath.join( this.genRootPath, 'src' );

    }

    buildDistAssetFolder() {
        const imageSrcFolder = libpath.join( this.sourceSrcPath, 'images' );
        if (fs.existsSync( imageSrcFolder )) {
            Util.copyFromFolderToDestFolder( imageSrcFolder,
                Util.persistByPath( libpath.join( this.genRootPath, 'dist', 'images' ) ) );
        }
    }

    persistImageFolder() {
        const images = libpath.join( this.genSrcPath, 'images' );
        if (fs.existsSync( images )) {
            Util.copyFromFolderToDestFolder( images,
                Util.persistByPath( libpath.join( this.sourceSrcPath, 'images' ) )
            );
        }
    }

    persistBaseFiles() {
        try {
            for (const file of Util.findFilePathBy( `../gen/src/base` )) {
                if (Util.isEmptyFile( file.absolute )) {
                    Util.appendInfo( `${file.absolute} is empty file, do not copy` )
                    return false;
                }
            }

            Util.copyFromFolderToDestFolder(
                `../gen/src/base`,
                `./base`
            )

            Util.appendInfo( `persist base files succeed` );
            return false;
        } catch (error) {
            /** 偷懶 hack */
            console.error( error );
        }
    }

    keepIndexAndCSSFiles(...exclude) {
        const files = Util.findFilePathBy( this.genSrcPath,
            (each) => {
                return (
                    _.isEqual( each.fileNameExtension, `index.js` ) ||
                    _.isEqual( each.extension, `less` ) ||
                    _.isEqual( each.fileNameExtension, `app.style.js` ) ||
                    _.isEqual( each.fileNameExtension, `mobile.style.js` ) ||
                    _.isEqual( each.fileNameExtension, `common.style.js` )
                )
            },
            'node_modules' );


        for (const file of files) {
            if (_.isEqual( '', Util.getContextForRawFile( file.path ).trim() )) {
                Util.appendInfo( `path ${file.path} is empty file, file would not persist` );
                return
            }
            if (Util.has( exclude, file.fileNameExtension )) continue;
            const from = file.absolute;
            const dest = libpath.join( this.sourceSrcPath, from.split( `src` ).pop() );
            Util.persistByPath( dest );
            Util.copySingleFile( from, dest, '', true );
            console.log( `persist ${from} succeed` );
        }
    }

    /** 就是把像是index file, 這樣的手寫檔案放到 genSrc   */
    overrideEachFilesFromSrcFolder(...exclude) {
        for (const file of Util.findFilePathBy( this.sourceSrcPath )) {
            if (Util.has( exclude, file.fileNameExtension )) continue;

            const from = file.absolute;
            const dest = libpath.join( this.genSrcPath, from.split( `src` ).pop() );
            if (fs.existsSync( dest ))
                Util.copySingleFile( from, dest, '', true );
            else {
                Util.appendError( `overrideIndexFiles dest => ${dest}` );
            }
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
            if (SURE_TO_PERSIST_VERY_IMPORTANT) {
                new ProjectIndexFilePersistHandler( {genRootPath, sourcePath} ).keepIndexAndCSSFiles()
                new ProjectIndexFilePersistHandler( {genRootPath, sourcePath} ).persistBaseFiles();
                new ProjectIndexFilePersistHandler( {genRootPath, sourcePath} ).persistImageFolder();
            }
            const source = CodegenNode.enrich( require( libpath.resolve( libpath.join( sourcePath, `source.js` ) ) ).default );
            await Util.cleanChildFiles( genRootPath, (each) => true, 'node_modules' );
            const totalClassNames = [];
            for (let component of source.components) {
                await new StoreBuilder( genRootPath ).buildBaseStore( component.struct );
                const names = await new ComponentBuilder( genRootPath ).buildBaseComponent( component );
                totalClassNames.push( {component, names} );
            }

            /** 因為 用到 method getGenStores(),stores 要等 gen出來才知道, 必須放在這邊 */
            await new StoreBuilder( genRootPath ).buildIndexFiles();
            await new AppBuilder( genRootPath ).buildAppIndexFiles( source );
            await new AppBuilder( genRootPath ).buildConfig( source );
            await new AppBuilder( genRootPath ).buildWebpackNPackageJson( source );
            await new AppBuilder( genRootPath ).buildRouterFile( source );
            await new AppBuilder( genRootPath ).buildBaseClasses();
            await new AppBuilder( genRootPath ).buildLessFile( totalClassNames, sourcePath );
            await new AppBuilder( genRootPath ).buildStyleFiles( totalClassNames, sourcePath );
            await new AppBuilder( genRootPath ).buildHtmlIndexAssetsFile();


            new ProjectIndexFilePersistHandler( {
                genRootPath,
                sourcePath
            } ).overrideEachFilesFromSrcFolder(
                `common.style.js`, `app.style.js`, `mobile.style.js`,
                `common.less`, `app.less`, `mobile.less` );

            new ProjectIndexFilePersistHandler( {
                genRootPath,
                sourcePath
            } ).buildDistAssetFolder()
            if (!fs.existsSync( libpath.join( genRootPath, `node_modules` ) ))
                await Util.executeCommandLine( `cd ${genRootPath} && npm install` );
        }
    )();
}
