const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusApolloStore from "./BaseDionysusApolloStore";

class ModularizedDionysusApolloStore extends BaseDionysusApolloStore {
    constructor(props) {
        super(props);
    }

    /** indexSetter的call function */
    fetchTextsOfIndexSetter = async () => {
        const indexOfSelected = [6, 7];
        const tabs = [
            { label: "星期一", value: 1 },
            { label: "星期二", value: 2 },
            { label: "星期三", value: 3 },
            { label: "星期四", value: 4 },
            { label: "星期五", value: 5 },
            { label: "星期天", value: 6 },
            { label: "星期日", value: 7 }
        ];
        return Util.getItemsOfMarkMatching(tabs, indexOfSelected);
    };

    submitTextsOfIndexSetter = async (rows) => {
        const indexesOfDayOff = _.filter(rows, (row) => _.isEqual(true, row.belong)).map((each) => each.value);
        const itemsOfDayOff = _.filter(rows, (row) => _.isEqual(true, row.belong));
        this.setOffDays(...itemsOfDayOff);
    };

    enableGopTopOfIndexSetter = () => {
        return false;
    };
}

export default ModularizedDionysusApolloStore;
