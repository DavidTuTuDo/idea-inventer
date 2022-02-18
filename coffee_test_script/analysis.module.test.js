import Analysis from '../pu91_scrapier/src/analysis/HtmlAnalysis'
import Index from "../configerer/release";
Index['DEBUG_MODE'] = true;
const analysis = new Analysis();

describe('findNodeByXXX testing', () => {

    test('findNodeByClasses', () => {
        const result = analysis.findNodeByClasses(analysis.body,
            "mainBody", "tone");
        expect(result.attributes.length).toBeGreaterThan(2);
    })

    test('findNodeByAttribute', () => {
        const result = analysis.findNodeByAttribute(analysis.body,
            {shape: 'C', shapes: 'add9'});
        expect(result.attributes.length).toBeGreaterThanOrEqual(2);
    })

    test('findNodeByAttributes', () => {
        const result = analysis.findNodeByAttributes(analysis.body,
            {id: 'tone_chord'}, {key: 'G'});
        expect(result.attributes.length).toBeGreaterThan(2);
    })

    test('findNodeByTagsInSequence', () => {
        const result = analysis.findNodeByTagsInSequence(analysis.body,
            'section',
            'div',
            'span');

        expect(result.tagName).toEqual('span');
    })

    test('findNodeByTagsInSequence', () => {
        const result = analysis.findNodeByAttributeInSequence(analysis.body,
            {class: 'window'}, {class: 'content2'}, {class: 'count'})
        jest.spyOn(analysis, 'findNodeByTagsInSequence')
        expect(result.tagName).toEqual('code')
    })

})

describe('transfer xml style words into flat words', () => {

    test('getFlatTextByNode', async () => {
        const result = analysis.getFlatTextByNode(
            analysis.findNodeByClass(analysis.getBody(), 'con'),
            true
        )
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(4);

    })

})
