import {utiller as Util, exceptioner as ERROR, pooller} from 'utiller';
import _ from 'lodash';
import Moment from 'moment';
import config from '../config';
import libpath from 'path';
import Admin from './Admin';

const MAX_BATCH_COUNT = 100;

class CommonRemoteApi extends Admin {

    constructor(props) {
        super(props);
    }

    async submitItems(path, ...objects) {
        Util.appendInfo(`submit path:{${path}}, size:${objects.length}`);
        let batch = this.fire().batch();
        let threshold = 0;
        while (objects.length > 0) {
            const object = objects.shift();
            const pk = _.toString(object.uid);
            if (!_.isEmpty(pk)) {
                batch.set(this.fire().collection(path).doc(pk), object)
            } else {
                batch.set(this.fire().collection(path).doc(), object)
            }

            threshold++;
            if (threshold >= MAX_BATCH_COUNT) {
                await batch.commit();
                threshold = 0;
                batch = this.fire().batch();
            }
        }
        if (threshold > 0)
            await batch.commit();
    }

    async fetchSizeOfCollection(path) {
        const list = await this.fire().collection(path).listDocuments()
        return list.length;
    }

    async submitItem(path, object) {
        Util.appendInfo(`push path:${path}`);
        const pk = _.toString(object.uid);
        if (!_.isEmpty(pk))
            return await this.fire().collection(path).doc(pk).set(object);
        else
            return await this.fire().collection(path).doc().set(object);
    }


    async updateItem(path, item) {
        Util.appendInfo(`update item path:${path} uid:${item.uid}`);
        await this.fire().collection(path).doc(item.uid).update(item);
        return true;
    }

    async deleteItem(path, item) {
        Util.appendInfo(`delete item path:${path} uid:${item.uid}`);
        await this.fire().collection(path).doc(item.uid).delete();
        return true;
    }

    async fetchItems(path, condition = (conditionStmt) => conditionStmt) {
        Util.appendInfo(`fetch items path:${path}}`);
        const query = condition(this.firestore().collection(path));
        const querySnapshot = await query.get();
        const all = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.uid = !_.isEmpty(data.uid) ? data.uid : doc.id;
            all.push(data);
        })
        return all;
    }

    async fetchItem(path, uid) {
        Util.appendInfo(`fetch item path:${path}}`);
        const result = this.firestore().collection(path).doc(uid);
        return result.exists ? {} : result.data();
    }

    async deleteItems(path, condition = (conditionStmt) => conditionStmt) {
        Util.appendInfo(`delete items ${path}`);
        const batch = this.fire().batch()
        if (condition) {
            const query = condition(this.firestore().collection(path));
            const querySnapshot = await query.get();
            querySnapshot.forEach((doc) => {
                batch.delete(doc)
            })
        } else {
            const list = await this.firestore().collection(path).listDocuments()
            list.map((doc) => batch.delete(doc));
        }

        await batch.commit();
    }

    async submitObject(path, object, objName) {
        const commitment = {};
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`submit object ${path}/${objName}`);
        commitment[objName] = object
        return await this.firestore().collection(path).doc(objName).set(commitment);
    }

    async fetchObject(path, objName) {
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`fetch object path:${path}/${objName}`);
        const result = await this.firestore().collection(path).doc(objName).get();
        return result.exists ? {} : result.data();
    }

    async updateObject(path, updatedObject, objName) {
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`update path:${path}/${objName}`);
        await this.firestore().collection(path).doc(objName).update(updatedObject);
    }

    async deleteObject(path, objName) {
        path = libpath.join(path, 'attrs');
        Util.appendInfo(`delete path:${path}/${objName}`);
        await this.firestore().collection(path).doc(objName).delete();
    }

    /** change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe*/
    listenItems(path, callback = (changes, error) => {
    }, condition = (stmt) => stmt) {
        const query = condition(this.firestore().collection(path));
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

    listenItem(path, uid, callback = (data, error) => {
    }) {
        const query = this.firestore().collection(path).doc(uid);
        const functionOfUnsubscribe = query.onSnapshot(
            (doc) => {
                callback(doc.data(), undefined);
            },
            (error) => {
                callback(error);
            }
        );
        return functionOfUnsubscribe;
    }

    listenObject(path, objName, callback = (data, error) => {
    }) {
        const fullpath = libpath.join(path, "attrs");
        const query = this.firestore().collection(fullpath).doc(objName);

        const functionOfUnsubscribe = query.onSnapshot(
            (doc) => {
                callback(doc.data(), undefined);
            },
            (error) => {
                callback(error);
            }
        );
        return functionOfUnsubscribe;
    }


    /** realtime database method */
    async realtimeFetchObject(refPath, filtering = (ref) => ref.once('value')) {
        console.log(`fetch object => ${refPath}`);
        const result = await filtering(this.database.ref(refPath));
        return result.val();
    }


    async realtimePostObject(refPath, obj = {}) {
        console.log(`write ${refPath}, param ${JSON.stringify(obj)}`);
        return await this.database.ref(refPath).set(obj);
    }

    async realtimeFetchArray(refPath, filtering = (ref) => ref.once('value')) {
        console.log(`fetch array => ${refPath}`);
        const result = await filtering(this.database.ref(refPath));
        const value = result.val();
        return _.isArray(value) ? value : _.values(value);
    }


}

export default CommonRemoteApi;
