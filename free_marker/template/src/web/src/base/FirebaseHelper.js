const edit = true;
import {exceptioner as ERROR, utiller as Util} from "utiller";
import _ from "lodash";
import BaseFirebase from "./BaseFirebase";
import CommonPoolHelper from "./CommonPoolHelper";
import Config from '../config';
import {GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut} from "firebase/auth";
import {
    getCountFromServer,
    getAggregateFromServer,
    sum,
    average,
    count,
    updateDoc,
    arrayUnion,
    arrayRemove,
    runTransaction,
    deleteDoc,
    writeBatch,
    collection,
    doc,
    setDoc,
    addDoc,
    onSnapshot,
    getDoc,
    getDocs,
    serverTimestamp,
    Timestamp,
    documentId,
    increment,
    query,
    where,
    orderBy,
    startAfter,
    limit,
    startAt,
    or,
    and,

} from "firebase/firestore";
import {connectFunctionsEmulator, httpsCallable} from "firebase/functions";
import {getDatabase} from "firebase/database";
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import libpath from 'path';

const MAX_COUNT_OF_FIRESTORE_BATCH = 300;

class FirebaseHelper extends BaseFirebase {

    /** web端當前的user */
    user;

    constructor() {
        super();
        if (this.auth() === undefined) return;
        const self = this;
        if (_.isEqual('web', Config.platform)) {
            /** 因為和admin共用, firebase-admin沒有onAuthStateChanged 這個 function */
            onAuthStateChanged(this.auth(), (user) => {
                self.user = user;
                const event = require('../event').default;
                event.emitAuthStateChanged(user);
                Util.appendInfo(`8745412, 登入後發布event了`, user)
            })
        }

        if (_.isEqual(Config.env, 'dev') && _.isEqual(Config.platform, 'web')) {
            connectFunctionsEmulator(this.functions(), "localhost", 5001)
        }
    }


