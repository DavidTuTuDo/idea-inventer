import {utiller as Util} from './utiller'
import {configer as Index} from "./configer";

const info = Util.getFileContextInJSON(Index.PATH_DYNAMIC_INFO);
info.cancel = !info.cancel;
Util.writeFileInJSON(Index.PATH_DYNAMIC_INFO, info);
