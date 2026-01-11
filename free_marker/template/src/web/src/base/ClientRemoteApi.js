const edit = true;
import { utiller as Util, exceptioner as ERROR } from "utiller";
import CommonPoolHelper from "./CommonPoolHelper";
import CommonRemoteApi from "./CommonRemoteApi";

class ClientRemoteApi extends CommonRemoteApi {
    constructor(props) {
        super(props);
    }

    normalizeTimestamp(obj) {
        if (obj instanceof this.FirebaseTimestampClass()) return obj.toMillis();
        else return obj;
    }

    async submitItem(path, object, id) {
        const _async = async () => super.submitItem(path, object, id);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async submitItems(path, ...objects) {
        const _async = async () => super.submitItems(path, ...objects);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async fetchIdsOfDocument(path) {
        const _async = async () => super.fetchIdsOfDocument(path);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    async fetchSizeOfCollection(path) {
        const _async = async () => super.fetchSizeOfCollection(path);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    async fetchCountOfSpecificCondition(path, ...conditions) {
        const _async = async () => super.fetchCountOfSpecificCondition(path, ...conditions);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    async fetchSumOfSpecificAttribute(path, attr, ...conditions) {
        const _async = async () => super.fetchSumOfSpecificAttribute(path, attr, ...conditions);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    async fetchAverageOfSpecificAttribute(path, attr, ...conditions) {
        const _async = async () => super.fetchAverageOfSpecificAttribute(path, attr, ...conditions);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    //multi = [...{name: 'name', type: 'sum', attribute: 'attr'}]
    async fetchMultiResultOfSpecific(path, multi, ...conditions) {
        const _async = async () => super.fetchMultiResultOfSpecific(path, multi, ...conditions);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    /** 用promise.all()拿不同id的documents，firestore目前不支援給batchFetch(已知id) */
    async fetchBatchItems(path, ...references) {
        const _async = async () => super.fetchBatchItems(path, ...references);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    async submitBatchParentItems(pathOfParent = ["father", "children"], items = [{ father: {}, children: {} }], batchCount = 100) {
        const _async = async () => super.submitBatchParentItems(pathOfParent, items, batchCount);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async deleteBatchParentItems(pathOfParent = ["father", "children"], idsOfFather = [""], batchCount = 100) {
        const _async = async () => super.deleteBatchParentItems(pathOfParent, idsOfFather, batchCount);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async updateItem(path, item, id) {
        const _async = async () => super.updateItem(path, item, id);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async upsertItem(path, item, id) {
        const _async = async () => super.upsertItem(path, item, id);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async updateItems(path, items, ...conditions) {
        const _async = async () => super.updateItems(path, items, ...conditions);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async updateEligibleItems(path, obj2Update = {}, ...conditions) {
        const _async = async () => super.updateEligibleItems(path, obj2Update, ...conditions);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async deleteItem(path, item) {
        const _async = async () => super.deleteItem(path, item);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteItems(path, items) {
        const _async = async () => super.deleteItems(path, items);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteEligibleItems(path, ...conditions) {
        const _async = async () => super.deleteEligibleItems(path, ...conditions);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteWholeItems(path) {
        const _async = async () => super.deleteWholeItems(path);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async submitObject(path, object) {
        const _async = async () => super.submitObject(path, object);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async fetchObject(path) {
        const _async = async () => super.fetchObject(path);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    async modifyItemsOfPaginate(path, job = async (items) => {}, conditions, size) {
        const _async = async () => super.modifyItemsOfPaginate(path, job, conditions, size);
        return await CommonPoolHelper.submitTo("fetch", _async);
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async fetchItems(path, ...conditions) {
        const asyncTask = async () => super.fetchItems(path, ...conditions);
        return await CommonPoolHelper.submitTo("fetch", asyncTask);
    }

    async updateObject(path, updatedObject) {
        const asyncTask = async () => super.updateObject(path, updatedObject);
        return await CommonPoolHelper.submitTo("submit", asyncTask);
    }

    async upsertObject(path, updatedObject) {
        const asyncTask = async () => super.upsertObject(path, updatedObject);
        return await CommonPoolHelper.submitTo("submit", asyncTask);
    }

    async deleteObject(path) {
        const _async = async () => super.deleteObject(path);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async appendAttrOfArrayItem(path, attribute, content, id) {
        const _async = async () => super.appendAttrOfArrayItem(path, attribute, content, id);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async deleteAttrOfArrayItem(path, attribute, content, id) {
        const _async = async () => super.deleteAttrOfArrayItem(path, attribute, content, id);
        return await CommonPoolHelper.submitTo("submit", _async);
    }

    async uploadStorageFile(blob, folder = "public", maxSize, options) {
        const _async = async () => super.uploadStorageFile(blob, folder, maxSize, options);
        return await CommonPoolHelper.submitTo("submit", _async, "high", `upload storage file`);
    }

    async deleteStorageFiles(folder = "public") {
        const _async = async () => super.deleteStorageFiles(folder);
        return await CommonPoolHelper.submitTo("submit", _async, "high", `delete storage files`);
    }

    async callCloudFunctions(functionName, data = {}) {
        const _async = async () => super.callCloudFunctions(functionName, data);
        return await CommonPoolHelper.submitTo("functions", _async);
    }

    async runUIAsyncCloudFunctionsTask(functionName, data, view) {
        const self = this;
        const task = async () => {
            return this.callCloudFunctions(functionName, data);
        };
        const path = `call functions => '${functionName}' `;
        const type = `firebase/functions`;
        try {
            Util.appendInfo(`ready to process firebase-functions '${functionName}' `);
            self.handleApiExecute(path, type, view);
            const general = await task();
            const result = general.data;
            if (!result.succeed) {
                Util.appendInfo(`firebase-functions '${functionName}' process fail`);
                throw new Error(result.data);
            } else {
                Util.appendInfo(`firebase-functions '${functionName}' process succeed`, result.data);
                return result.data;
            }
        } catch (error) {
            self.handleApiException(path, type, error, view);
            throw new Error(error.message);
        } finally {
            self.handleApiFinally(path, type, view);
        }
    }

    /** asyncApiTask 必須給的是async function */
    async runUIAsyncTask(asyncApiTask, type, path, view) {
        const self = this;
        try {
            self.handleApiExecute(path, type, view);
            return await asyncApiTask();
        } catch (error) {
            self.handleApiException(path, type, error, view);
            throw new Error(error.message);
        } finally {
            self.handleApiFinally(path, type, view);
        }
    }

    handleApiExecute(path, type, view) {
        if (view !== undefined) {
            // 替換：移除 instanceof BaseComponent 檢查，改為檢查方法是否存在
            if (view && typeof view.setLoadingViewVisibility === "function") {
                console.log(`☀️ ${path} execute 即將 loading-> true`);
                view.setLoadingViewVisibility(true);
            } else {
                // 如果 view 存在但沒有 setLoadingViewVisibility 方法，則拋出錯誤
                // 註：這假設 BaseComponent 或其 Store wrapper 是唯一具有此方法的實例。
                throw new ERROR(7006, `ClientRemoteApi: view must be a BaseComponent instance or its wrapper.`);
            }
        }
    }

    handleApiException(path, type, error, view) {
        if (view !== undefined) {
            // 替換：移除 instanceof BaseComponent 檢查，改為檢查方法是否存在
            if (view && typeof view.setSnackViewVisibility === "function") {
                const errorMsg = `${type} ${[path]}, ${error.message}`;
                console.log(`💔 ${path} execute 即將 wrong -> true`);
                view.setSnackViewVisibility(true, errorMsg, { type: `error`, duration: 3600 });
            }
        }
    }

    handleApiFinally(path, type, view) {
        if (view !== undefined) {
            // 替換：移除 instanceof BaseComponent 檢查，改為檢查方法是否存在
            if (view && typeof view.setLoadingViewVisibility === "function") {
                console.log(`🌙 ${path} execute 即將 loading-> false`);
                view.setLoadingViewVisibility(false);
            }
        }else console.log(`💢 ${path} view遺失了，所以無法將 loading-> false 💢`);
    }
}

export default ClientRemoteApi;
