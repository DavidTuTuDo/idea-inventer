import {utiller as Util, exceptioner as ERROR, pooller } from 'utiller';
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

    async submitItem(path, object) {
        Util.appendInfo(`push path:${path}`);
        const pk = _.toString(object.uid);
        if (!_.isEmpty(pk))
            return await this.fire().collection(path).doc(pk).set(object);
        else
            return await this.fire().collection(path).doc().set(object);
    }

    async batchSubmitItem(path, ...objects) {
        Util.appendInfo(`batchSubmit path:{${path}}, size:${objects.length}`);
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

    async fetchItems(path) {
        Util.appendInfo(`fetch items path:${path}}`);
        const querySnapshot = await this.firestore().collection(path).get();
        const all = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.uid = !_.isEmpty(data.uid) ? data.uid : doc.id;
            all.push(data);
        })
        return all;
    }

    async deleteItems(path) {
        Util.appendInfo(`delete all ${path}`);
        const batch = this.fire().batch()
        const list = await this.firestore().collection(path).listDocuments()
        list.map((doc) => batch.delete(doc));
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
        const data  = result.data();
        return data? data:{};
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
