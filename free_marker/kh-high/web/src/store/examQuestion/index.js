import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseExamQuestionStore from "./BaseExamQuestionStore";
import UserInfo from '../../userInfo';


const OPTIONS_OF_MATH_QUESTION = [' 0 ', ' 1 ', ' 2 ', ' 3 ', ' 4 ', ' 5 ', ' 6 ', ' 7 ', ' 8 ', ' 9 ', ' - ', ' ± ']

class ExamQuestionStore extends BaseExamQuestionStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    /** 用來判定options對or錯 */
    isOptionResultWithWrong = false;

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
            (each, index) => {
                return {
                    indexOfAnswer: this.getOptionQuestionTitle(each, this.getQid()),
                    answer: this.getAnswer().split('')[index],
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
            result = `${qid}-${position === 0 ? 1 : position + 1}`
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
        if (this.isMathOptionalQuestion()) {
            return !this.isOptionResultWithWrong;
        }
        return _.isEqual(this.getAnswer(), this.getReply());
    }

    /** 就是choice選項是依賴圖中的A-E or 1-5, 讓敘述更明確*/
    isChoiceDependOnAttachImage() {
        const AtoZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const oneToTen = '123456789';
        const statements = this.getChoices().map((each) => _.trim(each.getStatement()));
        const length = _.size(statements);
        return Util.isOrEquals(statements.join(''), AtoZ.substr(0, length), oneToTen.substr(0, length))
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
        if (this.isAnswerRight()) {
            this.setAlertImage('images/question_right.svg');
        } else {
            this.setAlertImage('images/question_error.svg');
        }
    }

    optionalValidation = () => {
        const self = this;

        function completedAllOptions() {
            for (const option of self.getOptionals()) {
                option.silentCompleted(true);
            }
        }

        if (this.isMathOptionalQuestion()) {
            let hasWrongOption = false;
            let optionsNotCompleted = false;

            for (const option of this.getOptionals()) {
                /**
                 * 1.如果completed 然後有一則是wrong = true, 顯示整題錯誤
                 * 2.如果completed 而且全部都是 wrong = false, 顯示整題正確
                 */
                if (!option.getCompleted()) {
                    optionsNotCompleted = true;
                }

                if (option.isAnswerWrong()) {
                    hasWrongOption = true;
                    break;
                }
            }

            const isAllOptionsRight = !optionsNotCompleted; /** 如果for完沒有發現wrong的, 也每題都completed === 這題對了 */

            console.log(isAllOptionsRight, hasWrongOption);

            if (isAllOptionsRight || hasWrongOption) {
                this.isOptionResultWithWrong = hasWrongOption;
                this.setCompleted(true);
                completedAllOptions();
            }
        }
    }

}

export default ExamQuestionStore;
