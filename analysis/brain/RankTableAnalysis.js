import _ from "lodash";
import fs from "fs";
import Util from "../../utiller";
import HtmlAnalysis from "./HtmlAnalysis.js";
import {configer as Index} from "../../configer";


class RankTableAnalysis extends HtmlAnalysis {

    getTableId() {
        return 'shbx_1_c';
    }

    getNextPageId() {
        return 'shbx_1_p'
    }

    constructor(raw) {
        super(raw);
    }

    getSongList() {
        const list = _.map(this.findNodeByAttribute(this.body,
            {'id': this.getTableId()},
            'ul').children,
            (child) => this.getSongInfo(child)
        );
        return list;
    }

    getSampleConfig() {
        return {
            path: Index.PATH_SAMPLE_URL_SONG_RANK,
            filename: Index.SAMPLE_FILE_NAME_SONG_RANK,
        }
    }

    getSongInfo(node) {

        const code = this.findNodeByTag(node, 'code');
        /** 名次 */
        const abbr = this.findNodeByTag(node, 'abbr');
        /** url, 歌名 */
        const div = this.findNodeByTag(node, 'div');

        const obj = {
            rank: this.getFlatTextByNode(code, false),
            name: this.getFlatTextByNode(this.findNodeByTagsInSequence(abbr, "a"), false),
            url: this.getNodeAttributeValue(this.findNodeByTagsInSequence(abbr, "a"), 'href'),
            singer: {
                img: this.getNodeAttributeValue(this.findNodeByTagsInSequence(div, "span", "img"), "src"),
                name: this.getFlatTextByNode(this.findNodeByTagsInSequence(div, "span", "a"), false),
                pageUrl: this.getNodeAttributeValue(this.findNodeByTagsInSequence(div, "span", "a"), "href")
            }
        };
        return obj;
    }

    async downloadSample(page, _delay) {
        const config = this.getSampleConfig();
        await page.goto(config.path,
            {waitUntil: 'networkidle2'}
        );
        await _delay(Index.HACK_DELAY_OF_MILLION_SECS);
        await page.click('span[sid="1"]');
        await _delay(Index.HACK_DELAY_OF_MILLION_SECS);
        const content = await page.content();
        this.persistedUnderObjectFolder(config.filename, content);
        if (Index.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`download ${config.filename} succeed`);
    }

    hasNextPage() {
        const node = this.findNodeByAttributes(this.body, {'class': 'page', id: this.getNextPageId()});
        if (this.hasChildren(node)) {
            const labels = node.children.map((child) => this.getFlatTextByNode(child, false))
            return _.find(labels, (label) => label.indexOf('下一頁') >= 0);
        }
        return false;
    }

    // a[onClick="loadWS0(${_page});"]
    getNextPageSymbol() {
        const node = this.findNodeByAttributes(this.body, {'class': 'page', id: this.getNextPageId()});
        if (this.hasChildren(node)) {
            const currentPageNodeIndex = _.findIndex(node.children, (child) => {
                return this.isContainAttribute(child, {'class': 'now'})
            });

            const nextNode = node.children[currentPageNodeIndex + 1];
            const symbol = `${nextNode.tagName}[onclick="${this.getNodeAttributeValue(nextNode, 'onclick')}"]`;
            return symbol;
        }
        return 'no,no,no';
    }
}


export default RankTableAnalysis

if (Index.DEBUG_MODE) {


}
