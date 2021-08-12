import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';
import Moment from 'moment';
import config from '../config';
import libpath from 'path';
import CommonPoolHelper from "./CommonPoolHelper";
import CommonRemoteApi from "./CommonRemoteApi";

class ClientRemoteApi extends CommonRemoteApi {

    constructor(props) {
        super(props);
    }

    async submitItem(path, object) {
        const _async = async () => super.submitItem(path, object);
        return await CommonPoolHelper.submitTo('submit', _async, 'low', 'submitItem');
    }

    async batchSubmitItem(path, ...objects) {
        const _async = async () => super.batchSubmitItem(path, ...objects);
        return await CommonPoolHelper.submitTo('submit', _async);
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


    async deleteItems(path) {
        const _async = async () => super.deleteItems(path);
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

    async fetchItems(path) {
        const asyncTask = async () => super.fetchItems(path);
        return await CommonPoolHelper.submitTo('fetch', asyncTask);
    }

    async updateObject(path, updatedObject, objName) {
        const _async = async () => super.updateObject(path, updatedObject, objName);
        return await CommonPoolHelper.submitTo('submit', _async)
    }

    async deleteObject(path, objName) {
        const _async = async () => super.deleteObject(path, objName);
        return await CommonPoolHelper.submitTo('submit', _async)

    }

    /** asyncApiTask 必須給的是async function */
    async runUIAsyncTask(asyncApiTask, type, path, view) {
        const self = this;
        try {
            self.handleApiExecute(path, type, view);
            return await asyncApiTask();
        } catch (error) {
            self.handleApiException(path, type, error, view);
        } finally {
            self.handleApiFinally(path, type, view);
        }
    }

    handleApiExecute(path, type, view) {
        if (view !== undefined) {
            view.setLoadingViewVisibility(true);
        }
    }

    handleApiException(path, type, error, view) {
        if (view !== undefined) {
            const errorMsg = `${type} ${[path]}, ${error.message}`
            view.setSnackViewVisibility(true, errorMsg, {type: `error`, duration: 5000});
        }
    }

    handleApiFinally(path, type, view) {
        if (view !== undefined) {
            view.setLoadingViewVisibility(false);
        }
    }

}

export default ClientRemoteApi;
