import {utiller as Util} from 'utiller'
import Index from "./config";

const info = Util.getFileContextInJSON(Index.PATH_DYNAMIC_INFO);
info.cancel = !info.cancel;
Util.writeFileInJSON(Index.PATH_DYNAMIC_INFO, info);
