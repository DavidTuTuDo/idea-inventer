import {utiller as Util, exceptioner as ERROR, pooller} from 'utiller';
import _ from 'lodash';
import Moment from 'moment';
import config from '../config';
import libpath from 'path';
import firebase from "./CommonFirebaseHelper";

const MAX_BATCH_COUNT = 100;

class CommonRemoteApi  {

    _firebase() {
        return firebase;
    }

    async submitItems(path, ...objects) {
        Util.appendInfo(`submit items => path:{${path}}, size:${objects.length}`);
        let batch = firebase.firestore().batch();
        let threshold = 0;
        while (objects.length > 0) {
            const object = objects.shift();
            const pk = _.toString(object.id);
            if (!_.isEmpty(pk)) {
                batch.set(firebase.firestore().collection(path).doc(pk), object)
            } else {
                batch.set(firebase.firestore().collection(path).doc(), object)
            }

            threshold++;
            if (threshold >= MAX_BATCH_COUNT) {
                await batch.commit();
                threshold = 0;
                batch = firebase.firestore().batch();
            }
        }
        if (threshold > 0)
            await batch.commit();
        return {message: `set path:${path} succeed`}
    }

    async fetchSizeOfCollection(path) {
        const list = await firebase.firestore().collection(path).listDocuments()
        return list.length;
    }

    async submitItem(path, object) {
        const id = object.id ? object.id : '';
        Util.appendInfo(`submit item => path:${path}/${id}`);
        if (id && !_.isEmpty(id)) {
            await firebase.firestore().collection(path).doc(id).set(object);
        } else {
            await firebase.firestore().collection(path).doc().set(object);
        }


        return {message: `set path:${path}/${id} succeed`}
    }


    async updateItem(path, id, item) {
        Util.appendInfo(`update item => path:/${path}/${id}`);
        await firebase.firestore().collection(path).doc(id).update(item);
        return true;
    }

    async deleteItem(path, id) {
        Util.appendInfo(`delete item => path:/${path}/${id}`);
        await firebase.firestore().collection(path).doc(id).delete();
        return true;
    }

    async fetchItems(path, condition = (conditionStmt) => conditionStmt) {
        Util.appendInfo(`fetch items => path:/${path}/`);
        const query = condition(firebase.firestore().collection(path));
        const querySnapshot = await query.get();
        const all = [];
        if (!querySnapshot.empty)
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = _.isEmpty(data.id) ? doc.id : data.id;
                all.push(data);
            })
        return all;
    }

    async fetchItem(path, id) {
        Util.appendInfo(`fetch item => path:/${path}/${id}`);
        const result = await firebase.firestore().collection(path).doc(id).get();
        return result.exists ?  result.data(): {};
    }

    async deleteItems(path, condition = (conditionStmt) => conditionStmt, all) {
        Util.appendInfo(`delete items ${path}`);
        const batch = firebase.firestore().batch()
        if (all) {
            const list = await firebase.firestore().collection(path).listDocuments()
            list.map((doc) => batch.delete(doc));
        } else {
            const query = condition(firebase.firestore().collection(path));
            const querySnapshot = await query.get();
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref)
            })
        }

        await batch.commit();
    }

    async submitObject(path, object, objName) {
        const commitment = {};
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`submit object => ${path}/${objName}`);
        commitment[objName] = object
        return await firebase.firestore().collection(path).doc(objName).set(commitment);
    }

    async fetchObject(path, objName) {
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`fetch object => path:/${path}/${objName}`);
        const result = await firebase.firestore().collection(path).doc(objName).get();
        return result.exists ? result.data() : {};
    }

    async updateObject(path, updatedObject, objName) {
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`update object => path:/${path}/${objName}`);
        await firebase.firestore().collection(path).doc(objName).update(updatedObject);
    }

    async deleteObject(path, objName) {
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`delete object => path:/${path}/${objName}`);
        await firebase.firestore().collection(path).doc(objName).delete();
    }

    /** change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe*/
    listenItems(path, callback = (changes, error) => {
    }, condition = (stmt) => stmt) {
        Util.appendInfo(`listenItems path:/${path}`);
        const query = condition(firebase.firestore().collection(path));
        const functionOfUnsubscribe = query.onSnapshot(
            (querySnapshot) => {
                const _changes = [];
                for (const change of querySnapshot.docChanges()) {
                    _changes.push({
                        type: change.type,
                        id: change.doc.id,
                        data: change.doc.data(),
                    });
                }
                callback(_changes, undefined);
            },
            (error) => {
                callback([], error);
            }
        );
        return functionOfUnsubscribe;
    }

    listenItem(path, id, callback = (data, error) => {
    }) {
        Util.appendInfo(`listenItem path:/${path}/${id}`);
        const query = firebase.firestore().collection(path).doc(id);
        const functionOfUnsubscribe = query.onSnapshot(
            (doc) => {
                callback(doc.data());
            },
            (error) => {
                callback(undefined, error);
            }
        );
        return functionOfUnsubscribe;
    }

    listenObject(path, objName, callback = (data, error) => {
    }) {
        const fullpath = libpath.join(path, "attrs");
        Util.appendInfo(`listenObject path:/${fullpath}/${objName}`);
        const query = firebase.firestore().collection(fullpath).doc(objName);

        const functionOfUnsubscribe = query.onSnapshot(
            (doc) => {
                callback(doc.data());
            },
            (error) => {
                callback(undefined, error);
            }
        );
        return functionOfUnsubscribe;
    }


    /** realtime database method */
    async realtimeFetchObject(refPath, filtering = (ref) => ref.once('value')) {
        Util.appendInfo(`fetch object => ${refPath}`);
        const result = await filtering(firebase.database().ref(refPath));
        return result.val();
    }


    async realtimePostObject(refPath, obj = {}) {
        Util.appendInfo(`write ${refPath}, param ${JSON.stringify(obj)}`);
        return await firebase.database().ref(refPath).set(obj);
    }

    async realtimeFetchArray(refPath, filtering = (ref) => ref.once('value')) {
        Util.appendInfo(`fetch array => ${refPath}`);
        const result = await filtering(firebase.database().ref(refPath));
        const value = result.val();
        return _.isArray(value) ? value : _.values(value);
    }


}

export default CommonRemoteApi;
