import GlobalConfig from "../GlobalConfig";


export default class MyException extends Error {

    static msg(msg) {
        return JSON.stringify(msg);
    }

    constructor(code, error) {
        if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
            if (error.message) {
                console.log(`Ops => ${code},${error.message}`);
            } else if (error.msg) {
                console.log(`Ops => ${code},${error.msg}`);
            } else
                console.log(`Ops => ${code},${JSON.stringify(error)}`);
        super(error);
    }


}
