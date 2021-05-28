import _ from 'lodash';



function printDefault(p1,custom_Default = 123){
    console.log(custom_Default)
}
function middleware(p1,third_default = undefined){
    printDefault(p1,undefined);
}
middleware(12)



