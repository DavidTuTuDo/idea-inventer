const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";
import BaseExamFilterComponent from "./BaseExamFilterComponent";
import Router from "../../router";

class ExamFilterComponent extends BaseExamFilterComponent {
    constructor(props) {
        super(props);
        this.subjectName = "";
    }

    componentDidMount() {
        super.componentDidMount();
        const enterPoint = this.propsMobX().paramObject;
        if (enterPoint !== undefined) {
            const route = enterPoint.route;
            if (route.startsWith(`dialog`)) {
                this.subjectName = route.split(":").pop();
            } else {
                this.handleCustomRouter(route);
                this.dismiss();
            }
        }
    }

    getSubjectName() {
        let result = this.subjectName.trim();
        if (Util.isEqual(result, "數學(舊制)")) result = "數學";
        return result;
    }

    getTitle() {
        return this.propsMobX().paramObject.title;
    }

    getInjectStyleOfExamFilterHistoryTestDiv(examFilter) {
        return Util.getVisibleOrNone(!Util.isEqual(this.getTitle(), "綜合題目"));
    }

    gotoExamPageWithCookie = async (obj) => {
        const { Application } = require("../../");

        Cookie.setExamFilter(obj);
        await Util.syncDelay(10);
        Router.gotoExamPage(Application.getLatestComponent());
        this.dismiss();
    };

    getInjectPropsOfExamFilterRandomTestRangeOfYearSlider(randomTest) {
        return {
            min: this.getStore().getExamHistoryInfo().getMinYear(),
            max: this.getStore().getExamHistoryInfo().getMaxYear(),
            step: this.getStore().getExamHistoryInfo().getStep(),
            marks: this.getStore().getExamHistoryInfo().getMarks()
        };
    }

    onExamFilterHistoryTestBtnWithHistoryButtonClicked = (param) => {
        const result = {
            range: [this.getStore().getHistoryTest().getSelectedSelector()],
            type: "history",
            subject: this.getSubjectName()
        };
        this.exeAsyncT(this.gotoExamPageWithCookie(result));
    };

    onExamFilterRandomTestBtnOfStartExamButtonClicked = (param) => {
        const range = this.getStore().getRandomTest().getRangeOfYear();
        const countsOfExam = this.getStore().getRandomTest().getSelectedCountsOfExam();
        const result = { range, countsOfExam, type: "random", subject: this.getSubjectName() };
        this.exeAsyncT(this.gotoExamPageWithCookie(result));
    };

    onExamFilterRandomTestFastRangeButtonClicked(value, param) {
        this.validateRangeByValue(param.object.value);
    }

    validateRangeByValue(value) {
        const max = this.getStore().getExamHistoryInfo().getMaxYear();
        this.getStore()
            .getRandomTest()
            .setRangeOfYear([max - value, max]);
    }
}

export default ExamFilterComponent;
