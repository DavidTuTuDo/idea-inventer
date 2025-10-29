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
import { ref, uploadBytes, getDownloadURL, getStorage, listAll, deleteObject } from "firebase/storage";
import libpath from "path";
import event from "../event";

const MAX_COUNT_OF_FIRESTORE_BATCH = 200;

const RemoteDo = {
    Query: 1, // fetch
    Modified: 2 // set, update, delete
};

class FirebaseHelper extends BaseFirebase {
    /** web端當前的user */
    user;

    constructor() {
        super();
        this.unsubscribeAuth = null;
        if (this.auth() === undefined) return;
        if (_.isEqual(Config.env, "dev") && _.isEqual(Config.platform, "web")) {
            connectFunctionsEmulator(this.functions(), "localhost", 5001);
        }
    }

    /**
     * 專門用於啟動 Firebase 認證狀態監聽的方法
     * 該方法應在應用程式啟動時，需要監聽狀態變化的組件之前被調用。
     */
    startAuthListener = () => {
        if (this.auth() === undefined || this.unsubscribeAuth !== null) {
            // 已經啟動了，或者沒有 Auth 實例
            return;
        }
        const self = this;
        // 啟動監聽，並將取消函數儲存起來
        this.unsubscribeAuth = onAuthStateChanged(this.auth(), (user) => {
            self.user = user;
            // 首次載入時和狀態變化時都會觸發
            event.emitAuthStateChanged(user);
        });
    };

    /**
     * 取消認證狀態監聽
     */
    stopAuthListener = () => {
        if (this.unsubscribeAuth) {
            this.unsubscribeAuth();
            this.unsubscribeAuth = null;
        }
    };

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

    /**
     * 拿到ref => firestore的ref有區分 collectionRef 和 documentRef
     * 有點彈性有點抽象，要硬記的function，如果id為空直，回傳collection()|反之就一定會回doc()，一定要想清楚當下情境是要collection還是doc
     * @param path 通常意義是collection name
     * @param id 通常意義是指 document name
     * @param asDoc 強制回傳一個doc()=>document path
     * */
    reference = (path, id, { asDoc = false } = {}) => {
        if (asDoc) return Util.isUndefinedNullEmpty(id) ? doc(this.firestore(), path) : doc(this.firestore(), path, id);
        if (_.isEqual(id, "asObj")) return doc(this.firestore(), path);
        return Util.isUndefinedNullEmpty(id) ? collection(this.firestore(), path) : doc(this.firestore(), path, id);
    };

    submitDocument = async (path, item = {}, id) => {
        const hasDocumentID = !Util.isUndefinedNullEmpty(id);
        const ref = this.reference(path, id);
        const docRef = !hasDocumentID ? await addDoc(ref, item) : await setDoc(ref, item);
        return { ...item, id: !hasDocumentID ? docRef.id : id, exists: true };
    };

