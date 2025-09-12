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

class ModularizedHadesComponent extends BaseHadesComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectViewOfDemeterDiv = () => {
        const self = this;
        return (
            <JobCalendar
                onPeriodChanged={(start, end) => {
                    self.fetchHeraOfCompound(start, end).then();
                }}
                // courses={self.sample()}
                courses={self.getStore().getCourses()}
            />
        );
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedHadesComponent;
