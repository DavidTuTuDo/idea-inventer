/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2022-05-11-12-53-33
 */
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import BaseStore from "../../base/BaseStore";

class BasePortfolioRhythmStore extends BaseStore {
    /** -------------------- fields -------------------- **/
    static sizeOfPerPage = 10;

    static sizeOfPerRequest = 50;

    @observable
    id = "";

    @observable
    uuidOfSinger = -1;

    @observable
    uuidOfSong = -1;

    @observable
    indexOfSequence = 100;

    @observable
    popularLevel = -1;

    @observable
    idOfGuitarPu = "";

    @observable
    idOfSinger = "";

    @observable
    composer = "";

    @observable
    singer = "";

    @observable
    name = "";

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        makeObservable(this);
        this.setDefaultValues();
        this.initial(props);
    }

    @action
    initial(obj) {
        super.initial(obj);
        if (obj && !_.isEmpty(obj.name)) {
            this.setName(obj.name);
        }
        if (obj && !_.isEmpty(obj.singer)) {
            this.setSinger(obj.singer);
        }
        if (obj && !_.isEmpty(obj.composer)) {
            this.setComposer(obj.composer);
        }
        if (obj && !_.isEmpty(obj.idOfSinger)) {
            this.setIdOfSinger(obj.idOfSinger);
        }
        if (obj && !_.isEmpty(obj.idOfGuitarPu)) {
            this.setIdOfGuitarPu(obj.idOfGuitarPu);
        }
        if (obj && _.isNumber(obj.popularLevel)) {
            this.setPopularLevel(obj.popularLevel);
        }
        if (obj && _.isNumber(obj.indexOfSequence)) {
            this.setIndexOfSequence(obj.indexOfSequence);
        }
        if (obj && !_.isEmpty(obj.uuidOfSong)) {
            this.setUuidOfSong(obj.uuidOfSong);
        }
        if (obj && !_.isEmpty(obj.uuidOfSinger)) {
            this.setUuidOfSinger(obj.uuidOfSinger);
        }
        if (obj && !_.isEmpty(obj.id)) {
            this.setId(obj.id);
        }
    }

    setDefaultValues() {}

    @action
    clean() {
        super.clean();
        this.name = "";
        this.singer = "";
        this.composer = "";
        this.idOfSinger = "";
        this.idOfGuitarPu = "";
        this.popularLevel = -1;
        this.indexOfSequence = 100;
        this.uuidOfSong = -1;
        this.uuidOfSinger = -1;
        this.id = "";
    }

    data() {
        return {
            name: this.name,
            singer: this.singer,
            composer: this.composer,
            idOfSinger: this.idOfSinger,
            idOfGuitarPu: this.idOfGuitarPu,
            popularLevel: this.popularLevel,
            indexOfSequence: this.indexOfSequence,
            uuidOfSong: this.uuidOfSong,
            uuidOfSinger: this.uuidOfSinger,
            id: this.id,
        };
    }

    rawData() {
        return {
            name: this.name,
            singer: this.singer,
            composer: this.composer,
            idOfSinger: this.idOfSinger,
            idOfGuitarPu: this.idOfGuitarPu,
            popularLevel: this.popularLevel,
            indexOfSequence: this.indexOfSequence,
            uuidOfSong: this.uuidOfSong,
            uuidOfSinger: this.uuidOfSinger,
            id: this.id,
        };
    }

    /** 把自己移動到array的頭或尾 */
    @action
    moveSelfToAside(toTail = true) {
        if (this.getParentNode()) {
            const items = this.getParentNode().getRhythms();
            this.getParentNode().setRhythms(
                ...Util.getArrayOfMoveSpecificItemToAside(items, this, toTail)
            );
        }
    }

    /** type是array, 才會被gen出的method */
    remove() {
        if (this.getParentNode()) this.getParentNode().removeRhythms(this);
    }

    async fetch(view, ...conditions) {
        return await this.fetchRhythms(view, ...conditions);
    }

    listenRhythmItem(view, id, callback = (data, error) => {}) {
        const path = `/rhythms`;
        return this.listenItem(path, id, callback);
    }

    /** type:['added','modified','removed'], 回傳的就是function of unsubscribe */
    listenRhythms(
        view,
        callback = (changes, error) => {},
        condition = (stmt) => stmt
    ) {
        const path = `/rhythms`;
        return this.listenItems(path, callback, condition);
    }

    async fetchSizeOfRhythms(view) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await self.fetchSizeOfCollection(path);
        };
        return await self.runUIAsyncTask(task, "fetch size", path, view);
    }

    async updateRhythms(view, ...items) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            await self.updateItems(path, ...items);
        };
        return await self.runUIAsyncTask(task, "update items", path, view);
    }

    async submitRhythms(view, ...items) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            const commitments = items.map((item) => this.normalizeRhythm(item));
            return await self.submitItems(path, ...commitments);
        };
        return await self.runUIAsyncTask(task, "submit items", path, view);
    }

    async deleteRhythmItem(view, id = this.getId()) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            const result = await self.deleteItem(path, id);
            if (this.hasParent()) this.getParentNode().removeRhythms(this);
            return result;
        };
        return await self.runUIAsyncTask(task, "delete item", path, view);
    }

    async updateRhythmItemAtomically(
        view,
        id = this.getId(),
        predict = async (item, transaction) => item
    ) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await self.updateItemAtomically(path, id, predict);
        };
        return await self.runUIAsyncTask(
            task,
            "update item atomically",
            path,
            view
        );
    }

    async updateRhythmItem(view, id = this.getId(), item = this.rawData()) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await self.updateItem(path, id, item);
        };
        return await self.runUIAsyncTask(task, "update item", path, view);
    }

    async submitRhythmItem(view, item = this.rawData()) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            const commitment = this.normalizeRhythm(item);
            return await self.submitItem(path, commitment);
        };
        return await self.runUIAsyncTask(task, "submit item", path, view);
    }

    async deleteRhythms(view, all = false, ...conditions) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await self.deleteItems(path, all, ...conditions);
        };
        return await self.runUIAsyncTask(task, "delete items", path, view);
    }

    async fetchRhythmItem(view, id = this.getId()) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            const item = await self.fetchItem(path, id);
            this.clean();
            this.initial(item);
            return item;
        };
        return await self.runUIAsyncTask(task, "fetch item", path, view);
    }

    async fetchRhythms(view, ...conditions) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await self.fetchItems(path, ...conditions, {
                limit: (stmt) => stmt.limit(BasePortfolioRhythmStore.sizeOfPerPage),
            });
        };
        return await self.runUIAsyncTask(task, "fetch items", path, view);
    }

    async fetchRhythmsOfLimitation(
        view,
        action = "in",
        fieldName = "name",
        ...valuesOfComparison
    ) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await this.fetchItemsOfLimitation(
                path,
                action,
                fieldName,
                ...valuesOfComparison
            );
        };
        return await self.runUIAsyncTask(
            task,
            "get items with limitation",
            path,
            view
        );
    }

    getRhythmItemDocRef(view, id = this.getId()) {
        const self = this;
        const path = `/rhythms`;
        return this.firestoreDocRef(path, id);
    }

    async fetchPureRhythms(view, ...conditions) {
        const self = this;
        const path = `/rhythms`;
        const task = async () => {
            return await self.fetchItems(path, ...conditions);
        };
        return await self.runUIAsyncTask(
            task,
            "fetch items without limit condition",
            path,
            view
        );
    }

    async fetchNextRhythms(view, lastItem, ...conditions) {
        const startAfterConditions = this.getStartAfterConditions(lastItem);
        return await this.fetchRhythms(
            view,
            ...startAfterConditions,
            ...conditions
        );
    }

    normalizeRhythm(object, update = false) {
        const _name = object.name ? object.name : ""; // string:沒有解釋
        const _singer = object.singer ? object.singer : ""; // string:沒有解釋
        const _composer = object.composer ? object.composer : ""; // string:沒有解釋
        const _idOfSinger = object.idOfSinger ? object.idOfSinger : ""; // string:用來搜尋特定歌手所有作品的index
        const _idOfGuitarPu = object.idOfGuitarPu ? object.idOfGuitarPu : ""; // string:sheet的unique id,用來點擊後道引到sheet
        const _popularLevel = _.isNumber(object.popularLevel)
            ? object.popularLevel
            : -1; // number:熱門指數
        const _indexOfSequence = _.isNumber(object.indexOfSequence)
            ? object.indexOfSequence
            : 100; // number:歌曲顯示的順序(依照字數)
        const _uuidOfSong = object.uuidOfSong ? object.uuidOfSong : -1; // string:用來記錄19up上tone唯一網址
        const _uuidOfSinger = object.uuidOfSinger ? object.uuidOfSinger : -1; // string:用來記錄19up上signer唯一網址
        const _id = object.id ? object.id : ""; // string:我是uid,不能被更改
        const _updateTime = this._firebase().getServerTimeSymbol();
        const commitment = {
            name: _name,
            singer: _singer,
            composer: _composer,
            idOfSinger: _idOfSinger,
            idOfGuitarPu: _idOfGuitarPu,
            popularLevel: _popularLevel,
            indexOfSequence: _indexOfSequence,
            uuidOfSong: _uuidOfSong,
            uuidOfSinger: _uuidOfSinger,
            id: _id,
            updateTime: _updateTime,
        };
        this.handleCommitment(update, commitment, object);
        return commitment;
    }

    getId() {
        return this.id;
    }

    @action
    removeId() {
        this.id = "";
    }

    @action
    setId(param) {
        if (param !== undefined) {
            this.id = param;
        } else {
            this.id = "";
        }
    }

    getUuidOfSinger() {
        return this.uuidOfSinger;
    }

    @action
    removeUuidOfSinger() {
        this.uuidOfSinger = -1;
    }

    @action
    setUuidOfSinger(param) {
        if (param !== undefined) {
            this.uuidOfSinger = param;
        } else {
            this.uuidOfSinger = -1;
        }
    }

    getUuidOfSong() {
        return this.uuidOfSong;
    }

    @action
    removeUuidOfSong() {
        this.uuidOfSong = -1;
    }

    @action
    setUuidOfSong(param) {
        if (param !== undefined) {
            this.uuidOfSong = param;
        } else {
            this.uuidOfSong = -1;
        }
    }

    getIndexOfSequence() {
        return this.indexOfSequence;
    }

    @action
    removeIndexOfSequence() {
        this.indexOfSequence = 100;
    }

    @action
    setIndexOfSequence(param) {
        if (param !== undefined) {
            this.indexOfSequence = param;
        } else {
            this.indexOfSequence = 100;
        }
    }

    getPopularLevel() {
        return this.popularLevel;
    }

    @action
    removePopularLevel() {
        this.popularLevel = -1;
    }

    @action
    setPopularLevel(param) {
        if (param !== undefined) {
            this.popularLevel = param;
        } else {
            this.popularLevel = -1;
        }
    }

    getIdOfGuitarPu() {
        return this.idOfGuitarPu;
    }

    @action
    removeIdOfGuitarPu() {
        this.idOfGuitarPu = "";
    }

    @action
    setIdOfGuitarPu(param) {
        if (param !== undefined) {
            this.idOfGuitarPu = param;
        } else {
            this.idOfGuitarPu = "";
        }
    }

    getIdOfSinger() {
        return this.idOfSinger;
    }

    @action
    removeIdOfSinger() {
        this.idOfSinger = "";
    }

    @action
    setIdOfSinger(param) {
        if (param !== undefined) {
            this.idOfSinger = param;
        } else {
            this.idOfSinger = "";
        }
    }

    getComposer() {
        return this.composer;
    }

    @action
    removeComposer() {
        this.composer = "";
    }

    @action
    setComposer(param) {
        if (param !== undefined) {
            this.composer = param;
        } else {
            this.composer = "";
        }
    }

    getSinger() {
        return this.singer;
    }

    @action
    removeSinger() {
        this.singer = "";
    }

    @action
    setSinger(param) {
        if (param !== undefined) {
            this.singer = param;
        } else {
            this.singer = "";
        }
    }

    getName() {
        return this.name;
    }

    @action
    removeName() {
        this.name = "";
    }

    @action
    setName(param) {
        if (param !== undefined) {
            this.name = param;
        } else {
            this.name = "";
        }
    }

    getClassName() {
        return "BasePortfolioRhythmStore";
    }
    /** -------------------- async api -------------------- **/
}
export default BasePortfolioRhythmStore;
