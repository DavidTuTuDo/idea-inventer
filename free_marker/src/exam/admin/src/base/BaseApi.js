import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import Moment from 'moment';
import firebase from "firebase";
import * as admin from "firebase-admin";
import config from '../config';
import libpath from 'path';

class BaseApi {


    constructor() {
        const credential = config.admin;
        admin.initializeApp({
            credential: admin.credential.cert(credential),
            databaseURL: config.server,
        });
        this.firestore = admin.firestore();
    }

    fire() {
        return this.firestore;
    }

    getServerTime() {
        return admin.firestore.FieldValue.serverTimestamp();
    }

    async push(path, object, uid = Util.getRandomHash()) {
        Util.appendInfo(`push path:${path}, uid:${uid}`);
        const pk = object.uid ? object.uid : uid;
        return await this.fire().collection(path).doc(pk).set(object);
    }

    async getAll(path) {
        Util.appendInfo(`get path:${path}}`);
        const querySnapshot = await this.fire().collection(path).get();
        const all = [];
        querySnapshot.forEach((doc) => {
            all.push(doc.data());
        })
        return all;
    }

    async deleteAll(path) {
        Util.appendInfo(`delete all ${path}`);
        const batch = this.fire().batch()
        const list = await this.fire().collection(path).listDocuments()
        list.map((doc) => batch.delete(doc));
        await batch.commit();
    }

    async set(path, object, objName) {
        Util.appendInfo(`set path:${path}`);
        const commitment = {};
        commitment[objName] = object
        return await this.fire().collection(path).set(commitment);
    }

    async get(path, objName) {
        Util.appendInfo(`get path:${path}`);
    }

    async update() {

    }



    async delete() {

    }

}

export default BaseApi;
