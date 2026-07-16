const edit = true;
import config from "../config";
import { initializeApp, cert } from "firebase-admin/app";
import { getFunctions } from "firebase-admin/functions";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

class BaseFirebase {
    constructor() {
        const credential = config.admin;
        this._app = initializeApp({
            credential: cert(credential),
            databaseURL: config.server,
            storageBucket: `${config.admin.project_id}.appspot.com`
        });
        this._storage = getStorage(this._app);
        this._firestore = getFirestore(this._app);
        this._mailStore = getFirestore(this._app, "deliver");
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

    mailStore() {
        return this._mailStore;
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
