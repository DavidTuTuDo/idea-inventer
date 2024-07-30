const edit = true;
import {exceptioner as ERROR, utiller as Util} from "utiller";
import _ from "lodash";
import BaseFirebase from "./BaseFirebase";
import CommonPoolHelper from "./CommonPoolHelper";
import Config from '../config';
import {
    Timestamp,
    FieldValue,
    FieldPath,
} from "firebase-admin/firestore";
import {connectFunctionsEmulator, httpsCallable} from "firebase-admin/functions";
import {ref, uploadBytes, getDownloadURL} from 'firebase-admin/storage'
import libpath from 'path';

const MAX_COUNT_OF_FIRESTORE_BATCH = 300;

class FirebaseHelper extends BaseFirebase {


    constructor() {
        super();
    }

    getFirestoreTimeStamp(ts) {
        return ts > 0 ? Timestamp.fromMillis(ts) : Timestamp.now();
    }

    getFirestoreTimeStampByDate(date) {
        return Timestamp.fromDate(date);
    }

    getCurrentFirestoreTimeStamp() {
        return Timestamp.now();
    }

    getLibOfFirebaseTimestamp() {
        return Timestamp;
    }

    /** firestore對於attribute為timestamp看得懂的格式 */
    getServerTimeSymbol() {
        return FieldValue.serverTimestamp();
    }

    getTimeStampObj(millis) {
        return Timestamp.fromMillis(millis);
    }

    async getCurrentServerTimeStamp() {
        await this.firestore().collection('public').doc('timestamp').set({serverTime: this.getServerTimeSymbol()})
        const timestamp = await this.firestore().collection('public').doc('timestamp').get();
        return timestamp.data().serverTime;
    }

    getFieldNameOfDocumentId() {
        return FieldPath.documentId();
    }

    collectionRef(path) {
        return this.firestore().collection(path);
    }

    /** firestore 的 modular api 使用原則 */

    reference = (path, id) => {
        return Util.isUndefinedNullEmpty(id) ? this.collectionRef(path) : this.collectionRef(path).doc(_.toString(id))
    }

    submitDocument = async (path, item = {}, id) => {
        const ref = this.reference(path, id);
        const result = Util.isUndefinedNullEmpty(id) ? await ref.add(item) : await ref.set(item)
        return {...item, id: id ?? result.id, exists: true};
    }

