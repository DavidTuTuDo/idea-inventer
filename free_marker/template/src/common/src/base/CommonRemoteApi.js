import {exceptioner as ERROR, utiller as Util} from 'utiller';
import _ from 'lodash';
import moment from 'moment';
import libpath from 'path';
import firebase from "./CommonFirebaseHelper";

const MAX_BATCH_COUNT = 200;

class CommonRemoteApi {

    _firebase() {
        return firebase;
    }

    firestore() {
        return firebase.firestore();
    }

    normalizeTimestamp(obj) {
        if (obj instanceof this.FirebaseTimestampClass())
            return obj.toMillis();
        else
            return obj;
    }

    /** null是讓mui picker沒有預設值(顯示出label)，所以特別保留 */
    normalizeAsMoment(param) {
        const self = this;
        function getSpecificExpress(pram) {
            if (_.isNull(pram)) return pram;
            else if(pram instanceof self.FirebaseTimestampClass()) return moment(pram.toMillis());
            else return moment(pram);
        }

        return _.isArray(param) ? param.map((each) => getSpecificExpress(each)) : getSpecificExpress(param);
    }

    getFieldNameOfDocumentId() {
        return firebase.getFieldNameOfDocumentId();
    }

    getObjectOfIncrement(delta) {
        return firebase.getFirestoreIncrement(delta);
    }

    getFirebaseTimestampObject(ts) {
        return firebase.getFirestoreTimeStamp(ts);
    }

    FirebaseTimestampClass() {
        return firebase.FirebaseTimestamp();
    }

    toFireBaseTimestampObject(obj) {
        if (obj instanceof firebase.getFirestoreLibrary().Timestamp) {
            return obj;
        } else {
            try {
                const ts = moment(obj).valueOf();
                return this.getFirebaseTimestampObject(ts);
            } catch (error) {
                return this.getObjectOfCurrentTimeStamp();
            }
        }
    }

    getObjectOfCurrentTimeStamp() {
        return firebase.getCurrentFirestoreTimeStamp();
    }

    async callCloudFunctions(functionName = '', data, region = 'us-central1') {
        const func = await firebase.functions(region).httpsCallable(functionName);
        Util.appendInfo(`functions httpOnCall => '${functionName}'`, data);
        return await func(data);
    }

    /** 取得collection所有的document ids */
    async fetchIdsOfDocument(path) {
        const list = await this.collectionRef(path).listDocuments();
        return _.isArray(list) ? list.map((each) => each.id) : [];
    }

    /** predicate 裏面放batch要做的動作 set,update,delete */
    async batchBracket(objects, predicate = (batch, object) => {
    }) {
        let batch = this.firestore().batch();
        let threshold = 0;
        while (objects.length > 0) {
            const object = objects.shift();
            predicate(batch, object);
            threshold++;
            /** 超過數量就先commit  一次 */
            if (threshold >= MAX_BATCH_COUNT) {
                await batch.commit();
                threshold = 0;
                batch = this.firestore().batch();
            }
        }

        if (threshold > 0)
            await batch.commit();
    }

    async submitItems(path, ...items) {
        const size = items.length
        Util.appendInfo(`batch submit => path:${path}, size:${size} start`);
        await this.batchBracket(items, (batch, item) => {
            const pk = _.toString(item.id);
            if (!_.isEmpty(pk)) {
                batch.set(this.firestoreDocRef(path, pk), item)
            } else {
                batch.set(this.firestoreDocRef(path), item)
            }
        })
        return {message: `batch submit path:${path}, size:${size} succeed`}
    }

    async updateItems(path, ...items) {
        const size = items.length
        Util.appendInfo(`batch update path:${path}, size:${items.length}`);
        await this.batchBracket(items, (batch, item) => {
            const id = item.id;
            if (Util.isUndefinedNullEmpty(id)) {
                throw new ERROR(2001, `ERROR ===> ${JSON.stringify(item)}`)
            } else {
                batch.update(this.firestoreDocRef(path, id), item);
            }
        })
        return {message: `batch update path:${path}, size:${size} succeed`}
    }

    /** 因為 == ,in, array-contains, not-in 這類的比較最多只能有10個, 所以得設計batch */
    fetchItemsOfLimitation = async (path, action, fieldName, ...valuesOfComparison) => {
        const result = [];
        Util.appendInfo(`fetch items in limitation with action = ${action} | fieldName = ${fieldName} | path:${path}, size:${valuesOfComparison.length}`);

        if (_.isEqual('id', fieldName)) {
            fieldName = this.getFieldNameOfDocumentId()
        }
        while (_.size(valuesOfComparison) > 0) {
            const values = await this.fetchItems(path, {
                where: (stmt) => stmt.where(fieldName, action, Util.getSliceArrayWithMutate(valuesOfComparison, 10))
            })
            result.push(...values);
        }
        return result;
    }

    async fetchSizeOfCollection(path) {
        const list = await this.collectionRef(path).listDocuments()
        return list.length;
    }

