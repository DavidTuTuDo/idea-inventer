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
import * as mm from 'music-metadata-browser';
import fetch from 'node-fetch';

(async () => {

    const api = new Api();
    const listener = new Listener();

    // const voices = await api.fetchVoices();
    // console.log(voices[0].pathOfResource);
    const url = 'https://firebasestorage.googleapis.com/v0/b/yueh-voice.appspot.com/o/voice%2FqngV7sGt0tN4Eijv2DlUQhHE9ry2%2F%E5%91%8A%E4%BA%94%E4%BA%BA-%E5%9C%A8%E9%80%99%E5%BA%A7%E5%9F%8E%E5%B8%82%E9%81%BA%E5%A4%B1%E4%BA%86%E4%BD%A0.mp3?alt=media&token=698cfe2f-d47e-4f72-b5a4-d2aac87ca43e';

    const metadata = await getMetadata(url);
    console.log(metadata);


})();


