const edit = true;
import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
import BaseFirebase from "./BaseFirebase";
import Config from "../config";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
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
    and
} from "firebase/firestore";
import { connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getDatabase } from "firebase/database";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import libpath from "path";

const MAX_COUNT_OF_FIRESTORE_BATCH = 300;
const MAX_COUNT_OF_FIRESTORE_FETCH = 150;

class FirebaseHelper extends BaseFirebase {
    /** web端當前的user */
    user;

    constructor() {
        super();
        if (this.auth() === undefined) return;
        const self = this;
        /** 因為和admin共用, firebase-admin沒有onAuthStateChanged 這個 function */
        onAuthStateChanged(this.auth(), (user) => {
            self.user = user;
            const event = require("../event").default;
            event.emitAuthStateChanged(user);
            Util.appendInfo(`8745412 FirebaseHelper登入後發布event了`, user);
        });

        if (_.isEqual(Config.env, "dev") && _.isEqual(Config.platform, "web")) {
            connectFunctionsEmulator(this.functions(), "localhost", 5002);
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
        return Util.exist(this.user) ? this.user.uid : "";
    };

    /** firestore對於attribute為timestamp看得懂的格式 */
    getServerTimeSymbol() {
        return serverTimestamp();
    }

    currentUser = () => {
        return this.user;
    };

    getGoogleAuthProvider() {
        const provider = new GoogleAuthProvider();
        return provider;
    }

    signInWithGoogle = async (asyncTask = async (result) => result) => {
        try {
            const result = await signInWithPopup(this.auth(), this.getGoogleAuthProvider());
            await asyncTask(result);
        } catch (error) {
            Util.appendInfo(`4545241354 pop-up頁面被無預期關閉 => ${error.message}`);
            throw new ERROR(9999, `8897899 登入發生錯誤`);
        }
    };

    logout = async () => {
        try {
            if (!Util.isUndefinedNullEmpty(this.user)) {
                await signOut(this.auth());
                Util.appendInfo("2556416521 User signed out successfully.");
            }
        } catch (error) {
            Util.appendInfo("45465454654 error signing out:", error.message);
        }
    };

    getTimeStampObj(millis) {
        return Timestamp.fromMillis(millis);
    }

    async getCurrentServerTimeStamp() {
        await this.firestore().collection("public").doc("timestamp").set({ serverTime: this.getServerTimeSymbol() });
        const timestamp = await this.firestore().collection("public").doc("timestamp").get();
        return timestamp.data().serverTime;
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
        return Util.isUndefinedNullEmpty(id) ? collection(this.firestore(), path) : doc(this.firestore(), path, id);
    };

    submitDocument = async (path, item = {}, id) => {
        const hasDocumentID = !Util.isUndefinedNullEmpty(id);
        const ref = this.reference(path, id);
        const docRef = !hasDocumentID ? await addDoc(ref, item) : await setDoc(ref, item);
        return { ...item, id: !hasDocumentID ? docRef.id : id, exists: true };
    };

    updateDocument = async (path, item = {}, id) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5987864 updateDocument()的id不能為空值`);
        return await updateDoc(this.reference(path, id), item);
    };

    /** 一個document可以擁有array屬性，這個function可以幫助append document array裡的item，不需要整個重寫*/
    appendDocumentArrayItem = async (path, id, attribute = "name", content = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `598781514 appendDocumentArrayItem()的id不能為空值`);
        return await this.updateDocument(path, Util.getObject(attribute, arrayUnion(content)), id);
    };

    /** 一個document可以擁有array屬性，這個function可以幫助delete document array裡的item，不需要整個重寫*/
    deleteDocumentArrayItem = async (path, id, attribute = "name", content = {}) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `518781514 deleteDocumentArrayItem()的id不能為空值`);
        return await this.updateDocument(path, Util.getObject(attribute, arrayRemove(content)), id);
    };

    /** atomically to increment 關於number的屬性，例如參訪人數之類的 */
    incrementDocumentNumeric = async (path, id, attribute, value = 1) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5187823514 incrementDocumentNumeric()的id不能為空值`);
        return await this.updateDocument(path, id, Util.getObject(attribute, increment(value)));
    };

    /** batch提供set, delete, update的功能, items就是帶進來的參數
     * todo: 可以設計為[....{ path:'route', content:{id:ioOfDoc}, behavior:'delete|set|update'}]，然後在predicate by case 處理
     * */
    batchDo = async (items, predicate = async (batch, object) => {}, batchCount = MAX_COUNT_OF_FIRESTORE_BATCH) => {
        async function commit(batch, count) {
            if (count > 0) {
                await batch.commit();
                Util.appendInfo(`5465465 batchDo execute commit(count:${count}) succeed`);
            }
        }

        Util.appendInfo(`54654456 batchDo is going to handle (count:${_.size(items)})`);
        let batch = writeBatch(this.firestore());
        let count = 0;

        while (items.length > 0) {
            await predicate(batch, items.shift());
            /** 由呼叫端去針對每個item視作 set/delete/update 的行為 */
            count = count + 1;
            /** 超過MAX先COMMIT次再歸零 */
            if (count >= batchCount) {
                await commit(batch, count);
                count = 0;
                batch = writeBatch(this.firestore());
            }
        }
        await commit(batch, count);
        Util.appendInfo(`5465466 batchDo (count:${_.size(items)}) succeed`);
    };

    submitDocuments = async (path, items) => {
        const result = [];
        await this.batchDo(items, (batch, item) => {
            const ref = this.reference(path, item.id);
            const itemRef = Util.isUndefinedNullEmpty(item.id) ? doc(ref) : ref;
            batch.set(itemRef, item);
            result.push({ ...item, id: itemRef.id });
        });
        return result;
    };

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
            const idsOfConstraint = querySnapshot.docs.map((doc) => doc.id);
            await this.batchDo(idsOfConstraint, (batch, id) => {
                const ref = this.reference(path, id);
                batch.update(ref, contentOfUpdate);
                result.push({ ...contentOfUpdate, id: ref.id });
            });
        } else {
            /** 2.針對已知的document id做batch update */
            await this.batchDo(items, (batch, item) => {
                const ref = this.reference(path, item.id);
                batch.update(ref, item);
                result.push({ ...item, id: ref.id });
            });
        }
        return result;
    };

    fetchDocuments = async (path, ...conditions) => {
        const querySnapshot = await getDocs(this.compound(path, conditions));
        const all = [];
        if (!querySnapshot.empty)
            querySnapshot.forEach((doc) => {
                // const total = querySnapshot.size;
                const data = doc.data();
                data._doc = doc;
                data.ref = doc.ref;
                data.id = _.isEmpty(data.id) ? doc.id : data.id;
                all.push(data);
            });
        return all;
    };

    async modifyDocumentsOfPaginate(uid, path, job, conditions, size = MAX_COUNT_OF_FIRESTORE_FETCH) {
        const collectionRef = this.compound(path, conditions);
        let lastDoc = null;
        let batchCount = 0;
        let totalProcessed = 0;

        while (true) {
            let q = query(collectionRef, limit(size)); // 以 document ID 排序，確保分頁正常運作
            if (lastDoc) q = query(collectionRef, startAfter(lastDoc), limit(size));

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                Util.appendInfo("9874564 ✅ 所有 documents 處理完畢");
                break;
            }
            const documents = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            await job(documents);
            // 執行每批次的任務，例如更新 updateTime

            lastDoc = snapshot.docs[snapshot.docs.length - 1]; // 記錄這批最後一筆，下一次從這裡繼續
            batchCount++;
            totalProcessed += documents.length;
            Util.appendInfo(`9874564 🔹 已處理第 ${batchCount} 批，累積 ${totalProcessed} 筆資料`);

            if (snapshot.size < size) break;
            // 小於 pageSize 代表已經到底
        }
    }

    fetchDocument = async (path, id) => {
        const docSnap = await getDoc(this.reference(path, id));
        return docSnap.exists() ? { ...docSnap.data(), id, _doc: docSnap, exists: true } : { exists: false };
    };

    /**
     * 批次讀取 Firestore documents，支援分批與額外欄位封裝。
     * @param {DocumentReference[]} references - 要讀取的 document references 陣列
     * @param {number} batchCount - 每批最大請求數，預設為 Firestore 最大值（例如 10）
     * @returns {Promise<Array<Object>>} - 每筆資料包含 `id`, `exists`, `_doc`, 以及其他資料欄位
     */
    fetchBatchDocuments = async (references, batchCount = MAX_COUNT_OF_FIRESTORE_FETCH) => {
        if (!references.length) return [];
        const allResults = [];
        for (let i = 0; i < references.length; i += batchCount) {
            const batch = references.slice(i, i + batchCount);
            const snapshots = await Promise.all(batch.map((ref) => getDoc(ref)));

            const batchResults = snapshots.map((snapshot) => {
                const data = snapshot.data() || {};
                return {
                    ...data,
                    id: data.id || snapshot.id,
                    exists: snapshot.exists(),
                    _doc: snapshot
                };
            });

            allResults.push(...batchResults);
        }
        return allResults;
    };

    getAutoDocumentID(xpath) {
        return doc(this.reference(xpath)).id;
    }

    async submitBatchParentsDocuments(pathOfParent = ["father", "children"], items = [{ father: { id: "" }, children: [{ id: "" }, { id: "" }] }], batchCount = 100) {
        const [parentCollection, childCollection] = pathOfParent;

        await this.batchDo(
            items,
            (batch, object) => {
                const parentData = object[parentCollection];
                const parentId = _.isEmpty(parentData.id) ? this.getAutoDocumentID(parentCollection) : parentData.id;
                parentData.id = parentId;
                const parentRef = this.reference(parentCollection, parentId);
                batch.set(parentRef, parentData);

                const children = object[childCollection] || [];

                for (const childData of children) {
                    const childId = _.isEmpty(childData.id) ? this.getAutoDocumentID(`${parentCollection}/${parentId}/${childCollection}`) : childData.id;
                    childData.id = childId;
                    const childRef = this.reference(`${parentCollection}/${parentId}/${childCollection}`, childId);
                    batch.set(childRef, childData);
                }
            },
            batchCount
        );
    }

    deleteBatchParentDocuments = async (pathOfParent = ["father", "children"], idsOfFather = [], batchCount = 200) => {
        const pathOfFather = _.head(pathOfParent);
        const pathOfSon = _.last(pathOfParent);
        await this.batchDo(
            idsOfFather,
            async (batch, id) => {
                const refOfFather = this.reference(pathOfFather, id);
                const childrenColRef = this.reference(`${pathOfFather}/${idsOfFather}/${pathOfSon}`);
                const childrenDocsSnap = await getDocs(childrenColRef);
                for (const childDoc of childrenDocsSnap.docs) batch.delete(childDoc.ref);
                batch.delete(refOfFather);
            },
            batchCount
        );
    };

    deleteDocument = async (path, id) => {
        await deleteDoc(this.reference(path, id));
    };

    deleteDocuments = async (path, whole, ...conditions) => {
        const all = _.isEqual(whole, true) ? await this.fetchDocuments(path) : await this.fetchDocuments(path, ...conditions);
        if (_.size(all) > 0)
            await this.batchDo(
                all.map((data) => data.ref),
                (batch, ref) => batch.delete(ref)
            );
    };

    /** {type:'where',params:['countOfPeople','>','10']} => where(...params) */
    normalize = (condition) => {
        const type = condition.type;
        switch (type) {
            case "where":
                return where(...condition.params);
            case "orderBy":
                return orderBy(...condition.params);
            case "limit":
                return limit(...condition.params);
            case "startAt":
                return startAt(...condition.params);
            case "startAfter":
                return startAfter(...condition.params);
            default:
                return undefined;
        }
    };

    sortedByPriority = (conditions) => {
        _.each(conditions, (each) => {
            switch (each.type) {
                case `where`:
                    each.index = 1;
                    break;
                case `orderBy`:
                    each.index = 2;
                    break;
                case `limit`:
                    each.index = 4;
                    break;
                case `startAt`:
                case `startAfter`:
                    each.index = 3;
                    break;
            }
        });
        return _.orderBy(conditions, ["index"], "asc");
    };

    constraints = (conditions) => {
        return _.filter(
            this.sortedByPriority(conditions).map((condition) => this.normalize(condition)),
            (each) => !_.isUndefined(each)
        );
    };

    compound = (path, conditions) => {
        const ref = this.reference(path);
        return _.size(conditions) > 0 ? query(ref, ...this.constraints(conditions)) : query(ref);
    };

    transaction = async (task = async (transaction) => true) => {
        return await runTransaction(this.firestore(), task);
    };

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
            throw new ERROR(9999, "474845146451964 updateDocumentAtomically 的id 不能為空值");
        }
        const uid = Util.getRandomHashV2(10);
        const behavior = async (transaction) => {
            const ref = self.reference(path, id);
            const docSnap = await transaction.get(ref);
            if (!docSnap.exists) {
                throw new ERROR(9999, `846865468 document ${libpath.join(path, id)} not exist`);
            }
            const document = docSnap.data();
            document.exists = true;
            const content = await predict(document, transaction, ref);
            if (!Util.isUndefinedNullEmpty(content)) transaction.update(ref, content);
            Util.appendInfo(`${uid} transaction update => path:/${path}/${id}`, `content ==> `, content);
        };
        return await this.transaction(behavior);
    }

    /**
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * data 就是寫入後的document value
     *
     * 回傳一個unsubscribe的function，需要要在componentDidUnmount的地方呼叫unsubscribe()
     * callback {status:[local|server|error|cache], changes: document, error:object }
     */
    listenDocument = (path, id, callback = (status, data, error) => true) => {
        const unsubscribe = onSnapshot(
            this.reference(path, id),
            (doc) => {
                const status = doc.metadata.hasPendingWrites ? "local" : "server";
                callback(status, { ...doc.data(), id: doc.id });
            },
            (error) => {
                callback("error", undefined, error);
            }
        );
        return unsubscribe;
    };

    /**
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * 監聽collection 變動，利用callback接收推播資訊
     * change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe
     *
     * callback {status:[local|server|error|cache], changes:[...{document}], error:object }
     * */
    listenDocuments = (path, callback = (status, array, error) => true, ...conditions) => {
        const unsubscribe = onSnapshot(
            this.compound(path, conditions),
            (snapshot) => {
                const changes = [];
                const status = snapshot.metadata.hasPendingWrites ? "local" : "server";
                // snapshot.docs; snapshot.size; snapshot.empty;
                snapshot.docChanges().forEach((change) => {
                    changes.push({
                        type: change.type /** [added|modified|removed] */,
                        id: change.doc.id,
                        data: change.doc.data()
                    });
                });
                callback(status, changes, undefined);
            },
            (error) => callback("error", undefined, error)
        );
        return unsubscribe;
    };

    fetchCountOfCollection = async (path) => {
        const snapShot = await getCountFromServer(this.reference(path));
        return snapShot.data().count;
    };

    /** 這是針對用desktop/mobile 選擇的檔案上傳機制
     *  前端以blob為主，而file selected選到的資料格式如下
     * {
     *     "name": "截圖 2024-07-15 下午8.38.30.png",
     *     "index": "0",
     *     "blob": file,
     *     "url": "blob:http://localhost:8080/4f6c25b3-8d6f-4d06-a236-6f9a4b13211a"
     * }
     *
     * */

    uploadStorageFile = async (file, folder = "public", fileNameExtension = undefined) => {
        function getContentType(fileName) {
            const extension = fileName.split(".").pop().toLowerCase();
            const mimeTypes = {
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                png: "image/png",
                gif: "image/gif",
                bmp: "image/bmp",
                webp: "image/webp",
                pdf: "application/pdf",
                txt: "text/plain",
                html: "text/html",
                css: "text/css",
                js: "application/javascript",
                json: "application/json",
                xml: "application/xml",
                mp4: "video/mp4",
                mp3: "audio/mpeg",
                wav: "audio/wav",
                ogg: "audio/ogg",
                zip: "application/zip",
                rar: "application/vnd.rar",
                doc: "application/msword",
                docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ppt: "application/vnd.ms-powerpoint",
                pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                xls: "application/vnd.ms-excel",
                xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                // 其他你可能需要的类型
            };

            return mimeTypes[extension] || "application/octet-stream";
        }

        // Create a storage reference
        const uid = Util.getRandomHashV2(10);
        const fileName = fileNameExtension ?? file.name;
        const storageRef = ref(this.storage(), `${folder}/${fileName ?? `file-${Util.getRandomHashV2(10)}`}`);
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file.blob, { contentType: getContentType(fileName) });
        Util.appendInfo(`${uid} ${fileName} own following meta: `, getContentType(fileName));
        Util.appendInfo(`${uid} File uploaded successfully:`);
        const downloadURL = await getDownloadURL(snapshot.ref);
        Util.appendInfo(`${uid} File available at:`, downloadURL);
        return downloadURL;
    };

    /** 針對query後的documents總數
     * fetchSumOfSpecificAttribute('member',{type:'where',params:['age','<=',12]})
     * */
    fetchCountOfSpecificCondition = async (path, ...conditions) => {
        const snapshot = await getCountFromServer(this.compound(path, conditions));
        return snapshot.data().count;
    };

    /** 針對query後的document特定的numeric做_.sum
     * fetchSumOfSpecificAttribute('member','feeOfYear',{type:'where',params:['age','>=',20]})
     * */
    fetchSumOfSpecificAttribute = async (path, attribute = "name", ...conditions) => {
        const snapshot = await getAggregateFromServer(this.compound(path, conditions), { sumOf: sum(attribute) });
        return snapshot.data().sumOf;
    };

    /** 針對query後的document特定的numeric做_.average
     * fetchAverageOfSpecificAttribute('member','height',{type:'where',params:['age','>=',20]})
     * */
    fetchAverageOfSpecificAttribute = async (path, attribute = "name", ...conditions) => {
        const snapshot = await getAggregateFromServer(this.compound(path, conditions), { average: average(attribute) });
        return snapshot.data().average;
    };

    /** 取得多樣的回傳
     * multi = [...{name:variable,type:[sum|count|average],attribute:field in Document}];
     * count 不用給 attribute 或直接用 fetchCountOfSpecificCondition
     *
     * sample:fetchMultiResultOfSpecific('member',[{name:countOfMember,type:'count'},{name:sumOfPartyFee,type:'sum',attribute:'fee'},{name:averageOfWeight,type:'average',attribute:'weight'}], {type:'where',params:['age','>','11']} )
     * result: {countOfMember:11,sumOfPartyFee:2342,averageOfWeight:60}
     *
     * */
    fetchMultiResultOfSpecific = async (path, multi = [{ name: "name", type: "sum", attribute: "attr" }], ...conditions) => {
        function getObjectOfMulti(multi) {
            const object = {};
            for (const query of multi) {
                switch (query.type) {
                    case "sum":
                        object[query.name] = sum(query.attribute);
                        break;
                    case "count":
                        object[query.name] = count();
                        break;
                    case "average":
                        object[query.name] = average(query.attribute);
                        break;
                }
            }
            return object;
        }

        const snapshot = await getAggregateFromServer(this.compound(path, conditions), getObjectOfMulti(multi));
        const result = snapshot.data();
        return Util.array2Obj(multi.map((query) => Util.getObject(query.name, result[query.name])));
    };
}

export default new FirebaseHelper();
