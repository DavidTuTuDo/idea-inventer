const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfo from "../../base/BaseUserInfo";
import { computed, toJS } from "mobx";
import BaseDionysusHermesStore from "./BaseDionysusHermesStore";
import { Application } from "../../index";
import Config from "../../config";

class ModularizedDionysusHermesStore extends BaseDionysusHermesStore {
    constructor(props) {
        super(props);
        this.eros = {};
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
        const idOfAuthor = this.getItemsOfChecked()?.[0]?.idOfAuthor;
        const priceOfWithoutTransport = this.getPriceB4Transport();
        this.setHasPhysical(_.some(this.getItemsOfChecked(), { isTaskJob: false }));
        if (idOfAuthor) {
            this.eros = await Application.getDionysusCartieStore().modifyErosInfoOfAuthor(idOfAuthor);
            Util.appendInfo(`hermes拿到了 eros => `, this.eros);
        } else return this.getComponent().showErrorSnackMessage(`發生異常，無法獲得賣家資訊`);

        for (const transaction of this.getTransactions()) {
            switch (transaction.getTypeOfTransaction()) {
                case Config.TransactionMethod.LinePay: //LINE支付
                    transaction.setDescription(`消費需滿 ${this.eros?.thresholdOfCheckoutByLinePay} 元`);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(this.eros?.thresholdOfCheckoutByLinePay);
                    transaction.setAvailable(this.eros?.enableOfLinePay && this.eros?.hasLinePay && priceOfWithoutTransport >= this.eros?.thresholdOfCheckoutByLinePay);
                    break;
                case Config.TransactionMethod.ECPay: //信用卡（綠界支付x`
                    transaction.setDescription(`消費需滿 ${this.eros?.thresholdOfCheckoutByCredit} 元`);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(this.eros?.thresholdOfCheckoutByCredit);
                    transaction.setAvailable(this.eros?.enableOfECPay && this.eros?.hasECPay && priceOfWithoutTransport >= this.eros?.thresholdOfCheckoutByCredit);

                    break;
                case Config.TransactionMethod.COD: //貨到付款`
                    transaction.setDescription(`滿 ${this.eros?.thresholdOfFreeShipByCOD} 元免運(產生額外手續費)`);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(this.eros?.thresholdOfFreeShipByCOD);
                    transaction.setAvailable(UserInfo.containsPhysicalGoodOfCheckedItem() && this.eros?.enableOfCOD);
                    break;
                case Config.TransactionMethod.DirectPay: //現金
                    transaction.setDescription(`訂單成立後，可使用掃碼付款`);
                    transaction.setAvailable(this.eros?.enableOfDirectPay && priceOfWithoutTransport >= this.eros?.thresholdOfAllowSelfPickup);
                    transaction.setPrice(-1);
                    transaction.setFreeOfThreshold(0);
                    break;
            }
        }
        this.touchPriceOfTransport();
        this.getComponent().scrollToTop();
    }

    updateTransportCheckboxStatus = (transport) => {
        this.getTransports().map((transport) => transport.setChoice(false));
        transport.setChoice(true);
    };

    updateTransactionCheckboxStatus = (transaction) => {
        this.getTransactions().map((transaction) => transaction.setChoice(false));
        transaction.setChoice(true);

        const isTransactionOfCOD = transaction.getTypeOfTransaction() === Config.TransactionMethod.COD;
        const selfPickUp = _.find(this.getTransports(), (transport) => transport.getTypeOfTransport() === Config.TransportMethod.SelfPickup);
        if (isTransactionOfCOD) selfPickUp?.setChoice(false);
        selfPickUp?.setChoiceDisabled(isTransactionOfCOD);
        this.touchPriceOfTransport();
    };

