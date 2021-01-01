import _ from "lodash";
import fs from "fs";
import HtmlAnalysis from "./HtmlAnalysis.js";
import GlobalConfig from "../../GlobalConfig.js";


class RankTableAnalysis extends HtmlAnalysis {

    constructor(raw) {
        super(raw);
    }

    getSongList() {
        const list = _.map(this.findNodeByAttribute(this.body,
            {'id': 'shbx_1_c'},
            'ul').children,
            (child) => this.getSongInfo(child)
        );
        return list;
    }

    getSampleConfig() {
        return {
            path: GlobalConfig.PATH_SAMPLE_URL_SONG_RANK,
            filename: GlobalConfig.SAMPLE_OBJECT_FILE_NAME_SONG_RANK,
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
        await _delay(GlobalConfig.DELAY_OF_MILLION_SECS);
        await page.click('span[sid="1"]');
        await _delay(GlobalConfig.DELAY_OF_MILLION_SECS);
        const content = await page.content();
        this.persistedUnderObjectFolder(config.filename, content);
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(`download ${config.filename} succeed`);
    }

}


export default RankTableAnalysis
