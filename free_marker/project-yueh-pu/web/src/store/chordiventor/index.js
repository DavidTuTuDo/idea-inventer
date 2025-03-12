const edit = true;

import BaseChordiventorStore from "./BaseChordiventorStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";
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

    persistent = () => {
        const content = this.getTxt();
        const cache = this.columnData();
        delete cache.tonalityOfContext;
        delete cache.tonalityOfOriginal;
        delete cache.tonalityOfFemale;
        delete cache.tonalityOfMale;
        delete cache.singerSuggests;
        delete cache.singer;
        Cookie.setCustomOfToneTxt(content);
        Cookie.setCacheOfToneInfo(cache);
    }

    getCurrentEditedPu = () => {
        return this.getSheet().getCurrentPu();
    }

    cleanUp = () => {
        this.clean();
        Cookie.removeCustomOfToneTxt();
        Cookie.removeCacheOfToneInfo();
        this.getSheet().setState(`stable`);
        this.getSheet().pushGuitarpu({});
    }

    getTxtOfNormalize = () => {
        return this.getTxt().replaceAll(/[\｜|]/g, "།")
    }

    invalidate = () => {
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

        this.getSheet().invalidate();
    }

    async onInitialFetchBeginning() {
        this.getSheet().setState(`stable`);
        this.getSheet().pushGuitarpu({});
    }

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        const context = Cookie.getCustomOfToneTxt();
        this.setTxt(context);
        const cache = Cookie.getCacheOfToneInfo();
        this.fromJson(cache);
        this.invalidate();
        return result;
    }

    constraint = () => {
        if(_.size(this.getTxt()) < 10 || this.getTxt() > 10000) return this.displayTipThenRefuse(`內文字數量異常，請檢查後再嘗試`);
        else if (_.size(this.getName()) < 1) return this.displayTipThenRefuse(`歌曲名稱不能為空`);
        else if (_.size(this.getCurrentEditedPu().getSinger()) < 1) return this.displayTipThenRefuse(`歌手名稱不能為空`);
        return true;
    }

    displayTipThenRefuse = (message) => {
        this.getComponent().showWarningSnackMessage(message);
        return false;
    }

    submitCustomPu = async () => {
        if(!this.constraint()) return;

        const spec = this.normalize(this.columnData());
        const content = this.getTxtOfNormalize();
        const normalize = {latestContext: Util.getEncryptStringV2(content), popularLevel: 10000, ...spec};
        let update = false;
        if (_.size(this.getIdOfGuitarPu()) > 3) {
            update = true;
            await this.apiOfPu.updateGuitarpuItem(this.getComponent(), normalize, this.getIdOfGuitarPu());
            await this.apiOfRy.updateRhythmItem(this.getComponent(), {
                ...normalize,
                composer: `詞：${spec.lyricist} 曲：${spec.composer}`}, this.getIdOfGuitarPu());
        } else {
            const resultOfPu = await this.apiOfPu.submitGuitarpuItem(this.getComponent(), {...normalize, idOfAuthor: UserInfo.getUid(), copyright: false});
            const resultOfRhythm = await this.apiOfRy.submitRhythmItem(this.getComponent(), {
                ...normalize,
                idOfAuthor: UserInfo.getUid(),
                composer: `詞：${spec.lyricist} 曲：${spec.composer}`,
                copyright: false
            });
            if (resultOfPu.succeed) this.setIdOfGuitarPu(resultOfPu.value.id)
        }
        this.getComponent().showSuccessSnackMessage(`已${update ? '更新' : '新增'}譜曲「${this.getName()}」`)
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
