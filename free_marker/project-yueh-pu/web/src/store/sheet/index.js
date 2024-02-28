import BaseSheetStore from "./BaseSheetStore";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import FavoritePu from "../personalRhythmFavoritePu";
import HistoryPu from '../historyRhythmPuOfRecord';
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";

const RULE_OF_CHANGE_CHORD_MAJOR_SIGN = [
    ['C'],
    ['Db', 'C#'],
    ['D'],
    ['Eb', 'D#'],
    ['E'],
    ['F'],
    ['F#', 'Gb'],
    ['G'],
    ['Ab', 'G#'],
    ['A'],
    ['Bb', 'A#'],
    ['B'],
];

const RULE_OF_CHANGE_CHORD_MINOR_SIGN_BACK_UP = [
    ['Am'],
    ['Bbm', 'A#m'],
    ['Bm'],
    ['Cm'],
    ['C#m', 'Dbm'],
    ['Dm'],
    ['Ebm', 'D#m'],
    ['Em'],
    ['Fm'],
    ['F#m', 'Gbm'],
    ['Gm'],
    ['G#m', 'Abm'],
];

const RULE_OF_CHANGE_CHORD_MINOR_SIGN = [
    ['Am'],
    ['Bbm', 'A#m'],
    ['Bm'],
    ['Cm'],
    ['C#m', 'Dbm'],
    ['Dm'],
    ['Ebm', 'D#m'],
    ['Em'],
    ['Fm'],
    ['F#m', 'Gbm'],
    ['Gm'],
    ['G#m', 'Abm'],
];

const RULE_OF_CHANGE_CHORD_WHOLE_SIGN = _.zip(RULE_OF_CHANGE_CHORD_MAJOR_SIGN, RULE_OF_CHANGE_CHORD_MINOR_SIGN).map((each) => _.flatten(each));
/**
 0: (3) ['A', 'F#m', 'Gbm']
 1: (3) ['Bb', 'A#', 'Gm']
 2: (3) ['B', 'G#m', 'Abm']
 */

const RULE_OF_CHANGE_CHORD_SIGN_ORDER_BY_STRING_LENGTH = _.orderBy(_.flatten(RULE_OF_CHANGE_CHORD_MAJOR_SIGN), (each) => _.size(each), 'desc')

/**
 * ['Bb', 'A#', 'Db', 'C#', 'Eb', 'D#', 'F#', 'Gb', 'Ab', 'G#', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
 *
 * order的目的是避免 [A]b => [Ab]b, 要以字數長的作為替換優先
 */

const SEPARATOR_OF_CHORD = '།';
const SEPARATOR_OF_TONALITY = '|';

