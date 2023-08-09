import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseHistoryRhythmComponent from "./BaseHistoryRhythmComponent";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import PersonalRhythm from "../personalRhythm";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

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
