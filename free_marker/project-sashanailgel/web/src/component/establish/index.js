const edit = true;
import { inject } from "mobx-react";
import BaseEstablishComponent from "./BaseEstablishComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";

@inject("establish")
@observer
class EstablishComponent extends BaseEstablishComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  isValidOfParamOfIdOfClass(idOfClass) {
    return !Util.isUndefinedNullEmpty(idOfClass);
  }

  /** -------------------- async api -------------------- **/
}

export default EstablishComponent;
