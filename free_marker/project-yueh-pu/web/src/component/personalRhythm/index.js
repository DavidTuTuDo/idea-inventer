import {inject} from "mobx-react";
import BasePersonalRhythmComponent from "./BasePersonalRhythmComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Typography from "@material-ui/core/Typography";
import Skeleton from "@material-ui/core/Skeleton";
import {observer} from "mobx-react";
import Card from "@material-ui/core/Card";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("personalRhythm")
@observer
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
            favoritePu.deleteFavoritePuItem(self).then((result) => {
                this.showInfoSnackMessage(`已成功刪除「${favoritePu.name}」`)
            })
        }
    }

    /** -------------------- async api -------------------- **/
}

export default PersonalRhythmComponent;
