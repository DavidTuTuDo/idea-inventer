/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-14-20-30-45
 */
import BaseExamStore from "./BaseExamStore";
import _ from "lodash";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";

class ExamStore extends BaseExamStore {

    syncQuestionDurationReply() {
        this.getTestingRecords().forEach((record, index) => {
            const question = _.nth(this.getQuestions(), index);
            const int = Util.stringToInteger(record.getIsWrongReply() ? record.getMyWrongAnswer() : question.getAnswer());
            question.setReply(int);
            question.setDuration(`本題使用: ${Util.getTimeFormatOfDurationToMillionSecond(record.duration)}`);
            question.setReplyTimestamp(`作答時間: ${Util.getChineseTimeFormat(record.getUpdateTime())}`)
        })
    }
}

export default ExamStore;