    async submitItem(path, item, id) {
        Util.appendInfo(`submit item => path:${path}/${id}`);
        let obj = item;
        if (!Util.isUndefinedNullEmpty(id)) {
            await this.firestoreDocRef(path, id).set(item);
        } else {
            const docRef = await this.collectionRef(path).add(item);
            obj.id = docRef.id;
        }

        return {
            succeed: true,
            message: `set path:${path}/${id} succeed`,
            value: obj,
        }
    }

    async updateItem(path, item, id) {
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, '474845146564 updateItem 的id 不能為空值')
        }
        Util.appendInfo(`update item => path:/${path}/${id}`);
        await this.firestoreDocRef(path, id).update(item);
        return {
            succeed: true,
            message: `update path:${path}/${id} succeed`,
            value: item,
        }
    }

    /** firestore transaction 的呼叫入口*/
    async runTransaction(asyncTask = async (behavior) => true) {
        return await this.firestore().runTransaction(asyncTask);
    }

    /** predict 裡面寫 updateContent | 觸發throw error的規則
     *
     *      (item) => {
     const old = item.count;
     if (old <= 85)
     throw new ERROR(9999,'不能小於85');

     const latest = old - 1;
     return {count: latest}
     }
     *
     * */
    async updateDocumentAtomically(path, predict = async (collection, transaction) => collection, id) {
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, '474845146451964 updateDocumentAtomically 的id 不能為空值')
        }

        const behavior = async (transaction) => {
            const ref = this.firestoreDocRef(path, id);
            const node = await transaction.get(ref);
            if (!node.exists) {
                throw new ERROR(9999, `document ${libpath.join(path, id)} not exist`)
            }
            const collection = node.data();
            collection.exists = true;
            const updateContent = await predict(collection, transaction);
            transaction.update(ref, updateContent);
            Util.appendInfo(`transaction update => path:/${path}/${id}`, `content ==> `, updateContent);

        }
        return await this.runTransaction(behavior);
    }

    async updateItemAtomically(path, predict = (item, transaction) => item, id) {
        return await this.updateDocumentAtomically(path, predict, id);
    }

    async deleteItem(path, id) {
        Util.appendInfo(`delete item => path:/${path}/${id}`);
        await this.firestoreDocRef(path, id).delete();
        return true;
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async fetchItems(path, ...conditions) {
        const uid = Util.getRandomHash(10);
        const sortedCondition = this.orderConditionByRules(conditions);
        if (sortedCondition.length > 0)
            Util.appendInfo(sortedCondition.map(each => (_.toString(each))));

        Util.appendInfo(`${uid} fetch items => path:/${path}/`);
        const query = Util.accumulate(this.collectionRef(path), sortedCondition);
        const querySnapshot = await query.get();
        const all = [];
        if (!querySnapshot.empty)
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data._doc = doc;
                data.id = _.isEmpty(data.id) ? doc.id : data.id;
                all.push(data);
            })
        Util.appendInfo(`${uid} fetch items => ${path} result with ${all.length} items`);

        return all;
    }

    orderConditionByRules(conditions = []) {
        /** 1.limit() 2.orderBy(), 3.startAt() or startAfter() , 4.where */
        const raw = [];
        for (const condition of conditions) {
            if (condition === undefined || _.isEmpty(condition)) continue;
            let priority = 99;
            let stmtOfFunction = (stmt) => stmt;
            if (_.isObject(condition)) {
                /** 這種概念 {where:(stmt) => stmt.where('id','==','david')}*/
                stmtOfFunction = Util.getObjectValue(condition);
                switch (Util.getObjectKey(condition)) {
                    case 'limit':
                        priority = 1;
                        break;
                    case 'startAt':
                    case 'startAfter':
                        priority = 2;
                        break;
                    case 'orderBy':
                        priority = 3
                        break;
                    case 'where':
                        priority = 4;
                        break;
                    default:
                        break;
                }
            } else if (_.isFunction(condition)) {
                /** 這種概念 (stmt) => stmt.where('id','==','david') */
                stmtOfFunction = condition
            } else {
                throw new ERROR(9745, `condition should be object|function, but it's ${typeof condition},${_.toString(condition)}`)
            }
            raw.push({stmt: stmtOfFunction, priority})
        }
        return _.isEmpty(raw) ? [] : _.orderBy(raw, ['priority'], ['desc']).map((each) => each.stmt);
    }

    /** 沒有帶入id表示firebase submit document會自己generate uid(具有uuid的規則在)*/
    firestoreDocRef(path, id) {
        if (id !== undefined && !_.isEmpty(id))
            return this.collectionRef(path).doc(_.toString(id));
        else
            return this.collectionRef(path).doc();
    }

    collectionRef(path) {
        return this.firestore().collection(path);
    }

    async fetchItem(path, id) {
        Util.appendInfo(`fetch item => path:/${path}/${id}`);
        const result = await this.firestoreDocRef(path, id).get();
        return result.exists ? {...result.data(), id, _doc: result, exists: true} : {exists: false};
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteItems(path, all, conditions = []) {
        Util.appendInfo(`delete items ${path}`);
        const sortedCondition = this.orderConditionByRules(conditions);
        const refs = [];
        if (all) {
            refs.push(...(await this.collectionRef(path).listDocuments()));
        } else {
            if (sortedCondition.length > 0)
                Util.appendInfo(sortedCondition.map(each => (_.toString(each))));

            const query = Util.accumulate(this.collectionRef(path), sortedCondition);
            const querySnapshot = await query.get();
            querySnapshot.forEach((doc) => {
                refs.push(doc.ref)
            })
        }

        await this.batchBracket(refs, (batch, each) => {
            batch.delete(each)
        })
    }

    async submitObject(path, object, objName = 'contents') {
        const commitment = object;
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`submit object => ${path}/${objName}`);
        return await this.firestoreDocRef(path, objName).set(commitment);
    }

    async fetchObject(path, objName) {
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`fetch object => path:/${path}/${objName}`);
        const result = await this.firestoreDocRef(path, objName).get();
        return result.exists ? result.data() : {};
    }

    getNormalizePathOfObjectApi(path) {
        if (this.isCollectionPath(path))
            return path;
        else
            return libpath.join(path, 'attrs');
    }

    isCollectionPath(path) {
        const segments = _.split(Util.getNormalizedStringNotStartWith(path, '/'), '/');
        return Util.isOdd(segments.length);
    }

    async updateObject(path, objName, updatedObject) {
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`update object => path:/${path}/${objName}`);
        return await this.firestoreDocRef(path, objName).update(updatedObject);
    }

    async updateObjectAtomically(path, predict = (object, transaction) => object, objName) {
        return await this.updateDocumentAtomically(path, predict, objName);
    }

    async deleteObject(path, objName = 'contents') {
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`delete object => path:/${path}/${objName}`);
        return await this.firestoreDocRef(path, objName).delete();
    }

    restfulListenItem(path, id, handler = (data) => data, view) {
        this.showLoadingView(view);
        Util.appendInfo(`listenItem path:/${path}/${id}`);
        const query = this.firestoreDocRef(path, id);
        const functionOfUnsubscribe = query.onSnapshot(
            (doc) => {
                if (doc !== undefined) {
                    const data = doc.data();
                    if (data === undefined) return;
                    /** 註冊listener 會先收到一個空data的訊息, 不知道衝三小, 所以先ignore */

                    this.closeLoadingView(view);
                    handler(data);
                }
            },
            (error) => {
                this.closeLoadingView(view);
                handler({status: 'fail', message: `${error.code}, ${error.message}`})
            }
        );
        return functionOfUnsubscribe;
    }

    /** change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe*/
    listenItems(path, callback = (changes, error) => {
    }, condition = (stmt) => stmt) {
        Util.appendInfo(`listenItems path:/${path}`);
        const query = condition(this.collectionRef(path));
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
        const query = this.firestoreDocRef(path, id);
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
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`listenObject path:/${path}/${objName}`);
        const query = this.firestoreDocRef(path, objName);

        const functionOfUnsubscribe = query.onSnapshot(
            (doc) => {
                const data = doc.data();
                callback(data);
            },
            (error) => {
                callback(undefined, error);
            }
        );
        return functionOfUnsubscribe;
    }

    showLoadingView(view) {
        if (view !== undefined && view.setLoadingViewVisibility)
            view.setLoadingViewVisibility(true);
    }

    closeLoadingView(view) {
        if (view !== undefined && view.setLoadingViewVisibility) {
            view.setLoadingViewVisibility(false);
        }

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

    async fetchUserIsExist(uid) {
        const result = await this.fetchItem('users', uid);
        return result.exists
    }

    async submitUserAsUid(uid) {
        await this.updateItem('users', uid, {admin: true});
    }

    async submitUserExist(uid) {
        await this.updateItem('users', uid, {exist: true})
    }

    async submitUserBeingAdmin(uid) {
        await this.fetchUserIsExist(uid);
    }

    async isAdminUser(uid = undefined) {
        const user = await this.fetchItem('users', uid);
        return user.exists && user.admin
    }

    handleCommitment(update, commitment, object) {
        if (update) {
            for (const key in commitment) {
                if (key in object) {
                    /** 保留屬性 */
                } else if (_.isEqual(key, 'updateTime')) {
                    /** 保留屬性 */
                } else {
                    delete commitment[key];
                }
            }
        }
    }

    async uploadStorageFile(blob, folder = 'public', type = 'file') {
        const ref = firebase.storage().ref();
        const uploadPath = libpath.join('./', folder, blob.name);
        Util.appendInfo(`firebase storage upload file path => ${uploadPath}`);
        const uploadTask = await ref.child(uploadPath).put(blob);
        return await uploadTask.ref.getDownloadURL();
    }

}

export default CommonRemoteApi;
