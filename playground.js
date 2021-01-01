import fs from "fs";
import path from 'path';

class Playground {

    constructor() {
        console.log("i am playground constructor");
    }
}

// const pg = new Playground();
//  async function doingSt() {
//      console.log('hihi');
//  }
//
//
//  doingSt()


function david(params = []) {
    for (const i of params) {
        console.info(i);
    }
    console.log(arguments);
}

// _([1, 2, 3, 4, 5, 6, 7]);

const aaa = {aa: {a: 3}, bb: {cc: 5}};

function getKeys(parent, value) {
    for (let [_key, _value] of Object.entries(parent)) {
        if (value === _value) {
            console.log(_key);

        }
    }
}

const cachePath = path.join('cache', 'continued.txt');
if (fs.existsSync(cachePath)) {
    for(const a of [1,2,3,4,5,6,7])
    fs.appendFileSync(cachePath,`\n${a}`, (err) => {
        console.log('shit');
    })
} else {
    fs.writeFile(cachePath, "1", (err) => {
        console.log('shit');
    })
}

const array = fs.readFileSync(cachePath,'utf-8',(err) => {}).split('\n');
console.log(array);



