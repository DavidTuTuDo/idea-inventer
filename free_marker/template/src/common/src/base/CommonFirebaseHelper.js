const edit = true;
import {exceptioner as ERROR, utiller as Util} from "utiller";
import _ from "lodash";
import BaseFirebase from "./BaseFirebase";
import CommonPoolHelper from "./CommonPoolHelper";
import Config from '../config';
import {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut} from "firebase/auth";
import {
    getCountFromServer,
    updateDoc,
    arrayUnion,
    arrayRemove,
    runTransaction,
    deleteDoc,
    writeBatch,
    collection,
    doc,
    setDoc,
    onSnapshot,
    getDoc,
    getDocs,
    getFirestore,
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
import {connectFunctionsEmulator, getFunctions, httpsCallable} from "firebase/functions";
import {getDatabase} from "firebase/database";
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import libpath from 'path';

const MAX_COUNT_OF_FIRESTORE_BATCH = 300;

class CommonFirebaseHelper extends BaseFirebase {

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

    firestore() {
        return getFirestore(this.app())
    }

    functions() {
        return getFunctions(this.app())
    }

    database() {
        return getDatabase(this.app())
    }

    auth() {
        return getAuth(this.app())
    }

    storage() {
        return getStorage(this.app())
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
            const credential = GoogleAuthProvider.credential(Util.getExistOne(credential.idToken, credential.oauthIdToken));
            try {
                const result = await signInWithCredential(self.auth(), credential);
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
        return Util.isUndefinedNullEmpty(id) ? collection(this.firestore(), path) : doc(this.firestore(), path, id)
    }

    submitDocument = async (path, item = {}, id) => {
        const ref = this.reference(path, id);
        await setDoc(ref, item);
        return {...item, id: ref.id, exists: true};
    }

    updateDocument = async (path, id, item = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5987864 updateDocument()的id不能為空值`);
        return await updateDoc(this.reference(path, id), item)
    }

    /** 一個document可以擁有array屬性，這個function可以幫助append document array裡的item，不需要整個重寫*/
    appendDocumentArrayItem = async (path, id, attribute = 'name', content = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `598781514 appendDocumentArrayItem()的id不能為空值`);
        const object = {}
        object[attribute] = arrayUnion(content);
        return await this.updateDocument(path, id, object);
    }

    /** 一個document可以擁有array屬性，這個function可以幫助delete document array裡的item，不需要整個重寫*/
    deleteDocumentArrayItem = async (path, id, attribute = 'name', content = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `518781514 deleteDocumentArrayItem()的id不能為空值`);
        const object = {}
        object[attribute] = arrayRemove(content);
        return await this.updateDocument(path, id, object);
    }

    /** atomically to increment 關於number的屬性，例如參訪人數之類的 */
    incrementDocumentNumeric = async (path, id, attribute, value = 1) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5187823514 incrementDocumentNumeric()的id不能為空值`);
        const object = {}
        object[attribute] = increment(value);
        return await this.updateDocument(path, id, object);
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
            predicate(items.shift(), batch);
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
        return await this.batchDo(items, (batch, item) => {
            batch.set(this.reference(path, _.toString(item.id)))
        })
    }

    updateDocuments = async (path, items) => {
        return await this.batchDo(items, (batch, item) => {
            if (Util.isUndefinedNullEmpty(_.toString(item.id))) throw new ERROR(9999, `6525435441313 updateDocuments的item沒有valid id => ${item.id}`)
            batch.update(this.reference(path, _.toString(item.id)))
        })
    }

    fetchDocuments = async (path, ...conditions) => {
        console.log('56565656 ==> ',conditions);
        const compound = query(this.reference(path), ...conditions.map(condition => this.normalize(condition)))
        const querySnapshot = await getDocs(compound);
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

    fetchDocument = async (path, id) => {
        const docSnap = await getDoc(this.reference(path, id));
        return docSnap.exists() ? {...docSnap.data(), id, _doc: docSnap, exists: true} : {exists: false};
    }

    deleteDocument = async (path, id) => {
        await deleteDoc(this.reference(path, id));
    }

    deleteDocuments = async (path, whole, ...conditions) => {
        const all = [];
        const querySnapshot = _.isEqual(whole, true) ? await this.fetchDocuments(path) : await this.fetchDocuments(path, ...conditions.map(this.normalize(conditions)));
        querySnapshot.forEach((doc) => all.push(doc.ref));
        await this.batchDo(all, (batch, ref) => batch.delete(ref));
    }

    /** {type:'where',params:['countOfPeople','>','10']} => where(...params) */
    normalize(condition) {
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
                throw new ERROR(9999, `4451513123 normalize() => CommonFirebaseHelper unsupported type=>{${type}}`)
        }
    }

    transaction = async (task = async (transaction) => true) => {
        return await runTransaction(this.firestore(), task)
    }

    /** predict 裡面寫 content | 觸發throw error的規則
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
            const content = await predict(document, transaction);
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
        const compound = query(this.reference(path), ...conditions.map(condition => this.normalize(condition)))
        const unsubscribe = onSnapshot(compound, (snapshot) => {
            const changes = [];
            const status = snapshot.metadata.hasPendingWrites ? "local" : "server";
            // snapshot.docs; snapshot.size; snapshot.empty;
            snapshot.docChanges().forEach((change) => {
                changes.push({
                    type: change.type,/** [added|modified|removed] */
                    id: change.doc.id,
                    data: change.doc.data()
                })
            })
            callback(status, changes, undefined)
        }, (error) => callback('error', undefined, error))
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

    /** 針對query後的documents總數*/
    fetchCountOfSpecificCondition(path, ...conditions) {
    }

    /** 針對query後的document特定的numeric做_.sum */
    fetchSumOfSpecificAttribute(path, attribute = 'name', ...conditions) {
    }

    /** 針對query後的document特定的numeric做_.averge */
    fetchAverageOfSpecificAttribute(path, attribute = 'name', ...conditions) {

    }

    /** 取得多樣的回傳
     * const snapshot = await getAggregateFromServer(coll, {
     *   countOfDocs: count(),
     *   totalPopulation: sum('population'),
     *   averageAge: average('age')
     * });
     *
     * console.log('countOfDocs: ', snapshot.data().countOfDocs);
     * console.log('totalPopulation: ', snapshot.data().totalPopulation);
     * console.log('averageAge: ', snapshot.data().averageAge);
     * */
    fetchMultiResultOfSpecific(path, multi = [{type: 'sum', attribute: 'name'}], ...condition) {

    }


}

export default new CommonFirebaseHelper();
