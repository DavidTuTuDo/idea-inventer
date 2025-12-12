const edit = true;
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import config from "../config";

class BaseFirebase {
    constructor() {
        const host = `firestore.${config.locateOfFirestore}.googleapis.com`;
        console.log(`firebase host => ${host}`);
        this._app = initializeApp(config.firebase);
        this._storage = getStorage(this._app);
        // this._firestore = initializeFirestore(this._app, {
        //     // 必須使用 host 參數指向 asia-east1 的 API 端點
        //     host,
        //     ssl: true
        // });
        this._firestore = getFirestore(this._app);
        this._auth = getAuth(this._app);
        this._functions = getFunctions(this._app, config.locateOfFunctions);
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

export default BaseFirebase;
