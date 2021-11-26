import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseExamEditorComponent from "./BaseExamEditorComponent";
import Cookie from "../../cookie";
import Router from "../../router";
import ExamSubjectIdStore from "../../store/examSubjectId";

@inject("exam")
@observer
class ExamEditorComponent extends BaseExamEditorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.handleExamFilter();
        super.componentDidMount();
    }

    handleExamFilter = () => {
        const filter = Cookie.getExamFilter();
        const self = this;
        if (_.isEmpty(filter)) {
            Router.gotoMainPage(this.getComponentInstance());
            return;
        }

        const subject = filter.subject; // 'string'
        const type = filter.type; // 'string'
        const range = filter.range; // [100, 105]
        const countsOfExam = filter.countsOfExam; //25 or 40
        Util.appendInfo(subject, type, range, countsOfExam)

        switch (type) {
            case 'history':
                this.getStore().setQuestionConditions([
                    {where: (stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where: (stmt) => stmt.where('year', '==', _.toNumber(_.head(range)))},
                    {orderBy: (stmt) => stmt.orderBy("qid")}
                ]);
                break;
            case 'random':
                this.setEnableInitFetch(false);
                const conditions = [
                    {where: (stmt) => stmt.where('subject', '==', _.trim(subject))},
                    {where: (stmt) => stmt.where('year', '>=', _.toNumber(range.shift()))},
                    {where: (stmt) => stmt.where('year', '<=', _.toNumber(range.shift()))}
                ]
                const subjectID = new ExamSubjectIdStore();
                subjectID.fetchSubjectIds(this, ...conditions).then((idMaps) => {
                    const ids = _.sampleSize(idMaps, countsOfExam).map(each => each.quid);
                    this.getStore().pushNextQuestionIDs(...ids);
                    return this.getStore().fetch(self)
                }).then();
                break;

            default:
                Util.appendError(`8354 ==> type can't not be ${type}`);
                /**
                 * show error dialog then return
                 **/
                break;
        }
    }
    /** -------------------- async api -------------------- **/
}

export default ExamEditorComponent;
