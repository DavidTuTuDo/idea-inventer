import config from "../config";
import * as admin from "firebase-admin";

class Admin {

    constructor() {
        const credential = config.admin;
        admin.initializeApp({
            credential: admin.credential.cert(credential),
            databaseURL: config.server,
        });
        this._firestore = admin.firestore();
    }

    firestore() {
        return this._firestore;
    }

    getServerTime() {
        return admin.firestore.FieldValue.serverTimestamp();
    }

}

export default Admin;
