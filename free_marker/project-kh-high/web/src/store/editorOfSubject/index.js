import BaseEditorOfSubjectStore from "./BaseEditorOfSubjectStore";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
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
import Question from "../examQuestion";
import AreaOfStatement from "../editorOfSubjectAreaOfStatement";
import BaseStore from "../../base/BaseStore";

class EditorOfSubjectStore extends BaseEditorOfSubjectStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfQuestion = new Question();
    }

    updateConditionsOfMathQuestion() {
        const conditions = [
            {where: (stmt) => stmt.where('subject', '==', '數學')},
            {orderBy: (stmt) => stmt.orderBy("qid")}
        ];

        const yearOfString = this.getAreaOfStatement().getSelectedYear();

        if (_.isEqual('unknown', yearOfString)) {
            conditions.push({where: (stmt) => stmt.where('typeOfMath', '==', -1)})
        } else {
            const yearOfInteger = _.toInteger(_.split(yearOfString, '-').shift());
            const timesOfInteger = _.toInteger(_.split(yearOfString, '-').pop());
            conditions.push({where: (stmt) => stmt.where('year', '==', yearOfInteger)});
            conditions.push({where: (stmt) => stmt.where('timesOfYear', '==', timesOfInteger)});
        }
        this.setQuestionConditions(conditions)
    }

    invalidate() {
        function getValueFromType(type) {
            switch (type) {
                case -1:
                    return 'unknown';
                case 0:
                    return 'common';
                case 1:
                    return 'mathA';
                case 2:
                    return 'mathB';
                case 3:
                    return 'expired';
            }
        }

        for (const question of this.getQuestions()) {
            const type = question.getTypeOfMath();
            question.setSelectedSelectorOfMath(getValueFromType(type));
        }
    }

    async fetch(view) {
        this.updateConditionsOfMathQuestion();
        const result = {
            ...{},
        };
        await new InfinitePool(1).runByEachTask([
            async () => {
                result.questions = await this.fetchQuestions(view);
            },
        ]);
        this.fromJson(result);
        return result;
    }

    updateMathABOfQuestion = async (value, question) => {
        function getIntegerOfValue(value) {
            switch (value) {
                case 'unknown':
                    return -1;
                case 'common':
                    return 0;
                case 'mathA':
                    return 1;
                case 'mathB':
                    return 2;
                case 'expired':
                    return 3;
                default:
                    return -1;
            }
        }
        return await this.apiOfQuestion.updateQuestionItem(this.getComponent(), {typeOfMath: getIntegerOfValue(value)}, question.getId());
    }

    async updateStatementOfMathTypeStuff() {
        const questions = await this.apiOfQuestion.fetchPureQuestions(this.getComponent(),
            {where: (stmt) => stmt.where('subject', '==', '數學')},
        );
        const questionsOfClassify = _.filter(questions, (question) => _.includes([0, 1, 2, 3], question.typeOfMath));
        this.getAreaOfStatement().setTotalOfSubjectQ(_.size(questions));
        this.getAreaOfStatement().setTotalOfClassifyQ(_.size(questionsOfClassify))

    }


    /** -------------------- async api -------------------- **/
}

export default EditorOfSubjectStore;
