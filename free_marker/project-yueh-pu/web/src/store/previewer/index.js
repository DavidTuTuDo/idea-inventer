const edit = true;

import BasePreviewerStore from "./BasePreviewerStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";

class PreviewerStore extends BasePreviewerStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        this.getSheet().setState(`stable`);
        const context = Cookie.getCustomOfTone();
        this.getSheet().pushGuitarpu({currentContext: context, originalContext: context});
        this.invalidate();
        return result;
    }

    getCurrentEditedPu = () => {
        return this.getSheet().getCurrentPu();
    }

    invalidate = () => {
        const toneOfContext = this.getSelectedTonalityOfContext();
        const toneOfMale = this.getSelectedTonalityOfMale();
        const toneOfFemale = this.getSelectedTonalityOfFemale();
        const toneOfOriginal = this.getSelectedTonalityOfOriginal();
        const speed = this.getSpeed();
        const name = this.getName();
        const _console = {toneOfContext, toneOfMale, toneOfOriginal, toneOfFemale}

        const pu = this.getCurrentEditedPu();
        pu.setTonalityOfContext(toneOfContext)
        pu.setTonalityOfMale(toneOfMale)
        pu.setTonalityOfFemale(toneOfFemale)
        pu.setTonalityOfOriginal(toneOfOriginal);
        pu.setSpeed(speed);
        pu.setName(name);
        this.getSheet().invalidate();
    }

    /** -------------------- async api -------------------- **/
}

export default PreviewerStore;
