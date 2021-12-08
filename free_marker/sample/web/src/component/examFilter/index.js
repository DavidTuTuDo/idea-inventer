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
    }

    componentDidMount() {
        super.componentDidMount();
        const enterPoint = this.props.paramObject;
        if (enterPoint !== undefined) {
            const route = enterPoint.route;
            if (route.startsWith(`dialog`)) {
                this.getStore().setSubject(this.getTitle());
            } else if (_.isEqual(route, 'historyWrong')) {
                this.gotoExamPageWithCookie({type: route});
            } else {
                this.handleCustomRouter(route);
                this.dismiss();
            }
        }
    }

    getTitle() {
        return this.props.paramObject.title;
    }

    getInjectStyleOfExamFilterHistoryTestDiv(examFilter) {
        return Util.getVisibleOrHidden(!_.isEqual(this.getTitle(), '綜合測驗'))
    }


    onApiSucceed(object) {
        const exams = this.getStore().getExamHistoryInfo().getHistoryExams();
        this.getStore().getHistoryTest().setSelectors(...exams);
        this.getStore().getHistoryTest().setSelectedSelector(_.last(exams).value)
        this.validateRangeByValue(3);
    }

    getInjectPropsOfRandomTestRangeOfYearSlider(randomTest) {
        return {
            min: this.getStore().getExamHistoryInfo().getMinYear(),
            max: this.getStore().getExamHistoryInfo().getMaxYear(),
            step: this.getStore().getExamHistoryInfo().getStep(),
            marks: this.getStore().getExamHistoryInfo().getMarks(),
        }
    }

    onBtnWithHistoryButtonClicked(param) {
        const result = {
            range: [this.getStore().getHistoryTest().getSelectedSelector()],
            type: 'history',
            subject: this.getStore().getSubject()
        };
        this.gotoExamPageWithCookie(result);
    }

    onBtnOfStartExamButtonClicked(param) {
        const range = this.getStore().getRandomTest().getRangeOfYear();
        const countsOfExam = this.getStore().getRandomTest().getSelectedCountsOfExam();
        const result = {range, countsOfExam, type: 'random', subject: this.getStore().getSubject()};
        this.gotoExamPageWithCookie(result);
    }

    gotoExamPageWithCookie(obj) {
        Cookie.setExamFilter(obj);
        Router.gotoExamPage(this.getComponentInstance())
    }

    onFastRangeButtonClicked(param) {
        this.validateRangeByValue(param.object.value)
    }

    validateRangeByValue(value) {
        const max = this.getStore().getExamHistoryInfo().getMaxYear();
        this.getStore().getRandomTest().setRangeOfYear([max - value, max])
    }

    on


    /** -------------------- async api -------------------- **/
}

export default ExamFilterComponent;
