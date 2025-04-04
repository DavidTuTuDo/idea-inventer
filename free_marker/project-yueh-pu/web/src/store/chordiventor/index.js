const edit = true;

import BaseChordiventorStore from "./BaseChordiventorStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Config from '../../config';
import ApiOfGuitarPu from '../sheetGuitarpu';
import ApiOfRhythm from '../portfolioRhythm';
import UserInfo from '../../base/BaseUserInfo'

class ChordiventorStore extends BaseChordiventorStore {

    constructor(props) {
        super(props);
        this.apiOfPu = new ApiOfGuitarPu();
        this.apiOfRy = new ApiOfRhythm();
    }

    persistent = async () => {
        const content = this.getTxt();
        const cache = this.columnData();
        await this.submitChordiventor(this.getComponent(), this.columnData());
        return true;
    }

    loadLatestData = async () => {
        const singers = _.clone(this.getSingerSuggests())
        const content = await this.fetchChordiventor(this.getComponent());
        this.fromJson(content);
        this.initialSingerSuggestBehavior(singers)
        await Util.syncDelay(10);
        this.invalidate();
    }

    getCurrentEditedPu = () => {
        return this.getSheet().getCurrentPu();
    }

    cleanUp = () => {
        const singers = this.getSingerSuggests();
        this.clean();
        this.initialSingerSuggestBehavior(singers)
        this.getSheet().setState(`stable`);
        this.getSheet().pushGuitarpu({});
    }

    getTxtOfNormalize = () => {
        return this.getTxt().replaceAll(/[\｜|]/g, "།")
    }

    invalidate = (options = {cleanIdOfSinger: false}) => {
        this.invalidateSheetPage();
        this.getSheet().setState(`stable`);
        if (_.isEqual(options.cleanIdOfSinger, true)) {
            this.removeSinger();
            this.setIdOfSinger('');
        }
        const toneOfContext = this.getSelectedTonalityOfContext();
        const toneOfMale = this.getSelectedTonalityOfMale();
        const toneOfFemale = this.getSelectedTonalityOfFemale();
        const toneOfOriginal = this.getSelectedTonalityOfOriginal();
        const speed = this.getSpeed();
        const name = this.getName();
        const content = this.getTxtOfNormalize();
        const singer = this.getInputOfSinger()
        const pu = this.getCurrentEditedPu();
        const selected = this.getSinger();

        pu.setCurrentContext(content);
        pu.setOriginalContext(content)
        pu.setTonalityOfContext(toneOfContext)
        pu.setTonalityOfMale(toneOfMale)
        pu.setTonalityOfFemale(toneOfFemale)
        pu.setTonalityOfOriginal(toneOfOriginal);
        pu.setSpeed(speed);
        pu.setName(name);
        pu.setLatestContext(content);
        if (!Util.isUndefinedNullEmpty(selected)) {
            pu.setSinger(selected.label)
            pu.setIdOfSinger(selected.uid)
            this.setIdOfSinger(selected.uid)
        } else pu.setSinger(singer);
        this.invalidateOfCautions();
        this.getSheet().invalidate();
    }

    invalidateOfCautions() {
        const cautions = [];
        const pu = this.getCurrentEditedPu();
        const singer = pu.getSinger();
        if (_.size(this.getName()) < 1) cautions.push('曲名不能為空')
        if (_.size(singer) < 1) cautions.push('歌手不能為空')
        else if (_.size(singer) > 0 && _.isEmpty(this.getIdOfSinger())) cautions.push('不存在歌手相關資訊')

        if (_.size(cautions) > 0) this.setCaution(`✶✶提示：${cautions.join('、')}`);
        else this.setCaution('');

    }

    invalidateSheetPage = () => {
        if (_.size(this.getSheet().getGuitarpus()) < 1) {
            this.getSheet().setState(`stable`);
            this.getSheet().setGuitarpus({});
        }
    }

