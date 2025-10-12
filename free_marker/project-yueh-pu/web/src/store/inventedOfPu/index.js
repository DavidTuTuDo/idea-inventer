const edit = true;

import BaseInventedOfPuStore from "./BaseInventedOfPuStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import UserInfoRef from "../../base/BaseUserInfo";
import GuitarPuApi from "../sheetGuitarpu";
import ApiOfRhythm from "../portfolioRhythm";

class InventedOfPuStore extends BaseInventedOfPuStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfGuitarPu = new GuitarPuApi();
        this.apiOfRy = new ApiOfRhythm();
    }

    onInitialFetchBeginning = async () => {
        const self = this;
        this.getPersonalRhythm().getComponent(true).setEnableInitFetch(false);
        this.getPersonalRhythm().enableManual();
        this.getPersonalRhythm().setState(`loading`);
        this.getPersonalRhythm().setOnClickOfDeleteMenuItem(async (pu) => {
            await self.apiOfGuitarPu.deleteGuitarpuItem(self.getComponent(), pu.getIdOfGuitarPu());
            await self.apiOfRy.deleteRhythmItem(self.getComponent(), pu.getIdOfGuitarPu());
            pu.remove();
        });
    };

    async onInitialFetchCompleted(collection) {
        const result = await super.onInitialFetchCompleted(collection);
        const items = await this.apiOfGuitarPu.fetchGuitarpus(this.getComponent(), { type: "where", params: ["idOfAuthor", "==", UserInfoRef.getUid()] });
        this.getPersonalRhythm().setFavoritePus(
            ...items.map((pu) => {
                return { ...pu, idOfGuitarPu: pu.id, needTitle: true, title: Util.getCurrentTimeFormatYMDHM(this.normalizeTimestamp(pu.updateTime)) };
            })
        );
        this.getPersonalRhythm().setState(`stable`);
        return result;
    }

    /** -------------------- async api -------------------- **/
}

export default InventedOfPuStore;
