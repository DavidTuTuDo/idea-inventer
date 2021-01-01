import HtmlAnalysis from "./HtmlAnalysis.js";
import _ from "lodash";
import fs from "fs";
import GlobalConfig from "../../GlobalConfig.js";
import util from "../../util";


class SingersAnalysis extends HtmlAnalysis {

    constructor(raw) {
        super(raw);
        this.mAllSinger = this.findNodeByAttribute(this.body, {class: 'showSingers', id: 'shbx_0'});
        console.log();
    }

    getSampleConfig() {

        return {
            path: GlobalConfig.PATH_SAMPLE_URL_SINGER,
            filename: GlobalConfig.SAMPLE_OBJECT_FILE_NAME_SINGER,
        }

    }

    /** 1:male, 2:female, 3:group, 4:western, 5:eastern 6:all*/

    getAllSingers(type = 6) {
        let singers = [];
        let types = []
        if (type === 6) {
            types = [1, 2, 3, 4, 5];
        } else {
            types.push(type);
        }
        for (let index of types) {
            const temp = _.map(this.getSingersNodeByType(index), (node) => {
                if (this.hasChildren(node)) {
                    return this.getSingerInfo(node, index);
                }
            });
            if (temp) {
                singers = singers.concat(temp);
            }
        }
        return singers;
    }

    /** 1:male, 2:female, 3:group, 4:western, 5:eastern 6:all*/
    getSingersByType(type) {
        return _.map(this.getSingersNodeByType(type), (node) => {
            if (this.hasChildren(node)) {
                return this.getSingerInfo(node)
            }
        });
    }


    getSingersNodeByType(type) {
        /** 1:male, 2:female, 3:group, 4:western, 5:eastern 6:all*/
        const node = this.findNodeByAttribute(this.mAllSinger, {id: `singerlistf${type}`});
        return _.filter(node.children, (child) => {
            return this.hasChildren(child);
        });
    }

    getSingerInfo(node, type) {
        let info = {};
        if (this.hasChildren(node)) {
            const names = util.formalizeNamesToArray(this.getFlatTextByNode(node.children[1], false).trim());
            info = {
                type,
                name: names[0], /** '黃鴻升' */
                names, /** '黃鴻升','小鬼', '丸子三兄弟' */
                url: this.getNodeAttributeValue(this.findNodeByAttributeInSequence(node, {class: 'face'}), 'href'),
                popu_songs: this.getPopularSongs(this.findNodeByTagsInSequence(node, 'div')),
                imageUrl: this.getNodeAttributeValue(
                    this.findNodeByTagsInSequence(
                        this.findNodeByAttributeInSequence(node, {class: 'face'}), `img`)
                    , 'data-original'),
            }
        }
        return info;
    }

    getPopularSongs(node) {
        if (this.hasChildren(node)) {
            return _.map(node.children, (child) => {
                const name = this.getFlatTextByNode(child, false);
                const url = this.getNodeAttributeValue(child, 'href')
                return {name, url};
            })
        }

        return [];
    }
}

if (GlobalConfig.DEBUG_MODE) {
    const sa = new SingersAnalysis();
    console.log(util.getShuffledArrayWithLimitCount(sa.getAllSingers(), 10));
}

export default SingersAnalysis