    touchPriceOfTransport = () => {
        /** 如果購物車已超過該項目的免運金額(freeOfThreshold)*/
        const transportsOfShouldHidden = [];
        for (const transport of this.getTransports()) {
            switch (transport.getTypeOfTransport()) {
                case Config.TransportMethod.SelfPickup: //自行取貨`
                    transport.setDescription(`消費滿 ${this.eros?.thresholdOfAllowSelfPickup} 元提供自取`);
                    transport.setPrice(0);
                    transport.setFreeOfThreshold(0);
                    transport.setAvailable(this.eros?.whetherPickupByBuyerSelf && this.getPriceB4Transport() >= this.eros?.thresholdOfAllowSelfPickup);
                    break;
                case Config.TransportMethod.Store711: //7-11 取貨
                    transport.setDescription(`已付款，滿 ${this.eros?.thresholdOfFreeShipByStorePickup} 元免運`);
                    transport.setPrice(this.eros?.feeOfInStorePickup);
                    transport.setFreeOfThreshold(this.eros?.thresholdOfFreeShipByStorePickup);
                    transport.setAvailable(this.eros?.whetherShipByStorePickup);
                    break;
                case Config.TransportMethod.StoreFamily: //全家 取貨
                    transport.setDescription(`已付款，滿 ${this.eros?.thresholdOfFreeShipByStorePickup} 元免運`);
                    transport.setPrice(this.eros?.feeOfInStorePickup);
                    transport.setFreeOfThreshold(this.eros?.thresholdOfFreeShipByStorePickup);
                    transport.setAvailable(this.eros?.whetherShipByStorePickup);
                    break;
                case Config.TransportMethod.RapidOnDay: //當日到(14:00前下單)
                    transport.setDescription(`已付款，滿 ${this.eros?.thresholdOfFreeShipByRapidly} 元免運`);
                    transport.setPrice(this.eros?.feeOfRapidOnDelivery);
                    transport.setFreeOfThreshold(this.eros?.thresholdOfFreeShipByRapidly);
                    transport.setAvailable(this.eros?.whetherShipByRapidly);
                    break;
                case Config.TransportMethod.Freight: //宅配
                    transport.setDescription(`滿 ${this.eros?.thresholdOfFreeShipByHomeDelivery} 元免運`);
                    transport.setPrice(this.eros?.feeOfHomeDelivery);
                    transport.setFreeOfThreshold(this.eros?.thresholdOfFreeShipByHomeDelivery);
                    transport.setAvailable(this.eros?.whetherHomeDelivery);
                    break;
            }

            if (this.getSelectedTransaction()?.getTypeOfTransaction() === Config.TransactionMethod.COD)
                transport.setPrice(
                    this.getPriceB4Transport() >= this.eros.thresholdOfFreeShipByCOD && this.getPriceB4Transport() >= transport.getFreeOfThreshold()
                        ? 0
                        : Util.getPriceOfPercentageBehavior(transport.getPrice(), this.eros?.percentageFeeOfCOD, false)
                );
            else if (this.getPriceB4Transport() >= transport.getFreeOfThreshold()) transport.setPrice(0);
            if (_.isEqual(transport.getAvailable(), false)) transportsOfShouldHidden.push(transport);
        }
        this.removeTransports(...transportsOfShouldHidden);
    };

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

    updateTransportInfo = () => {
        const transport = this.getSelectedTransport();
        const transaction = this.getSelectedTransaction();

        Util.appendInfo(`選擇的付費方式:`, transaction ? transaction.data() : "");
        Util.appendInfo(`選擇的物流方式:`, transport ? transport.data() : "");

        return {
            typeOfTransaction: _.toNumber(transaction.getTypeOfTransaction()),
            typeOfTransport: this.getHasPhysical() ? _.toNumber(transport.getTypeOfTransport()) : Config.TransportMethod.Needless,
            feeOfTransport: this.getHasPhysical() ? _.toNumber(transport.getPrice()) : 0,
            priceB4Transport: this.getPriceB4Transport(),
            price: this.getPriceOfTotal(),
            itemsOfChecked: this.getItemsOfChecked(),
            hasPhysical: this.getHasPhysical()
        };
    };
}

export default ModularizedDionysusHermesStore;
