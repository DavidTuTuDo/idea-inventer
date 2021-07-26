/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-04-14-20-30-44
*/
import BaseQuestionStore from "./BaseQuestionStore";
import {observable} from "mobx";

class QuestionStore extends BaseQuestionStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  filter(obj) {
      return _.sampleSize(obj,10);
  }

    initial(obj) {
      super.initial(obj);
      this.setTip(`${this.getYear()}-${this.getSubject()}-${this.getType()}`);
  }

  isReply(){
      return this.getReply() !== -999;
  }

  isAnswerWrong(){
      if(!this.isReply())  return false;
      return !_.isEqual(this.getReply(), this.getAnswer());
  }

  getAnswer() {
      const answer = super.getAnswer();
      switch (answer){
          case 'A':
              return 0;
          case 'B':
              return 1;
          case 'C':
              return 2;
          case 'D':
              return 3;
          case 'E':
              return 4;
          default:
              return -9;
      }
    }

    /** -------------------- async api -------------------- **/
}
export default QuestionStore;
