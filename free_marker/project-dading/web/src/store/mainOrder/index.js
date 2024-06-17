const edit = true;
import BaseMainOrderStore from "./BaseMainOrderStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import Config from "../../config";

class MainOrderStore extends BaseMainOrderStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);

    }

    invalidate(establish) {
        this.setNameOfDestination(this.getLabelByValue(Config.COUNTRY_OF_TRAVEL, this.destination));
        this.setNameOfAgent(this.getLabelByValue(establish.getAgent(), this.getSelectedAgent()));
        this.setDateOfStartTravel(Util.getSimpleDateYYMMDDFormat(this.getStartOfTravel()));
    }

    getLabelByValue(array, value) {
        const item = _.find(array, item => _.isEqual(item.value, _.toString(value)));
        return item ? item.label : '無';
    }

    /** -------------------- async api -------------------- **/
}

export default MainOrderStore;
