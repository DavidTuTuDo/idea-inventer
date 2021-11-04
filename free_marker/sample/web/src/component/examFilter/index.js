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
    console.log(`dialog`,this.props.dialog);
    console.log(`paramObject`,this.props.paramObject);
    const dialog = this.props.dialog;
    Util.syncDelay(5000).then(() => {
      dialog.close();
    })

  }

  /** -------------------- async api -------------------- **/
}
export default ExamFilterComponent;
