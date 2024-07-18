const edit = true;
import {initializeApp} from "firebase/app";
import {getFunctions} from "firebase/functions";
import {getStorage} from "firebase/storage";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getDatabase} from "firebase/database";
import config from "../config";

class BaseFirebase {

    constructor() {
        this._app = initializeApp(config.firebase);
        this._storage = getStorage(this._app);
        this._firestore = getFirestore(this._app);
        this._auth = getAuth(this._app);
        this._functions = getFunctions(this._app);
        this._database = getDatabase(this._app);
    }

    app() {
        return this._app;
    }

    firestore() {
        return this._firestore;
    }

    functions() {
        return this._functions;
    }

    database() {
        return this._database;
    }

    auth() {
        return this._auth;
    }

    storage() {
        return this._storage;
    }

}

export default BaseFirebase
