import Util from './util'
import GlobalConfig from "./GlobalConfig";

const info = Util.readFileInJSON(GlobalConfig.PATH_DYNAMIC_INFO);
info.cancel = !info.cancel;
Util.writeFileInJSON(GlobalConfig.PATH_DYNAMIC_INFO, info);
