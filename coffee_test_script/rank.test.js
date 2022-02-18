import RankTableAnalysis from "../pu91_scrapier/src/analysis/RankTableAnalysis";
import Index from "../configerer/release";
Index['DEBUG_MODE'] = true;
const rank = new RankTableAnalysis();
describe("Rank function testing",() => {

    test('getSongList',() => {
        const result = rank.getSongList();
        expect(result.length).toBeGreaterThan(20);

    })

})
