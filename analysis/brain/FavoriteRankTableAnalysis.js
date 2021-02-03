import _ from "lodash";
import fs from "fs";
import Util from "../../Util";
import GlobalConfig from "../../GlobalConfig.js";
import RankTableAnalysis from "./RankTableAnalysis";


class FavoriteRankTableAnalysis extends RankTableAnalysis {

    getTableId() {
        return 'shbx_3_c';
    }

    getNextPageId() {
        return 'shbx_3_p';
    }

}

export default FavoriteRankTableAnalysis

if (GlobalConfig.DEBUG_MODE) {


}
