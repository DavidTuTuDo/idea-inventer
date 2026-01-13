const edit = true;

import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
import dayjs from "dayjs";
import firebase from "./FirebaseHelper";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

class CommonRemoteApi {
    _firebase() {
        return firebase;
    }

    batchDeleteStorageByPrefixes = async (prefixes = [""], batchCount = 50) => {
        return firebase.batchDeleteStorageByPrefixes(prefixes, batchCount);
    };

    normalizeTimestamp(obj) {
        if (obj instanceof this.FirebaseTimestampClass()) return obj.toMillis();
        else return obj;
    }

    /**
     * 將 Firebase Timestamp 或其他日期格式標準化為 Day.js 物件。
     * 支援單一物件或陣列輸入，並保留 null 以供 MUI Picker 顯示 label。
     * * @param {any|any[]} param - Firebase Timestamp, Date, string, number 或其陣列
     * @returns {dayjs.Dayjs|null|(dayjs.Dayjs|null)[]} 標準化後的結果
     */
    normalizeAsDayjs(param) {
        const self = this;

        /**
         * 內部輔助函式：處理單一參數
         * @param {any} pram
         */
        function getSpecificExpress(pram) {
            // 1. 保留 null 值，確保 MUI Picker 顯示 label 而非預設日期
            if (_.isNull(pram)) return pram;

            // 2. 處理 Firebase Timestamp (偵測是否存在 toMillis 方法)
            if (pram instanceof self.FirebaseTimestampClass()) {
                return dayjs(pram.toMillis());
            }

            // 3. 處理一般格式 (Date, string, timestamp number)
            return dayjs(pram);
        }

        // 判斷輸入是否為陣列，若是則使用 map 批量處理
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
        return firebase.getLibOfFirebaseTimestamp();
    }

    toFireBaseTimestampObject(obj) {
        if (_.isNull(obj) || _.isUndefined(obj)) return null;

        if (obj instanceof firebase.getLibOfFirebaseTimestamp()) {
            return obj;
        } else {
            try {
                return this.getFirebaseTimestampObject(dayjs(obj).valueOf());
            } catch (error) {
                Util.appendError(`441513135 ${error.message}`);
                return this.getObjectOfCurrentTimeStamp();
            }
        }
    }

    getObjectOfCurrentTimeStamp() {
        return firebase.getCurrentFirestoreTimeStamp();
    }

    async callCloudFunctions(functionName = "", data, region = "us-central1") {
        Util.appendInfo(`454546 functions httpOnCall => '${functionName}'`, data);
        data.fingerprint = await this.getFingerprintUid();
        return await firebase.httpOnCall(functionName, data);
    }

    /** 取得collection所有的document ids */
    async fetchIdsOfDocument(path) {
        const all = await firebase.fetchDocuments(path);
        return all.map((each) => each.id);
    }

    /** predicate 裏面放batch要做的動作 set,update,delete, 所以每個
     * todo: 可以設計為[....{ path:'route', content:{id:ioOfDoc}, behavior:'delete|set|update'}]，然後在predicate by case 處理
     * */
    async batchBracket(objects, predicate = (batch, object) => {}) {
        await firebase.batchDo(objects, predicate);
        return { message: `batchBracket succeed size:${_.size(objects)} succeed` };
    }

