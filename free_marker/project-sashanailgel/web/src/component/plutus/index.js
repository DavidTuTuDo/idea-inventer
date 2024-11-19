const edit = true;
import { inject } from "mobx-react";
import { observer } from "mobx-react";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import BasePlutusComponent from './BasePlutusComponent';

@inject("plutus")
@observer
class PlutusComponent extends BasePlutusComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onPlutusGetAddressTestButtonClicked(param) {
    this.getCurrentLocation().then(result => console.log(result));
  }

  onCitySelectedChange(value, param) {
    const self =this;
    Util.syncDelay(1).then(() => {
      self.getStore().validateDistrictByCity()
    })
  }

  /** -------------------- async api -------------------- **/
}

export default PlutusComponent;
