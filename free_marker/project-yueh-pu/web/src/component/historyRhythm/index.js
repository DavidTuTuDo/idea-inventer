const edit = true;
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseHistoryRhythmComponent from "./BaseHistoryRhythmComponent";

@inject("historyRhythm")
@observer
class HistoryRhythmComponent extends BaseHistoryRhythmComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.registerScrollToBottomJob(this.getStore().fetchNext)
  }

  /** -------------------- async api -------------------- **/
}
export default HistoryRhythmComponent;
