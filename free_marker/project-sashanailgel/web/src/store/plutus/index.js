const edit = true;
import BasePlutusStore from "./BasePlutusStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import {computed} from "mobx";

class PlutusStore extends BasePlutusStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        super.onInitialFetchCompleted(collection);
        this.validateDistrictByCity();
    }

    validateDistrictByCity() {
        const districts = Config.getDistrictsByCity(this.getSelectedCity())
        this.setDistrict(...districts);
        if (_.size(districts) > 0)
            this.setSelectedDistrict(districts[0].value);
    }

    @computed
    get getComputedPriceOfTotal() {
        return 0;
    }

    /** -------------------- async api -------------------- **/
}

export default PlutusStore;
