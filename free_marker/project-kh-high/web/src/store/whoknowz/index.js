const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseWhoknowzStore from "./BaseWhoknowzStore";
import ConfuseStore from "../whoknowzConfuse";
import QuestionStore from "../examQuestion";
import { action, observable } from "mobx";
import UserInfoRef from "../../base/BaseUserInfo";

class WhoknowzStore extends BaseWhoknowzStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    @observable
    question = new QuestionStore();

    @observable
    cid = "";

    @observable
    aid = "";

    setConfuseId(cid) {
        this.cid = cid;
    }

    setAnswerId(aid) {
        this.aid = aid;
    }

    hasTargetAnswerId() {
        return !Util.isEmpty(this.aid);
    }

    @action
    setQuestion(question) {
        this.question.initial(question);
    }

    getHeadConfuse() {
        const confuse = _.head(this.getConfuses());
        return confuse === undefined ? {} : confuse;
    }

    isConfuserOwner() {
        return Util.isEqual(this.getHeadConfuse().userId, UserInfoRef.getUid());
    }

    isMathOrEnglish() {
        return this.question !== undefined && Util.isOrEquals(this.question.getSubject(), "數學B", "數學A", "數學", "數學(舊制)", "英文");
    }

    async fetch() {
        Util.appendInfo(this.getClassName(), " fetch... 被執行了");
        const confuse = await new ConfuseStore().fetchConfuseItem(this.getComponent(), this.cid);

        this.setConfuses(confuse);
        const question = await new QuestionStore().fetchQuestionItem(this.getComponent(), confuse.qid);
        this.setQuestion(question);
        this.invalidateSubmitString();

        if (this.isConfuserOwner()) {
            this.setAnswerConditions([
                {
                    where: (stmt) => stmt.where("cid", "==", this.getHeadConfuse().getId())
                }
            ]);
            await this.fetchAnswers(this.getComponent());
        } else if (this.hasTargetAnswerId()) {
            this.setAnswerConditions(this.getInArrayConditions([this.aid]));
            await this.fetchAnswers(this.getComponent());
        } else {
            this.pushAnswer({});
        }
    }

    @action
    invalidateSubmitString() {
        if (this.getIsAnswerReply()) {
            this.setSubmit(`答案已送出`);
        } else if (this.isConfuserOwner()) {
            this.setSubmit(`本人無法回答`);
        } else {
            this.removeSubmit();
        }
    }

    async submitConfirmedAnswer() {
        const answer = _.head(this.getAnswers());
        if (answer.getAnswerByText().length <= 10) {
            this.getComponent().showWarningSnackMessage(`文字答案至少需要到10個字元,方便過濾無意義回答`);
        } else {
            this.setIsAnswerReply(true);
            answer.setCid(this.getHeadConfuse().getId());
            answer.setQid(this.getHeadConfuse().getQid());
            answer.setUserId(UserInfoRef.getUid());
            answer.setSubject(this.getHeadConfuse().getSubject());
            await answer.submitAnswerItem(this.getComponent());
            this.invalidateSubmitString();
        }
    }

    isAnswerReliedOrOwner() {
        return !!this.getIsAnswerReply() || this.isConfuserOwner();
    }

    /** -------------------- async api -------------------- **/
}

export default WhoknowzStore;
