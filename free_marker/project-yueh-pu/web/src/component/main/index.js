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
import PortfolioRhythmStore from "../../store/portfolioRhythm";

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
        const self = this;
        const func = param.object;
        console.log(func.route);
        switch (func.route) {
            case 'randomRhythm':
                const rhythm = Util.getRandomItemOfArray(this.getKeywords().filter((each) => _.isEqual(each.type, 11) && each.popularLevel > 10000));
                Router.gotoSheetDetailPage(this, rhythm.uid);
                break;
            case 'randomEric':
                this.gotoSingerRandomRhythm('niyTvtrrHV4h22xjoJ96').then()
                break;
            case 'randomGEM':
                this.gotoSingerRandomRhythm('9kTdLItmUY231jq8QB33').then()
                break;
            default:
                break
        }
    }

    gotoSingerRandomRhythm = async (id) => {
        const store = new PortfolioRhythmStore();
        const portfolio = await store.fetchPureRhythms(this,
            {where: (stmt) => stmt.where('idOfSinger', '==', id)}
        )
        const rhythm = Util.getRandomItemOfArray(portfolio);
        if(rhythm)
            Router.gotoSheetDetailPage(this, rhythm.idOfGuitarPu);
    }

    /** -------------------- async api -------------------- **/
}

export default MainComponent;
