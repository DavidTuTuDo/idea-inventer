import {utiller as Util} from 'utiller'
import Index from "./config";

const info = Util.getFileContextInJSON(Index.PATH_DYNAMIC_INFO);
console.log(`before:`,info);


info.cancel = !info.cancel;
Util.writeFileInJSON(Index.PATH_DYNAMIC_INFO, info);
console.log(`after read:`,Util.getFileContextInJSON(Index.PATH_DYNAMIC_INFO));
