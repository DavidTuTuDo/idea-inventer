const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseHadesComponent from "./BaseHadesComponent";
import JobCalendar from "../../base/JobCalendar";
import Hades from "../../store/hadesHade";
import moment from "moment";

class ModularizedHadesComponent extends BaseHadesComponent {
    constructor(props) {
        super(props);
        this.apiOfHades = new Hades();
    }

    getInjectViewOfHadesDiv = () => {
        const self = this;
        return (
            <JobCalendar
                onPeriodChanged={(start, end) => {
                    self.fetchHadesOfCompound(start, end).then();
                }}
                courses={self
                    .getStore()
                    .getHades()
                    .map((each) => self.normalize(each))}
            />
        );
    };

    normalize = (each) => {
        const format = (firebaseTS) => moment(this.getStore().normalizeTimestamp(firebaseTS)).format("YYYYMMDDHHmmss");
        const period = `${format(each.timeOfCreate)}-${format(each.timeOfPayment)}`;
        const name = `＄${each.priceOfTotal}`;
        return { ...each, period, name };
    };

    fetchHadesOfCompound = async (start, end) => {
        const ts = (stringOfTS) => this.getStore().toFireBaseTimestampObject(moment(stringOfTS, "YYYYMMDDHHmmss"));
        const startOfPrecisely = `${start}000000`;
        const endOfPrecisely = `${end}235959`;

        const items = await this.apiOfHades.fetchPureHades(
            this,
            UserInfoRef.getUid(),
            { type: "where", params: ["timeOfPayment", ">=", ts(startOfPrecisely)] },
            { type: "where", params: ["timeOfPayment", "<=", ts(endOfPrecisely)] }
        );
        this.getStore().cleanHades();
        this.getStore().pushHades(...items);
        // console.log(`ready ==> `, items);
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedHadesComponent;
