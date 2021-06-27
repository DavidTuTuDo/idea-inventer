import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import config from "../config";
import {exceptioner as ERROR, utiller as Util} from "utiller";
import CommonPoolHelper from "./CommonPoolHelper";

class BaseFirebase {

    constructor() {
        if (!firebase.apps.length) {
            this.app = firebase.initializeApp(config.firebase);
        } else {
            this.app = firebase.app();
        }
    }

    core() {
        return this.app;
    }

    getAuthLibrary(){
        return firebase.auth;
    }

    getFirebaseLibrary(){
        return firebase.firestore;
    }

}

export default BaseFirebase
