const edit = true;

import BaseCelestialStore from "./BaseCelestialStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction } from "mobx";
import BaseStore from "../../base/BaseStore";

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
