import HtmlAnalysis from "./HtmlAnalysis.js";
import Index from "../config";
import _ from "lodash";
import {utiller as util} from 'utiller';

import fs from "fs";


class SongListAnalysis extends HtmlAnalysis {

    constructor(raw) {
        super(raw);
        this.list = this.findNodeByAttribute(this.body, {id: 'songlist'}, 'tbody');
        this.totalPage = this.getTotalPage();
    }

    getTotalPage() {
        const mPageNode = this.findNodeByClasses(this.body, 'mainBody', 'page');
        if (!this.hasChildren(mPageNode)) {
            return -1;
        } else
            return _.filter(mPageNode.children,(child) => this.hasChildren(child)).length - 2;
    }


    getSampleConfig() {
        return {
            path: Index.PATH_SAMPLE_URL_SONG_LIST,
            filename: Index.SAMPLE_FILE_NAME_SONG_LIST,
        }
    }

    getSongInfo(node) {
        if (!this.isNode(node))
            return {};

        const song = {
            name: this.getFlatTextByNode(this.findNodeByClass(node, 'sname'), false),
            url: this.getNodeAttributeValue(this.findNodeByClass(node, 'sname'), 'href'),
            lyricist: this.getFlatTextByChildIndex(node, 1),
            composer: this.getFlatTextByChildIndex(node, 2),
            popularLevel: util.getValueWithIntegerType(this.getFlatTextByChildIndex(node, 3)),
            createTime: this.getFlatTextByChildIndex(node, 4),
        };
        return song;
    }


    getAll() {
        if (this.hasChildren(this.list)) {
            return _.map(this.list.children, (child) => this.getSongInfo(child));
        }
        return {};
    }


    getFlatTextByChildIndex(node, index, needNewline) {
        if (needNewline === undefined)
            needNewline = false;
        return this.getFlatTextByNode(this.getChildNodeByIndex(node, index), needNewline)
    }

    hasNextPage() {
        const node = this.findNodeByClasses(this.body, 'mainBody', 'page', 'now');
        const currentPageInt = Number(this.getFlatTextByNode(node, false));
        return this.totalPage > currentPageInt;
    }


    getNextPageButtonSymbol() {
        const node = this.findNodeByClasses(this.body, 'mainBody', 'page', 'now');
        if (!this.isNode(node)) return "";
        const currentPageInt = Number(this.getFlatTextByNode(node, false));
        return `${node.tagName}[href="javascript:toPage(${currentPageInt + 1})"]`;
    }


}

export default SongListAnalysis;
