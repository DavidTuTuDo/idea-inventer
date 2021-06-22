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
        const async = async () => super.submitItem(path.object);
        return await CommonPoolHelper.submitTo('submit', async);
    }

    async batchSubmitItem(path, ...objects) {
        const async = async () => super.batchSubmitItem(path, ...objects);
        return await CommonPoolHelper.submitTo('submit', async);
    }

    async fetchSizeOfCollection(path) {
        const async = async () => super.fetchSizeOfCollection(path);
        return await CommonPoolHelper.submitTo('fetch', async);
    }


    async updateItem(path, item) {
        const async = async () => super.updateItem(path, item);
        return await CommonPoolHelper.submitTo('submit', async);
    }

    async deleteItem(path, item) {
        const async =  async () => super.deleteItem(path, item);
        return await CommonPoolHelper.submitTo('submit', async);
    }



    async deleteItems(path) {
        const async = async () => super.deleteItems(path);
        return await CommonPoolHelper.submitTo('submit', async);
    }

    async submitObject(path, object, objName) {
        const async = async () => super.submitObject(path, object, objName);
        return await CommonPoolHelper.submitTo('submit', async);
    }

    async fetchObject(path, objName) {
        const async = async () => super.fetchObject(path, objName);
        return await CommonPoolHelper.submitTo('fetch', async)
    }

    async fetchItems(path) {
        const asyncTask = async () => super.fetchItems(path);
        return await CommonPoolHelper.submitTo('fetch', asyncTask);
    }

    async updateObject(path, updatedObject, objName) {
        const async = async () => super.updateObject(path, updatedObject, objName);
        return await CommonPoolHelper.submitTo('submit', async)
    }

    async deleteObject(path, objName) {
        const async = async () => super.deleteObject(path, objName);
        return await CommonPoolHelper.submitTo('submit', async)

    }

}

export default ClientRemoteApi;
