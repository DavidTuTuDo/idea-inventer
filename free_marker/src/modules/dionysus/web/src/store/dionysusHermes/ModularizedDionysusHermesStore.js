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
        } else return this.getComponent().showErrorSnackMessage(`發生異常，無法獲得賣家資訊`);

        /** 如果購物車已超過該項目的免運金額(freeOfThreshold)*/
        const transportsOfShouldHidden = [];

        for (const transaction of this.getTransactions()) {
            switch (transaction.getTypeOfTransaction()) {
                case 1: //LINE支付
                    transaction.setDescription(`消費需滿 ${eros.thresholdOfCheckoutByLinePay} 元`);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(eros.thresholdOfCheckoutByLinePay);
                    transaction.setAvailable(eros.enableOfLinePay && eros.hasLinePay);
                    break;
                case 3: //信用卡（綠界支付x`
                    transaction.setDescription(`消費需滿 ${eros.thresholdOfCheckoutByCredit} 元`);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(eros.thresholdOfCheckoutByCredit);
                    transaction.setAvailable(eros.enableOfECPay && eros.hasECPay);
                    break;
                case 4: //貨到付款`
                    transaction.setDescription(`消費需滿 ${eros.thresholdOfFreeShipByCOD} 元`);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(eros.thresholdOfFreeShipByCOD);
                    transaction.setAvailable(eros.whetherHomeShipByCOD);
                    break;
                case 9: //現金
                    transaction.setDescription(``);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(0);
                    break;
            }
        }

        for (const transport of this.getTransports()) {
            switch (transport.getTypeOfTransport()) {
                case 3: //自行取貨`
                    transport.setDescription(`消費滿 ${eros.thresholdOfAllowSelfPickup} 元提供自取`);
                    transport.setPrice(0);
                    transport.setFreeOfThreshold(0);
                    transport.setAvailable(eros.whetherShipByStorePickup && priceOfWithoutTransport >= eros.thresholdOfAllowSelfPickup);
                    break;
                case 4: //7-11 取貨
                    transport.setDescription(`滿 ${eros.thresholdOfFreeShipByStorePickup} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.thresholdOfFreeShipByStorePickup);
                    transport.setAvailable(eros.whetherShipByStorePickup);
                    break;
                case 5: //全家 取貨
                    transport.setDescription(`滿 ${eros.thresholdOfFreeShipByStorePickup} 元免運`);
                    transport.setPrice(eros.feeOfInStorePickup);
                    transport.setFreeOfThreshold(eros.thresholdOfFreeShipByStorePickup);
                    transport.setAvailable(eros.whetherShipByStorePickup);
                    break;
                case 7: //當日到(14:00前下單)
                    transport.setDescription(`滿 ${eros.thresholdOfFreeShipByRapidly} 元免運`);
                    transport.setPrice(eros.feeOfRapidOnDelivery);
                    transport.setFreeOfThreshold(eros.thresholdOfFreeShipByRapidly);
                    transport.setAvailable(eros.whetherShipByRapidly);
                    break;
                case 8: //宅配
                    transport.setDescription(`滿 ${eros.thresholdOfFreeShipByHomeDelivery} 元免運`);
                    transport.setPrice(eros.feeOfHomeDelivery);
                    transport.setFreeOfThreshold(eros.thresholdOfFreeShipByHomeDelivery);
                    transport.setAvailable(eros.whetherHomeDelivery);
                    break;
            }

            if (priceOfWithoutTransport >= transport.getFreeOfThreshold()) transport.setPrice(0);
            if (_.isEqual(transport.getAvailable(), false)) transportsOfShouldHidden.push(transport);
        }
        this.removeTransports(...transportsOfShouldHidden);
        this.getComponent().scrollToTop();
    }

    updateTransportCheckboxStatus(transport) {
        this.getTransports().map((transport) => transport.setChoice(false));
        transport.setChoice(true);
    }

    updateTransactionCheckboxStatus(transaction) {
        this.getTransactions().map((transaction) => transaction.setChoice(false));
        transaction.setChoice(true);
    }

    hasSurelyChoice() {
        const transport = this.getSelectedTransport();
        const transaction = this.getSelectedTransaction();
        Util.appendInfo(`選擇的付費方式:`, transaction ? transaction.data() : "");
        Util.appendInfo(`選擇的物流方式:`, transport ? transport.data() : "");

        if (UserInfo.containsPhysicalGoodOfCheckedItem())
            return !Util.isUndefinedNullEmpty(this.getSelectedTransport()) && !Util.isUndefinedNullEmpty(this.getSelectedTransaction());
        else return !Util.isUndefinedNullEmpty(this.getSelectedTransaction());
    }

    getSelectedTransport = () => {
        return _.find(this.getTransports(), (transport) => transport.getChoice());
    };

    getSelectedTransaction = () => {
        return _.find(this.getTransactions(), (transaction) => transaction.getChoice());
    };

    updateTransportInfo() {
        const transport = this.getSelectedTransport();
        const transaction = this.getSelectedTransaction();

        Util.appendInfo(`選擇的付費方式:`, transaction ? transaction.data() : "");
        Util.appendInfo(`選擇的物流方式:`, transport ? transport.data() : "");

        if (UserInfo.containsPhysicalGoodOfCheckedItem()) {
            Cookie.setInfoOfSelectedTransport({
                typeOfTransaction: transaction.getTypeOfTransaction(),
                stringOfTransaction: transaction.getName(),
                typeOfTransport: transport.getTypeOfTransport(),
                feeOfTransport: transport.getPrice(),
                stringOfTransport: transport.getName()
            });
        } else {
            Cookie.setInfoOfSelectedTransport({
                typeOfTransaction: transaction.getTypeOfTransaction(),
                stringOfTransaction: transaction.getName()
            });
        }
    }
}

export default ModularizedDionysusHermesStore;
