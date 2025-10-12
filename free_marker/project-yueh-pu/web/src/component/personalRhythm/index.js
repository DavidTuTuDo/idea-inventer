const edit = true;

import { inject } from "mobx-react";
import BasePersonalRhythmComponent from "./BasePersonalRhythmComponent";
import { utiller as Util } from "utiller";
import { observer } from "mobx-react";
import Router from "../../router";

class PersonalRhythmComponent extends BasePersonalRhythmComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onPersonalRhythmFavoritePuCardClicked(param) {
        const rhythm = param.object;
        Router.gotoSheetDetailPage(this.getComponentInstance(), rhythm.getIdOfGuitarPu());
    }

    getInjectStyleOfPersonalRhythmFavoritePuTitleTypography(favoritePu) {
        return Util.getVisibleOrNone(favoritePu.getNeedTitle());
    }

    onPersonalRhythmFavoritePuExtraIconButtonDeleteClicked(param) {
        const self = this;
        return async () => {
            const favoritePu = param.object;
            if (self.getStore().hasOnClickOfDeleteOfMenuItem()) await self.getStore().getOnClickOfDeleteOfMenuItem(favoritePu);
            else
                favoritePu.deleteFavoritePuItem(self).then((result) => {
                    this.showInfoSnackMessage(`已成功刪除「${favoritePu.name}」`);
                });
        };
    }

    /** -------------------- async api -------------------- **/
}

export default PersonalRhythmComponent;
