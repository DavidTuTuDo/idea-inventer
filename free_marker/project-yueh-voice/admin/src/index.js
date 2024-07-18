import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/FirebaseHelper";
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

    async function updateCPRT() {
        await api.submitInfoOfCopyRight({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`
        })
    }

    async function updateCPRTContent() {
        await api.submitInfoOfCopyRightContact({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`,
            phone: `+886982763479`,
            email: `freshingmoon0725@gmail.com`,
        })
    }

    async function updateCPRTProjects() {
        await api.deleteProjects(true);
        await api.submitProjects([
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7832.jpg?alt=media&token=5bf27574-f678-462d-8b3a-ea4077c4910e",
                    "route": "https://kh-high.web.app/",
                    "indexOfSequence": 0,
                    "trait": "線上答題 | 高中學測",
                    "title": "悅考",
                    "descriptions": [{ "statement": "一目暸然的答題方式(單選、多選)" }, { "statement": "錯誤回顧、線上協助" }]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7833.jpg?alt=media&token=4998b3fa-5571-415a-b0d1-0dd4d5d81486",
                    "route": "https://yueh-voice.web.app/",
                    "indexOfSequence": 2,
                    "trait": "線上播放器 ｜客製化",
                    "title": "悅耳",
                    "descriptions": [{ "statement": "建立自己的線上專輯" }, { "statement": "聲音的故事（PODCASTS、街聲）" }]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7838.jpg?alt=media&token=8c1aa03d-5aff-4e93-9745-7bd3bd92e5ed",
                    "route": "empty",
                    "indexOfSequence": 4,
                    "trait": "施工中 | 知識變現 | 技能販售",
                    "title": "悅薪",
                    "descriptions": [
                        { "statement": "施工中" },
                        { "statement": "時薪制販售技能（科目教學、美編、美髮、美睫）" },
                        { "statement": "線上付款（降低人工筆記、保障權益）" }
                    ]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FS__3342348.jpg?alt=media&token=dfdc178e-aa97-4e3c-95d8-7029cbeef62f",
                    "route": "https://yueh-pu.web.app/",
                    "indexOfSequence": 1,
                    "trait": "音樂｜和弦譜",
                    "title": "悅譜",
                    "descriptions": [
                        { "statement": "和弦即時轉調（原調、男女建議調性）" },
                        { "statement": "字體調整（手機、平板、電腦）" }
                    ]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7834.jpg?alt=media&token=9a973889-89a8-4c41-ae34-509b4182646f",
                    "route": "empty",
                    "indexOfSequence": 5,
                    "trait": "施工中 | 線上預約 | 申請",
                    "title": "悅曆",
                    "descriptions": [{ "statement": "施工中" }, { "statement": "場地預約、資格審核、違規計點紀錄" }]
                },
                {
                    "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7840.jpg?alt=media&token=0634dc18-6bff-450b-950a-2493898dcc66",
                    "route": "empty",
                    "indexOfSequence": 7,
                    "trait": "施工中 | 線上小説 ｜黑底白字",
                    "title": "悅讀",
                    "descriptions": [{ "statement": "線上閱讀，使用案底色鮮少眼睛壓力" }, { "statement": "閱讀紀錄，全文檢索" }]
                }
            ]
        );
    }


    // await updateCPRT();
    // await updateCPRTContent();
    // await updateCPRTProjects();

    // await submitShortcut();

})();


