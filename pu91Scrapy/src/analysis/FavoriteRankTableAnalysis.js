import _ from "lodash";
import fs from "fs";
import Util from "utiller";
import RankTableAnalysis from "./RankTableAnalysis";
import Index from "../config";

class FavoriteRankTableAnalysis extends RankTableAnalysis {

    getTableId() {
        return 'shbx_3_c';
    }

    getNextPageId() {
        return 'shbx_3_p';
    }

}

export default FavoriteRankTableAnalysis

if (Index.DEBUG_MODE) {


}
