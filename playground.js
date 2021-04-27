import _ from 'lodash';

const array = [1, 2];
array.parent = {pp: 'pp'};
console.log(_.isArray(array));
console.log(array.length);

