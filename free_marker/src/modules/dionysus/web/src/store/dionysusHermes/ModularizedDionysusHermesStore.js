const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Cookie from "../../cookie";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusHermesStore from "./BaseDionysusHermesStore";

class ModularizedDionysusHermesStore extends BaseDionysusHermesStore {
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
            if (_.isEqual(transport.getAvailable(), false)) transportsOfShouldHidden.push(transport);
        }
        this.removeTransports(...transportsOfShouldHidden);
        this.getComponent().scrollToTop();
    }

    updateCheckboxStatus(transport) {
        this.getTransports().map((transport) => transport.setChoice(false));
        transport.setChoice(true);
    }

    hasSurelyChoice() {
        const choice = _.find(this.getTransports(), (transport) => transport.getChoice());
        return !Util.isUndefinedNullEmpty(choice);
    }

    getSelectedTransport = () => {
        return _.find(this.getTransports(), (transport) => transport.getChoice());
    };

    updateTransportInfo() {
        const transport = this.getSelectedTransport();
        Cookie.setInfoOfSelectedTransport({
            typeOfTransport: transport.getTypeOfTransport(),
            feeOfTransport: transport.getPrice(),
            stringOfTransport: transport.getName()
        });
    }
}

export default ModularizedDionysusHermesStore;
