/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-04-14-20-30-45
*/
import BaseExamStore from "./BaseExamStore";

class ExamStore extends BaseExamStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/
  filter(obj) {
      obj.questions = _.sampleSize(obj.questions,10);
      return obj;
  }

    /** -------------------- async api -------------------- **/
}
export default ExamStore;
