import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";
import { inject } from "mobx-react";
import BaseMainEditorComponent from "./BaseMainEditorComponent";

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
