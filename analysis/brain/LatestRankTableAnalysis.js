import _ from "lodash";
import fs from "fs";
import Util from "../../Util";
import GlobalConfig from "../../GlobalConfig.js";
import RankTableAnalysis from "./RankTableAnalysis";


class LatestRankTableAnalysis extends RankTableAnalysis {

    getTableId() {
        return 'shbx_2_c';
    }

    getNextPageId() {
        return 'shbx_2_p';
    }

}

export default LatestRankTableAnalysis

if (GlobalConfig.DEBUG_MODE) {


}
