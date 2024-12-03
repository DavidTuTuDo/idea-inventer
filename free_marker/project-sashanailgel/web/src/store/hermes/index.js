const edit = true;
import BaseHermesStore from "./BaseHermesStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {computed} from "mobx";
import Cookie from '../../cookie';

class HermesStore extends BaseHermesStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    @computed
    get getComputedPriceOfTotal() {
        return _.sum([this.getPriceB4Transport(), this.getPriceOfSelectedTransport()]);
    }

    getPriceOfSelectedTransport() {
        const transport = _.find(this.getTransports(), (transport) => _.isEqual(true, transport.getChoice()));
        return transport ? transport.getPrice() : 0;
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        const priceOfWithoutTransport = _.toNumber(Cookie.getTotalPriceOfCartie());
        this.setPriceB4Transport(priceOfWithoutTransport);

        /** 如果購物車已超過該項目的免運金額(freeOfThreshold)*/
        const transportsOfShouldHidden = [];
        for (const transport of this.getTransports()) {
            if (priceOfWithoutTransport >= transport.getFreeOfThreshold()) transport.setPrice(0);
            if (_.isEqual(transport.getAvailable(), false)) transportsOfShouldHidden.push(transport)
        }
        this.removeTransports(...transportsOfShouldHidden);
    }

    updateCheckboxStatus(transport) {
        this.getTransports().map(transport => transport.setChoice(false));
        transport.setChoice(true);
    }

    hasSurelyChoice() {
        const choice = _.find(this.getTransports(), (transport) => transport.getChoice());
        return !Util.isUndefinedNullEmpty(choice);
    }

    getSelectedTransport = () => {
        return _.find(this.getTransports(), transport => transport.getChoice());
    }

    updateTransportInfo() {
        const transport = this.getSelectedTransport();
        Cookie.setInfoOfSelectedTransport({
            typeOfTransport: transport.getTypeOfTransport(),
            feeOfTransport: transport.getPrice(),
            stringOfTransport: transport.getName()
        })
    }

    /** -------------------- async api -------------------- **/
}

export default HermesStore;