    async upsertDocument(path, data, id) {
        // 使用您專案中既有的檢查函式
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, "upsertDocument 需要一個明確的 id");
        // 使用您專案中既有的 reference 函式來取得文件參考
        const docRef = this.reference(path, id);
        // 使用 { merge: true } 選項來實現 "upsert"，並讓錯誤自然向上拋出
        await setDoc(docRef, data, { merge: true });
    }

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

    /**
     * 執行批次寫入操作（Set, Delete, Update）。
     * 函式會在達到最大批次數量時自動提交（Commit）並開始新的批次。
     * 【重要】此函式將不會捕獲 predicate 函式中的任何錯誤，錯誤將直接傳播到 batchDo 的呼叫端。
     * @param {Array<Object>} documents - 要處理的文件資料陣列。
     * @param {function(batch: MAX_COUNT_OF_FIRESTORE_BATCH.WriteBatch, document: Object): (void | Promise<any>)} [predicate] - 處理每個文件的函式。應使用 batch.set/delete/update 將操作加入批次中。其中 `document` 包含 `id` 和 `_doc` 屬性。
     * @param {number} [batchCount=MAX_COUNT_OF_FIRESTORE_BATCH] - 單個批次最多包含的操作數量 (Firestore 限制為 500)。
     * @returns {Promise<Number>}
     * @throws {Error} - 如果在 predicate 或 batch commit 中發生錯誤。
     */
    batchDo = async (documents, predicate = async (batch, document) => {}, batchCount = MAX_COUNT_OF_FIRESTORE_BATCH) => {
        async function commit(batch, count) {
            if (count > 0) {
                // commit 失敗會拋出錯誤，由外部呼叫者處理
                await batch.commit();
                Util.appendInfo(`1242232 web batch do commit(count:${count}) succeed`);
            }
        }

        // 檢查 documents
        if (!Array.isArray(documents) || documents.length === 0) {
            Util.appendInfo(`1231232 web batch do: documents array is empty or invalid.`);
            return;
        }

        const totalCount = documents.length;
        Util.appendInfo(`1231232 web batch do is going to handle (count:${totalCount})`);
        let batch = writeBatch(this.firestore()); // Web SDK: 使用 writeBatch(db)
        let count = 0; // 當前批次中的操作數量

        // 使用 for...of 迴圈以確保串行控制
        for (const document of documents) {
            // 1. 執行 predicate。
            const result = predicate(batch, document);
            // 2. 檢查是否為 Promise，並等待其完成。
            if (result && typeof result.then === "function") await result;
            count++; // 累加操作數量
            // 檢查是否達到批次上限，如果是，則提交並重置
            if (count >= batchCount) {
                await commit(batch, count);
                count = 0;
                batch = writeBatch(this.firestore()); // 開始新的批次
            }
        }
        // 提交最後一個未滿的批次
        await commit(batch, count);
        Util.appendInfo(`32312312 web batch do (count:${totalCount}) succeed`);
        return totalCount;
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
     * 批次更新指定的 id 文件。
     * @param {string} path - Collection 路徑。
     * @param {Array<object>} [documents=[]] - 要更新的文件陣列，每個文件必須包含 'id' 欄位。
     * @returns {Promise<void>}
     */
    updateDocuments = async (path, documents = [{ id: "" }]) => {
        await this.batchDo(documents, (batch, document) => {
            batch.update(this.reference(path, document.id), document);
        });
    };

    /**
     * 批次更新所有符合條件的文件。
     * @param {string} path - Collection 路徑。
     * @param {object} obj2Update - 要套用到所有符合文件上的更新內容。
     * @param {...object|function} conditions - Firestore 查詢條件。
     * @returns {Promise<Array>} - 操作成功回傳 true。
     */
    updateEligibleDocuments = async (path, obj2Update, ...conditions) => {
        const task = (batch, document) => {
            // 注意：這裡使用 document._doc.ref 取得 documentRef
            batch.update(document._doc.ref, obj2Update);
        };
        // 在 Modified 模式下，不需要 selected: true
        return await this.pagination({ path, conditions, task });
    };

    /**
     * 獲取符合條件的所有文件 (使用分頁讀取)。
     * @param {string} path - Collection 路徑。
     * @param {...object|function} conditions - Firestore 查詢條件 (where, orderBy, limit, 等)。
     * @returns {Promise<Array<object>>} - 文件陣列。
     */
    fetchDocuments = async (path, ...conditions) => {
        return this.pagination({ path, conditions });
    };

    async modifyDocumentsOfPaginate(uid, path, job, conditions, size = MAX_COUNT_OF_FIRESTORE_BATCH) {
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
    fetchBatchDocuments = async (references, batchCount = MAX_COUNT_OF_FIRESTORE_BATCH) => {
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

    /**
     * 批次刪除指定的 id 文件。
     * @param {string} path - Collection 路徑。
     * @param {Array<object>} documents - 要刪除的文件陣列，每個文件必須包含 'id' 欄位。
     * @returns {Promise<void>}
     */
    deleteDocuments = async (path, documents) => {
        await this.batchDo(documents, (batch, document) => {
            batch.delete(this.reference(path, document.id));
        });
    };

    /**
     * 批次刪除所有符合條件的文件。
     * @param {string} path - Collection 路徑。
     * @param {...object|function} conditions - Firestore 查詢條件。
     * @returns {Promise<Array>} - 操作成功回傳。
     */
    deleteEligibleDocuments = async (path, ...conditions) => {
        const task = (batch, document) => {
            batch.delete(document._doc.ref);
        };
        // 在 Modified 模式下，不需要 selected: true
        return await this.pagination({ path, conditions, task });
    };

    /**
     * 刪除整個 Collection 中的所有文件 (透過分頁刪除)。
     * @param {string} path - Collection 路徑。
     * @returns {Promise<Array>} - 操作成功回傳 true。
     */
    deleteWholeDocuments = async (path) => {
        const task = (batch, document) => {
            batch.delete(document._doc.ref);
        };
        // 注意：這裡的 conditions 陣列為空，表示刪除所有
        return await this.pagination({ path, conditions: [], task });
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
            case "startAfter":
                return startAfter(...condition.params);
            case "startAt":
                return startAt(...condition.params);
            case "or":
                return or(...condition.params);
            case "and":
                return and(...condition.params);
            default:
                return undefined;
        }
    };

    sortedByPriority = (conditions) => {
        _.each(conditions, (each) => {
            switch (each.type) {
                case `where`:
                case `or`:
                case `and`:
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

    /**
     * 【分頁讀取與批次處理】 迭代地讀取符合條件的所有文件。
     * @param {object} options - 分頁選項。
     * @param {string} [options.path=''] - Collection 路徑。
     * @param {Array<any>} [options.conditions=[]] - 查詢條件 (where, orderBy等)。Web SDK 格式：`{ type: 'where', params: ['field', '==', 'value'] }`。
     * @param {number} [options.pageSize=MAX_COUNT_OF_FIRESTORE_BATCH] - 每次查詢獲取的文件數量。
     * @param {function(batch: Firestore.WriteBatch, document: Object): (void | Promise<any>)} [options.task=null] - 可選的處理函式。如果提供，將啟用 Modified 模式，並使用 batchDo 進行批次寫入。
     * @returns {Promise<Array>} - Query 模式返回文件陣列；Modified 模式返回 true (表示操作成功)。
     */
    pagination = async ({ path = "", conditions = [], pageSize = MAX_COUNT_OF_FIRESTORE_BATCH, task = null }) => {
        const hasTask = task && _.isFunction(task);
        const behavior = hasTask ? RemoteDo.Modified : RemoteDo.Query;

        // ---【分頁穩定性檢查】---
        const hasOrderBy = conditions.some((c) => (_.isPlainObject(c) && Object.keys(c).includes("orderBy")) || (_.isPlainObject(c) && c.type === "orderBy"));

        let finalConditions = conditions;
        if (!hasOrderBy) {
            // Web SDK: 如果沒有明確排序，強制以 documentId 進行排序
            const orderByCondition = { type: "orderBy", params: [documentId()] };
            finalConditions = [...conditions, orderByCondition];
        }
        // ---【分頁穩定性檢查】---

        let lastDocSnap = null;
        let batchCount = 0;
        let totalFetched = 0;
        const all = [];

        while (true) {
            let queryConstraints = [...finalConditions];

            // 設置游標 (StartAfter)
            if (lastDocSnap) queryConstraints.push({ type: "startAfter", params: [lastDocSnap] });

            //設置查詢限制 (Limit)
            const hasLimit = conditions.some((c) => (_.isPlainObject(c) && Object.keys(c).includes("limit")) || (_.isPlainObject(c) && c.type === "limit"));

            if (!hasLimit) queryConstraints.push({ type: "limit", params: [pageSize] });

            //  執行查詢
            const snapshot = await getDocs(this.compound(path, queryConstraints));

            if (snapshot.empty) {
                Util.appendInfo(`991235 path:/${path} paginate has completed.`);
                break;
            }

            const documents = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                data._doc = docSnap; // 將原始快照物件保留，以便在 Modified 模式下進行操作
                data.id = docSnap.id || data.id;
                return data;
            });

            switch (behavior) {
                case RemoteDo.Query:
                    all.push(...documents);
                    break;
                case RemoteDo.Modified:
                    // 將 task 傳遞給 batchDo 的 predicate 參數
                    all.push(...documents.map((each) => each.id));
                    await this.batchDo(documents, task);
                    break;
                default:
                    throw new Error(`1561521213421 un-handled behavior => ${behavior}`);
            }

            lastDocSnap = snapshot.docs[snapshot.docs.length - 1]; // 記錄這批最後一筆的 DocumentSnapshot
            batchCount++;
            totalFetched += documents.length;
            Util.appendInfo(`991236 path:/${path} fetched ${documents.length} documents in batch ${batchCount}. Total fetched: ${totalFetched}`);

            if (snapshot.size < pageSize) {
                // 如果獲取的數量少於 pageSize，代表已經到底
                break;
            }
        }
        return all;
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
     *atomic = transaction邏輯
     * fetch回來一個document時遠端會針當前doc寫一個sign，如果update document時發現sign不一樣(代表document被更動過)，就會執行retry，而且transaction update/delete/set 不需要加上await，只有get需要
     * */

    /**
     * 處理 Firestore 原子操作的核心邏輯。
     * @param {string} path - 集合路徑。
     * @param {string} id - 文件 ID。
     * @param {function} behavior - 事務執行函數，處理讀取和寫入邏輯。
     */
    /**
     * 處理 Firestore 原子操作的核心執行函式。
     * 它執行讀取、呼叫預測函數，並處理共同的驗證和日誌記錄。
     * @param {string} path - 集合路徑。
     * @param {string} id - 文件 ID。
     * @param {string} operationType - 操作類型 ('update' 或 'upsert')，用於日誌記錄和驗證。
     * @param {function(documentOfLatest|null, transaction, ref): Promise<object>} predictFn - 預測更新/插入內容的回調函數。
     * @returns {Promise<any>} - 事務的結果。
     */
    async executeAtomicOperation(path, id, operationType, predictFn) {
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, `994784746 ${operationType}DocumentAtomically 的 id 不能為空值`);
        }

        const uid = Util.getRandomHashV2(10);
        const ref = this.reference(path, id);

        const behavior = async (transaction) => {
            // --- 1. 讀取 (Read) ---
            const docSnap = await transaction.get(ref);
            let document = docSnap.data() || {};
            document.exists = docSnap.exists;

            // --- 2. 驗證 (Validation) for 'update' 類型 ---
            if (operationType === "update" && !docSnap.exists) {
                throw new ERROR(9999, `846865468 document ${libpath.join(path, id)} not exist. Cannot update a non-existent document.`);
            }

            // --- 3. 預測寫入內容 (Prediction) ---
            // predictFn: (documentOfLatest, transaction, ref) => contentOfUpdate
            const contentOfUpdate = await predictFn(document, transaction, ref);

            // --- 4. 寫入 (Write) ---
            if (!Util.isUndefinedNullEmpty(contentOfUpdate)) {
                if (operationType === "update") {
                    // 如果是更新操作，則使用 update()
                    transaction.update(ref, contentOfUpdate);
                } else if (operationType === "upsert") {
                    // 如果是 upsert 操作，則使用 set() 搭配 merge: true
                    transaction.set(ref, contentOfUpdate, { merge: true });
                }

                Util.appendInfo(`${uid} transaction ${operationType} => path:/${path}/${id}`, `content ==> `, contentOfUpdate);
            }
        };

        // 執行事務
        return await this.transaction(behavior);
    }

    /**
     * 原子地更新一個現有的文件。如果文件不存在則拋出錯誤。
     * @param {string} path - 集合路徑。
     * @param {function(documentOfLatest, transaction, ref): Promise<object>} predict - 預測更新內容的回調函數。
     * @param {string} id - 文件 ID。
     * @returns {Promise<any>} - 事務的結果。
     */
    async updateDocumentAtomically(path, predict, id) {
        // 使用核心執行器，並指定操作類型為 'update'
        return await this.executeAtomicOperation(path, id, "update", predict);
    }

    /**
     * 原子地插入或更新一個文件 (Upsert)。
     * 如果文件存在則更新 (merge)，不存在則創建。
     * @param {string} path - 集合路徑。
     * @param {function(documentOfLatest|{exists: false}, transaction, ref): Promise<object>} predict - 預測更新/插入內容的回調函數。
     * @param {string} id - 文件 ID。
     * @returns {Promise<any>} - 事務的結果。
     */
    async upsertDocumentAtomically(path, predict, id) {
        // 使用核心執行器，並指定操作類型為 'upsert'
        return await this.executeAtomicOperation(path, id, "upsert", predict);
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

    uploadStorageFile = async (
        file,
        folder = "public",
        fileNameExtension = undefined,
        maxSizeInBytes = 5 * 1024 * 1024 // 預設 5MB
    ) => {
        if (!file || !file.name || !file.blob) {
            throw new Error("Invalid file format. Expecting { name, blob }.");
        }

        if (!(file.blob instanceof Blob)) {
            throw new Error("file.blob must be a Blob object.");
        }

        if (file.blob.size > maxSizeInBytes) {
            throw new Error(`File size exceeds the limit of ${maxSizeInBytes / 1024 / 1024} MB.`);
        }

        const getContentType = (fileName) => {
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
            };
            return mimeTypes[extension] || "application/octet-stream";
        };

        const uid = Util.getRandomHashV2(10);
        const fileName = fileNameExtension ?? file.name ?? `file-${uid}`;
        const storageRef = ref(this.storage(), `${folder}/${fileName}`);
        const contentType = getContentType(fileName);

        try {
            const snapshot = await uploadBytes(storageRef, file.blob, { contentType });
            Util.appendInfo(`${uid} ${fileName} own following meta: `, contentType);
            Util.appendInfo(`${uid} File uploaded successfully.`);
            const downloadURL = await getDownloadURL(snapshot.ref);
            Util.appendInfo(`${uid} File available at:`, downloadURL);
            return downloadURL;
        } catch (error) {
            Util.appendError(`${uid} Upload failed: ${error.message}`, error);
            throw error;
        }
    };

    uploadStorageFiles = async (files, folder = "public", fileNameExtensions = [], maxSizeInBytes = 5 * 1024 * 1024) => {
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error("Invalid input: files should be a non-empty array.");
        }

        const uploadPromises = files.map(async (file, index) => {
            try {
                const fileNameExt = fileNameExtensions[index] ?? undefined;
                return await this.uploadStorageFile(file, folder, fileNameExt, maxSizeInBytes);
            } catch (err) {
                const uid = Util.getRandomHashV2(10);
                Util.appendError(`${uid} Skipping file due to error: ${err.message}`, err);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        return urls.filter(Boolean);
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

    batchDeleteStorageByPrefixes = async (prefixes, batchCount = 50) => {
        /**
         * 辅助函数：将数组分割成指定大小的块
         * @param {Array<T>} array 原始数组
         * @param {number} size 块的大小
         * @returns {Array<Array<T>>} 分割后的块数组
         */
        const chunkArray = (array, size) => {
            const chunked = [];
            for (let i = 0; i < array.length; i += size) {
                chunked.push(array.slice(i, i + size));
            }
            return chunked;
        };

        /**
         * 递归地删除给定引用下的所有文件（包括子文件夹）。
         * @param {object} currentRef - 当前路径的 StorageReference 对象
         * @param {number} internalBatchSize - 内部并发删除的批次大小
         * @returns {Promise<object[]>} 内部删除操作的结果列表
         */
        async function deleteFolderContents(currentRef, internalBatchSize) {
            let listResult;
            try {
                listResult = await listAll(currentRef);
            } catch (listError) {
                // 如果 listAll 失败（例如：路径不存在或权限不足），记录错误并返回空结果
                const path = currentRef.fullPath || currentRef.toString();
                console.error(`[List Failed] 无法列出路径 ${path} 下的文件: ${listError.message}`);
                return [{ status: "rejected", path, reason: `List failed: ${listError.message}` }];
            }

            let allDeletePromises = [];

            // 1. 处理当前路径下的所有文件 (items)
            for (const itemRef of listResult.items) {
                // 对每个文件创建删除 Promise，并捕获错误
                const deletePromise = deleteObject(itemRef)
                    .then(() => ({ status: "fulfilled", path: itemRef.fullPath, message: `Deleted ${itemRef.fullPath}` }))
                    .catch((error) => ({ status: "rejected", path: itemRef.fullPath, reason: error.message }));

                allDeletePromises.push(deletePromise);
            }

            // 2. 递归处理所有子文件夹 (prefixes)
            for (const prefixRef of listResult.prefixes) {
                // 递归调用，并将返回的 Promise 收集起来
                const nestedResultsPromise = deleteFolderContents(prefixRef, internalBatchSize);
                allDeletePromises.push(nestedResultsPromise.then((res) => res.flat())); // 扁平化嵌套结果
            }

            // 3. 严格执行批次删除，防止过多并发请求
            let finalResults = [];
            const deleteChunks = chunkArray(allDeletePromises, internalBatchSize);

            for (const chunk of deleteChunks) {
                // 使用 Promise.allSettled 并行执行当前批次，并等待完成
                const chunkResults = await Promise.allSettled(chunk);

                // 收集结果：处理来自递归调用的嵌套数组结果
                for (const result of chunkResults) {
                    if (result.status === "fulfilled") {
                        // 如果结果是数组（来自嵌套递归），则扁平化；否则直接添加
                        if (Array.isArray(result.value)) {
                            finalResults.push(...result.value);
                        } else {
                            finalResults.push(result.value);
                        }
                    } else {
                        finalResults.push(result.reason); // Rejected promise
                    }
                }
            }

            return finalResults.flat(); // 最终返回扁平化的操作结果列表
        }

        if (!prefixes || prefixes.length === 0) {
            console.log("batchDeleteStorageByPrefixesWeb: 沒有要處理的前綴。");
            return [];
        }

        console.log(`batchDeleteStorageByPrefixesWeb: 開始批量刪除，共 ${prefixes.length} 個前綴，批次大小: ${batchCount}`);

        const prefixChunks = chunkArray(prefixes, batchCount);
        let allOperationResults = [];
        let chunkIndex = 0;

        // 1. 串行處理每個前綴批次 (使用 for...of + await)
        for (const prefixChunk of prefixChunks) {
            chunkIndex++;
            console.log(`\n--- 開始處理批次 ${chunkIndex}/${prefixChunks.length} (${prefixChunk.length} 個前綴) ---`);

            // 2. 在每個批次內部，並行發起 "list and delete" 任務 (使用 Promise.allSettled)
            const prefixDeleteTasks = prefixChunk.map((prefix) => {
                const pathRef = ref(this.storage(), prefix);

                // deleteFolderContents 負責遞歸和內部批次控制
                return deleteFolderContents(pathRef, batchCount)
                    .then((results) => ({ status: "fulfilled", prefix, results }))
                    .catch((error) => ({ status: "rejected", prefix, reason: error.message }));
            });

            // 3. 等待當前批次中的所有前綴處理完成
            const chunkResults = await Promise.allSettled(prefixDeleteTasks);

            // 收集結果
            allOperationResults = allOperationResults.concat(chunkResults.map((r) => r.value || r.reason));
        }

        // 4. 統計和報告最終結果
        const successfulDeletes = allOperationResults.filter((r) => r.status === "fulfilled");
        const failedDeletes = allOperationResults.filter((r) => r.status === "rejected");
        let totalFilesDeleted = 0;
        successfulDeletes.forEach((s) => {
            if (s.results) {
                // s.results 是內部檔案刪除的結果列表
                totalFilesDeleted += s.results.filter((r) => r.status === "fulfilled").length;
            }
        });

        console.log(`\n========================================================`);
        console.log(`總嘗試刪除的前綴數: ${allOperationResults.length}`);
        console.log(`-> 成功處理前綴數量: ${successfulDeletes.length}`);
        console.log(`-> 失敗處理前綴數量: ${failedDeletes.length}`);
        console.log(`-> 總計成功刪除的文件數: ${totalFilesDeleted}`);

        if (failedDeletes.length > 0) {
            console.error("部分前綴處理失敗詳情:");
            failedDeletes.forEach((f) => {
                console.error(` - 前綴: ${f.prefix}, 原因: ${f.reason}`);
            });
        } else {
            console.log("所有前綴批次處理成功完成。");
        }
        console.log(`========================================================\n`);

        return allOperationResults;
    };
}

export default new FirebaseHelper();
