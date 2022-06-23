import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import Moment from 'moment';
import libpath from 'path';
import CommonPoolHelper from "./CommonPoolHelper";
import CommonRemoteApi from "./CommonRemoteApi";
import BaseComponent from "./BaseComponent";
import firebase from "./CommonFirebaseHelper";

class ClientRemoteApi extends CommonRemoteApi {

    constructor(props) {
        super(props);
    }

    async submitItem(path, object) {
        const _async = async () => super.submitItem(path, object);
        return await CommonPoolHelper.submitTo('submit', _async, 'low', 'submitItem');
    }

    async batchSubmitItem(path, ...objects) {
        const _async = async () => super.submitItems(path, ...objects);
        return await CommonPoolHelper.submitTo('submit', _async);
    }

    async fetchIdsOfDocument(path) {
        const _async = async () => super.fetchIdsOfDocument(path);
        return await CommonPoolHelper.submitTo('fetch', _async);
    }

    async fetchSizeOfCollection(path) {
        const _async = async () => super.fetchSizeOfCollection(path);
        return await CommonPoolHelper.submitTo('fetch', _async);
    }


    async updateItem(path, id, item) {
        const _async = async () => super.updateItem(path, id, item);
        return await CommonPoolHelper.submitTo('submit', _async);
    }

    async deleteItem(path, item) {
        const _async = async () => super.deleteItem(path, item);
        return await CommonPoolHelper.submitTo('submit', _async);
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async deleteItems(path, all, ...conditions) {
        const _async = async () => super.deleteItems(path, ...conditions);
        return await CommonPoolHelper.submitTo('submit', _async);
    }

    async submitObject(path, object, objName) {
        const _async = async () => super.submitObject(path, object, objName);
        return await CommonPoolHelper.submitTo('submit', _async);
    }

    async fetchObject(path, objName) {
        const _async = async () => super.fetchObject(path, objName);
        return await CommonPoolHelper.submitTo('fetch', _async)
    }

    /**  condition 的範本大概是 => (stmt) => stmt.limit(6), where('','')*/
    async fetchItems(path, ...conditions) {
        const asyncTask = async () => super.fetchItems(path, ...conditions);
        return await CommonPoolHelper.submitTo('fetch', asyncTask);
    }

    async updateObject(path, objName,updatedObject) {
        const asyncTask = async () => super.updateObject(path, objName,updatedObject);
        return await CommonPoolHelper.submitTo('submit', asyncTask)
    }

    async deleteObject(path, objName) {
        const _async = async () => super.deleteObject(path, objName);
        return await CommonPoolHelper.submitTo('submit', _async)
    }

    async uploadStorageFile(blob, folder = 'public', type = 'file') {
        const _async = async () => super.uploadStorageFile(blob, folder, type);
        return await CommonPoolHelper.submitTo('submit', _async, 'high', `upload ${type}`);
    }

    async callCloudFunctions(functionName, data = {}) {
        const _async = async () => super.callCloudFunctions(functionName, data);
        return await CommonPoolHelper.submitTo('functions', _async)
    }

    async runUIAsyncCloudFunctionsTask(functionName, data, view) {
        const self = this;
        const task = async () => {
            return this.callCloudFunctions(functionName, data);
        }
        const path = `call functions => '${functionName}' `;
        const type = `firebase/functions`
        try {
            Util.appendInfo(`ready to process firebase-functions '${functionName}' `);
            self.handleApiExecute(path, type, view);
            const general = await task();
            const result = general.data;
            if (!result.succeed) {
                Util.appendInfo(`firebase-functions '${functionName}' process fail`);
                throw new Error(result.data);
            } else {
                Util.appendInfo(`firebase-functions '${functionName}' process succeed`,result.data);
                return result.data;
            }
        } catch (error) {
            self.handleApiException(path, type, error, view)
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
            if (view instanceof BaseComponent)
                view.setLoadingViewVisibility(true);
            else {
                throw new ERROR(7006)
            }
        }
    }

    handleApiException(path, type, error, view) {
        if (view !== undefined && view instanceof BaseComponent) {
            const errorMsg = `${type} ${[path]}, ${error.message}`
            view.setSnackViewVisibility(true, errorMsg, {type: `error`, duration: 5000});
        }
    }

    handleApiFinally(path, type, view) {
        if (view !== undefined && view instanceof BaseComponent) {
            view.setLoadingViewVisibility(false);
        }
    }

}

export default ClientRemoteApi;
