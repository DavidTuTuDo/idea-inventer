import _ from "lodash";
import fs from "fs";
import {configer as Index} from "../../configer";
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

if (Index.DEBUG_MODE) {


}
