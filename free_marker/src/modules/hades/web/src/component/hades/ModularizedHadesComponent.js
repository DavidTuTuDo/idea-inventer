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

class ModularizedHadesComponent extends BaseHadesComponent {
    constructor(props) {
        super(props);
        this.apiOfHades = new Hades();
    }

    getInjectViewOfDemeterDiv = () => {
        const self = this;
        return (
            <JobCalendar
                onPeriodChanged={(start, end) => {
                    self.fetchHadesOfCompound(start, end).then();
                }}
                // courses={self.sample()}
                courses={self.getStore().getCourses()}
            />
        );
    };

    fetchHadesOfCompound = async (start, end) => {
        const ts = (stringOfTS) => this.getStore().toFireBaseTimestampObject(stringOfTS);
        const startOfPrecisely = _.toNumber(`${start}000000`);
        const endOfPrecisely = _.toNumber(`${end}235959`);

        const items = await this.apiOfHades.fetchHades(
            this,
            UserInfoRef.getUid(),
            { type: "where", params: ["timeOfPayment", ">=", ts(startOfPrecisely)] },
            { type: "where", params: ["timeOfPayment", "<=", ts(endOfPrecisely)] }
        );

        console.log(`ready ==> `, items);
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedHadesComponent;
