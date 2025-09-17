import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseMyFatefulQuestionsStore from "./BaseMyFatefulQuestionsStore";
import WhoknowzAnswerStore from "../whoknowzAnswer";
import WhoknowzConfuseStore from "../whoknowzConfuse";
import WhoknowzFastCenterStore from "../whoknowzFavorite";
import ExamQuestionStore from "../examQuestion";
import WhoknowzFavoriteStore from "../whoknowzFavorite";
import UserInfo from "../../base/BaseUserInfo";

class MyFatefulQuestionsStore extends BaseMyFatefulQuestionsStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    preparedItems = [];

    constructor(props) {
        super(props);
    }

    setQuestionsType(type) {
        this.getFilter().setSelectedQuestionType(type);
    }

    getSelectSubjectStmts = () => {
        const subject = this.getFilter().getSelectedWhichSubject();
        return _.isEqual(subject, "all") ? [] : [{ where: (stmt) => stmt.where("subject", "==", subject) }];
    };

    getFatefulQuestionType() {
        return this.getFilter().getSelectedQuestionType();
    }

    async fetch(view) {
        const items = [];
        switch (this.getFatefulQuestionType()) {
            case "favorite":
                items.push(...(await new WhoknowzFavoriteStore().fetchFavorites(this.getComponent(), undefined, ...this.getCompoundQueryStmts())));
                break;
            case "stupidAsk":
                items.push(...(await new WhoknowzConfuseStore().fetchConfuses(this.getComponent(), ...this.getCompoundQueryStmts(true))));
                break;
            case "kindlyReply":
                items.push(...(await new WhoknowzAnswerStore().fetchAnswers(this.getComponent(), ...this.getCompoundQueryStmts(true))));
                break;
            default:
                this.setErrorMsg(`帶入參數錯誤`);
        }
        if (!this.isErrorState()) await this.fatefulItemAdapter(items);
    }

    getCompoundQueryStmts = (onlySelf) => {
        const stmts = [];
        if (onlySelf) {
            stmts.push({ where: (stmt) => stmt.where("userId", "==", UserInfo.getUid()) });
        }
        stmts.push({ orderBy: (stmt) => stmt.orderBy("updateTime", "desc") }, ...this.getSelectSubjectStmts());
        return stmts;
    };

    fatefulItemAdapter = async (items, isNext = false) => {
        this.preparedItems.push(...items);
        const questionIds = items.map((each) => each.qid);
        const questions = await new ExamQuestionStore().fetchQuestions(this.getComponent(), ...this.getInArrayConditions(questionIds));

        function getQuestion(qid) {
            return _.find(questions, (question) => _.isEqual(question.id, qid));
        }

        const nextItems = items.map((each) => {
            const question = getQuestion(each.qid);
            return {
                uid: each.id,
                cid: each.cid,
                questionTopic: question.topic.name,
                type: this.getFatefulQuestionType(),
                createTime: Util.getChineseTimeFormat(this.normalizeTimestamp(each.updateTime)),
                subjectInfo: `${question.year}-${question.subject}`
            };
        });

        if (isNext) {
            this.pushFatefulItems(...nextItems);
        } else {
            this.setFatefulItems(...nextItems);
        }
    };

    onBottomTouched = async () => {
        const items = [];
        const lastItem = _.last(this.preparedItems);
        switch (this.getFatefulQuestionType()) {
            case "favorite":
                items.push(...(await new WhoknowzFavoriteStore().fetchNextFavorites(this.getComponent(), undefined, lastItem, ...this.getCompoundQueryStmts())));

                if (items.length < WhoknowzFavoriteStore.sizeOfPerPage) {
                    this.setHasNextPageBehavior(false);
                }
                break;
            case "stupidAsk":
                items.push(...(await new WhoknowzConfuseStore().fetchNextConfuses(this.getComponent(), lastItem, ...this.getCompoundQueryStmts(true))));

                if (items.length < WhoknowzConfuseStore.sizeOfPerPage) {
                    this.setHasNextPageBehavior(false);
                }
                break;
            case "kindlyReply":
                items.push(...(await new WhoknowzAnswerStore().fetchNextAnswers(this.getComponent(), lastItem, ...this.getCompoundQueryStmts(true))));

                if (items.length < WhoknowzAnswerStore.sizeOfPerPage) {
                    this.setHasNextPageBehavior(false);
                }
                break;
        }
        await this.fatefulItemAdapter(items, true);
    };
    /** -------------------- async api -------------------- **/
}

export default MyFatefulQuestionsStore;
