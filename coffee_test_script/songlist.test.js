import Index from "../configerer/release";
import SongListAnalysis from "../pu91_scrapier/src/analysis/SongListAnalysis";
Index['DEBUG_MODE'] = true;
const songlist = new SongListAnalysis();

describe("SongList Function Testing",() => {

    test('getAll',() => {
        const result = songlist.getAll();
        expect(result.length).toBeGreaterThan(4);
    })


    test('hasNextPage', () => {
        const result = songlist.hasNextPage();
        expect(result).toBeTruthy()
    })

    test('getNextPageSymbol', () => {
        const result = songlist.getNextPageButtonSymbol();
        expect(typeof result).toEqual('string');
    })

})
