import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamQuestionStore from "./BaseExamQuestionStore";
import UserInfo from '../../userInfo';


const OPTIONS_OF_MATH_QUESTION = [' 0 ', ' 1 ', ' 2 ', ' 3 ', ' 4 ', ' 5 ', ' 6 ', ' 7 ', ' 8 ', ' 9 ', , ' - ', ' ± ']

class ExamQuestionStore extends BaseExamQuestionStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.initialBehaviorOfMathOptionalQuestion();

    }

    isMathOptionalQuestion() {
        return _.startsWith(this.getSubject(), '數學') && this.getTypeOfQuestion() === 3
    }

    is108Evolution() {
        return this.getYear() >= 111
    }

    initialBehaviorOfMathOptionalQuestion() {
        if (!this.isMathOptionalQuestion())
            return;

        const startIndex = this.is108Evolution() ? this.getQid() : this.getIndexOfAnswer();
        const length = _.size(this.getAnswer().split(''));
        const subs = _.range(startIndex, startIndex + length, 1).map(
            (each) => {
                return {
                    indexOfAnswer: this.getOptionQuestionTitle(each, this.getQid()),
                    choices: OPTIONS_OF_MATH_QUESTION.map((each) => {
                        return {statement: _.trim(each)}
                    })
                }
            })

        this.pushOptionals(...subs)
    }

    getOptionQuestionTitle(result, qid) {
        if (this.is108Evolution()) {
            const position = result - qid;
            result = `${qid}-${position === 0 ? 1 : position+1}`
        }
        return `選擇圖中 (${result}) 答案`
    }

    needAssistantArea() {
        return !_.isEmpty(this.getTopicOfAssistant().getName()) || _.size(this.getTopicOfAssistant().getImages()) > 0
    }

    isMultiSelected() {
        return _.size(Array.from(this.getAnswer())) > 1
    }

    setReply(param) {
        /** 在historyWrong,param會是string,'ABC', 在答題的時候會是number,0123*/

        const charsOfAnswer = _.isNumber(param) ? Util.integerToString(param) : param;
        if (this.getCompleted() || Util.has(this.getReply(), charsOfAnswer)) {
            return;
        }

        const AtoZs = charsOfAnswer.split('').map((each) => {
            return {answer: each}
        });

        const currently = this.getReply().split('').map((each) => {
            return {answer: each}
        });

        const orders = _.orderBy([...currently, ...AtoZs], ['answer'], "asc");
        const stringOfAnswer = orders.map((each) => each.answer).join('');
        super.setReply(`${stringOfAnswer}`);

        if ((this.isAnswerRight() || this.isAnswerWrong())) {
            this.setCompleted(true);
        }
    }

    isAnswerRight() {
        return _.isEqual(this.getAnswer(), this.getReply());
    }

    isAnswerWrong() {
        let wrong = false;
        const replies = this.getReply().split('');
        for (const reply of replies) {
            if (!Util.has(this.getAnswer(), reply)) {
                wrong = true;
                break;
            }
        }
        return wrong;
    }

    initial(obj) {
        super.initial(obj);
        if (UserInfo.isAdmin())
            this.setTip(`${this.getYear()}-${this.getSubject()}-${this.getType()}-${this.getTimesOfYear() === 1 ? '正式' : '補考'}-${this.getQid()}-${this.isMultiSelected() ? '多選題' : '單選題'}`);
        else
            this.setTip(`${this.getYear()}年-${this.getSubject()}科目-${this.isMultiSelected() ? '多選題' : '單選題'}`)
    }

    hasPhotos() {
        return _.size(this.getChoices()) > 0;
    }

    setCompleted(param) {
        super.setCompleted(param);
        this.validateAlertImage();
        if (this.getParentNode() !== undefined) {
            this.getParentNode().submitQuestionRecord(this).then();
        }
    }


    validateAlertImage = () => {
        if (this.isAnswerWrong()) {
            this.setAlertImage('images/question_error.svg');
        } else {
            this.setAlertImage('images/question_right.svg');
        }
    }

}

export default ExamQuestionStore;
