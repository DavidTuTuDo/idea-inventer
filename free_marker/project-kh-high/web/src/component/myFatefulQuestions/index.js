import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseMyFatefulQuestionsComponent from "./BaseMyFatefulQuestionsComponent";
import Router from "../../router";
import Cookie from "../../cookie";

@inject("myFatefulQuestions")
@observer
class MyFatefulQuestionsComponent extends BaseMyFatefulQuestionsComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.appendScrollToBottomJob(this.getStore().onBottomTouched);
        this.getStore().setQuestionsType(this.paramOfType);
    }

    onQuestionTypeSelectedChange(value) {
        this.exeAsyncT(this.getStore().fetch(this));
    }

    onWhichSubjectSelectedChange(value) {
        this.exeAsyncT(this.getStore().fetch(this));
    }

    onMyFatefulQuestionsFatefulItemCardClicked(param) {
        const item = param.object;
        switch (this.getStore().getFatefulQuestionType()) {
            case "favorite":
                Cookie.setExamFilter({ type: "demo", qid: item.uid });
                Router.gotoExamPage(this);
                break;
            case "stupidAsk":
                Router.gotoWhoknowzPage(this, item.getUid());
                break;
            case "kindlyReply":
                Router.gotoWhoknowzPage(this, item.getCid(), item.getUid()); /** 此時 uid === aid*/
                break;
        }
    }

    isValidOfParamOfType(type) {
        return this.constraintOfParam(type, "favorite", "stupidAsk", "kindlyReply");
    }

    /** -------------------- async api -------------------- **/
}
export default MyFatefulQuestionsComponent;
