const edit = true;
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import { utiller as Util } from "utiller";

import Router from "../../router";
import PortfolioRhythmStore from "../../store/portfolioRhythm";

class MainComponent extends BaseMainComponent {
    constructor(props) {
        super(props);
    }

    onMainPromotedBannerImageImgClicked(param) {
        this.gotoUrlWithNewTab(param.object.route);
    }

    onMainHotRhythmCardClicked(param) {
        const song = param.object;
        Router.gotoSheetDetailPage(this, song.getIdOfGuitarPu());
    }

    onMainHotSingerCardClicked(param) {
        const singer = param.object;
        Router.gotoPortfolioPage(this, "list", singer.getIdOfSinger());
    }

    onMainInterestingOfFunctionPaperClicked(param) {
        const self = this;
        const func = param.object;
        switch (func.route) {
            case "randomRhythm":
                const rhythm = Util.getRandomItemOfArray(this.getKeywordSuggests().filter((each) => Util.isEqual(each.type, 11) && each.popularLevel > 10000));
                return Router.gotoSheetDetailPage(this, rhythm.uid);
            case "preludes":
                return Router.gotoPortfolioPage(this, "preludes", Util.getRandomHash(10));
            default:
                return this.exeAsyncT(this.gotoSingerRandomRhythm(func.getId()));
        }
    }

    gotoSingerRandomRhythm = async (id) => {
        const store = new PortfolioRhythmStore();
        const portfolio = await store.fetchPureRhythms(this, { type: "where", params: ["idOfSinger", "==", id] });
        const rhythm = Util.getRandomItemOfArray(portfolio);
        if (rhythm) Router.gotoSheetDetailPage(this, rhythm.idOfGuitarPu);
    };

    getInjectStyleOfMainTitleOfHotSingerTypography(main) {
        return Util.getVisibleOrNone(main.isInitialFetchCompleted());
    }

    getInjectStyleOfMainTitleOfHotRhythmTypography(main) {
        return Util.getVisibleOrNone(main.isInitialFetchCompleted());
    }
}

export default MainComponent;
