import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseExamFilterComponent from "./BaseExamFilterComponent";

@inject("examFilter")
@observer
class ExamFilterComponent extends BaseExamFilterComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    super.componentDidMount();
    const enterPoint = this.props.paramObject;
    if(enterPoint !== undefined) {
      const route = enterPoint.route;
      if(route.startsWith(`dialog`)) {
      }else {
        this.handleCustomRouter(route);
        this.dismiss();
      }
    }
  }

  onBtnOfStartExamButtonClicked(param) {
    console.log(this.getStore().getRandomTest().getRangeOfYear());
    console.log(this.getStore().getExamHistoryInfo().rawData())
  }

  onBtnWithHistoryButtonClicked(param) {
    console.log(this.getStore().getHistoryTest().getSelectedSelector());

  }




  /** -------------------- async api -------------------- **/
}
export default ExamFilterComponent;
