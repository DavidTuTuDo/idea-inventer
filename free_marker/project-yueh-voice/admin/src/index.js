import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/CommonFirebaseHelper";
import {linepayer as LinePay} from "linepayer";
import libpath from 'path';
import config from './config';
import moment from 'moment';
import {configerer} from "configerer";
import fetch from 'node-fetch';

(async () => {

    const api = new Api();

    async function submitShortcut() {
        await api.deleteShortcuts();
        await api.submitShortcuts(
            {
                title: '回到首頁',
                icon: 'muIcon:Bedtime',
                route: `route:main`,
                indexOfSequence: 0,
            },
            {
                title: '明悅-悅譜',
                icon: 'muIcon:School',
                route: 'path:https://yueh-pu.web.app/',
                indexOfSequence: 1,
            },
            {
                title: '明悅-悅考',
                icon: 'muIcon:School',
                route: 'path:https://kh-high.web.app/',
                indexOfSequence: 2,
            }
        )
    }

    async function moveUserInfoToUser() {
        const ids = await api.fetchDocumentIdsOfUser();
        for (const id of ids) {
            const user = await api.fetchUserInfo(id);
            const result = await api.submitUserItem({...user, id, isAdmin: false}, id);
        }
    }

    async function updateUserInfoToUser() {
        const ids = await api.fetchDocumentIdsOfUser();
        for (const id of ids) {
            const result = await api.updateUserItem({id: id}, id);
        }
    }

    async function deleteUserInfoToUser() {
        const ids = await api.fetchDocumentIdsOfUser();
        for (const id of ids) {
            const result = await api.deleteObject(`users/${id}/attrs`, 'userInfo');
            console.log(result);
        }
    }
    // await submitShortcut();


})();


