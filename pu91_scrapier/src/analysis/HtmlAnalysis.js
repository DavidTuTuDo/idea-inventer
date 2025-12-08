import {configerer as Configer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import config from '../config';
import _ from 'lodash';
import libpath from 'path';
import fs from "fs";
import path from 'path';
import * as html2json from "himalaya";

/** author:明悅
 *  create time:Wed Oct 13 2021 15:09:49 GMT+0800 (Taipei Standard Time)
 */
class HtmlAnalysis {

    needFormat = true;

    constructor(raw) {
        this.samplingTaget = _.isString(raw) ? html2json.parse(raw) : {};
        this.init();
    }


    setNeedFormat(need) {
        this.needFormat = need;
    }


    init() {
        if (Configer.DEBUG_MODE && _.isEmpty(this.samplingTaget)) {
            let sample = {};
            const mSamplePath = path.join(config.PATH_SAMPLE_OBJECT_ROOT, this.getSampleConfig().filename);
            if (fs.existsSync(mSamplePath))
                sample = JSON.parse(fs.readFileSync(mSamplePath, 'utf-8'));
            this.samplingTaget = sample ? sample : {};
        }
        this.html = _.find(this.samplingTaget, {'tagName': 'html'});
        this.body = this.findNodeByTag(this.html, 'body');
    }


    getChildNodeByIndex(obj, childIndex) {
        if (obj && obj.children && obj.children[childIndex])
            return obj.children[childIndex];
        else
            return {};
    }

    getBody() {
        if (this.body)
            return this.body;
        else
            return {};
    }

    getSampleConfig() {
        return {
            path: config.PATH_SAMPLE_URL_BASE,
            filename: config.SAMPLE_FILE_NAME_BASE,
        }
    }

    findNodeByClass(node, className) {
        return this.findNodeByAttribute(node, {class: className});
    }

    /**
     * ex: <Section class="mainBody" id="myId" />
     *
     * @param node
     * shold be array
     * @param tag
     * comparison to ex,tag would be "Section"
     * @param attr
     * comparison to ex,attr would be {`class`:`mainBody`,`id`:`myId`}
     */

    findNodeByAttribute(node, attr, tag) {
        let target = {};
        let shouldCheckTag = !_.isNull(tag);
        if (this.isContainAttribute(node, attr)) {
            target = shouldCheckTag ? node : _.isEqual(node.tagName, tag) ? node : {};
        }

        if (this.isNode(target))
            return target;

        if (this.hasChildren(node)) {
            _.each(node.children, (child) => {
                const node = this.findNodeByAttribute(child, attr, tag);
                if (this.isNode(node)) {
                    target = node;
                    return false;
                }
            })
        }
        return target;
    }

    findNodeByClasses(node, ...clazz) {
        let traits = _.map([...clazz], (clazz) => {
            return {class: clazz}
        });
        return this.findNodeByAttributes(node, ...traits);
    }

    /**
     * <tag class=page id=text1
     * attr obj = { id:'text1'}*/
    findNodeByAttributes(node, ...attrs) {
        let traits = [...attrs];
        let result = node;
        while (this.hasChildren(result) && !_.isEmpty(traits)) {
            result = this.findNodeByAttribute(result, traits[0]);
            if (this.isNode(result)) {
                traits.shift();
            }
        }
        return result;
    }

    findNodeByPredicate(node, array, predicate) {
        let traits = array;
        let result = node;
        while (this.hasChildren(result) && !_.isEmpty(traits)) {
            const trait = traits[0];
            traits.shift();
            result = predicate(result, trait);
        }
        return result;
    }

    findNodeByAttributeInSequence(node, ...attrs) {
        return this.findNodeByPredicate(node,
            [...attrs],
            (childNode, attr) => {
                return _.find(childNode.children, (grandson) => {
                    return this.isContainAttribute(grandson, attr);
                })
            });
    }


    findNodeByTagsInSequence(node, ...tags) {
        return this.findNodeByPredicate(node,
            [...tags],
            (childNode, tag) => {
                return _.find(childNode.children, (grandson) => {
                    return grandson.tagName === tag;
                })
            });
    }


    /** much more efficient way to derive data */
    findNodeByClassInSequence(node, ...clazz) {
        return this.findNodeByPredicate(
            node,
            [...clazz],
            (childNode, clazzz) => {
                return _.find(childNode.children, (grandson) => _.some(grandson.attributes, {
                    'value': clazzz,
                    'key': 'class'
                }));
            })
    }

    /** single level */
    findNodeByTag(node, tagName) {
        if (node && !_.isEmpty(node.children))
            return _.find(node.children, {'tagName': tagName});
        return {};
    }

    isContainClass(obj, className) {
        return this.isContainAttribute(obj, {'class': className});
    }

    isContainAttribute(node, attrs) {
        if (this.hasAttributes(node)) {
            const attributes = node.attributes;
            const map = this.getAttrMapArray(attrs);
            const hasAttribute = this.isArrayContainsArray(attributes, map);
            return hasAttribute;
        }
        return false
    }

    getAttrMapArray(trait) {
        return _.map(trait, (value, key) => {
            return {
                'key': key,
                'value': value
            }
        });
    }

    isArrayContainsArray(array1, array2) {
        if (array1.length === 0 || array2.length === 0) return false;

        const larger = array1.length > array2.length ? array1 : array2;
        const smaller = larger === array1 ? array2 : array1;
        for (let item of smaller) {
            if (_.findIndex(larger, item) < 0)
                return false;
        }
        return true;
        // return _.some(array1, item => _.findIndex(array2, item) >= 0);
    }

    getFlatTextByNode(node, needNewLine) {
        if (_.isEmpty(node))
            return '';

        let result = '';
        needNewLine = ((needNewLine === undefined) ? true : needNewLine);
        _.forEach(node.children, (child) => {
            if ('text' === child.type)
                result = result + child.content;
            else if ("element" === child.type) {
                result = result + this.getFlatTextByNode(child, false);
            } else {
                //ignore situation
            }
            result = result + (needNewLine ? '\n' : "");
        });
        return this.needFormat ? this.replaceHtmlEntites(result) : result;
    }

    replaceHtmlEntites(s) {
        let translate_re = /&(nbsp|amp|quot|lt|gt);/g;
        let translate = {
            "nbsp": " ",
            "amp": "&",
            "quot": "\"",
            "lt": "<",
            "gt": ">"
        };
        return (s.replace(translate_re, (match, entity) => {
            return translate[entity];
        }))
    }

    persistedUnderObjectFolder(fileName, raw) {
        if (raw) {
            const jsonObj = html2json.parse(raw);
            fs.writeFile(path.join(config.PATH_SAMPLE_OBJECT_ROOT, fileName),
                JSON.stringify(jsonObj, null, 2),
                (err) => {
                    Util.appendError('persistedUnderObjectFolder : ' + JSON.stringify(err.message))
                });
        }
    }

    async downloadSample(page, _delay) {
        const config = this.getSampleConfig();
        await page.goto(config.path,
            {waitUntil: 'networkidle2'}
        );
        await _delay(Configer.HACK_DELAY_OF_MILLION_SECS);
        const content = await page.content();
        this.persistedUnderObjectFolder(config.filename, content);
        if (Configer.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`download ${config.filename} succeed`);
    }

    hasAttributes(node) {
        return node && !_.isEmpty(node.attributes);
    }

    getNodeAttributeValue(node, key) {
        if (this.hasAttributes(node)) {
            const attribute = _.find(node.attributes, {'key': key});
            return attribute ? attribute.value : undefined;
        }
    }

    hasChildren(node) {
        return node && node.children && !_.isEmpty(node.children);
    }

    isNode(node) {
        return node && !_.isEmpty(node.tagName);
    }
}

export default HtmlAnalysis

if (Configer.DEBUG_MODE) {
    (async () => {


        }
    )();
}
