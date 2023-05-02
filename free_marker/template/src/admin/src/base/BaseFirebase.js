import config from "../config";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import * as admin from "firebase-admin";

class BaseFirebase {

    constructor() {
        const credential = config.admin;
        admin.initializeApp({
            credential: admin.credential.cert(credential),
            databaseURL: config.server,
            storageBucket:`${config.admin.project_id}.appspot.com`,
        });
        this.admin = admin;
    }
    core() {
        return this.admin;
    }

    getFirestoreLibrary() {
        return admin.firestore;
    }

}


export default BaseFirebase
