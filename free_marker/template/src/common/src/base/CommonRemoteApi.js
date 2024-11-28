const edit = true;
import {exceptioner as ERROR, utiller as Util} from 'utiller';
import _ from 'lodash';
import moment from 'moment';
import libpath from 'path';
import firebase from "./FirebaseHelper";

class CommonRemoteApi {

    _firebase() {
        return firebase;
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
            else if (pram instanceof self.FirebaseTimestampClass()) return moment(pram.toMillis());
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
        return firebase.getLibOfFirebaseTimestamp();
    }

    toFireBaseTimestampObject(obj) {
        if (_.isNull(obj) || _.isUndefined(obj))
            return null;

        if (obj instanceof firebase.getLibOfFirebaseTimestamp()) {
            return obj;
        } else {
            try {
                return this.getFirebaseTimestampObject(moment(obj).valueOf());
            } catch (error) {
                Util.appendError(`441513135 ${error.message}`);
                return this.getObjectOfCurrentTimeStamp();
            }
        }
    }

    getObjectOfCurrentTimeStamp() {
        return firebase.getCurrentFirestoreTimeStamp();
    }

    async callCloudFunctions(functionName = '', data, region = 'us-central1') {
        Util.appendInfo(`454546 functions httpOnCall => '${functionName}'`, data);
        return await firebase.httpOnCall(functionName, data);
    }

    /** 取得collection所有的document ids */
    async fetchIdsOfDocument(path) {
        const all = firebase.fetchDocuments(path);
        return all.map((each) => each.id);
    }

    /** predicate 裏面放batch要做的動作 set,update,delete, 所以每個
     * todo: 可以設計為[....{ path:'route', content:{id:ioOfDoc}, behavior:'delete|set|update'}]，然後在predicate by case 處理
     * */
    async batchBracket(objects, predicate = (batch, object) => {
    }) {
        await firebase.batchDo(objects, predicate);
        return {message: `batchBracket succeed size:${_.size(objects)} succeed`}
    }