    async submitItems(path, ...items) {
        const size = items.length;
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} batch submit => path:${path}, size:(${_.size(items)})`);
        Util.appendInfo("${uid} batch submit items => ", items);
        const result = await firebase.submitDocuments(path, items);
        Util.appendInfo(`${uid} batch submit path:${path}, size:${size} succeed`);
        return result;
    }

    async updateItems(path, items) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} batch update path:${path} size:(${_.size(items)})`);
        Util.appendInfo("${uid} batch update items => ", items);
        const result = await firebase.updateDocuments(path, items);
        Util.appendInfo(`${uid} batch update path:${path}, size:${_.size(result)} succeed`);
        return result;
    }

    async updateEligibleItems(path, obj2Update = {}, ...conditions) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} batch eligible update path:${path}`);
        const result = await firebase.updateEligibleDocuments(path, obj2Update, ...conditions);
        Util.appendInfo(`${uid} batch eligible update path:${path}, size:${_.size(result)} succeed`);
        return result;
    }

    /** 因為 == ,in, array-contains, not-in 這類的比較最多只能有10個, 所以得設計batch */
    fetchItemsOfLimitation = async (path, action, fieldName, ...valuesOfComparison) => {
        const result = [];
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start fetch items in limitation with action = ${action} | fieldName = ${fieldName} | path:${path}, size:${valuesOfComparison.length}`);
        if (_.isEqual("id", fieldName)) {
            fieldName = this.getFieldNameOfDocumentId();
        }
        while (_.size(valuesOfComparison) > 0) {
            const values = await this.fetchItems(path, {
                type: "where",
                params: [fieldName, action, Util.getSliceArrayWithMutate(valuesOfComparison, 10)]
            });
            result.push(...values);
        }
        Util.appendInfo(`${uid} finish fetch items in limitation`);
        return result;
    };

    async fetchSizeOfCollection(path) {
        return await firebase.fetchCountOfCollection(path);
    }

    /**
     * 異步取得裝置的穩定指紋識別碼 (Visitor ID)。
     * 這個 ID 可作為未登入使用者的唯一 UID，用於後端限流。
     * * 注意：此函式應該在使用時才呼叫，而不是在頁面載入時同步執行，
     * 以避免阻塞主執行緒。
     * * @returns {Promise<string>} 唯一的瀏覽器指紋 ID (visitorId)。
     */
    getFingerprintUid = async () => {
        try {
            // 載入 FingerprintJS 代理實例
            // 這是異步操作，會收集瀏覽器/硬體資訊
            const fp = await FingerprintJS.load();

            // 獲取指紋結果
            const result = await fp.get();

            // result.visitorId 就是計算出的唯一指紋 ID (UID)
            const visitorId = result.visitorId;

            if (!visitorId) {
                console.error("FingerprintJS 無法生成有效的 visitorId。");
                // 拋出錯誤或返回一個安全的空值，取決於你的錯誤處理策略
                return "fingerprint-error-unknown";
            }

            // 可以選擇在這裡將 ID 暫時儲存在 sessionStorage/memory cache 中，
            // 避免在單次 session 中重複執行指紋計算，以提升效能。
            // SessionStorage 在無痕模式結束後也會被清除。
            // sessionStorage.setItem('cached_fp_uid', visitorId);

            return visitorId;
        } catch (error) {
            console.error("執行 FingerprintJS 發生錯誤:", error);
            // 如果指紋計算失敗 (例如被 AdBlocker 阻擋)，返回一個備用值
            return "fingerprint-calculation-failed";
        }
    };

    async submitItem(path, item, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start submit item => path:${path}/${id ?? "not set"}`);
        const obj = await firebase.submitDocument(path, item, id);
        Util.appendInfo(`${uid} succeed submit item => path:${path}/${obj.id}`);
        return {
            succeed: true,
            message: `set path:${path}/${obj.id} succeed`,
            value: obj
        };
    }

    async updateItem(path, item, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start update item => path:/${path}/${id}`);
        await firebase.updateDocument(path, item, id);
        Util.appendInfo(`${uid} succeed update item => path:/${path}/${id}`);
        return {
            succeed: true,
            message: `update path:${path}/${id} succeed`,
            value: item
        };
    }

    async upsertItem(path, item, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start upsert item => path:/${path}/${id}`);
        await firebase.upsertDocument(path, item, id);
        Util.appendInfo(`${uid} succeed upsert item => path:/${path}/${id}`);
        return {
            succeed: true,
            message: `upsert path:${path}/${id} succeed`,
            value: item
        };
    }

    /** firestore transaction 的呼叫入口*/
    async runTransaction(asyncTask = async (behavior) => true) {
        return await firebase.transaction(asyncTask);
    }

    /** predict 裡面寫 updateContent | 觸發throw error的規則
     *
     *      (item) => {
     const old = item.count;
     if (old <= 85)
     throw new ERROR(9999,'不能小於85'); || return Promise.reject("Sorry! Population is too big");


     const latest = old - 1;
     return {count: latest}
     }
     *
     * */
    async updateDocumentAtomically(path, predict = async (documentOfLatest, transaction) => documentOfLatest, id) {
        return await firebase.updateDocumentAtomically(path, predict, id);
    }

    async upsertDocumentAtomically(path, predict = async (documentOfLatest, transaction) => documentOfLatest, id) {
        return await firebase.upsertDocumentAtomically(path, predict, id);
    }

    async updateItemAtomically(path, predict = (item, transaction) => item, id) {
        return await this.updateDocumentAtomically(path, predict, id);
    }

    async upsertItemAtomically(path, predict = (item, transaction) => item, id) {
        return await this.upsertDocumentAtomically(path, predict, id);
    }

    async deleteItem(path, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start delete item => path:/${path}/${id}`);
        await firebase.deleteDocument(path, id);
        Util.appendInfo(`${uid} succeed delete item => path:/${path}/${id}`);
        return true;
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async fetchItems(path, ...conditions) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start fetch items => path:/${path}/`);
        const all = await firebase.fetchDocuments(path, ...conditions);
        Util.appendInfo(`${uid} succeed fetch items => ${path} with ${all.length} items`);
        return all;
    }

    async modifyItemsOfPaginate(path, job = async (items) => {}, conditions, size) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start modify enormous items => path:/${path}`);
        const counts = await firebase.modifyDocumentsOfPaginate(uid, path, job, conditions, size);
        Util.appendInfo(`${uid} succeed modify enormous items => path:/${path} with ${counts} items`);
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
                    case "limit":
                        priority = 1;
                        break;
                    case "startAt":
                    case "startAfter":
                        priority = 2;
                        break;
                    case "orderBy":
                        priority = 3;
                        break;
                    case "where":
                        priority = 4;
                        break;
                    default:
                        break;
                }
            } else if (_.isFunction(condition)) {
                /** 這種概念 (stmt) => stmt.where('id','==','david') */
                stmtOfFunction = condition;
            } else {
                throw new ERROR(9745, `condition should be object|function, but it's ${typeof condition},${_.toString(condition)}`);
            }
            raw.push({ stmt: stmtOfFunction, priority });
        }
        return _.isEmpty(raw) ? [] : _.orderBy(raw, ["priority"], ["desc"]).map((each) => each.stmt);
    }

    async fetchItem(path, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start fetch item => path:/${path}/${id}`);
        const item = await firebase.fetchDocument(path, id);
        Util.appendInfo(`${uid} succeed fetch item => path:/${path}/${id}`);
        return item;
    }

    /** 用promise.all()拿不同id的documents，firestore目前不支援給batchFetch(已知id) */
    async fetchBatchItems(path, ...references) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start batch fetch item(${_.size(references)}) => ${path}`);
        const item = await firebase.fetchBatchDocuments(references);
        Util.appendInfo(`${uid} succeed batch fetch item(${_.size(references)}) => ${path}`);
        return item;
    }

    async submitBatchParentItems(pathOfParent = ["father", "children"], items = [{ father: {}, children: {} }], batchCount = 100) {
        const uid = Util.getRandomHashV2(10);
        const path = JSON.stringify(pathOfParent);
        Util.appendInfo(`${uid} start batch parent ${path} items(${_.size(items)})`);
        const result = await firebase.submitBatchParentDocuments(pathOfParent, items, batchCount);
        Util.appendInfo(`${uid} succeed batch parent ${path} items(${_.size(items)})`);
        return result;
    }

    async deleteBatchParentItems(pathOfParent = ["father", "children"], idsOfFather = [""], batchCount = 100) {
        const uid = Util.getRandomHashV2(10);
        const path = JSON.stringify(pathOfParent);
        Util.appendInfo(`${uid} start delete batch parent ${path} items(${_.size(idsOfFather)})`);
        const result = await firebase.deleteBatchParentDocuments(pathOfParent, idsOfFather, batchCount);
        Util.appendInfo(`${uid} succeed delete batch parent ${path} items(${_.size(idsOfFather)})`);
        return result;
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteItems(path, items) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start delete items ${path} size:(${_.size(items)})`);
        await firebase.deleteDocuments(path, items);
        Util.appendInfo(`${uid} succeed delete items ${path}`);
    }

    async deleteEligibleItems(path, ...conditions) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start eligible delete items ${path} `);
        const result = await firebase.deleteEligibleDocuments(path, ...conditions);
        Util.appendInfo(`${uid} succeed eligible delete items ${path} size:(${_.size(result)})`);
    }

    async deleteWholeItems(path) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start delete whole items ${path}`);
        const result = await firebase.deleteWholeDocuments(path);
        Util.appendInfo(`${uid} succeed delete whole  items ${path} size:(${_.size(result)})`);
    }

    async submitObject(path, content) {
        const uid = Util.getRandomHashV2(10);
        const commitment = content;
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start submit object => ${path}`);
        const object = await firebase.submitDocument(path, commitment, "asObj");
        Util.appendInfo(`${uid} succeed submit object => ${path}`);
        return object;
    }

    async upsertObject(path, content) {
        const uid = Util.getRandomHashV2(10);
        const commitment = content;
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start upsert object => ${path}`);
        const object = await firebase.upsertDocument(path, commitment, "asObj");
        Util.appendInfo(`${uid} succeed upsert object => ${path}`);
        return object;
    }

    /** 一個document可以擁有array屬性，這個function可以幫助append document array裡的item，不需要整個重寫*/
    async appendAttrOfArrayItem(path, attribute, content, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start append item document->array => ${path}/${id}`);
        await firebase.appendDocumentArrayItem(path, id, attribute, content);
        Util.appendInfo(`${uid} succeed append item document->array => ${path}/${id}`);
    }

    /** 一個document可以擁有array屬性，這個function可以幫助delete document array裡的item，不需要整個重寫*/
    async deleteAttrOfArrayItem(path, attribute, content, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start delete item document->array => ${path}/${id}`);
        await firebase.deleteDocumentArrayItem(path, id, attribute, content);
        Util.appendInfo(`${uid} succeed delete item document->array => ${path}/${id}`);
    }

    async fetchObject(path) {
        const uid = Util.getRandomHashV2(10);
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start fetch object => path:/${path}`);
        const object = await firebase.fetchDocument(path, "asObj");
        Util.appendInfo(`${uid} succeed fetch object => path:/${path}`);
        return object;
    }

    getNormalizePathOfObjectApi(path) {
        if (typeof path !== "string") {
            throw new Error("Path must be a string.");
        }

        const segments = path.split("/").filter(Boolean); // 移除空段落

        if (segments.length % 2 === 0) {
            // 已是合法的 document path
            return segments.join("/");
        }

        // 非法 document path，補上 /attr
        return [...segments, "attr"].join("/");
    }

    buildPath = (main, sub) => {
        const isValidSub = sub && String(sub).trim();
        return `${main}${isValidSub ? `/${sub}` : ""}`;
    };

    isCollectionPath(path) {
        const segments = _.split(Util.getNormalizedStringNotStartWith(path, "/"), "/");
        return Util.isOdd(segments.length);
    }

    async updateObject(path, updatedObject) {
        const uid = Util.getRandomHashV2(10);
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start update object => path:/${path}}`);
        await firebase.updateDocument(path, updatedObject, "asObj");
        Util.appendInfo(`${uid} succeed update object => path:/${path}}`);
    }

    async updateObjectAtomically(path, predict = (object, transaction) => object) {
        return await this.updateDocumentAtomically(path, predict, "asObj");
    }

    async upsertObjectAtomically(path, predict = (object, transaction) => object) {
        return await this.upsertObjectAtomically(path, predict, "asObj");
    }

    async deleteObject(path) {
        const uid = Util.getRandomHashV2(10);
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start delete object => path:/${path}`);
        await firebase.deleteDocument(path, "asObj");
        Util.appendInfo(`${uid} succeed delete object => path:/${path}`);
    }

    restfulListenItem(path, id, handler = (data) => data, view) {
        const self = this;
        this.showLoadingView(view);
        Util.appendInfo(`restfulListenItem path:/${path}/${id}`);
        const functionOfUnsubscribe = this.listenItem(path, id, (status, data, error) => {
            if (_.isEqual(status, "server") && !Util.isUndefinedNullEmpty(data)) {
                self.closeLoadingView(view);
                handler(data);
            } else {
                this.closeLoadingView(view);
                handler({ status, message: `${error ? error.message : "try not to handling"}` });
            }
        });
        return functionOfUnsubscribe;
    }

    /**
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * 監聽collection 變動，利用callback接收推播資訊
     * change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe
     *
     * callback {status:[local|server|error|cache], changes:[...{document}], error:object }
     * */
    listenItems(path, callback = (status, changes, error) => {}, ...conditions) {
        Util.appendInfo(`listenItems path:/${path}`);
        return firebase.listenDocuments(path, callback, ...conditions);
    }

    /**
     * status string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * data 就是寫入後的document value
     *
     * 回傳一個unsubscribe的function，需要要在componentDidUnmount的地方呼叫unsubscribe()
     * callback {status:[local|server|error|cache], changes: document, error:object }
     */
    listenItem(path, id, callback = (status, data, error) => {}) {
        Util.appendInfo(`listenItem path:/${path}/${id}`);
        return firebase.listenDocument(path, id, callback);
    }

    listenObject(path, callback = (status, data, error) => {}) {
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`listenObject path:/${path}`);
        return firebase.listenDocument(path, "asObj", callback);
    }

    showLoadingView(view) {
        if (view !== undefined && view.enableAppLoading) view.enableAppLoading(true);
    }

    closeLoadingView(view) {
        if (view !== undefined && view.enableAppLoading) {
            view.enableAppLoading(false);
        }
    }

    async fetchUserIsExist(uid) {
        const result = await this.fetchItem("users", uid);
        return result.exists;
    }

    async submitUserAsUid(uid) {
        await this.updateItem("users", uid, { admin: true });
    }

    async submitUserExist(uid) {
        await this.updateItem("users", uid, { exist: true });
    }

    async submitUserBeingAdmin(uid) {
        await this.fetchUserIsExist(uid);
    }

    async isAdminUser(uid = undefined) {
        const user = await this.fetchItem("users", uid);
        return user.exists && user.isAdmin;
    }

    handleCommitment(update, commitment, object) {
        // 移除 undefined 或 null 的屬性
        Object.keys(commitment).forEach((k) => {
            if (commitment[k] == null) delete commitment[k];
        });

        if (!update) return;

        // 僅保留 object 內存在的屬性與 updateTime
        Object.keys(commitment).forEach((k) => {
            if (!(k in object) && k !== "updateTime") delete commitment[k];
        });
    }

    /** 這是針對用desktop/mobile 選擇的檔案上傳機制 */
    async uploadStorageFile(blob, folder = "public", maxSize, options) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start upload file => folder:/${folder}`);
        const result = await firebase.uploadStorageFile(blob, folder, maxSize, options);
        Util.appendInfo(`${uid} finish upload file => url(${result})`);
        return result;
    }

    /** 這是針對用desktop/mobile 選擇的檔案上傳機制 */
    async uploadStorageFiles(blobs, folder = "public", maxSize, options) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start upload file => folder:/${folder}`);
        const result = await firebase.uploadStorageFiles(blobs, folder, maxSize, options);
        Util.appendInfo(`${uid} finish upload files`, result);
        return result;
    }

    async deleteStorageFiles(folder = "public") {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start delete all storage => folder:/${folder}`);
        const result = await firebase.batchDeleteStorageByPrefix(folder);
        Util.appendInfo(`${uid} finish delete all storage => folder:/${folder}`);
        return result;
    }

    reference(path, id, config = { asDoc: false }) {
        return firebase.reference(path, id, config);
    }

    async fetchCountOfSpecificCondition(path, ...conditions) {
        return firebase.fetchCountOfSpecificCondition(path, ...conditions);
    }

    async fetchSumOfSpecificAttribute(path, attr, ...conditions) {
        return firebase.fetchSumOfSpecificAttribute(path, attr, ...conditions);
    }

    async fetchAverageOfSpecificAttribute(path, attr, ...conditions) {
        return firebase.fetchAverageOfSpecificAttribute(path, attr, ...conditions);
    }

    //multi = [...{name: 'name', type: 'sum', attribute: 'attr'}]
    async fetchMultiResultOfSpecific(path, multi, ...conditions) {
        return firebase.fetchMultiResultOfSpecific(path, multi, ...conditions);
    }

    /** realtime database method 想開發成為preference的概念
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
     */
}

export default CommonRemoteApi;
