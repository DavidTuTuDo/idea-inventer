import {inject} from "mobx-react";
import BaseRhythmComponent from "./BaseRhythmComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Typography from "@material-ui/core/Typography";
import {observer} from "mobx-react";
import RhythmStore from "../../store/rhythm";
import Style from "../../style";
import MenuIcon from "@material-ui/icons/menu";
import React from "react";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

const RULE_OF_CHANGE_CHORD_SIGN = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab'];
const RULE_OF_CHANGE_CHORD_SIGN_ORDER_BY_LENGTH = _.orderBy(RULE_OF_CHANGE_CHORD_SIGN, (each) => _.size(each), 'desc')

/** order的目的是避免 [A]b => [Ab]b, 要以字數長的作為替換優先 */

@inject("rhythm")
@observer
class RhythmComponent extends BaseRhythmComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getGuitarpuContext(guitarpu) {
        const encrypt = super.getGuitarpuContext(guitarpu);
        const decrypt = Util.getDecryptString(encrypt);
        return decrypt;
    }

    getStringOfHidingChord(context) {
        const segments = _.split(context, '\n');
        _.remove(segments, (each) => this.isGuitarChordParagraph(each));
        return segments.join('\n');
    }

    /** 檢查這條訊息是吉他Chord*/
    isGuitarChordParagraph(string) {
        return _.size(Util.indexesOf(string, '|')) > 1
    }

    onRhythmGuitarpuPaperClicked(param) {
        this.getStore().toggleIsAdjustVisible();
    }

    onRhythmAdjustCenterSharpenButtonClicked(param) {
        this.invalidateTranspositionChord(true);
    }

    onRhythmAdjustCenterFlattenButtonClicked(param) {
        this.invalidateTranspositionChord(false);
    }

    invalidateTranspositionChord(sharpen = false) {

        /***
         * [A-G][b|#|?]
         * A -> Bb -> B -> C -> Db -> D -> Eb -> E -> F -> F# -> G -> Ab
         *
         * sharpen 就是升記號, 不然就是flatten
         */
        function getChordOfTransposition(chord, sharpen = true) {
            const indexOfCurrent = _.indexOf(RULE_OF_CHANGE_CHORD_SIGN, chord);
            const indexOfEndless = _.size(RULE_OF_CHANGE_CHORD_SIGN) - 1;
            let indexOfNext = sharpen ? indexOfCurrent + 1 : indexOfCurrent - 1;
            indexOfNext = indexOfNext > indexOfEndless ? 0 : indexOfNext;
            return _.nth(RULE_OF_CHANGE_CHORD_SIGN, indexOfNext);
        }

        function handleSlash(string) {
            const latest = []
            const segments = string.split('/');
            for (const segment of segments) {
                latest.push(transpositionParagraph(segment));
            }
            return latest.join('/');
        }

        function transpositionParagraph(string, sharpen) {
            let latest = string;
            for (const SIGN of RULE_OF_CHANGE_CHORD_SIGN_ORDER_BY_LENGTH) {
                if (Util.has(string, SIGN)) {
                    /** console.log(`${RULE_OF_CHANGE_CHORD_SIGN_ORDER_BY_LENGTH} , origin:${string}`, ` sign:${SIGN}, to:${getChordOfTransposition(SIGN, sharpen)}`); */
                    latest = Util.replaceAll(string, SIGN, getChordOfTransposition(SIGN, sharpen))
                    break;
                }
            }
            return latest;
        }

        const segmentsOfContext = this.getCurrentPuContext().split('\n');
        const segmentsOfContextChord = _.filter(segmentsOfContext, (each) => this.isGuitarChordParagraph(each));
        for (const segment of segmentsOfContextChord) {
            const segments = segment.split(' ');
            const latest = [];
            for (const segment of segments) {
                latest.push(Util.has(segment, '/') ? handleSlash(segment) : transpositionParagraph(segment));
            }
            /**  console.log(`from: ${segment}`, `to:${segmentOfTransposition}`);*/
            Util.replaceArrayByContentIndex(segmentsOfContext, segment, latest.join(' '));
        }
        const contextOfTransposition = segmentsOfContext.join('\n');
        this.updatePuContext(contextOfTransposition);
    }


    updatePuContext(latest) {
        const pu = _.head(this.getStore().getGuitarpus())
        pu.setContext(Util.getEncryptString(latest));
    }

    getCurrentPuContext() {
        return this.getGuitarpuContext(_.head(this.getStore().getGuitarpus()))
    }

    onRhythmAdjustCenterEnlargeButtonClicked(param) {
        this.adjustFontSizeByClassName('RhythmGuitarpuContextTypography');
    }

    onRhythmAdjustCenterShrinkButtonClicked(param) {
        this.adjustFontSizeByClassName('RhythmGuitarpuContextTypography', false);
    }

    onRhythmAdjustCenterIsHideChordSwitchChange(param) {
        super.onRhythmAdjustCenterIsHideChordSwitchChange(param);
    }


    /** -------------------- async api -------------------- **/
}

export default RhythmComponent;
