import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from '../../cookie';
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseExamFilterComponent from "./BaseExamFilterComponent";
import Router from '../../router';

@inject("examFilter")
@observer
class ExamFilterComponent extends BaseExamFilterComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.subjectName = '';
    }

    componentDidMount() {
        super.componentDidMount();
        const enterPoint = this.props.paramObject;
        if (enterPoint !== undefined) {
            const route = enterPoint.route;
            if (route.startsWith(`dialog`)) {
                this.getStore().setSubject(this.getTitle());
                this.subjectName = route.split(':').pop();
            } else {
                this.handleCustomRouter(route);
                this.dismiss();
            }
        }
    }

    getSubjectName() {
        return this.subjectName.trim();
    }

    getTitle() {
        return this.props.paramObject.title;
    }

    getInjectStyleOfExamFilterHistoryTestDiv(examFilter) {
        return Util.getVisibleOrNone(!_.isEqual(this.getTitle(), '綜合題目'))
    }

    onCloseButtonClicked(param) {
        this.dismiss();
    }

    gotoExamPageWithCookie = (obj) => {
        this.dismiss();
        Util.syncDelay(200).then((result) => {
            Cookie.setExamFilter(obj);
            Router.gotoExamPage(this.getComponentInstance())
        })
    }

    getInjectPropsOfExamFilterRandomTestRangeOfYearSlider(randomTest) {
        return {
            min: this.getStore().getExamHistoryInfo().getMinYear(),
            max: this.getStore().getExamHistoryInfo().getMaxYear(),
            step: this.getStore().getExamHistoryInfo().getStep(),
            marks: this.getStore().getExamHistoryInfo().getMarks(),
        }
    }

    onExamFilterHistoryTestBtnWithHistoryButtonClicked = (param) => {
        const result = {
            range: [this.getStore().getHistoryTest().getSelectedSelector()],
            type: 'history',
            subject: this.getSubjectName(),
        };
        this.gotoExamPageWithCookie(result);
    }


    onExamFilterRandomTestBtnOfStartExamButtonClicked = (param) => {
        const range = this.getStore().getRandomTest().getRangeOfYear();
        const countsOfExam = this.getStore().getRandomTest().getSelectedCountsOfExam();
        const result = {range, countsOfExam, type: 'random', subject: this.getTitle()};
        this.gotoExamPageWithCookie(result);
    }

    onExamFilterRandomTestFastRangeButtonClicked(param) {
        this.validateRangeByValue(param.object.value)
    }

    validateRangeByValue(value) {
        const max = this.getStore().getExamHistoryInfo().getMaxYear();
        const min = max - value;
        this.getStore().getRandomTest().setRangeOfYear([max - value, max])
    }

    /** -------------------- async api -------------------- **/
}

export default ExamFilterComponent;