    FirebaseTimestamp() {
        return serverTimestamp();
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

    getFirestoreIncrement(delta) {
        return increment(delta);
    }

    getLibOfFirebaseTimestamp() {
        return Timestamp;
    }

    getCurrentUser() {
        return this.user;
    }

    getUid = () => {
        return Util.exist(this.user) ? this.user.uid : '';
    }

    /** firestore對於attribute為timestamp看得懂的格式 */
    getServerTimeSymbol() {
        return serverTimestamp();
    }

    currentUser = () => {
        return this.user;
    }

    getGoogleAuthProvider() {
        const provider = new GoogleAuthProvider();
        return provider;
    }

    signInWithGoogle = async (asyncTask = async (result) => result) => {
        const result = await signInWithPopup(this.auth(), this.getGoogleAuthProvider()).catch(error => {
            Util.appendInfo(`4545241354 pop-up頁面被無預期關閉 => ${error.message}`)
        });
        await asyncTask(result);
    }

    logout = async () => {
        try {
            await signOut(this.auth());
            Util.appendInfo('2556416521 User signed out successfully.');
        } catch (error) {
            Util.appendInfo('45465454654 error signing out:', error.message);
        }
    }

    getTimeStampObj(millis) {
        return Timestamp.fromMillis(millis);
    }

    async getCurrentServerTimeStamp() {
        await this.firestore().collection('public').doc('timestamp').set({serverTime: this.getServerTimeSymbol()})
        const timestamp = await this.firestore().collection('public').doc('timestamp').get();
        return timestamp.data().serverTime;
    }

    async signInWithExistedCredential(credential) {
        const self = this;
        const asyncTask = async () => {
            Util.appendInfo('151561032 signInWithExistedCredential start...');
            const outhCredential = GoogleAuthProvider.credential(Util.getExistOne(credential.idToken, credential.oauthIdToken));
            try {
                const result = await signInWithCredential(self.auth(), outhCredential);
                Util.appendInfo('546451213 signInWithExistedCredential finished...');

                return {
                    credential: result.credential, user: result.user
                }
            } catch (error) {
                /** 如果已經是登入狀況又呼叫的話, 可能會跑進去 stale in log-in */
                throw new ERROR(error)
            }
        }
        return await CommonPoolHelper.submitTo('submit', asyncTask, 'high', 'signInWithExistedCredential');
    }

    getFieldNameOfDocumentId() {
        return documentId();
    }

    async httpOnCall(functionName, data) {
        const functions = httpsCallable(this.functions(), functionName);
        return await functions(data);
    }


    /** firestore 的 modular api 使用原則 */

    reference = (path, id) => {
        return Util.isUndefinedNullEmpty(id) ? collection(this.firestore(), path) : doc(this.firestore(), path, _.toString(id))
    }

    submitDocument = async (path, item = {}, id) => {
        const ref = this.reference(path, id);
        const docRef = Util.isUndefinedNullEmpty(id) ? await addDoc(ref, item) : await setDoc(ref, item);
        return {...item, id: docRef.id, exists: true};
    }

    updateDocument = async (path, item = {}, id) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5987864 updateDocument()的id不能為空值`);
        return await updateDoc(this.reference(path, id), item)
    }

    /** 一個document可以擁有array屬性，這個function可以幫助append document array裡的item，不需要整個重寫*/
    appendDocumentArrayItem = async (path, id, attribute = 'name', content = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `598781514 appendDocumentArrayItem()的id不能為空值`);
        return await this.updateDocument(path, Util.getObject(attribute, arrayUnion(content)), id);
    }

    /** 一個document可以擁有array屬性，這個function可以幫助delete document array裡的item，不需要整個重寫*/
    deleteDocumentArrayItem = async (path, id, attribute = 'name', content = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `518781514 deleteDocumentArrayItem()的id不能為空值`);
        return await this.updateDocument(path, Util.getObject(attribute, arrayRemove(content)), id);
    }

    /** atomically to increment 關於number的屬性，例如參訪人數之類的 */
    incrementDocumentNumeric = async (path, id, attribute, value = 1) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5187823514 incrementDocumentNumeric()的id不能為空值`);
        return await this.updateDocument(path, id, Util.getObject(attribute, increment(value)));
    }

    /** batch提供set, delete, update的功能
     * todo: 可以設計為[....{ path:'route', content:{id:ioOfDoc}, behavior:'delete|set|update'}]，然後在predicate by case 處理
     * */
    batchDo = async (items, predicate = (batch, object) => {
    }) => {
        async function commit(batch, count) {
            if (count > 0) {
                await batch.commit();
                Util.appendInfo(`5465465 batchDo execute commit(count:${count}) succeed`)
            }
        }

        Util.appendInfo(`54654456 batchDo is going to handle (count:${_.size(items)})`)
        let batch = writeBatch(this.firestore());
        let count = 0;

        while (items.length > 0) {
            predicate(batch, items.shift());
            /** 由呼叫端去針對每個item視作 set/delete/update 的行為 */
            count = count + 1;
            /** 超過MAX先COMMIT次再歸零 */
            if (count >= MAX_COUNT_OF_FIRESTORE_BATCH) {
                await commit(batch, count);
                count = 0;
                batch = writeBatch(this.firestore());
            }
        }
        await commit(batch, count);
        Util.appendInfo(`5465466 batchDo (count:${_.size(items)}) succeed`)
    }

    submitDocuments = async (path, items) => {
        const result = [];
        await this.batchDo(items, (batch, item) => {
            const ref = this.reference(path, item.id);
            const itemRef = Util.isUndefinedNullEmpty(item.id) ? doc(ref) : ref
            batch.set(itemRef, item);
            result.push({...item, id: itemRef.id})
        })
        return result;
    }


    /**
     * 1. this.updateDocuments(path,{verified:true},{type:'where',params:['age','>','12']})
     *
     * 2. this.updateDocuments(path,[...{ id:'sdjaoisdosa',verified:true },{ id:'sdjaoisfsdfdsfs',hieght:120 }]
     */
    updateDocuments = async (path, items, ...conditions) => {
        const result = [];
        if (_.size(conditions) > 0) {
            /** 1.如果有condition,就是針對條件篩選後的document執行update */
            const contentOfUpdate = items[0];
            const colRef = this.reference(path);
            const q = query(colRef, ...this.constraints(conditions));
            const querySnapshot = await getDocs(q);
            const idsOfConstraint = querySnapshot.docs.map(doc => doc.id);
            await this.batchDo(idsOfConstraint, (batch, id) => {
                const ref = this.reference(path, id);
                batch.update(ref, contentOfUpdate);
                result.push({...contentOfUpdate, id: ref.id})
            })
        } else {
            /** 2.針對已知的document id做batch update */
            await this.batchDo(items, (batch, item) => {
                const ref = this.reference(path, item.id);
                batch.update(ref, item);
                result.push({...item, id: ref.id})
            })
        }
        return result;
    }

    fetchDocuments = async (path, ...conditions) => {
        const querySnapshot = await getDocs(this.compound(path, conditions));
        const all = [];
        if (!querySnapshot.empty) querySnapshot.forEach((doc) => {
            // const total = querySnapshot.size;
            const data = doc.data();
            data._doc = doc;
            data.ref = doc.ref;
            data.id = _.isEmpty(data.id) ? doc.id : data.id;
            all.push(data);
        })
        return all;
    }

    fetchDocument = async (path, id) => {
        const docSnap = await getDoc(this.reference(path, id));
        return docSnap.exists() ? {...docSnap.data(), id, _doc: docSnap, exists: true} : {exists: false};
    }

    deleteDocument = async (path, id) => {
        await deleteDoc(this.reference(path, id));
    }

    deleteDocuments = async (path, whole, ...conditions) => {
        const all = _.isEqual(whole, true) ? await this.fetchDocuments(path) : await this.fetchDocuments(path, ...conditions);
        if (_.size(all) > 0)
            await this.batchDo(all.map(data => data.ref), (batch, ref) => batch.delete(ref));
    }

    /** {type:'where',params:['countOfPeople','>','10']} => where(...params) */
    normalize = (condition) => {
        const type = condition.type;
        switch (type) {
            case 'where':
                return where(...condition.params);
            case 'orderBy':
                return orderBy(...condition.params);
            case 'limit':
                return limit(...condition.params);
            case 'startAt':
                return startAt(...condition.params);
            case 'startAfter':
                return startAfter(...condition.params);
            default:
                throw new ERROR(9999, `4451513123 normalize() => FirebaseHelper unsupported type=>{${type}}`)
        }
    }

    constraints = (conditions) => {
        return conditions.map(condition => this.normalize(condition))
    }

    compound = (path, conditions) => {
        const ref = this.reference(path);
        return _.size(conditions) > 0 ? query(ref, ...this.constraints(conditions)) : query(ref);
    }

    transaction = async (task = async (transaction) => true) => {
        return await runTransaction(this.firestore(), task)
    }


    /**
     *
     *predict(document,transaction) 裡面是atomic的行為，transcation可以get() -> document
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
    async updateDocumentAtomically(path, predict = async (documentOfLatest, transaction, ref) => documentOfLatest, id) {
        const self = this;
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, '474845146451964 updateDocumentAtomically 的id 不能為空值')
        }
        const uid = Util.getRandomHashV2(10);
        const behavior = async (transaction) => {
            const ref = self.reference(path, id);
            const docSnap = await transaction.get(ref);
            if (!docSnap.exists) {
                throw new ERROR(9999, `846865468 document ${libpath.join(path, id)} not exist`)
            }
            const document = docSnap.data();
            document.exists = true;
            const content = await predict(document, transaction, ref);
            if (!Util.isUndefinedNullEmpty(content)) transaction.update(ref, content);
            Util.appendInfo(`${uid} transaction update => path:/${path}/${id}`, `content ==> `, content);

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
        const unsubscribe = onSnapshot(this.reference(path, id), (doc) => {
            const status = doc.metadata.hasPendingWrites ? "local" : "server";
            callback(status, doc.data())
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
        const unsubscribe = onSnapshot(this.compound(path, conditions), (snapshot) => {
            const changes = [];
            const status = snapshot.metadata.hasPendingWrites ? "local" : "server";
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
        const snapShot = await getCountFromServer(this.reference(path));
        return snapShot.data().count;
    }


    /** 這是針對用desktop/mobile 選擇的檔案上傳機制 */
    uploadStorageFile = async (blob, folder = 'public', type = 'file') => {
        // Create a storage reference
        const uid = Util.getRandomHashV2(10);
        const storageRef = ref(this.storage(), `${folder}/${blob.name ?? `file-${Util.getRandomHashV2(10)}`}`);
        // Upload the file
        const snapshot = await uploadBytes(storageRef, blob);
        Util.appendInfo(`${uid} File uploaded successfully:`, snapshot);
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        Util.appendInfo(`${uid} File available at:`, downloadURL);
        return downloadURL;
    }

    /** 針對query後的documents總數
     * fetchSumOfSpecificAttribute('member',{type:'where',params:['age','<=',12]})
     * */
    fetchCountOfSpecificCondition = async (path, ...conditions) => {
        const snapshot = await getCountFromServer(this.compound(path, conditions));
        return snapshot.data().count;
    }

    /** 針對query後的document特定的numeric做_.sum
     * fetchSumOfSpecificAttribute('member','feeOfYear',{type:'where',params:['age','>=',20]})
     * */
    fetchSumOfSpecificAttribute = async (path, attribute = 'name', ...conditions) => {
        const snapshot = await getAggregateFromServer(this.compound(path, conditions),
            {sumOf: sum(attribute)});
        return snapshot.data().sumOf;

    }

    /** 針對query後的document特定的numeric做_.average
     * fetchAverageOfSpecificAttribute('member','height',{type:'where',params:['age','>=',20]})
     * */
    fetchAverageOfSpecificAttribute = async (path, attribute = 'name', ...conditions) => {
        const snapshot = await getAggregateFromServer(this.compound(path, conditions),
            {average: average(attribute)});
        return snapshot.data().average;
    }

    /** 取得多樣的回傳
     * multi = [...{name:variable,type:[sum|count|average],attribute:field in Document}];
     * count 不用給 attribute 或直接用 fetchCountOfSpecificCondition
     *
     * sample:fetchMultiResultOfSpecific('member',[{name:countOfMember,type:'count'},{name:sumOfPartyFee,type:'sum',attribute:'fee'},{name:averageOfWeight,type:'average',attribute:'weight'}], {type:'where',params:['age','>','11']} )
     * result: {countOfMember:11,sumOfPartyFee:2342,averageOfWeight:60}
     *
     * */
    fetchMultiResultOfSpecific = async (path, multi = [{name: 'name', type: 'sum', attribute: 'attr'}], ...conditions) => {
        function getObjectOfMulti(multi) {
            const object = {};
            for (const query of multi) {
                switch (query.type) {
                    case 'sum':
                        object[query.name] = sum(query.attribute);
                        break;
                    case 'count':
                        object[query.name] = count();
                        break;
                    case 'average':
                        object[query.name] = average(query.attribute);
                        break;
                }
            }
            return object;
        }

        const snapshot = await getAggregateFromServer(this.compound(path, conditions),
            getObjectOfMulti(multi))
        const result = snapshot.data();
        return Util.array2Obj(multi.map(query => Util.getObject(query.name, result[query.name])))
    }

}

export default new FirebaseHelper();
