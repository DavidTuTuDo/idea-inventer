/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-14-20-30-43
 */
import BaseChoiceStore from "./BaseChoiceStore";

class ChoiceStore extends BaseChoiceStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/
    isReplyEqualToAnswer() {
        const question = this.getParentNode();
        if (!question.isReply()) return false;
        return _.isEqual(this.getIndexOfParent(),
            question.getAnswer())
    }

    getIndexOfParent() {
        const self = this;
        const question = this.getParentNode();
        const indexOfChoice = question.getChoices().indexOf(self);
        return indexOfChoice;
    }

    isWrongReply() {
        const question = this.getParentNode();
        if (!question.isReply()) return false;
        return (_.isEqual(this.getIndexOfParent(), question.getReply()) &&
            this.getIndexOfParent() !== question.getAnswer());
    }

    /** -------------------- async api -------------------- **/
}

export default ChoiceStore;
