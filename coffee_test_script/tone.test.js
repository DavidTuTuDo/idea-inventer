import Index from "../configerer/release";
import ToneAnalysis from "../pu91_scrapier/src/analysis/ToneAnalysis";
Index['DEBUG_MODE'] = true;
const tone = new ToneAnalysis();

describe("Tone Function Testing",() => {

    test('Get Tone Of The Page',() => {
        const result = tone.getTone();
        expect(result.length).toBeGreaterThan(70);
    })

})
