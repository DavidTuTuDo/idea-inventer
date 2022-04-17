import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import MainStore from "../../store/main";
import Style from "../../style";
import MenuIcon from "@material-ui/icons/menu";
import React from "react";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }


    onMainHotRhythmCardClicked(param) {
        const song = param.object;
        Router.gotoSheetDetailPage(this, song.getIdOfGuitarPu())
    }

    onMainHotSingerCardClicked(param) {
        const singer = param.object;
        Router.gotoPortfolioPage(this, 'list', singer.getIdOfSinger())
    }

    onMainInterestingOfFunctionPaperClicked(param) {
        const func = param.object;
        console.log(func.route);
        switch (func.route) {
            case 'randomRhythm':
                const rhythm = Util.getRandomItemOfArray(this.getKeywords().filter((each) => _.isEqual(each.type,11) && each.popularLevel > 10000));
                Router.gotoSheetDetailPage(this, rhythm.uid);
                break;
            default:
                break
        }
    }

    /** -------------------- async api -------------------- **/
}

export default MainComponent;