    async submitItems(path, ...items) {
        const size = items.length
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} batch submit => path:${path}, size:${size} start`);
        const result = await firebase.submitDocuments(path, items);
        Util.appendInfo(`${uid} batch submit path:${path}, size:${size} succeed`);
        return result;

    }

    async updateItems(path, items, ...conditions) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} batch update path:${path}`);
        const result = await firebase.updateDocuments(path, items, ...conditions);
        Util.appendInfo(`${uid} batch update path:${path}, size:${_.size(result)} succeed`);
        return result;

    }

    /** 因為 == ,in, array-contains, not-in 這類的比較最多只能有10個, 所以得設計batch */
    fetchItemsOfLimitation = async (path, action, fieldName, ...valuesOfComparison) => {
        const result = [];
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start fetch items in limitation with action = ${action} | fieldName = ${fieldName} | path:${path}, size:${valuesOfComparison.length}`);
        if (_.isEqual('id', fieldName)) {
            fieldName = this.getFieldNameOfDocumentId()
        }
        while (_.size(valuesOfComparison) > 0) {
            const values = await this.fetchItems(path, {
                type: 'where', params: [fieldName, action, Util.getSliceArrayWithMutate(valuesOfComparison, 10)]
            })
            result.push(...values);
        }
        Util.appendInfo(`${uid} finish fetch items in limitation`);
        return result;
    }

    async fetchSizeOfCollection(path) {
        return await firebase.fetchCountOfCollection(path);
    }

    async submitItem(path, item, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start submit item => path:${path}/${id ?? 'not set'}`);
        const obj = await firebase.submitDocument(path, item, id);
        Util.appendInfo(`${uid} succeed submit item => path:${path}/${obj.id}`);
        return {
            succeed: true,
            message: `set path:${path}/${obj.id} succeed`,
            value: obj,
        }
    }

    async updateItem(path, item, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start update item => path:/${path}/${id}`);
        await firebase.updateDocument(path, item, id);
        Util.appendInfo(`${uid} succeed update item => path:/${path}/${id}`);
        return {
            succeed: true,
            message: `update path:${path}/${id} succeed`,
            value: item,
        }
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

    async updateItemAtomically(path, predict = (item, transaction) => item, id) {
        return await this.updateDocumentAtomically(path, predict, id);
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

    async fetchItem(path, id) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start fetch item => path:/${path}/${id}`);
        const item = await firebase.fetchDocument(path, id);
        Util.appendInfo(`${uid} succeed fetch item => path:/${path}/${id}`);
        return item;
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteItems(path, whole, ...conditions) {
        const uid = Util.getRandomHashV2(10);
        Util.appendInfo(`${uid} start delete items ${path}`);
        await firebase.deleteDocuments(path, whole, ...conditions);
        Util.appendInfo(`${uid} succeed delete items ${path}`);
    }

    async submitObject(path, content, objName = 'field') {
        const uid = Util.getRandomHashV2(10);
        const commitment = content;
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start submit object => ${path}/${objName}`);
        const object = await firebase.submitDocument(path, commitment, objName);
        Util.appendInfo(`${uid} succeed submit object => ${path}/${objName}`);
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

    async fetchObject(path, objName) {
        const uid = Util.getRandomHashV2(10);
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start fetch object => path:/${path}/${objName}`);
        const object = await firebase.fetchDocument(path, objName);
        Util.appendInfo(`${uid} start fetch object => path:/${path}/${objName}`);
        return object;
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
        const uid = Util.getRandomHashV2(10);
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start update object => path:/${path}/${objName}`);
        await firebase.updateDocument(path, objName, updatedObject);
        Util.appendInfo(`${uid} succeed update object => path:/${path}/${objName}`);
    }

    async updateObjectAtomically(path, predict = (object, transaction) => object, objName) {
        return await this.updateDocumentAtomically(path, predict, objName);
    }

    async deleteObject(path, objName = 'contents') {
        const uid = Util.getRandomHashV2(10);
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`${uid} start delete object => path:/${path}/${objName}`);
        await firebase.deleteDocument(path, objName);
        Util.appendInfo(`${uid} succeed delete object => path:/${path}/${objName}`);
    }

    restfulListenItem(path, id, handler = (data) => data, view) {
        const self = this;
        this.showLoadingView(view);
        Util.appendInfo(`restfulListenItem path:/${path}/${id}`);
        const functionOfUnsubscribe = this.listenItem(path, id, (status, data, error) => {
            if (_.isEqual(status, 'server') && !Util.isUndefinedNullEmpty(data)) {
                self.closeLoadingView(view);
                handler(data);
            } else {
                this.closeLoadingView(view);
                handler({status, message: `${error ? error.message : 'try not to handling'}`});
            }
        })
        return functionOfUnsubscribe;
    }

    /**
     * status =>string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * 監聽collection 變動，利用callback接收推播資訊
     * change:{type,data,id} ;type:['added','modified','removed'], 回傳的就是function of unsubscribe
     *
     * callback {status:[local|server|error|cache], changes:[...{document}], error:object }
     * */
    listenItems(path, callback = (status, changes, error) => {
    }, ...conditions) {
        Util.appendInfo(`15412313 listenItems path:/${path}`);
        return firebase.listenDocuments(path, callback, ...conditions);
    }

    /**
     * status string[local|server|error|cache]是指本地端寫入一個document時,就會收到一個local端的callback, 等到資料完整在remote端部署，就會再收到server端的callback
     * data 就是寫入後的document value
     *
     * 回傳一個unsubscribe的function，需要要在componentDidUnmount的地方呼叫unsubscribe()
     * callback {status:[local|server|error|cache], changes: document, error:object }
     */
    listenItem(path, id, callback = (status, data, error) => {
    }) {
        Util.appendInfo(`6347871 listenItem path:/${path}/${id}`);
        return firebase.listenDocument(path, id, callback);
    }

    listenObject(path, objName, callback = (data, error) => {
    }) {
        path = this.getNormalizePathOfObjectApi(path);
        Util.appendInfo(`listenObject path:/${path}/${objName}`);
        return firebase.listenDocument(path, objName, callback);
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
        for (const key in commitment)
            if (_.isUndefined(commitment[key]) || _.isNull(commitment[key])) delete commitment[key]

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

    async firestoreDocRef(path, id) {
        return firebase.reference(path, id);
    }

    /** 這是針對用desktop/mobile 選擇的檔案上傳機制 */
    async uploadStorageFile(blob, folder = 'public', fileNameExtension) {
        return await firebase.uploadStorageFile(blob, folder, fileNameExtension);
    }

    reference(path, id) {
        return firebase.reference(path, id);
    }

    async fetchCountOfSpecificCondition(path, ...conditions) {
        return firebase.fetchCountOfSpecificCondition(path, ...conditions)
    }

    async fetchSumOfSpecificAttribute(path, attr, ...conditions) {
        return firebase.fetchSumOfSpecificAttribute(path, attr, ...conditions)
    }

    async fetchAverageOfSpecificAttribute(path, attr, ...conditions) {
        return firebase.fetchAverageOfSpecificAttribute(path, attr, ...conditions)
    }

    //multi = [...{name: 'name', type: 'sum', attribute: 'attr'}]
    async fetchMultiResultOfSpecific(path, multi, ...conditions) {
        return firebase.fetchMultiResultOfSpecific(path, multi, ...conditions)
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
