const edit = true;

import { exceptioner as ERROR, utiller as Util } from "utiller";
import { chain, chunk, head, isNil, isPlainObject, last, size } from "lodash-es";
import BaseFirebase from "./BaseFirebase";
import { Timestamp, FieldValue, FieldPath } from "firebase-admin/firestore";
import libpath from "path";

const MAX_COUNT_OF_FIRESTORE_BATCH = 300;
const MAX_COUNT_OF_STORAGE_BATCH = 50;

const RemoteDo = {
    Query: 1, //fetch
    Modified: 2 //set, update, delete
};

class FirebaseHelper extends BaseFirebase {
    constructor() {
        super();
    }

    /**
     * 將毫秒數轉換為 Firestore Timestamp 物件。
     * @param {number} ts - 毫秒數 (自 Epoch 以來)。如果小於等於 0，則回傳當前時間戳。
     * @returns {Timestamp} - Firestore Timestamp 物件。
     */
    getFirestoreTimeStamp(ts) {
        return ts > 0 ? Timestamp.fromMillis(ts) : Timestamp.now();
    }

    /**
     * 將 JavaScript Date 物件轉換為 Firestore Timestamp 物件。
     * @param {Date} date - JavaScript Date 物件。
     * @returns {Timestamp} - Firestore Timestamp 物件。
     */
    getFirestoreTimeStampByDate(date) {
        return Timestamp.fromDate(date);
    }

    /**
     * 取得當前的 Firestore Timestamp 物件。
     * @returns {Timestamp} - 當前的 Firestore Timestamp 物件。
     */
    getCurrentFirestoreTimeStamp() {
        return Timestamp.now();
    }

    /**
     * 取得 Firestore Timestamp 函式庫。
     * @returns {typeof Timestamp} - Timestamp 類別本身。
     */
    getLibOfFirebaseTimestamp() {
        return Timestamp;
    }

    /**
     * 取得 Firestore 伺服器時間標記 (FieldValue.serverTimestamp())，用於 attribute 欄位。
     * @returns {FieldValue} - 伺服器時間標記。
     */
    getServerTimeSymbol() {
        return FieldValue.serverTimestamp();
    }

    getDeleteDocAttributeSymbol() {
        return FieldValue.delete();
    }

    /**
     * 透過毫秒數建立一個 Timestamp 物件。
     * @param {number} millis - 毫秒數 (自 Epoch 以來)。
     * @returns {Timestamp} - Firestore Timestamp 物件。
     */
    getTimeStampObj(millis) {
        return Timestamp.fromMillis(millis);
    }

    /**
     * 獲取當前 Firestore 伺服器的時間戳。
     * @returns {Promise<Timestamp>} - 伺服器時間戳。
     */
    async getCurrentServerTimeStamp() {
        await this.firestore().collection("public").doc("timestamp").set({ serverTime: this.getServerTimeSymbol() });
        const timestamp = await this.firestore().collection("public").doc("timestamp").get();
        return timestamp.data().serverTime;
    }

    /**
     * 取得 Document ID 的 FieldPath 符號。
     * @returns {FieldPath} - Document ID 的 FieldPath。
     */
    getFieldNameOfDocumentId() {
        return FieldPath.documentId();
    }

    /**
     * 取得 Collection Reference。
     * @param {string} path - Firestore Collection 路徑 (e.g., 'users' 或 'users/userId/posts')。
     * @returns {Firestore.CollectionReference} - Collection Reference。
     */
    collectionRef(path) {
        return this.firestore().collection(path);
    }

    /**
     * 取得 Firestore Reference (Collection 或 Document)。
     * @param {string} path - Collection 路徑 (e.g., 'users')。若 id='asObj'，則此處為完整的 Document 路徑 (e.g., 'users/userId')。
     * @param {string} [id] - Document ID。若為空值或 undefined，則回傳 CollectionReference (除非 asDoc 為 true)。
     * @param {object} [options] - 選項物件。
     * @param {boolean} [options.asDoc=false] - 強制回傳 DocumentReference。若 id 為空，會自動產生一個新的 Document ID。
     * @returns {Firestore.CollectionReference|Firestore.DocumentReference} - Reference 物件。
     */
    reference = (path, id, { asDoc = false } = {}) => {
        if (asDoc) return Util.isEmpty(id) ? this.collectionRef(path).doc() : this.collectionRef(path).doc(id);
        if (Util.isEqual(id, "asObj")) return this.firestore().doc(path);
        return Util.isUndefinedNullEmpty(id) ? this.collectionRef(path) : this.collectionRef(path).doc(id);
    };

