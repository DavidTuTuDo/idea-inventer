/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-04-14-20-30-44
*/
import BaseQuestionStore from "./BaseQuestionStore";

class QuestionStore extends BaseQuestionStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  initial(obj) {
      super.initial(obj);
      this.setTip(`${this.getYear()}-${this.getSubject()}-${this.getType()}`);
  }

    /** -------------------- async api -------------------- **/
}
export default QuestionStore;
