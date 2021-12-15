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

    async fetch() {
        const confuse = await (new ConfuseStore()).fetchConfuseItem(this.getComponent(), this.cid);
        this.setConfuses(confuse);
        const question = await (new QuestionStore()).fetchQuestionItem(this.getComponent(), confuse.qid);
        this.setQuestion(question);
        this.pushAnswer({})
    }


    /** -------------------- async api -------------------- **/
}

export default WhoknowzStore;
