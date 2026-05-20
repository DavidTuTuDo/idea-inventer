import {configerer as GlobalConfig} from 'configerer';
import ERRORs from './ERRORs';
import {utiller as Util} from '../index.js';

class MyException extends Error {

    constructor(code, ...infos) {
        const error = ERRORs[code];
        if (error === undefined) {
            throw new MyException(9999, `code ''${code}'' is not define in ERRORs.js`);
        }
        super(`${error.message}`);
        this.uid = Util === undefined ? '777Debug777' : Util.getRandomValue(0, 100000000000);
        this.code = code;
        this.infos = '';
        this._msg = error.message;

        for (const info of infos) {
            if (info !== undefined)
                this.infos += ('##') + ' ' + `${Util === undefined ? `777Debug777-${info}` : Util.getAttrValueInSequence(info, 'message', 'msg')}`;
        }

        this.message = `UID:${this.uid}  CODE:${this.code}  REASON:${this._msg}  INFO:${this.infos}`;

        if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
            Util.appendError(this.message);

    }

    static msg(msg) {
        return JSON.stringify(msg);
    }

    getErrorCode() {
        return this.code;
    }

    isConstraintError() {
        return (this.message && this.message.indexOf(`SQLITE_CONSTRAINT`) > 0);
    }

}

export default MyException;