    /**
     * 取得一個新的自動生成的 Document ID。
     * @param {string} xpath - Collection 路徑。
     * @returns {string} - 新的 Document ID。
     */
    getAutoDocumentID(xpath) {
        return this.collectionRef(xpath).doc().id;
    }

    /**
     * 提交 (Set/Add) 單一文件到 Firestore。
     * @param {string} path - Collection 路徑。
     * @param {object} [item={}] - 要寫入的文件資料。
     * @param {string} [id] - 可選的文件 ID。若提供，則使用 set()；否則使用 add() 並自動生成 ID。
     * @returns {Promise<object>} - 包含 id 和 exists 標記的寫入資料。
     */
    submitDocument = async (path, item = {}, id) => {
        const ref = this.reference(path, id);
        const result = Util.isUndefinedNullEmpty(id) ? await ref.add(item) : await ref.set(item);
        return { ...item, id: id ?? result.id, exists: true };
    };

    /**
     * 插入或更新單一文件。如果文件不存在，會被建立。如果文件已經存在，會將提供的資料與現有文件合併。
     * @param {string} path - Collection 路徑。
     * @param {object} [item={}] - 要寫入的資料。
     * @param {string} [id] - 文件 ID。若為空，將自動生成 ID (退化為 add 行為)。
     * @returns {Promise<object>} - 包含寫入資料。
     */
    upsertDocument = async (path, item = {}, id) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, "upsertDocument 需要一個明確的 id");
        const ref = this.reference(path, id);
        await ref.set(item, { merge: true });
        return { ...item, id, exists: true };
    };

    /**
     * 更新單一文件中的部分欄位。
     * @param {string} path - Collection 路徑。
     * @param {object} [item={}] - 要更新的欄位及值。
     * @param {string} id - 文件 ID。不可為空。
     * @returns {Promise<Firestore.WriteResult>} - 寫入結果。
     * @throws {ERROR} - 如果 id 為空。
     */
    updateDocument = async (path, item = {}, id) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5987824 updateDocument()的id不能為空值`);
        return await this.reference(path, id).update(item);
    };

    /**
     * 原子性地增加文件中的數字屬性 (使用 FieldValue.increment)。
     * @param {string} path - Collection 路徑。
     * @param {string} id - 文件 ID。不可為空。
     * @param {string} attribute - 要增加的屬性名稱。
     * @param {number} [value=1] - 增加的值 (可為負數)。
     * @returns {Promise<Firestore.WriteResult>} - 寫入結果。
     * @throws {ERROR} - 如果 id 為空。
     */
    incrementDocumentNumeric = async (path, id, attribute, value = 1) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5187823514 incrementDocumentNumeric()的id不能為空值`);
        return this.updateDocument(path, Util.getObject(attribute, FieldValue.increment(value)), id);
    };

    /**
     * 批次提交 (Set/Add) 多個文件。
     * @param {string} path - Collection 路徑。
     * @param {Array<object>} items - 文件資料陣列。每個文件可包含可選的 'id' 欄位。
     * @returns {Promise<void>}
     */
    submitDocuments = async (path, items) => {
        await this.batchDo(items, (batch, item) => {
            // 使用 reference(path, item.id) 取得 CollectionRef 或 DocumentRef
            // 如果 item.id 存在，則 reference() 回傳 DocumentRef；若不存在，則回傳 CollectionRef，然後我們用 doc() 產生一個新的 DocumentRef
            const itemRef = Util.isUndefinedNullEmpty(item.id) ? this.reference(path).doc() : this.reference(path, item.id);
            batch.set(itemRef, item);
        });
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
     * 批次提交包含子集合的文件，適用於 Parent/Child 結構。
     * @param {Array<string>} [pathOfParent=["father", "children"]] - 包含 [父集合名稱, 子集合名稱] 的陣列。
     * @param {Array<object>} [items=[]] - 文件物件陣列。結構為 { [parentCollection]: parentData, [childCollection]: childDataArray }。
     * @param {number} [batchCount=MAX_COUNT_OF_FIRESTORE_BATCH] - 單個批次最多包含的操作數量。
     * @returns {Promise<void>}
     */
    async submitBatchParentDocuments(
        pathOfParent = ["father", "children"],
        items = [{ father: { id: "" }, children: [{ id: "" }, { id: "" }] }],
        batchCount = MAX_COUNT_OF_FIRESTORE_BATCH
    ) {
        const [parentCollection, childCollection] = pathOfParent;

        await this.batchDo(
            items,
            (batch, object) => {
                const parentData = object[parentCollection];
                const parentId = Util.isEmpty(parentData.id) ? this.getAutoDocumentID(parentCollection) : parentData.id;
                parentData.id = parentId;

                const parentRef = this.reference(parentCollection, parentId);
                batch.set(parentRef, parentData);

                const children = object[childCollection] || [];

                for (const childData of children) {
                    const childId = Util.isEmpty(childData.id) ? this.getAutoDocumentID(`${parentCollection}/${parentId}/${childCollection}`) : childData.id;
                    childData.id = childId;

                    const childRef = this.reference(`${parentCollection}/${parentId}/${childCollection}`, childId);
                    batch.set(childRef, childData);
                }
            },
            batchCount
        );
    }

    /**
     * 批次刪除父文件及其所有子集合的文件。
     * @param {Array<string>} [pathOfParent=["father", "children"]] - 包含 [父集合名稱, 子集合名稱] 的陣列。
     * @param {Array<string>} [idsOfFather=[]] - 要刪除的父文件 ID 陣列。
     * @param {number} [batchCount=200] - 單個批次最多包含的操作數量。
     * @returns {Promise<void>}
     */
    deleteBatchParentDocuments = async (pathOfParent = ["father", "children"], idsOfFather = [], batchCount = 200) => {
        const pathOfFather = head(pathOfParent);
        const pathOfSon = last(pathOfParent);
        await this.batchDo(
            idsOfFather,
            async (batch, id) => {
                const refOfFather = this.reference(pathOfFather, id);
                // 必須先讀取子集合才能刪除，這是 Admin SDK 的特性
                const childrenSnap = await refOfFather.collection(pathOfSon).get();
                for (const childSnap of childrenSnap.docs) batch.delete(childSnap.ref);
                batch.delete(refOfFather);
            },
            batchCount
        );
    };

    /**
     * 迭代地讀取並處理符合條件的大型 Collection，用於 Read-then-Update 任務。
     * (已棄用，請使用 pagination 函式)
     * @param {string} uid - 執行此任務的使用者或工作 ID (用於日誌追蹤)。
     * @param {string} path - Collection 路徑。
     * @param {function(items: Array<object>): Promise<void>} [job] - 處理每個分頁批次文件的非同步函式。
     * @param {Array<object|function>} [conditions=[]] - Firestore 查詢條件 (where, orderBy, limit, startAfter 等)。
     * @param {number} [pageSize=MAX_COUNT_OF_FIRESTORE_BATCH] - 每次查詢獲取的文件數量。
     * @returns {Promise<number>} - 總共處理的文件數量。
     */
    async modifyDocumentsOfPaginate(uid, path, job = async (items) => {}, conditions = [], pageSize = MAX_COUNT_OF_FIRESTORE_BATCH) {
        const ref = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
        let lastDoc = null;
        let batchCount = 0;
        let totalProcessed = 0;

        // 檢查條件中是否有使用者指定的 limit
        const hasLimit = conditions.some((c) => (isPlainObject(c) && Object.keys(c).includes("limit")) || (isPlainObject(c) && c.type === "limit"));

        while (true) {
            // 這裡為了讓 startAfter 穩定工作，通常需要一個明確的 orderBy
            // 由於 firestore-admin 的特性，如果沒有 orderBy，startAfter(lastDoc) 預設會使用內部順序
            let query = ref.orderBy(FieldPath.documentId());

            if (!hasLimit) {
                query = query.limit(pageSize); // 如果沒有自訂 limit，才加上 pageSize 的 limit
            }

            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();
            if (snapshot.empty) {
                Util.appendInfo(`${uid} modify path:/${path} has completed`);
                break;
            }

            const documents = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            }));

            // 執行每批次的任務，例如更新 updateTime
            if (Util.isFunction(job)) await job(documents);

            lastDoc = snapshot.docs[snapshot.docs.length - 1]; // 記錄這批最後一筆，下一次從這裡繼續
            batchCount++;
            totalProcessed += documents.length;

            Util.appendInfo(`${uid} path:/${path} modify the ${batchCount} batch, accumulated ${totalProcessed} documents`);

            if (hasLimit || snapshot.size < pageSize) {
                // 有自訂 limit 或者是拿到的資料少於一頁大小，就跳出
                break;
            }
        }
        return totalProcessed;
    }

    /**
     * 標準化並排序 Firestore 查詢條件。
     * 支援兩種格式：
     * 1. Admin SDK Compound 格式：`{ where: (stmt) => stmt.where('id', '==', 'david') }`
     * 2. Web SDK 格式：`{ type: 'where', params: ['name', 'in', ['david', 'John']] }`
     * 條件優先順序 (高到低): limit > startAt/startAfter > orderBy > where > select。
     * @param {Array<object|function>} [conditions=[]] - 包含查詢條件物件或函式的陣列。
     * @returns {Array<function>} - 經排序且標準化後的查詢函式陣列，可以直接傳給 Util.accumulate 組合查詢。
     * @throws {ERROR} - 如果條件物件格式不正確。
     */
    conditionsOfRuled(conditions = []) {
        // 儲存標準化後的條件
        const normalizedConditions = [];

        // 第一次過濾：將有 type 屬性的條件標準化為 { type: function }
        for (const condition of conditions) {
            if (condition?.type && Array.isArray(condition.params)) {
                // 將條件類型作為 key，對應的查詢函式作為 value
                const key = condition.type;
                const rule = {
                    [key]: (stmt) => stmt[key](...condition.params) // 使用 stmt[key] 動態調用方法
                };
                normalizedConditions.push(rule);
            } else if (Util.isFunction(condition) || (isPlainObject(condition) && Object.keys(condition).length === 1 && Util.isFunction(Object.values(condition)[0]))) {
                // 若已是函式或合法物件 (e.g., { where: () => ... })，直接保留
                normalizedConditions.push(condition);
            } else {
                // 其他類型忽略
                continue;
            }
        }

        const raw = [];

        // 第二次過濾：計算每個條件的優先順序並組合
        for (const condition of normalizedConditions) {
            if (isNil(condition) || Util.isEmpty(condition)) continue;

            let stmtFn = (stmt) => stmt; // 預設為不變
            let priority = 99; // 預設優先順序最低

            if (Util.isFunction(condition)) {
                // 如果是純函式
                stmtFn = condition;
            } else if (isPlainObject(condition)) {
                // 如果是物件，假設只含一個 key-value配對
                const entries = Object.entries(condition);
                if (entries.length === 0) continue;

                const [key, value] = entries[0];

                if (!key || !Util.isFunction(value)) {
                    throw new ERROR(9745, `條件物件中應該要有 function 為 value，但實際是：${Util.toString(condition)}`);
                }

                stmtFn = value;

                // 根據 key 指定優先順序 (優先順序越低越先執行，以便讓 limit/startAfter 最後覆蓋或生效)
                switch (key) {
                    case "limit":
                        priority = 11;
                        break;
                    case "startAt":
                    case "startAfter":
                        priority = 9;
                        break;
                    case "orderBy":
                        priority = 7;
                        break;
                    case "where":
                        priority = 5;
                        break;
                    case "select": // 新增 select 條件
                        priority = 3;
                        break;
                    default:
                        priority = 99;
                }
            } else {
                // 非支援類型，丟出錯誤
                throw new ERROR(9745, `condition 應該是 object 或 function，但實際是 ${typeof condition}, ${Util.toString(condition)}`);
            }

            raw.push({ stmt: stmtFn, priority });
        }

        // 將條件依優先順序從高到低排序 (priority 數字越小，表示優先權越高，越晚應用於查詢)
        // 確保 where/orderBy 先應用，limit/startAfter 最後應用
        return chain(raw).orderBy("priority", "asc").map("stmt").value();
    }

    /**
     * 獲取單一文件。
     * @param {string} path - Collection 路徑。
     * @param {string} id - 文件 ID。
     * @returns {Promise<object>} - 文件的資料物件，如果存在則包含 id, exists:true；否則包含 exists:false。
     */
    fetchDocument = async (path, id) => {
        const docSnap = await this.reference(path, id).get();
        return docSnap.exists ? { ...docSnap.data(), id, _doc: docSnap, exists: true } : { exists: false };
    };

    /**
     * 刪除單一文件。
     * @param {string} path - Collection 路徑。
     * @param {string} id - 文件 ID。
     * @returns {Promise<void>}
     */
    deleteDocument = async (path, id) => {
        await this.reference(path, id).delete();
    };

    /**
     * 執行一個 Firestore 交易 (Transaction)。
     * @param {function(transaction: Firestore.Transaction): Promise<any>} [task=async (transaction) => true] - 交易邏輯的非同步函式。
     * @returns {Promise<any>} - 交易的結果。
     */
    transaction = async (task = async (transaction) => true) => {
        return await this.firestore().runTransaction(task);
    };

    /**
     * 原子性地更新文件 (在交易中執行)。
     * @param {string} path - Collection 路徑。
     * @param {function(document: object, transaction: Firestore.Transaction, ref: Firestore.DocumentReference): Promise<object>} predict - 讀取文件並回傳要更新內容的非同步函式。
     * @param {string} id - 文件 ID。不可為空。
     * @returns {Promise<any>} - 交易的結果。
     * @throws {ERROR} - 如果 id 為空或文件不存在。
     */
    async updateDocumentAtomically(path, predict = async (document, transaction) => document, id) {
        const self = this;
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, "474845146451964 updateDocumentAtomically 的id 不能為空值");
        }

        const behavior = async (transaction) => {
            const ref = self.reference(path, id);
            const docSnap = await transaction.get(ref);
            if (!docSnap.exists) {
                throw new ERROR(9999, `846865468 document ${libpath.join(path, id)} not exist`);
            }
            const document = docSnap.data();
            document.exists = true;
            document.id = id;
            const content = await predict(document, transaction, ref);
            transaction.update(ref, content);
            Util.appendInfo(`transaction update => path:/${path}/${id}`, `content ==> `, content);
        };
        return await this.transaction(behavior);
    }

    /**
     * 原子性地插入或更新文件 (在交易中執行)。
     * @param {string} path - Collection 路徑。
     * @param {function(document: object, transaction: Firestore.Transaction, ref: Firestore.DocumentReference): Promise<object>} predict - 讀取文件並回傳要寫入內容的非同步函式。
     * @param {string} id - 文件 ID。不可為空。
     * @returns {Promise<any>} - 交易的結果。
     * @throws {ERROR} - 如果 id 為空。
     */
    async upsertDocumentAtomically(path, predict = async (document, transaction) => document, id) {
        const self = this;
        if (Util.isUndefinedNullEmpty(id)) {
            throw new ERROR(9999, "upsertDocumentAtomically 的id 不能為空值");
        }

        const behavior = async (transaction) => {
            const ref = self.reference(path, id);
            const docSnap = await transaction.get(ref);

            let document = {};
            if (docSnap.exists) {
                document = docSnap.data();
            }
            document.exists = docSnap.exists;
            document.id = id;

            const content = await predict(document, transaction, ref);
            // 使用 set 搭配 merge: true 來實現 upsert
            transaction.set(ref, content, { merge: true });
            Util.appendInfo(`transaction upsert => path:/${path}/${id}`, `content ==> `, content);
        };
        return await this.transaction(behavior);
    }

    /**
     * 監聽單一文件的變動 (使用 onSnapshot)。
     * @param {string} path - Collection 路徑。
     * @param {string} id - 文件 ID。
     * @param {function(status: string, data: object, error: object): boolean} [callback] - 處理快照更新的函式。status: [server|error]。
     * @returns {function(): void} - 取消監聽的函式 (unsubscribe)。
     */
    listenDocument = (path, id, callback = (status, data, error) => true) => {
        const unsubscribe = this.reference(path, id).onSnapshot(
            (doc) => {
                // 在 firebase-admin 中，通常只會收到伺服器端變動
                callback("server", doc.data(), undefined);
            },
            (error) => {
                callback("error", undefined, error);
            }
        );
        return unsubscribe;
    };

    /**
     * 監聽整個 Collection 的變動 (使用 onSnapshot)。
     * @param {string} path - Collection 路徑。
     * @param {function(status: string, changes: Array<object>, error: object): boolean} [callback] - 處理 Collection 變動的函式。
     * changes 包含 {type: ['added'|'modified'|'removed'], id, data}。
     * @param {...object|function} conditions - Firestore 查詢條件 (where, orderBy, limit, 等)。
     * @returns {function(): void} - 取消監聽的函式 (unsubscribe)。
     */
    listenDocuments = (path, callback = (status, array, error) => true, ...conditions) => {
        const queryRef = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));

        const unsubscribe = queryRef.onSnapshot(
            (snapshot) => {
                const changes = [];
                const status = "server";
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

    /**
     * 獲取 Collection 中的文件數量 (透過列出文件 ID)。
     * WARNING: 對於大型 Collection，這是一個昂貴的操作。
     * @param {string} path - Collection 路徑。
     * @returns {Promise<number>} - 文件總數。
     */
    fetchCountOfCollection = async (path) => {
        const list = await this.reference(path).listDocuments();
        return size(list);
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

    /**
     * 批次更新所有符合條件的文件。
     * @param {string} path - Collection 路徑。
     * @param {object} obj2Update - 要套用到所有符合文件上的更新內容。
     * @param {...object|function} conditions - Firestore 查詢條件。
     * @returns Promise<Array>
     */
    updateEligibleDocuments = async (path, obj2Update, ...conditions) => {
        const task = (batch, document) => {
            // 注意：這裡使用 document._doc.ref 取得 documentRef
            batch.update(document._doc.ref, obj2Update);
        };
        // 在 Modified 模式下，不需要 selected: true
        await this.pagination({ path, conditions, task });
        return true;
    };

    /**
     * 批次刪除所有符合條件的文件。
     * @param {string} path - Collection 路徑。
     * @param {...object|function} conditions - Firestore 查詢條件。
     * @returns Promise<Array>
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
     * @returns Promise<Array>
     */
    deleteWholeDocuments = async (path) => {
        const task = (batch, document) => {
            batch.delete(document._doc.ref);
        };
        // 注意：這裡的 conditions 陣列為空，表示刪除所有
        return await this.pagination({ path, conditions: [], task });
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

    /** 在transaction狀態下，拿批次的document做*/
    transactionGet = async ({ transaction, path = "", conditions = [] }) => {
        const query = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
        const snapsShot = await transaction.get(query);
        return snapsShot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id || data.id;
            return data;
        });
    };

    /**
     * 【分頁讀取與批次處理】 迭代地讀取符合條件的所有文件。
     * @param {object} options - 分頁選項。
     * @param {string} [options.path=''] - Collection 路徑。
     * @param {Array<any>} [options.conditions=[]] - 查詢條件 (where, orderBy等)。
     * @param {number} [options.pageSize=MAX_COUNT_OF_FIRESTORE_BATCH] - 每次查詢獲取的文件數量。
     * @param {function(batch: Firestore.WriteBatch, document: Object): (void | Promise<any>)} [options.task=null] - 可選的處理函式。如果提供，將啟用 Modified 模式，並使用 batchDo 進行批次寫入。
     * @param {boolean} [options.selected=false] - 性能優化：在 Modified 模式下，如果只需要 Document ID，可設定為 true (不一定能顯著優化 Admin SDK 性能)。
     * @returns {Promise<Array>} - Query 模式返回文件陣列；Modified 模式返回 true (表示操作成功)。
     */
    pagination = async ({ path = "", conditions = [], pageSize = MAX_COUNT_OF_FIRESTORE_BATCH, task = null, selected = false }) => {
        // 修正 behavior 判斷：提供 task -> Modified；未提供 task -> Query
        const hasTask = task && Util.isFunction(task);
        const behavior = hasTask ? RemoteDo.Modified : RemoteDo.Query;

        // ---【分頁穩定性檢查】---
        // 確保有排序條件 (這是分頁的必要條件，避免 startAfter 錯亂)
        const hasOrderBy = conditions.some((c) => (isPlainObject(c) && Object.keys(c).includes("orderBy")) || (isPlainObject(c) && c.type === "orderBy"));

        let finalConditions = conditions;
        if (!hasOrderBy) {
            // 若無排序，則強制以 documentId 進行排序
            const orderByCondition = { orderBy: (stmt) => stmt.orderBy(FieldPath.documentId()) };
            finalConditions = [...conditions, orderByCondition]; // 排序應優先於其他條件，但這裡放在後面，conditionsOfRuled 會處理排序。
        }
        // ---【分頁穩定性檢查】---
        // 3. 設置查詢限制 (Limit)
        const hasLimit = conditions.some((c) => (isPlainObject(c) && Object.keys(c).includes("limit")) || (isPlainObject(c) && c.type === "limit"));

        if (!hasLimit) finalConditions = [...finalConditions, { limit: (stmt) => stmt.limit(pageSize) }];

        if (selected) {
            // 性能優化：加入 Select 投影，只傳輸 Document ID
            const selectCondition = { select: (stmt) => stmt.select(FieldPath.documentId()) };
            finalConditions = [selectCondition, ...finalConditions];
        }

        const initialRef = this.reference(path);
        let lastDoc = null;
        let batchCount = 0;
        let totalFetched = 0;
        const all = [];

        while (true) {
            let queryConditions = [...finalConditions];

            // 1. 如果沒有指定 limit，前面已經套用 pageSize。所以這裡不用再次覆蓋 limitCondition。

            // 2. 設置游標 (StartAfter)
            if (lastDoc) {
                const startAfterCondition = { startAfter: (stmt) => stmt.startAfter(lastDoc) };
                queryConditions = [...queryConditions, startAfterCondition];
            }

            // 3. 執行查詢
            const query = Util.accumulate(initialRef, this.conditionsOfRuled(queryConditions));
            const snapshot = await query.get();

            if (snapshot.empty) {
                Util.appendInfo(`991235 path:/${path} paginate has completed.`);
                break;
            }

            const documents = snapshot.docs.map((doc) => {
                const data = doc.data();
                data._doc = doc; // 將原始快照物件保留，以便在 Modified 模式下進行操作
                data.id = doc.id || data.id;
                return data;
            });

            switch (behavior) {
                case RemoteDo.Query:
                    all.push(...documents);
                    break;
                case RemoteDo.Modified:
                    // 將 task 傳遞給 batchDo 的 predicate 參數，documents 包含 _doc 供 batchDo 內的 task 使用
                    all.push(...documents.map((each) => each.id));
                    await this.batchDo(documents, task);
                    break;
                default:
                    throw new Error(`1561521213421 un-handled behavior => ${behavior}`);
            }

            lastDoc = snapshot.docs[snapshot.docs.length - 1]; // 記錄這批最後一筆
            batchCount++;
            totalFetched += documents.length;
            Util.appendInfo(`991236 path:/${path} fetched ${documents.length} documents in batch ${batchCount}. Total fetched: ${totalFetched}`);

            if (hasLimit || snapshot.size < pageSize) {
                // 如果用戶有指定 limit，或者獲取的數量少於 pageSize，代表已經到底
                break;
            }
        }
        return all;
    };

    /**
     * 執行批次寫入操作（Set, Delete, Update）。
     * 函式會在達到最大批次數量時自動提交（Commit）並開始新的批次。
     * 【重要】此函式將不會捕獲 predicate 函式中的任何錯誤，錯誤將直接傳播到 batchDo 的呼叫端。
     * @param {Array<Object>} documents - 要處理的文件資料陣列。
     * @param {function(batch: Firestore.WriteBatch, document: Object): (void | Promise<any>)} [predicate] - 處理每個文件的函式。應使用 batch.set/delete/update 將操作加入批次中。如果返回 Promise，則會等待其解決。
     * @param {number} [batchCount=MAX_COUNT_OF_FIRESTORE_BATCH] - 單個批次最多包含的操作數量 (Firestore 限制為 500)。
     * @returns {Promise<void>}
     * @throws {Error} - 如果在 predicate 或 batch commit 中發生錯誤。
     */
    batchDo = async (documents, predicate = async (batch, document) => {}, batchCount = MAX_COUNT_OF_FIRESTORE_BATCH) => {
        // 檢查 documents
        if (!Array.isArray(documents) || documents.length === 0) {
            Util.appendInfo(`1231232 admin batch do: documents array is empty or invalid.`);
            return;
        }

        const totalCount = documents.length;

        async function commit(batch, count) {
            if (count > 0) {
                // commit 失敗會拋出錯誤，由外部呼叫者處理
                await batch.commit();
                Util.appendInfo(`1242232 admin batch do commit(count:${count}) succeed`);
            }
        }

        Util.appendInfo(`1231232 admin batch do is going to handle (count:${totalCount})`);
        let batch = this.firestore().batch();
        let count = 0; // 當前批次中的操作數量

        // 使用 for...of 迴圈以確保串行控制
        for (const document of documents) {
            // 1. 執行 predicate。
            // 如果 predicate 是同步的且拋出錯誤，會立即退出 batchDo。
            const result = predicate(batch, document);

            // 2. 檢查是否為 Promise，並等待其完成。
            // 如果 result 是 Promise 且拒絕（reject），會立即退出 batchDo。
            if (result && typeof result.then === "function") {
                await result;
            }

            // 累加操作數量
            count++;

            // 檢查是否達到批次上限，如果是，則提交並重置
            if (count >= batchCount) {
                // commit 失敗會拋出錯誤，由外部呼叫者處理
                await commit(batch, count);
                count = 0;
                batch = this.firestore().batch(); // 開始新的批次
            }
        }
        // 提交最後一個未滿的批次
        await commit(batch, count);
        Util.appendInfo(`32312312 admin batch do (count:${totalCount}) succeed`);
        return totalCount;
    };

    /**
     * firebase-admin 專用。批量串行删除 Firebase Storage 中多个前缀下的所有文件，并控制并发度。
     * @param {string[]} [prefixes=[""]] - 路径前缀字符串数组，例如 ['dionysus/id_1/', 'dionysus/id_2/']。
     * @param {number} [batchCount=MAX_COUNT_OF_STORAGE_BATCH] - 限制同时处理的前缀数量（批次大小）。
     * @returns {Promise<Object[]>} - 返回所有操作结果的状态数组（包含 status, prefix, reason/message）。
     */
    batchDeleteStorageByPrefixes = async (prefixes, batchCount = 20) => {
        const safePrefixes = prefixes ?? [];

        if (safePrefixes.length === 0) {
            console.warn("batchDeleteStorageByPrefixes: 未提供任何路徑前綴。");
            return [];
        }

        console.log(`🚀 開始 Storage 批量刪除（Admin SDK），目標路徑數: ${safePrefixes.length}，批次大小: ${batchCount}`);

        const prefixChunks = chunk(safePrefixes, batchCount);
        const allResults = [];

        // 外層：prefix 批次（序列處理）
        for (const [index, chunk] of prefixChunks.entries()) {
            console.log(`\n--- 正在處理第 ${index + 1}/${prefixChunks.length} 批次（${chunk.length} 個 prefix）---`);

            const batchTasks = chunk.map((prefix) =>
                this.batchDeleteStorageByPrefix(prefix, batchCount)
                    .then((details) => ({
                        status: "fulfilled",
                        prefix,
                        details
                    }))
                    .catch((err) => ({
                        status: "rejected",
                        prefix,
                        reason: err.message
                    }))
            );

            const settledResults = await Promise.allSettled(batchTasks);

            settledResults.forEach((res) => {
                if (res.status === "fulfilled") {
                    allResults.push(res.value);
                } else {
                    allResults.push({
                        status: "rejected",
                        reason: res.reason
                    });
                }
            });
        }

        this.logDeleteReport(allResults);
        return allResults;
    };

    batchDeleteStorageByPrefix = async (prefix = "", batchSize = 20) => {
        let files;

        try {
            [files] = await this.storage().bucket().getFiles({ prefix });
        } catch (error) {
            console.error(`[getFiles Error] Prefix: ${prefix}`, error.message);
            return [
                {
                    status: "rejected",
                    path: prefix,
                    reason: `getFiles failed: ${error.message}`
                }
            ];
        }

        if (!files || files.length === 0) {
            return [];
        }

        const operationResults = [];
        const fileChunks = chunk(files, batchSize);

        // 嚴格分批刪除（避免瞬間大量 request）
        for (const [index, chunk] of fileChunks.entries()) {
            console.log(`🗑️ 刪除 prefix=${prefix}，第 ${index + 1}/${fileChunks.length} 批`);

            const deleteTasks = chunk.map((file) =>
                file
                    .delete()
                    .then(() => ({
                        status: "fulfilled",
                        path: file.name,
                        type: "file"
                    }))
                    .catch((err) => ({
                        status: "rejected",
                        path: file.name,
                        reason: err.message
                    }))
            );

            const settled = await Promise.allSettled(deleteTasks);

            settled.forEach((res) => {
                if (res.status === "fulfilled") {
                    operationResults.push(res.value);
                } else {
                    operationResults.push(res.reason);
                }
            });
        }

        return operationResults;
    };

    logDeleteReport(results = []) {
        const successItems = results.filter((r) => r.status === "fulfilled");
        const failedItems = results.filter((r) => r.status === "rejected");

        const totalFilesDeleted = successItems.reduce((acc, curr) => {
            const count = curr.details?.filter((d) => d.status === "fulfilled" && d.type === "file").length ?? 0;
            return acc + count;
        }, 0);

        console.log(`\n==================== 📊 刪除任務報告 ====================`);
        console.log(`總路徑數: ${results.length} | ✅ 成功: ${successItems.length} | ❌ 失敗: ${failedItems.length}`);
        console.log(`🗑️ 已刪除檔案總數: ${totalFilesDeleted}`);

        if (failedItems.length > 0) {
            console.group("❌ 失敗詳情");
            failedItems.forEach((f) => console.error(`Prefix: ${f.prefix}, 原因: ${f.reason}`));
            console.groupEnd();
        }

        console.log(`========================================================\n`);
    }
}

export default new FirebaseHelper();
