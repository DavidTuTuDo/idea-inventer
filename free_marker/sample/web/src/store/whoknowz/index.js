import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseWhoknowzStore from "./BaseWhoknowzStore";
import ConfuseStore from "../whoknowzConfuse";
import QuestionStore from "../examQuestion";
import {
    action,
    observable,
} from "mobx";
import UserInfoRef from "../../userInfo";
import UserInfo from "../../userInfo";


class WhoknowzStore extends BaseWhoknowzStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    @observable
    question = new QuestionStore();

    @observable
    cid = '';

    setConfuseId(cid) {
        this.cid = cid;
    }

    @action
    setQuestion(question) {
        this.question.initial(question);
    }

    getHeadConfuse(){
        const confuse = _.head(this.getConfuses());
        return confuse === undefined ? {} : confuse;
    }

    isConfuserOwner() {
        return _.isEqual(this.getHeadConfuse().userId,
            UserInfoRef.getUid())
    }

    async fetch() {
        const confuse = await (new ConfuseStore()).fetchConfuseItem(this.getComponent(), this.cid);
        this.setConfuses(confuse);
        const question = await (new QuestionStore()).fetchQuestionItem(this.getComponent(), confuse.qid);
        this.setQuestion(question);
        this.invalidateSubmitString();

        if(this.isConfuserOwner()) {
            this.setAnswerConditions([{
                where:(stmt) => stmt.where('cid','==',this.getHeadConfuse().id)
            }])
            const answers = await this.fetchAnswers(this.getComponent());
            this.pushAnswers(...answers);
        } else {
            this.pushAnswer({})
        }
    }

    @action
    invalidateSubmitString() {
        if(this.getIsAnswerReply()) {
            this.setSubmit(`答案已送出`)
        } else if(this.isConfuserOwner()) {
            this.setSubmit(`本人無法回答`)
        } else {
            this.removeSubmit()
        }
    }

    async submitConfirmedAnswer() {
        const answer = _.head(this.getAnswers())
        if(answer.getAnswerByText().length <= 10) {
            this.getComponent().showWarningSnackMessage(`文字答案至少需要到10個字元,方便過濾無意義回答`);
        } else {
            this.setIsAnswerReply(true);
            answer.setCid(this.getHeadConfuse().getId());
            answer.setUserId(UserInfo.getUid());
            await answer.submitAnswerItem(this.getComponent());
            this.invalidateSubmitString();
        }
    }

    isAnswerReliedOrOwner() {
        return (!!this.getIsAnswerReply() ||
        this.isConfuserOwner())
    }


    /** -------------------- async api -------------------- **/
}

export default WhoknowzStore;
