import Index from "../configerer/release";
import ToneAnalysis from "../pu91_scrapier/src/analysis/ToneAnalysis";
import SingersAnalysis from "../pu91_scrapier/src/analysis/SingersAnalysis";
Index['DEBUG_MODE'] = true;
const singers = new SingersAnalysis();

describe("Singers Function Testing",() => {

    test('Get Singers Of The Page',() => {
        const result = singers.getAllSingers();
        expect(singers.getAllSingers().length).toBeGreaterThan(50);
    })

})