    updateDocument = async (path, id, item = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5987824 updateDocument()的id不能為空值`);
        return await this.reference(path, id).update(item);
    }


    /** atomically to increment 關於number的屬性，例如參訪人數之類的 */
    incrementDocumentNumeric = async (path, id, attribute, value = 1) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5187823514 incrementDocumentNumeric()的id不能為空值`);
        return this.updateDocument(path, id, Util.getObject(attribute, FieldValue.increment(value)))
    }

    /** batch提供set, delete, update的功能
     * todo: 可以設計為[....{ path:'route', content:{id:ioOfDoc}, behavior:'delete|set|update'}]，然後在predicate by case 處理
     * */
    batchDo = async (items, predicate = (batch, item) => true) => {
        async function commit(batch, count) {
            if (count > 0) {
                await batch.commit();
                Util.appendInfo(`1242232 admin batch do commit(count:${count}) succeed`)
            }
        }

        Util.appendInfo(`1231232 admin batch do is going to handle (count:${_.size(items)})`)
        let batch = this.firestore().batch();
        let count = 0;

        while (items.length > 0) {
            predicate(batch, items.shift());
            /** 由呼叫端去針對每個item視作 set/delete/update 的行為 */
            count = count + 1;
            /** 超過MAX先COMMIT次再歸零 */
            if (count >= MAX_COUNT_OF_FIRESTORE_BATCH) {
                await commit(batch, count);
                count = 0;
                batch = this.firestore().batch();
            }
        }
        await commit(batch, count);
        Util.appendInfo(`32312312 admin batch do (count:${_.size(items)}) succeed`)
    }

    submitDocuments = async (path, items) => {
        const result = await this.batchDo(items, (batch, item) => {
            const itemRef = Util.isUndefinedNullEmpty(item.id) ? this.reference(path, item.id).doc() : this.reference(path, item.id)
            batch.set(itemRef, item);
        })
    }

    updateDocuments = async (path, contentsOfUpdate, ...conditions) => {
        const hasCondition = _.size(conditions) > 0;
        const targets = hasCondition ? (await this.fetchDocuments(path, ...conditions)).map(each => each.id) : contentsOfUpdate;

        return await this.batchDo(targets, (batch, item) => {
            if (hasCondition) batch.update(this.reference(path, item), contentsOfUpdate[0]); /** 此時item 為 document id*/
            else if (!Util.isUndefinedNullEmpty(item.id)) batch.update(this.reference(path, item.id), item);
            else throw new ERROR(9999, `6524521323 admin hasCondition == ${hasCondition}, updateDocuments的item沒有valid id => ${contentsOfUpdate.id}`)
        })
    }

    fetchDocuments = async (path, ...conditions) => {
        const query = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
        const querySnapshot = await query.get();
        const all = [];
        if (!querySnapshot.empty) querySnapshot.forEach((doc) => {
            // const total = querySnapshot.size;
            const data = doc.data();
            data._doc = doc;
            data.id = _.isEmpty(data.id) ? doc.id : data.id;
            all.push(data);
        })
        return all;
    }

    /**
     * firebase-admin 沒有modular api，所以condition是以下格式，要做排序，要where().orderBy().limit()
     * {where:(stmt) => stmt.where('id','==','david')}
     * {orderBy:(stmt) => stmt,orderBy('age','desc')}
     * */
    conditionsOfRuled(conditions = []) {
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

    fetchDocument = async (path, id) => {
        const docSnap = await this.reference(path, id).get();
        return docSnap.exists ? {...docSnap.data(), id, _doc: docSnap, exists: true} : {exists: false};
    }

    deleteDocument = async (path, id) => {
        await this.reference(path, id).delete();
    }

    deleteDocuments = async (path, whole = false, ...conditions) => {
        const all = [];
        if (whole) all.push(...(await this.reference(path).listDocuments()))
        else {
            const query = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
            const querySnapshot = await query.get();
            querySnapshot.forEach((doc) => all.push(doc.ref))
        }
        await this.batchDo(all, (batch, ref) => batch.delete(ref));
    }

    transaction = async (task = async (transaction) => true) => {
        return await this.firestore().runTransaction(task)
    }


    /** predict(document,transaction) 裡面是atomic的行為，transcation可以get() -> document
     * 例如購物系統，當countOfProduct > 1時，就可以atomically得去更新為 {countOfProduct:countOfProduct - 1}
     * 若countOfProduct <= 0 時，就throw Error，聽停止這個transaction
     * 觸發throw error的規則
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
    async updateDocumentAtomically(path, predict = async (document, transaction) => document, id) {
        const self = this;
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, '474845146451964 updateDocumentAtomically 的id 不能為空值')
        }

        const behavior = async (transaction) => {
            const ref = self.reference(path, id);
            const docSnap = await transaction.get(ref);
            if (!docSnap.exists) {
                throw new ERROR(9999, `846865468 document ${libpath.join(path, id)} not exist`)
            }
            const document = docSnap.data();
            document.exists = true;
            document.id = id;
            const content = await predict(document, transaction, ref);
            transaction.update(ref, content);
            Util.appendInfo(`transaction update => path:/${path}/${id}`, `content ==> `, content);

        }
        return await this.transaction(behavior);
    }

    /**
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * data 就是寫入後的document value
     *
     * 回傳一個unsubscribe的function，需要要在componentDidUnmount的地方呼叫unsubscribe()
     * callback {status:[local|server|error|cache], changes: document, error:object }
     */
    listenDocument = (path, id, callback = (source, data, error) => true) => {
        const unsubscribe = this.reference(path, id).onSnapshot((doc) => {
            callback('server', doc.data())
        }, (error) => {
            callback("error", undefined, error)
        })
        return unsubscribe;
    }

    /**
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * 監聽collection 變動，利用callback接收推播資訊
     * change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe
     *
     * callback {status:[local|server|error|cache], changes:[...{document}], error:object }
     * */
    listenDocuments = (path, callback = (status, array, error) => true, ...conditions) => {
        const unsubscribe = this.reference(path).onSnapshot((snapshot) => {
            const changes = [];
            const status = "server";
            // snapshot.docs; snapshot.size; snapshot.empty;
            snapshot.docChanges().forEach((change) => {
                changes.push({
                    type: change.type, /** [added|modified|removed] */
                    id: change.doc.id,
                    data: change.doc.data()
                })
            })
            callback(status, changes, undefined)
        }, (error) => callback('error', undefined, error))
        return unsubscribe;
    }

    fetchCountOfCollection = async (path) => {
        const list = await this.reference(path).listDocuments();
        return _.size(list);
    }


}

export default new FirebaseHelper();
