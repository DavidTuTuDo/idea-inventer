import _ from "lodash";
import fs from "fs";
import HtmlAnalysis from "./HtmlAnalysis.js";
import path from 'path';
import {utiller as Util} from '../../utiller';
import {configer as Index} from "../../configer";

class ToneAnalysis extends HtmlAnalysis {

    constructor(raw) {
        super(raw);
        this.showToneInfo = this.findNodeByClass(this.body, 'showToneInfo');
        this.mAuthorAndComposer = this.findNodeByClass(this.showToneInfo, 'con');

    }

    getSampleConfig() {
        return {
            path: Index.PATH_SAMPLE_URL_TONE,
            filename: Index.SAMPLE_FILE_NAME_TONE,
        }
    }

    getTitle() {
        const title = _.trim(
            this.getFlatTextByNode(this.findNodeByAttribute(this.showToneInfo,
                {
                    'id': 'mtitle'
                }
            )));
        return Util.getFirebaseFormattedString(title);
    }

    getEncryptedToneTexts() {
        return Util.getEncryptString(this.getTone());
    }

    getTone() {
        return this.getFlatTextByNode(
            this.findNodeByClass(this.showToneInfo, 'tone'));
    }

    getComposer() {
        return this.getFlatTextByNode(this.getChildNodeByIndex(this.mAuthorAndComposer, 1)).trim()
    }

    getSingers() {
        let singerString = this.getFlatTextByNode(
            this.getChildNodeByIndex(this.mAuthorAndComposer, 0), false);

        /** avoid this situation, '演唱：'陳勢安 */
        singerString = singerString.substring(3).trim();
        return Util.formalizeNamesToArray(singerString);
    }

    getClickedCountOfWhole() {
        const stringOfCount = this.getFlatTextByNode(this.findNodeByClass(this.body, 'qrcode'), false).trim();
        const normalize = _.replace(stringOfCount, /,/g, '');
        const toNumber = Util.getValueWithIntegerType(normalize);
        return toNumber;
    }


    /** 原調：Bb速度：68 男調：A女調：E */
    getTkInfo() {
        return this.getFlatTextByNode(
            this.findNodeByClassInSequence(this.showToneInfo, 'tkinfo')).trim();
    }

    /** 参考刷法：X ↑--↓ -↓↑↓ ↑-↑↓参考指法：T1 21 31 21" */
    getSfzf() {
        return this.getFlatTextByNode(
            this.findNodeByClassInSequence(this.showToneInfo, 'sfzf')).trim();
    }

    downloadFile() {
        const tonePath = path.join(Index.TONES_ROOT, this.getSingers()[0]);
        if (!fs.existsSync(tonePath)) fs.mkdirSync(tonePath);
        /** stmt all tone under this singer */

        fs.writeFile(`${path.join(tonePath,
            _.trim(this.getTitle()))}.txt`,
            this.printAll(), (err) => {
                if (Index.MODULE_MSG.SHOW_ERROR && !_.isNull(err))
                    Util.appendInfo(`error: ${err.message}`)
            });
    }

    getCapoLevel() {
        const result = this.getFlatTextByNode(
            this.findNodeByClasses(this.body, 'capo', 'select'), false);
        return result.trim();
    }

    printAll() {
        const encrypt = this.getEncryptedToneTexts();
        const decrypt = Util.getDecryptString(encrypt);
        const whole = this.getTitle() + '\n\n' +
            '點擊數: ' + this.getClickedCountOfWhole() + '\n\n' +
            this.getComposer() + '\n\n' +
            this.getSingers() + '\n\n' +
            encrypt + '\n\n' +
            this.getTkInfo() + '\n\n' +
            this.getSfzf() + '\n\n' +
            this.getCapoLevel() + '\n\n' +
            decrypt + '\n\n';

        if (Index.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo('TONE:'+whole);

        return whole;
    }

    getNormalizeToneObject() {
        const singers = this.getSingers();
        return {
            name: this.getTitle(),
            singers,
            singer: singers[0],
            popularLevel: this.getClickedCountOfWhole(),
            tone: this.getEncryptedToneTexts(),
            capoLevel: this.getCapoLevel(),
            composer: this.getComposer(),
            tkInfo: this.getTkInfo(),
            sfzf: this.getSfzf(),
            updateTime: _.now(),
        }
    }

}

if (Index.DEBUG_MODE) {
    const tone = new ToneAnalysis();
    // tone.printAll();
    tone.downloadFile();
    Util.appendInfo(JSON.stringify(tone.getNormalizeToneObject()))
}

export default ToneAnalysis;
