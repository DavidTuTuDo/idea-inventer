import _ from 'lodash';
import moment from 'moment';


// const current  = moment(_.now());
// console.log(current.toDate());
// current.add(31,'days');
// console.log(current.toDate());

const sss = true;
console.log(!!sss);
const a = {aa: 1, ab: {abc: 1, abd: 2}}
const b = {bb: 2, bc: {abc: 1, abd: 2}}
const c = {cc: 3, cd: {abc: 1, abd: 2}}
_.merge(a, b);
a.bc = {fuc:4,dac:3};

console.log(`a===> `, a);
console.log(`b===> `, b);


