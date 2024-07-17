const edit = true;
import { initializeApp } from "firebase/app";
import config from "../config";

class BaseFirebase {

    constructor() {
        this._app = initializeApp(config.firebase);
    }

    app() {
        return this._app;
    }

}

export default BaseFirebase
