const edit = true;

import BaseCelestialStore from "./BaseCelestialStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import { Application } from "../../";

class CelestialStore extends BaseCelestialStore {
    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        this.prepare();
        if (this.hasValidPiece() && Util.isUndefinedNullEmpty(this.getPieceOfHead().getImage())) {
            this.getPieceOfHead().setImage("images/image_default_celestial.png");
        }
    }

    prepare() {
        if (this.hasValidPiece()) this.setSrcOfPVoice(this.getPieceOfHead().getPathOfResource());
    }

    hasValidPiece() {
        return !Util.isUndefinedNullEmpty(this.getPieceOfHead());
    }

    isPiecePathValid() {
        if (this.hasValidPiece() && !Util.isUndefinedNullEmpty(this.getSrcOfPVoice())) {
            return true;
        }
        return false;
    }

    repeat = () => {
        const self = this;
        this.setSrcOfPVoice(undefined);
        Util.performActionWithoutTimingIssue(() => {
            self.prepare();
        }, 500);
    };

    /** -------------------- async api -------------------- **/
}

export default CelestialStore;
