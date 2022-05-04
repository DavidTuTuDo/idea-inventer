import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseMainEditorComponent from "./BaseMainEditorComponent";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseEditorComponent from "../../base/BaseEditorComponent";

@inject("main")
@observer
class MainEditorComponent extends BaseMainEditorComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default MainEditorComponent;
