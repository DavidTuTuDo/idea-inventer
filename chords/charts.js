/*
 * Vex Guitar Chord Chart Renderer.
 * Mohit Muthanna Cheppudira -- http://0xfe.blogspot.com
 *
 * Requires: chord.js
 * Requires: Raphael JS (raphaeljs.com)
 */
var chord_chart = [
    { section: "Open Chords",
        description: "These chords are played in open position, and generally " +
            "include open strings.",
        chords: [
            {
                name: "C Major",
                chord: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 3]],
                position: 0,
                bars: []
            },
            {
                name: "D Major",
                chord: [[1, 2], [2, 3], [3, 2], [4, 0], [5, "x"], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "E Major",
                chord: [[1, 0], [2, 0], [3, 1], [4, 2], [5, 2], [6, 0]],
                position: 0,
                bars: []
            },
            {
                name: "G Major",
                chord: [[1, 3], [2, 3], [3, 0], [4, 0], [5, 2], [6, 3]],
                position: 0,
                bars: []
            },
            {
                name: "A Major",
                chord: [[1, 0], [2, 2], [3, 2], [4, 2], [5, 0], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "D Minor",
                chord: [[1, 1], [2, 3], [3, 2], [4, 0], [5, "x"], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "E Minor",
                chord: [[1, 0], [2, 0], [3, 0], [4, 2], [5, 2], [6, 0]],
                position: 0,
                bars: []
            },
            {
                name: "A Minor",
                chord: [[1, 0], [2, 1], [3, 2], [4, 2], [5, 0], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "C7",
                chord: [[1, 0], [2, 1], [3, 3], [4, 2], [5, 3], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "D7",
                chord: [[1, 2], [2, 1], [3, 2], [4, 0], [5, "x"], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "E7",
                chord: [[1, 0], [2, 3], [3, 1], [4, 0], [5, 2], [6, 0]],
                position: 0,
                bars: []
            },
            {
                name: "G7",
                chord: [[1, 1], [2, 0], [3, 0], [4, 0], [5, 2], [6, 3]],
                position: 0,
                bars: []
            },
            {
                name: "A7",
                chord: [[1, 0], [2, 2], [3, 0], [4, 2], [5, 0], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "Dm7",
                chord: [[1, 1], [2, 1], [3, 2], [4, 0], [5, "x"], [6, "x"]],
                position: 0,
                bars: []
            },
            {
                name: "Em7",
                chord: [[1, 0], [2, 3], [3, 0], [4, 2], [5, 2], [6, 0]],
                position: 0,
                bars: []
            },
            {
                name: "Am7",
                chord: [[1, 0], [2, 1], [3, 0], [4, 2], [5, 0], [6, "x"]],
                position: 0,
                bars: []
            },
        ]
    }
];

function createChordStruct(key, string, shape) {
    //alert("->"+key+","+string+","+shape+"<-");
    //var string = string.toUpperCase();
    //Util.appendInfo(">"+string+">"+positions[string]);
    var position;
    try{
        position= positions[string][key];
    }catch(e){
        position=0;
    }
    var struct = chord_shapes[shape];
    if(!struct){
        return null;
    }

    if(struct.hasOwnProperty("position_num")){
        position=struct.position_num;
    }

    var tuning=["E", "A", "D", "G", "B", "E"];
    if(struct.hasOwnProperty("tuning")){
        tuning=struct.tuning;
    }
    var _name=key + struct.name;
    if(_isGroupFlag(key[1])){
        _name=key[0]+struct.name;
    }
    return {
        name:_name,
        chord: struct.chord,
        position: position,
        position_text: struct.position_text,
        bars: struct.bars,
        tuning: tuning
    }
}

function _isGroupFlag(t2){
    return t2=="0"||t2=="2"||t2=="3"||t2=="4"||t2=="5"||t2=="8";
}

function createChordElement(chord_struct) {
    var chordbox = $('<div>').addClass('chord');
    var chordcanvas = $('<div>');
    var chordname = $('<div>').addClass('chordname');


    chordbox.append(chordname);
    chordbox.append(chordcanvas);
    chordname.append(chord_struct.name);

    var paper = Raphael(chordcanvas[0], 60, 60);
    var chord = new ChordBox(paper, 5,4, 50,60);

    chord.setChord(
        chord_struct.chord,
        chord_struct.position,
        chord_struct.bars,
        chord_struct.position_text,
        chord_struct.tuning);
    chord.draw();

    return chordbox;
}

function createSectionElement(section_struct) {
    var section = $('<div>').addClass('section');
    var section_title = $('<div>').addClass('title');
    var section_desc = $('<div>').addClass('description');

    //section.append(section_title);
    //section.append(section_desc);
    section_title.append(section_struct.section);
    section_desc.append(section_struct.description);

    return section;
}

function createShapeChart(keys, container, shapes, shape) {
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var section = createSectionElement({
            section: key + " Chords (" + shape + " Shape)",
            description: shape + "-Shaped barre chords in the key of " + key + "." });

        for (var j = 0; j < shapes.length; ++j) {
            var chord_elem = createChordElement(
                createChordStruct(key, shape, shapes[j]));
            section.append(chord_elem);
        }

        container.append(section);
    }
}

function createShapeChartSingle(keys, container, shapes, shape) {
    var _cc=createChordStruct(keys, shape, shapes);
    if(_cc){
        container.append(createChordElement(_cc));
        return true;
    }else{
        return false;
    }
}

function createUKCSingle(keys, container) {
    var _cc=ukuleleTables[keys];
    if(_cc){
        container.append(createUKCElement(_cc));
        return true;
    }else{
        return false;
    }
}
function createUKCElement(strs) {
    var csr=strs.split(" ");
    var chordbox = $('<div>').addClass('chord');
    var chordcanvas = $('<div>');
    var chordname = $('<div>').addClass('chordname');
    chordbox.append(chordname);
    chordbox.append(chordcanvas);
    chordname.append(csr[0]);
    var paper = Raphael(chordcanvas[0], 50, 60);
    var chord = new UKChordBox(paper,csr[1],csr[2],csr[3]);
    chord.draw();
    return chordbox;
}
