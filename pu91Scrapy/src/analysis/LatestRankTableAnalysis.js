import _ from "lodash";
import fs from "fs";
import RankTableAnalysis from "./RankTableAnalysis";
import Index from "../config";

class LatestRankTableAnalysis extends RankTableAnalysis {

    getTableId() {
        return 'shbx_2_c';
    }

    getNextPageId() {
        return 'shbx_2_p';
    }

}

export default LatestRankTableAnalysis

if (Index.DEBUG_MODE) {


}