class SheetStore extends BaseSheetStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfFavorite = new FavoritePu();
        this.apiOfHistory = new HistoryPu();
    }

    /** -------------------- async api -------------------- **/

    async fetch(view) {
        const result = await super.fetch(view);
        if (_.size(result.guitarpus) > 0) {
            const pu = result.guitarpus[0];
            await this.updateFavoriteToggleState(_.size(result.guitarpus) > 0 ? pu.id : '');
            await this.apiOfHistory.submitPuOfRecordItem(view, {
                idOfGuitarPu: pu.id,
                name: pu.name,
                singer: pu.singer,
            })
        }
        return result;
    }

    async updateFavoriteToggleState(idOfCurrentGuitarPu) {
        if (UserInfoRef.isLoginWithSucceed()) {
            this.getAdjustCenter().getJoinToFavorite().setToggle(!Util.isUndefinedNullEmpty(await this.getFavoritePuByIdOfGuitarPu(idOfCurrentGuitarPu)));
        }
    }

    async getFavoritePuByIdOfGuitarPu(idOfGuitarPu) {
        const items = await this.apiOfFavorite.fetchFavoritePus(this.getComponent(),
            UserInfoRef.getUid(), {where: (stmt) => stmt.where('idOfGuitarPu', '==', idOfGuitarPu)})
        return _.head(items);
    }

    async submitFavoritePuState(join = false) {
        if (UserInfoRef.isLoginWithSucceed()) {
            if (join) {
                await this.apiOfFavorite.submitFavoritePuItem(this.getComponent(), {
                    idOfGuitarPu: this.getCurrentPu().getId(),
                    name: this.getCurrentPu().getName(),
                    singer: this.getCurrentPu().getSinger(),
                });
            } else {
                const item = await this.getFavoritePuByIdOfGuitarPu(this.getCurrentPu().getId());
                if (item) {
                    console.log(item);
                    await this.apiOfFavorite.deleteFavoritePuItem(this.getComponent(), item.id);
                }

            }
        }
    }

    @action
    async onInitialFetchCompleted() {
        await super.onInitialFetchCompleted();

        if (!Util.isUndefinedNullEmpty(this.getCurrentPu())) {
            this.getCurrentPu().setSpeedOfRhythm(this.getCurrentPu().getSpeed())
            this.getCurrentPu().setOriginalContext(this.normalizePu(this.getCurrentPu().getOriginalContext(), true));
            this.getCurrentPu().setCurrentContext(this.normalizePu(this.getCurrentPu().getCurrentContext(), true));
            this.getAdjustCenter().setToFemaleTonality(`女建議${this.getStringOfSuggestDescription(this.getTonalityOfFemale())}`)
            this.getAdjustCenter().setToMaleTonality(`男建議${this.getStringOfSuggestDescription(this.getTonalityOfMale())}`)
            this.getAdjustCenter().setToOriginalTonality(`原${this.getStringOfSuggestDescription(this.getTonalityOfOriginal())}`)
            this.getComponent().showInfoSnackMessage(`${this.getCurrentPu().getSinger()}:${this.getCurrentPu().getName()}`)
            this.setNameOfSongAndSinger(`${this.getCurrentPu().getSinger()}:${this.getCurrentPu().getName()}`)
        }
    }

    getStringOfSuggestDescription(tone) {
        const result = this.getSuggestTonalityCapoLevel(tone);
        return ` ${result.from} 調\n(彈${result.to} 夾${result.level}格)`
    }

    getTonalityOfFemale() {
        return this.normalizeTonality(this.getCurrentPu().getTonalityOfFemale())
    }

    getTonalityOfMale() {
        return this.normalizeTonality(this.getCurrentPu().getTonalityOfMale())
    }

    getTonalityOfOriginal() {
        return this.normalizeTonality(this.getCurrentPu().getTonalityOfOriginal())
    }

    getTonalityOfContext() {
        return this.normalizeTonality(this.getCurrentPu().getTonalityOfContext())
    }

    normalizeTonality(string) {
        return string.split(SEPARATOR_OF_TONALITY).shift();
    }


    getAdjustCenter() {
        return this.getAdjust().getCenter()
    }

    @action
    invalidateTranspositionChord(level = 1, context = this.getCurrentPuContext()) {
        const segmentsOfContext = context.split('\n');
        const segmentsOfContextChord = _.filter(segmentsOfContext, (each) => this.isGuitarChordParagraph(each));
        for (const segment of segmentsOfContextChord) {
            Util.replaceArrayByContentIndex(segmentsOfContext, segment, this.getStringOfTranspositionBySigns(segment, level, [' ', '/']));
        }
        const contextOfTransposition = segmentsOfContext.join('\n');
        this.updatePuContext(contextOfTransposition);
    }

    updatePuContext(latest) {
        const normalize = this.normalizePu(latest);
        this.getCurrentPu().setCurrentContext(normalize);
    }

    normalizePu(context, decrypt = false) {
        if (decrypt)
            context = Util.getDecryptString(context);
        let segments = context.split('\n');
        segments = _.dropWhile(segments, (each) => Util.isUndefinedNullEmpty(_.trim(each)));
        segments = _.dropRightWhile(segments, (each) => Util.isUndefinedNullEmpty(_.trim(each)));
        return segments.join('\n');
    }

    getCurrentPuContext() {
        return this.getCurrentPu().getCurrentContext();
    }

    getOriginalPuContext() {
        return this.getCurrentPu().getOriginalContext();
    }

    getCurrentPu() {
        return _.head(this.getGuitarpus()) ?? {};
    }

    setVisibleOfChordInContext(hide = false) {
        function getStringOfRemoveChordsAndSeparator(paragraph) {
            const after = Util.replaceAllWithSets(paragraph, {from: SEPARATOR_OF_CHORD, to: ' '}, {
                from: '－',
                to: ' '
            }, {from: '-', to: ' '});
            const reg = new RegExp(`^[A-G]`, 'g');
            return Util.getStringHandledByEachLine(after,
                (segment, index, segments) => {
                    if (reg.test(_.trim(segment))) {
                        Util.replaceArrayByContentIndex(segments, segment, '');
                    }
                },
                ' ',
            );
        }

        const segments = this.getOriginalPuContext().split('\n');
        if (hide) {
            for (const segment of segments) {
                if (this.isGuitarChordParagraph(segment))
                    Util.replaceArrayByContentIndex(segments, segment, getStringOfRemoveChordsAndSeparator(segment));
            }
        }
        this.updatePuContext(segments.join('\n'));
    }

    transpositionByGender(gender) {
        let tone = '';
        switch (gender) {
            case 'male':
                tone = this.getTonalityOfMale();
                break;
            case 'female':
                tone = this.getTonalityOfFemale()
                break
            case 'original':
                tone = this.getTonalityOfOriginal();
                break;
        }

        const suggest = this.getSuggestTonalityCapoLevel(this.normalizeTonality(tone));
        const tonalityOfDestination = suggest.to;
        const tonalityOfContext = this.normalizeTonality(this.getTonalityOfContext());
        const level = this.getLevelOfBetweenChords(tonalityOfContext, tonalityOfDestination);
        this.invalidateTranspositionChord(level, this.getOriginalPuContext());
    }


    /** -------------------- 以下為弦轉換相關的邏輯 最好放到utiller裏面 -------------------- **/
    /***
     * [A-G][b|#|?]
     * A -> Bb -> B -> C -> Db -> D -> Eb -> E -> F -> F# -> G -> Ab
     *
     * level:  -2 ==> 降兩個半音,  3 ==> 增加3個半音
     */
    getChordOfTransposition(chord, level) {
        const indexOfCurrent = this.getIndexOfChordLevel(chord);
        let indexOfNext = _.sum([indexOfCurrent, level]);
        return _.head(Util.nth(RULE_OF_CHANGE_CHORD_MAJOR_SIGN, indexOfNext));
    }

    transpositionParagraph(paragraph, level) {
        let latest = paragraph;
        for (const SIGN of RULE_OF_CHANGE_CHORD_SIGN_ORDER_BY_STRING_LENGTH) {
            if (Util.has(paragraph, SIGN)) {
                /** console.log(`${RULE_OF_CHANGE_CHORD_SIGN_ORDER_BY_LENGTH} , origin:${string}`, ` sign:${SIGN}, to:${getChordOfTransposition(SIGN, sharpen)}`); */
                latest = Util.replaceAll(paragraph, SIGN, this.getChordOfTransposition(SIGN, level))
                break;
            }
        }
        return latest;
    }

    /** 取得'C','C#','Abm','Em'... 的index */
    getIndexOfChordLevel(chord = 'C') {
        for (const compound of RULE_OF_CHANGE_CHORD_WHOLE_SIGN) {
            if (Util.containsBy(compound, chord)) {
                return _.indexOf(RULE_OF_CHANGE_CHORD_WHOLE_SIGN, compound)
            }
        }
        Util.appendError(`878415451 ${chord} is not handled`);
        throw new Error(9999, `878415451 ${chord} is not handled`);
    }

    /** 看兩個和弦差了幾個半音, 有可能是負值,
     *
     * sample: [D,C] ==> -2
     * sample: [C,D] ==> 2
     * sample: [Am,Bbm] ==> 1
     * sample: [C,E#] ==> 4
     * */
    getLevelOfBetweenChords(...chords) {
        const orders = chords.map((chord) => this.getIndexOfChordLevel(chord));
        return orders.pop() - orders.shift();
    }

    /**
     * 因為Eb調不好壓和弦, 會改成C調夾5格
     * 因為Dbm調不好壓, 會改成 Am調夾4格
     *
     * @param tonality tonalityOfFrom
     * @returns {from: 'Gm', to: 'Em', level: 3}
     */

    getSuggestTonalityCapoLevel(tonality) {
        const isMinerTonality = Util.has(tonality, 'm');
        const suggestTonality = isMinerTonality ? ['Am', 'Em'] : ['C', 'G'];
        const resultOfSuggest = _.orderBy(suggestTonality.map((each) => {
            return {from: tonality, to: each, level: this.getLevelOfBetweenChords(each, tonality)}
        }), (each) => each.level, 'desc');
        return _.last(resultOfSuggest).level >= 0 ? _.last(resultOfSuggest) : _.head(resultOfSuggest);
    }

    /**
     * 把一段文字用遞迴完成換功能
     *  from:|C                           G/B                      |Am7                 Am7/G    |
     *  to:|Db                           Ab/C                      |Bbm7                 Bbm7/Ab    |
     * @param string
     * @param level 半音的階級
     * @param signs 用來遞迴切割string
     * @returns {string}
     */
    getStringOfTranspositionBySigns(string, level, signs) {
        const latest = []
        let currentSign;
        const result = Util.getStateOfStringContainsSign(string, ...signs);
        if (result.exists) {
            currentSign = result.sign;
            latest.push(...string.split(currentSign).map((segment) => this.getStringOfTranspositionBySigns(segment, level, signs)));
        } else {
            latest.push(this.transpositionParagraph(string, level));
        }
        return latest.join(currentSign)
    }

    /** 檢查這條訊息是吉他Chord*/
    isGuitarChordParagraph(string) {
        return _.size(Util.indexesOf(string, SEPARATOR_OF_CHORD)) > 1
    }
}

export default SheetStore;
