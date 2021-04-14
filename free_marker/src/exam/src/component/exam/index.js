/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-04-13-18-23-07
*/
import { observer, inject } from "mobx-react";
import BaseExamComponent from "./BaseExamComponent";

@inject("exam")
@observer
class ExamComponent extends BaseExamComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/
  componentDidMount() {
      super.componentDidMount();
      this.props.exam.fetch().then();
  }

  getButtonColor() {
        return 'primary';
  }

    /** -------------------- async api -------------------- **/
}
export default ExamComponent;
