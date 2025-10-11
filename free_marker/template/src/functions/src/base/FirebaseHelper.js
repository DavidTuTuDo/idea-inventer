const edit = true;

import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
import BaseFirebase from "./BaseFirebase";
import CommonPoolHelper from "./CommonPoolHelper";
import Config from "../config";
import { Timestamp, FieldValue, FieldPath } from "firebase-admin/firestore";
import { connectFunctionsEmulator, httpsCallable } from "firebase-admin/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase-admin/storage";
import libpath from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { google } from "googleapis";
import stream, { Readable } from "stream";

const MAX_COUNT_OF_FIRESTORE_BATCH = 300;
const MAX_COUNT_OF_FIRESTORE_FETCH = 500;

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
        await this.firestore().collection("public").doc("timestamp").set({ serverTime: this.getServerTimeSymbol() });
        const timestamp = await this.firestore().collection("public").doc("timestamp").get();
        return timestamp.data().serverTime;
    }

    getFieldNameOfDocumentId() {
        return FieldPath.documentId();
    }

    collectionRef(path) {
        return this.firestore().collection(path);
    }

    /**
     * 有點彈性有點抽象，要硬記的function，如果id為空直，回傳collection()|反之就一定會回doc()，一定要想清楚當下情境是要collection還是doc
     * @param asDoc 強制回傳一個doc()=>document path
     * */
    reference = (path, id, { asDoc = false } = {}) => {
        if (asDoc) return _.isEmpty(id) ? this.collectionRef(path).doc() : this.collectionRef(path).doc(id); /** 用於假制一個ref 常用於transaction(ref,{...content})*/
        if (_.isEqual(id, "asObj")) return this.firestore().doc(path); /** 用於submit object物件的設定(firestore)*/
        return Util.isUndefinedNullEmpty(id) ? this.collectionRef(path) : this.collectionRef(path).doc(id);
    };

    getAutoDocumentID(xpath) {
        return this.collectionRef(xpath).doc().id;
    }

    submitDocument = async (path, item = {}, id) => {
        const ref = this.reference(path, id);
        const result = Util.isUndefinedNullEmpty(id) ? await ref.add(item) : await ref.set(item);
        return { ...item, id: id ?? result.id, exists: true };
    };

    updateDocument = async (path, item = {}, id) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5987824 updateDocument()的id不能為空值`);
        return await this.reference(path, id).update(item);
    };

    /** atomically to increment 關於number的屬性，例如參訪人數之類的 */
    incrementDocumentNumeric = async (path, id, attribute, value = 1) => {
        if (Util.isUndefinedNullEmpty(id)) throw new ERROR(9999, `5187823514 incrementDocumentNumeric()的id不能為空值`);
        return this.updateDocument(path, id, Util.getObject(attribute, FieldValue.increment(value)));
    };

    /** batch提供set, delete, update的功能
     * todo: 可以設計為[....{ path:'route', content:{id:ioOfDoc}, behavior:'delete|set|update'}]，然後在predicate by case 處理
     * */
    batchDo = async (items, predicate = async (batch, item) => true, batchCount = MAX_COUNT_OF_FIRESTORE_BATCH) => {
        async function commit(batch, count) {
            if (count > 0) {
                await batch.commit();
                Util.appendInfo(`1242232 admin batch do commit(count:${count}) succeed`);
            }
        }

        Util.appendInfo(`1231232 admin batch do is going to handle (count:${_.size(items)})`);
        let batch = this.firestore().batch();
        let count = 0;

        while (items.length > 0) {
            await predicate(batch, items.shift());
            /** 由呼叫端去針對每個item視作 set/delete/update 的行為 */
            count = count + 1;
            /** 超過MAX先COMMIT次再歸零 */
            if (count >= batchCount) {
                await commit(batch, count);
                count = 0;
                batch = this.firestore().batch();
            }
        }
        await commit(batch, count);
        Util.appendInfo(`32312312 admin batch do (count:${_.size(items)}) succeed`);
    };

    submitDocuments = async (path, items) => {
        const result = await this.batchDo(items, (batch, item) => {
            const itemRef = Util.isUndefinedNullEmpty(item.id) ? this.reference(path, item.id).doc() : this.reference(path, item.id);
            batch.set(itemRef, item);
        });
    };

    updateDocuments = async (path, contentsOfUpdate, ...conditions) => {
        const hasCondition = _.size(conditions) > 0;
        const targets = hasCondition ? (await this.fetchDocuments(path, ...conditions)).map((each) => each.id) : contentsOfUpdate;

        return await this.batchDo(targets, (batch, item) => {
            if (hasCondition) batch.update(this.reference(path, item), contentsOfUpdate[0]); /** 此時item 為 document id*/
            else if (!Util.isUndefinedNullEmpty(item.id)) batch.update(this.reference(path, item.id), item);
            else throw new ERROR(9999, `6524521323 admin hasCondition == ${hasCondition}, updateDocuments的item沒有valid id => ${contentsOfUpdate.id}`);
        });
    };

    async submitBatchParentDocuments(pathOfParent = ["father", "children"], items = [{ father: { id: "" }, children: [{ id: "" }, { id: "" }] }], batchCount = 100) {
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
                const childrenSnap = await refOfFather.collection(pathOfSon).get();
                for (const childSnap of childrenSnap.docs) batch.delete(childSnap.ref);
                batch.delete(refOfFather);
            },
            batchCount
        );
    };

    fetchDocuments = async (path, ...conditions) => {
        const query = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
        const querySnapshot = await query.get();
        const all = [];
        if (!querySnapshot.empty)
            querySnapshot.forEach((doc) => {
                // const total = querySnapshot.size;
                const data = doc.data();
                data._doc = doc;
                data.id = _.isEmpty(data.id) ? doc.id : data.id;
                all.push(data);
            });
        return all;
    };

    /** 當要對一個龐大的collection做read then update(job)，一定要用pagination 處理 */
    async modifyDocumentsOfPaginate(uid, path, job = async (items) => {}, conditions = [], pageSize = MAX_COUNT_OF_FIRESTORE_FETCH) {
        const ref = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
        let lastDoc = null;
        let batchCount = 0;
        let totalProcessed = 0;

        while (true) {
            let query = ref.limit(pageSize); // 這裡用 document ID 作排序
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
            if (_.isFunction(job)) await job(documents);

            lastDoc = snapshot.docs[snapshot.docs.length - 1]; // 記錄這批最後一筆，下一次從這裡繼續
            batchCount++;
            totalProcessed += documents.length;

            Util.appendInfo(`${uid} path:/${path} modify the ${batchCount} batch, accumulated ${totalProcessed} documents`);
            if (snapshot.size < pageSize) {
                // 小於 pageSize 代表已經到底
                break;
            }
        }
        return totalProcessed;
    }

    /**
     * 批次讀取 Firestore documents（使用 firebase-admin），支援分批與額外欄位封裝。
     * @param {FirebaseFirestore.DocumentReference[]} references - 要讀取的 document references 陣列
     * @param {number} batchCount - 每批最大請求數，預設為 Firestore 限制（例如 10）
     * @returns {Promise<Array<Object>>} - 每筆資料包含 `id`, `exists`, `_doc`, 以及其他資料欄位
     */
    fetchBatchDocuments = async (references, batchCount = 10) => {
        if (!references.length) return [];

        const allResults = [];
        for (let i = 0; i < references.length; i += batchCount) {
            const batch = references.slice(i, i + batchCount);
            const snapshots = await Promise.all(batch.map((ref) => ref.get()));

            const batchResults = snapshots.map((snapshot) => {
                const data = snapshot.data() || {};
                return {
                    ...data,
                    id: data.id || snapshot.id,
                    exists: snapshot.exists,
                    _doc: snapshot
                };
            });
            allResults.push(...batchResults);
        }

        return allResults;
    };

    /**
     * firebase-admin 沒有modular api，所以condition是以下格式，要做排序，要where().orderBy().limit()
     * {where:(stmt) => stmt.where('id','==','david')}
     * {orderBy:(stmt) => stmt,orderBy('age','desc')}
     * 上述是firebase-admin使用compound的方式
     *
     * 這是firebase-web的寫法{type:'where', params:['name','in',['david','John']]}，目前也能相容
     * */
    conditionsOfRuled(conditions = []) {
        // 儲存標準化後的條件
        const normalizedConditions = [];

        // 第一次過濾：將有 type 屬性的條件標準化為 { type: function }
        for (const condition of conditions) {
            if (condition?.type && _.isArray(condition.params)) {
                // 將條件類型作為 key，對應的查詢函式作為 value
                const key = condition.type;
                const rule = {
                    [key]: (stmt) => stmt.where(...condition.params)
                };
                normalizedConditions.push(rule);
            } else if (_.isFunction(condition) || _.isPlainObject(condition)) {
                // 若已是函式或合法物件，直接保留
                normalizedConditions.push(condition);
            } else {
                // 其他類型忽略
                continue;
            }
        }

        const raw = [];

        // 第二次過濾：計算每個條件的優先順序並組合
        for (const condition of normalizedConditions) {
            if (_.isNil(condition) || _.isEmpty(condition)) continue;

            let stmtFn = (stmt) => stmt; // 預設為不變
            let priority = 99; // 預設優先順序最低

            if (_.isFunction(condition)) {
                // 如果是純函式
                stmtFn = condition;
            } else if (_.isPlainObject(condition)) {
                // 如果是物件，假設只含一個 key-value 配對
                const [key, value] = Object.entries(condition)[0] || [];

                if (!key || !_.isFunction(value)) {
                    throw new ERROR(9745, `條件物件中應該要有 function 為 value，但實際是：${_.toString(condition)}`);
                }

                stmtFn = value;

                // 根據 key 指定優先順序
                switch (key) {
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
                        priority = 99;
                }
            } else {
                // 非支援類型，丟出錯誤
                throw new ERROR(9745, `condition 應該是 object 或 function，但實際是 ${typeof condition}, ${_.toString(condition)}`);
            }

            raw.push({ stmt: stmtFn, priority });
        }

        // 將條件依優先順序從高到低排序，回傳查詢函式陣列
        return _.chain(raw).orderBy("priority", "desc").map("stmt").value();
    }

    fetchDocument = async (path, id) => {
        const docSnap = await this.reference(path, id).get();
        return docSnap.exists ? { ...docSnap.data(), id, _doc: docSnap, exists: true } : { exists: false };
    };

    deleteDocument = async (path, id) => {
        await this.reference(path, id).delete();
    };

    deleteDocuments = async (path, whole = false, ...conditions) => {
        const all = [];
        if (whole) all.push(...(await this.reference(path).listDocuments()));
        else {
            const query = Util.accumulate(this.reference(path), this.conditionsOfRuled(conditions));
            const querySnapshot = await query.get();
            querySnapshot.forEach((doc) => all.push(doc.ref));
        }
        await this.batchDo(all, (batch, ref) => batch.delete(ref));
    };

    transaction = async (task = async (transaction) => true) => {
        return await this.firestore().runTransaction(task);
    };

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
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * data 就是寫入後的document value
     *
     * 回傳一個unsubscribe的function，需要要在componentDidUnmount的地方呼叫unsubscribe()
     * callback {status:[local|server|error|cache], changes: document, error:object }
     */
    listenDocument = (path, id, callback = (source, data, error) => true) => {
        const unsubscribe = this.reference(path, id).onSnapshot(
            (doc) => {
                callback("server", doc.data());
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
        const unsubscribe = this.reference(path).onSnapshot(
            (snapshot) => {
                const changes = [];
                const status = "server";
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
        const list = await this.reference(path).listDocuments();
        return _.size(list);
    };

    async deployDocxFileToAdminStorage(buffer, fileName = "folder/filename.extension") {
        if (!fileName.endsWith(".docx")) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.docx`
            };
        }
        return await this.deployButterAsFile2AdminStorage(buffer, fileName, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`);
    }

    async deployPDFtoAdminStorage(buffer, fileName = `folder/filename.extension`) {
        if (!fileName.endsWith(`.pdf`)) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.pdf`
            };
        }
        return await this.deployButterAsFile2AdminStorage(buffer, fileName, `application/pdf`);
    }

    async deployButterAsFile2AdminStorage(buffer, fileName, contentType) {
        const ref = this.storage().bucket();
        const core = ref.file(fileName);
        try {
            await core.save(buffer, { contentType });
            // console.log('File uploaded successfully:', result.metadata);

            const downloadUrl = await core.getSignedUrl({
                action: "read",
                expires: "03-09-3000"
            });

            return {
                succeed: true,
                path: downloadUrl[0],
                message: `produce doc file succeed`
            };
        } catch (error) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：${error.message}`
            };
        }
    }

    async getBufferOfGeneratedDocx(pathOfDocxTemplate = {}, data = { nameOfTravel: "小卉國8日行", startDateOfTravel: "2月17號", countOfPeople: "2" }) {
        /** Load the docx file as binary content */
        const content = fs.readFileSync(pathOfDocxTemplate);
        /** Unzip the content of the file */
        const zip = new PizZip(content);
        /** This will parse the template, and will throw an error if the template is
         invalid, for example, if the template is "{user" (no closing tag) */
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        });
        /** Render the document (Replace {first_name} by John, {last _name} by Doe, ...) */
        doc.render(data);
        /** Get the zip document and generate it as a nodebuffer */
        const buf = doc.getZip().generate({
            type: "nodebuffer"
            /** compression: DEFLATE adds a compression step.
             For a 50MB output document, expect 500ms additional CPU time */
            // compression: "DEFLATE",
        });
        /** doing something of log usage,buf is a node.js Buffer, you can either write it to a file or res.
         * persist file will => fs.writeFileSync(`./output${_.toString(Util.getCurrentTimeStamp())}.docx`, buf); */
        return buf;
    }

    async authenticate() {
        const auth = new google.auth.GoogleAuth({
            keyFile: "template/googleapi.json", // Path to your service account key file
            scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
        });
        return await auth.getClient();
    }

    async convertDocxToPdfBuffer(docxBuffer, name) {
        const auth = await this.authenticate();
        const drive = google.drive({ version: "v3", auth });
        // Create a readable stream from the docx buffer
        const docxStream = new stream.PassThrough();
        docxStream.end(docxBuffer);
        // Upload the docx buffer as a new Google Docs file
        const fileMetadata = {
            name: name,
            mimeType: "application/vnd.google-apps.document"
        };
        const media = {
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            body: docxStream
        };
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id"
        });
        const fileId = file.data.id;
        // Export the Google Docs file as a PDF
        const response = await drive.files.export(
            {
                fileId: fileId,
                mimeType: "application/pdf"
            },
            { responseType: "arraybuffer" }
        );
        // Delete the temporary Google Docs file
        await drive.files.delete({ fileId: fileId });
        // Return the PDF buffer
        return Buffer.from(response.data);
    }

    async uploadBufferOFDocx2Drive(bufferOfDocx, filePath) {
        const auth = await this.authenticate();
        const drive = google.drive({ version: "v3", auth });

        const fileMetadata = {
            name: libpath.basename(filePath),
            mimeType: "application/vnd.google-apps.document" // Google Docs mime type
        };

        const media = {
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX mime type
            body: Readable.from(bufferOfDocx)
        };

        try {
            const file = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: "id"
            });
            const fileId = file.data.id;
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: "writer",
                    type: "anyone"
                }
            });

            const result = await drive.files.get({
                fileId: fileId,
                fields: "webViewLink"
            });
            return {
                succeed: true,
                path: result.data.webViewLink
            };
        } catch (error) {
            return {
                succeed: false,
                message: `'4123132 error uploading or sharing file:', ${error.message}`
            };
        }
    }

    /**
     * firebase-admin 專用
     * 批量串行删除 Firebase Storage 中多个前缀下的所有文件，并控制并发度。
     * @param {string[]} prefixes 路径前缀字符串数组，例如 ['dionysus/id_1/', 'dionysus/id_2/']。
     * @param {number} [batchCount=50] 限制同时处理的前缀数量（批次大小）。
     * @returns {Promise<Object[]>} 返回所有操作结果的状态数组（包含 status, prefix, reason/message）。
     */
    batchDeleteStorageByPrefixes = async (prefixes = [""], batchCount = 50) => {
        if (!prefixes || prefixes.length === 0) {
            console.log("batchDeleteStorageByPrefixes: 没有要处理的前缀。");
            return [];
        }

        const BUCKET = this.storage().bucket();

        /**
         * 辅助函数：将数组分割成指定大小的块
         */
        const chunkArray = (array, size) => {
            const chunked = [];
            for (let i = 0; i < array.length; i += size) {
                chunked.push(array.slice(i, i + size));
            }
            return chunked;
        };

        /**
         * 删除单个 Storage 前缀下的所有文件，并处理错误。
         */
        const deleteSinglePrefix = async (prefix) => {
            try {
                // 使用 Google Cloud Storage 的 deleteFiles 方法批量删除文件
                await BUCKET.deleteFiles({ prefix });

                console.log(`[成功] 删除了前缀: ${prefix}`);
                return { status: "fulfilled", prefix, message: `Deleted files under ${prefix}` };
            } catch (error) {
                // 捕获所有错误，包括路径下没有文件的“错误”（如果 GCS 抛出的话），
                // 确保不中断主流程，并记录失败信息。
                const errorMessage = error.message || String(error);
                console.error(`[失败] 删除前缀 ${prefix} 时出错: ${errorMessage}`);
                return { status: "rejected", prefix, reason: errorMessage };
            }
        };

        console.log(`batchDeleteStorageByPrefixes: 开始批量删除，共 ${prefixes.length} 个前缀，批次大小: ${batchCount}`);

        const prefixChunks = chunkArray(prefixes, batchCount);
        let allResults = [];
        let chunkIndex = 0;

        // 使用 for...of 和 await 确保批次串行执行
        for (const chunk of prefixChunks) {
            chunkIndex++;
            console.log(`\n--- 开始处理批次 ${chunkIndex}/${prefixChunks.length} (${chunk.length} 个任务) ---`);

            // 将当前批次中的所有前缀转换为 Promise
            const deletePromises = chunk.map((prefix) => deleteSinglePrefix(prefix));

            // 使用 Promise.allSettled 并行执行当前批次的所有删除操作
            const results = await Promise.allSettled(deletePromises);

            // 收集结果。allSettled 的结果是 {status, value/reason}
            allResults = allResults.concat(results.map((r) => r.value || r.reason));
        }

        // 统计和报告最终结果
        const successfulDeletes = allResults.filter((r) => r.status === "fulfilled");
        const failedDeletes = allResults.filter((r) => r.status === "rejected");

        console.log(`\n========================================================`);
        console.log(`总删除尝试: ${allResults.length}`);
        console.log(`成功处理前缀数量: ${successfulDeletes.length}`);
        console.log(`失败处理前缀数量: ${failedDeletes.length}`);

        if (failedDeletes.length > 0) {
            console.error("部分删除失败详情:");
            failedDeletes.forEach((f) => {
                console.error(` - 前缀: ${f.prefix}, 原因: ${f.reason}`);
            });
        } else {
            console.log("所有前缀批次处理成功完成。");
        }
        console.log(`========================================================\n`);

        return allResults;
    };
}

export default new FirebaseHelper();
