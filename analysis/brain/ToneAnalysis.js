import _ from "lodash";
import fs from "fs";
import HtmlAnalysis from "./HtmlAnalysis.js";
import GlobalConfig from "../../GlobalConfig.js";
import path from 'path';
import Util from '../../util';

class ToneAnalysis extends HtmlAnalysis {

    constructor(raw) {
        super(raw);
        this.showToneInfo = this.findNodeByClass(this.body, 'showToneInfo');
        this.mAuthorAndComposer = this.findNodeByClass(this.showToneInfo, 'con');

    }

    getSampleConfig() {
        return {
            path: GlobalConfig.PATH_SAMPLE_URL_TONE,
            filename: GlobalConfig.SAMPLE_OBJECT_FILE_NAME_TONE,
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
        const toNumber = _.toNumber(normalize);
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
        const tonePath = path.join(GlobalConfig.TONES_ROOT, this.getSingers()[0]);
        if (!fs.existsSync(tonePath)) fs.mkdirSync(tonePath);
        /** get all tone under this singer */

        fs.writeFile(`${path.join(tonePath,
            _.trim(this.getTitle()))}.txt`,
            this.printAll(), (err) => {
                if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
                    console.log(`error: ${err}`)
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

        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(whole);

        return whole;
    }

    getNormalizeToneObject() {
        const singers  = this.getSingers();
        return {
            name: this.getTitle(),
            singers,
            singer:singers[0],
            clickedCountOfWhole: this.getClickedCountOfWhole(),
            tone: this.getEncryptedToneTexts(),
            capoLevel: this.getCapoLevel(),
            composer: this.getComposer(),
            tkInfo: this.getTkInfo(),
            sfzf: this.getSfzf()
        }
    }

}

if (GlobalConfig.DEBUG_MODE) {
    const tone = new ToneAnalysis();
    // tone.printAll();
    tone.downloadFile();
    console.log(JSON.stringify(tone.getNormalizeToneObject()))
}

export default ToneAnalysis;
