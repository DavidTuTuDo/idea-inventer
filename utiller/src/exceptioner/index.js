import {configer as GlobalConfig} from 'configer';
import {utiller as Util} from '../index';
import ERRORs from './ERRORs';

export default class MyException extends Error {

    static msg(msg) {
        return JSON.stringify(msg);
    }

    getErrorCode() {
        return this.code;
    }

    isConstraintError() {
        return (this.message && this.message.indexOf(`SQLITE_CONSTRAINT`) > 0);
    }

    constructor(code, ...infos) {
        const error = ERRORs[code];
        if (error === undefined) {
            throw new MyException(9999, `code ''${code}'' is not define in ERRORs.js`);
        }
        super(`${error.message}`);
        this.uid = Util.getRandomValue(0, 100000000000);
        this.code = code;
        this.infos = '';
        this._msg = error.message;

        for (const info of infos) {
            if (info !== undefined)
                this.infos += ('##') + ' ' + Util.getAttrValueInSequence(info, 'message', 'msg');
        }

        this.message = `UID:${this.uid}  CODE:${this.code}  REASON:${this._msg}  INFO:${this.infos}`;

        if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
            Util.appendError(this.message);

    }


}