    async onInitialFetchBeginning() {
        this.invalidateSheetPage();
    }

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        const idOfGuitarPu = this.getParamOfIdOfGuitarPuInPath();
        if (_.size(idOfGuitarPu) > 4) {
            /** 從SHEET->編輯->來到這裡*/


            const pu = await this.apiOfPu.fetchGuitarpuItem(this.getComponent(), idOfGuitarPu);

            const conditionA = UserInfo.isAdminHelper();
            const conditionB = _.isEqual(pu.copyright, false) && _.isEqual(pu.idOfAuthor, UserInfo.getUid());

            if(conditionA || conditionB) {
                const txt = Util.getDecryptStringV2(pu.latestContext);
                pu.selectedTonalityOfFemale = pu.tonalityOfFemale;
                pu.selectedTonalityOfMale = pu.tonalityOfMale;
                pu.selectedTonalityOfContext = pu.tonalityOfContext;
                pu.selectedTonalityOfOriginal = pu.tonalityOfOriginal;
                pu.inputOfSinger = pu.singer;
                delete pu.tonalityOfFemale
                delete pu.tonalityOfMale
                delete pu.tonalityOfContext
                delete pu.tonalityOfOriginal
                this.fromJson({...pu, txt, idOfGuitarPu: pu.id});
                this.invalidate();
            } else this.getComponent().showWarningSnackMessage(`您沒有權限訪問此譜的編輯模式`)


        }
        return result;


    }

    constraint = () => {
        if (_.size(this.getTxt()) < 10 || this.getTxt() > 10000) return this.displayTipThenRefuse(`內文字數量異常，請檢查後再嘗試`);
        else if (_.size(this.getName()) < 1) return this.displayTipThenRefuse(`歌曲名稱不能為空`);
        else if (_.size(this.getCurrentEditedPu().getSinger()) < 1) return this.displayTipThenRefuse(`歌手名稱不能為空`);
        return true;
    }

    displayTipThenRefuse = (message) => {
        this.getComponent().showWarningSnackMessage(message);
        return false;
    }

    submitCustomPu = async () => {
        if (!this.constraint()) return;

        const spec = this.normalize(this.columnData());
        const content = this.getTxtOfNormalize();
        const normalize = {latestContext: Util.getEncryptStringV2(content), popularLevel: 10000, ...spec};
        let update = false;
        if (_.size(this.getIdOfGuitarPu()) > 3) {
            update = true;
            await this.apiOfPu.updateGuitarpuItem(this.getComponent(), normalize, this.getIdOfGuitarPu());
            try {
                await this.apiOfRy.updateRhythmItem(this.getComponent(), {
                    ...normalize,
                    composer: `詞：${spec.lyricist} 曲：${spec.composer}`
                }, this.getIdOfGuitarPu());
            }catch (error) {
                if(UserInfo.isAdmin()) this.displayTipThenRefuse(`UPDATE RHYTHM 錯誤，${error.message}`);
            }
        } else {
            const resultOfPu = await this.apiOfPu.submitGuitarpuItem(this.getComponent(),
                {
                    ...normalize,
                    idOfAuthor: UserInfo.getUid(),
                    copyright: false
                });
            const idOfGuitarPu = resultOfPu.value.id;
            const resultOfRhythm = await this.apiOfRy.submitRhythmItem(this.getComponent(), {
                ...normalize,
                idOfAuthor: UserInfo.getUid(),
                idOfGuitarPu,
                composer: `詞：${spec.lyricist} 曲：${spec.composer}`,
                copyright: false
            }, idOfGuitarPu);
            if (resultOfPu.succeed) this.setIdOfGuitarPu(idOfGuitarPu)
            return true;
        }
        this.getComponent().showSuccessSnackMessage(`已${update ? '更新' : '新增'}譜曲「${this.getName()}」`)
        return true;
    }

    normalize = (obj) => {
        const data = _.clone(obj);
        delete data.singer;
        delete data.tonalityOfContext;
        delete data.tonalityOfOriginal;
        delete data.tonalityOfFemale;
        delete data.tonalityOfMale;
        delete data.singerSuggests;
        data.tonalityOfOriginal = data.selectedTonalityOfOriginal;
        data.tonalityOfContext = data.selectedTonalityOfContext;
        data.tonalityOfFemale = data.selectedTonalityOfFemale;
        data.tonalityOfMale = data.selectedTonalityOfMale;
        data.singer = this.getCurrentEditedPu().getSinger();
        return data;
    }

}

export default ChordiventorStore;
