const edit = true;
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
import MenuIcon from "@mui/icons-material/menu";
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

    constructor(props) {
        super(props);
    }

    onMainPromotedBannerImageImgClicked(param) {
        this.gotoUrlWithNewTab(param.object.route);
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
                this.gotoSingerRandomRhythm('9UHXP0nujftiTWTxGSva').then()
                break;
            case 'randomGEM':
                this.gotoSingerRandomRhythm('Y1SB30qmG7qvcYK7hOQg').then()
                break;
            case 'preludes':
                Router.gotoPortfolioPage(this, 'preludes', Util.getRandomHash(10))
                break;
            case 'randomMayday':
                this.gotoSingerRandomRhythm('Pn84Semny282MbWnKY2C').then()
                break;
            case 'randomLin':
                this.gotoSingerRandomRhythm('Urnw1dN0NGg2LB3zu1K4').then()
                break;
            case 'randomJay':
                this.gotoSingerRandomRhythm('QXodheBMMm97TZt7AlTY').then()
                break;
            case 'randomAlin':
                this.gotoSingerRandomRhythm('wRJ8dKprAu23D4o6y2ji').then()
                break;
            case 'randomFive':
                this.gotoSingerRandomRhythm('dWChuHedUIMm17qHuOkl').then()
                break;
            case 'randomMei':
                this.gotoSingerRandomRhythm('dTlaBS0zJ83Sgpoiewas').then()
                break;
            default:
                break
        }
    }

    gotoSingerRandomRhythm = async (id) => {
        const store = new PortfolioRhythmStore();
        const portfolio = await store.fetchPureRhythms(this,
            {type: 'where', params: ['idOfSinger', '==', id]})
        const rhythm = Util.getRandomItemOfArray(portfolio);
        if (rhythm)
            Router.gotoSheetDetailPage(this, rhythm.idOfGuitarPu);
    }

    /** -------------------- async api -------------------- **/
}

export default MainComponent;
