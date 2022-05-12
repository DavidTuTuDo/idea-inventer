/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2022-05-11-12-53-35
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
import Rhythm from "../portfolioRhythm";
import BaseStore from "../../base/BaseStore";

class BasePortfolioStore extends BaseStore {
    /** -------------------- fields -------------------- **/
    conditionsOfRhythm = [];

    @observable
    rhythms = [];

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
        if (obj && !_.isEmpty(obj.rhythms)) {
            this.setRhythms(...obj.rhythms);
        }
    }

    setDefaultValues() {
        this.setRhythms(...this.rhythms);
    }

    @action
    clean() {
        super.clean();
        this.rhythms = [];
        this.cleanRhythmConditions();
        this.setNextRhythmPageMode("paging");
        this.cleanRhythmNextIds();
    }

    data() {
        return {
            rhythms: this.rhythms.map((each) => each.data()),
        };
    }

    rawData() {
        return {
            rhythms: this.rhythms.map((each) => each.rawData()),
        };
    }

    getRhythmConditions() {
        return this.conditionsOfRhythm;
    }

    cleanRhythmConditions() {
        this.conditionsOfRhythm.length = 0;
    }

    setRhythmConditions(conditions) {
        if (_.isArray(conditions)) this.conditionsOfRhythm = conditions;
    }

    async fetch(view) {
        const result = {
            ...{},
            rhythms: await this.fetchRhythms(view),
        };
        this.fromJson(result);
        return result;
    }

    @action
    setRhythms(...items) {
        const self = this;
        if (items !== undefined && _.isArray(items)) {
            this.rhythms.length = 0;
            this.rhythms.push(
                ...items.map((each) =>
                    each instanceof Rhythm
                        ? each
                        : new Rhythm({ ...each, parentNode: self })
                )
            );
        } else {
            this.rhythms.length = 0;
        }
    }

    getRhythms() {
        return this.rhythms;
    }

    @action
    cleanRhythms() {
        this.rhythms.length = 0;
    }

    @action
    pushRhythms(...items) {
        const self = this;
        this.rhythms.push(
            ...items.map((each) =>
                each instanceof Rhythm
                    ? each
                    : new Rhythm({ ...each, parentNode: self })
            )
        );
    }

    @action
    pushRhythmsByIndex(index, ...params) {
        const self = this;
        Util.insertToArray(
            this.rhythms,
            index,
            ...params.map((each) =>
                each instanceof Rhythm
                    ? each
                    : new Rhythm({ ...each, parentNode: self })
            )
        );
    }

    pushRhythm = (item = {}) => {
        this.pushRhythms(item);
    };

    @action
    removeRhythmsByIndex(...indexes) {
        for (const index of indexes) {
            if (index < -1 && this.rhythms.length < index) {
                Util.appendError(
                    `7821, index ${index} is not valid length ==>`,
                    this.rhythms.length,
                    `index ==>`,
                    index
                );
                return;
            }
        }
        _.pullAt(this.rhythms, indexes);
    }

    @action
    removeRhythms(...fatefulItems) {
        const indexes = [];
        for (const item of fatefulItems) {
            indexes.push(_.indexOf(this.rhythms, item));
        }
        this.removeRhythmsByIndex(...indexes);
    }

    submitRhythms = async (view, ...objs) => {
        const fatefulItems = [];
        for (const obj of objs) {
            const item = await new Rhythm(obj).submitRhythmItem(view);
            fatefulItems.push(item.value);
        }
        this.pushRhythms(...fatefulItems);
    };

    updateRhythms = async (view) => {
        await new Rhythm().submitRhythms(
            view,
            ...this.getRhythms().map((each) => each.rawData())
        );
    };

    submitRhythm = async (view, obj = {}) => {
        return await this.submitRhythms(view, obj);
    };

    nextRhythmPageMode = "paging"; //['in-array','paging']

    rhythmNextIds = [];

    pushNextRhythmIDs = (...ids) => {
        this.rhythmNextIds.push(...ids);
        this.nextRhythmPageMode = "in-array";
    };

    cleanRhythmNextIds() {
        this.rhythmNextIds.length = 0;
    }

    getNextRhythmIDs = () => {
        return this.rhythmNextIds;
    };

    getNextRhythmPageMode = () => {
        return this.nextRhythmPageMode;
    };

    setNextRhythmPageMode = (mode) => {
        this.nextRhythmPageMode = mode;
    };

    fetchRhythms = async (view) => {
        const self = this;
        const fatefulItems = [];
        switch (self.getNextRhythmPageMode()) {
            case "in-array":
                const itemsOfNextIds = await self.fetchRhythmByNextIds(view);
                fatefulItems.push(...itemsOfNextIds);
                break;
            case "paging":
                const itemsOfNextPage = await self.fetchRhythmNextPageItems(view);
                fatefulItems.push(...itemsOfNextPage);
                break;
            default:
                const queryItems = await new Rhythm().fetch(
                    view,
                    ...this.getRhythmConditions()
                );
                fatefulItems.push(...queryItems);
                break;
        }

        if (fatefulItems < Rhythm.sizeOfPerPage) {
            this.setHasPageItems(false);
        }

        this.pushRhythms(...fatefulItems);
        return fatefulItems;
    };

    fetchRhythmNextPageItems = async (view) => {
        const conditions = this.getStartAfterConditions(_.last(this.getRhythms()));
        const fatefulItems = await new Rhythm().fetch(
            view,
            ...this.getRhythmConditions(),
            ...conditions
        );
        return fatefulItems;
    };

    fetchRhythmByNextIds = async (view) => {
        const self = this;
        const targets = _.remove(self.getNextRhythmIDs(), (each, index) => {
            return index < Rhythm.sizeOfPerPage;
        });
        if (!_.isEmpty(targets)) {
            return await new Rhythm().fetch(
                view,
                ...this.getInArrayConditions(targets),
                ...this.getRhythmConditions()
            );
        }
        return [];
    };

    getClassName() {
        return "BasePortfolioStore";
    }
    /** -------------------- async api -------------------- **/
}
export default BasePortfolioStore;
