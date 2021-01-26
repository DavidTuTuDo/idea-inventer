import GlobalConfig from "../GlobalConfig";
import Util from '../util';

export default class MyException extends Error {

    static msg(msg) {
        return JSON.stringify(msg);
    }

    constructor(code, error, selfInfo) {
        super(error);
        this.uid = Util.getRandomValue(0, 100000000000);
        this.code = code;
        this.error = error;
        this.selfInfo = selfInfo;
        this.errorMsg = JSON.stringify(error);

        {
            if (error.message) {
                this.errorMsg = `${error.message}, ORIGIN_ERROR:${JSON.stringify(error)}`;
            } else if (error.msg) {
                this.errorMsg = `${error.msg}, ORIGIN_ERROR:${JSON.stringify(error)}`;
            }
        }
        this.logger = `UID:${this.uid} CODE:${this.code} REASON:${this.errorMsg} INFO:${this.selfInfo}`;

        if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
            Util.appendInfo(this.log);

        if (GlobalConfig.PERSIST_ERROR_LOG)
            this.persist();
    }

    persist() {
        Util.appendFile(GlobalConfig.PATH_ERROR_LOG, this.logger);
    }


}
