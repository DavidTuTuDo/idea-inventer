const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Cookie from "../../cookie";
import UserInfo from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusHermesStore from "./BaseDionysusHermesStore";
import { Application } from "../../index";

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
        let eros = {};
        const idOfAuthor = UserInfo.getAuthorOfHeadItemOfCartie();

        if (idOfAuthor) {
            await Application.getDionysusCartieStore().modifyErosInfoOfAuthor(idOfAuthor);
            eros = Application.getDionysusCartieStore().getErosOfPublic();
            Util.appendInfo(`hermes拿到了 Eros => `, eros);
            //todo:更新所有運費資訊
        } else return this.getComponent().showErrorSnackMessage(`發生異常，無法獲得賣家資訊`);

        /** 如果購物車已超過該項目的免運金額(freeOfThreshold)*/
        const transportsOfShouldHidden = [];
        for (const transport of this.getTransports()) {
            switch (transport.getTypeOfTransport()) {
                case 1: //LINE支付
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 2:
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 3: //信用卡（綠界支付x`
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 4: //7-11 取貨
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 5: //7-11 取貨付款
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 6: //ATM轉帳付款`,
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 7: //宅配(宅急便)
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfCashOnDelivery);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 8: //宅配（貨到付款
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfCashOnDelivery);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
                case 9: //現金
                    transport.setDescription(`滿 ${eros.priceOfFreeShipping} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.priceOfFreeShipping);
                    break;
            }

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
        Util.appendInfo(`選擇的付費方式:`, transport.data());
        Cookie.setInfoOfSelectedTransport({
            typeOfTransport: transport.getTypeOfTransport(),
            feeOfTransport: transport.getPrice(),
            stringOfTransport: transport.getName()
        });
    }
}

export default ModularizedDionysusHermesStore;
