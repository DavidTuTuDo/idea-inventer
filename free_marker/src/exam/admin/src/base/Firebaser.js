import config from "../config";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import * as admin from "firebase-admin";

class Firebaser {

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


export default new Firebaser();
