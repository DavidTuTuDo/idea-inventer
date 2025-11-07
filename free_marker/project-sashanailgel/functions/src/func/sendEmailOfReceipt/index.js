const edit = true;

import ModularizedSendEmailOfReceipt from "./ModularizedSendEmailOfReceipt";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import BaseSendEmailOfReceipt from "./BaseSendEmailOfReceipt";

const TRANSPORT_SUPPLIES = [
    {
        id: "111",
        typeOfTransport: 1,
        freeOfThreshold: 999,
        name: `Line Pay(Money轉帳)`,
        price: 60,
        description: `滿 999 元免運、高雄市隔日到`
    },
    {
        id: "222",
        typeOfTransport: 2,
        freeOfThreshold: 999,
        name: `Line Pay(Line Point折抵)`,
        price: 60,
        description: `滿 999 元免運、高雄市隔日到`,
        notice: `需要註冊為Line Pay商家，參考`
    },
    {
        id: "333",
        typeOfTransport: 3,
        freeOfThreshold: 1200,
        price: 60,
        name: `信用卡付款`,
        description: `滿 999 元免運、高雄市隔日到`,
        available: false
    },
    {
        id: "444",
        typeOfTransport: 4,
        freeOfThreshold: 999,
        price: 60,
        name: `7-11 取貨`,
        description: `滿 999 元免運`,
        available: false
    },
    {
        id: "555",
        typeOfTransport: 5,
        freeOfThreshold: 1200,
        price: 60,
        name: `7-11 取貨付款`,
        description: `滿 999 元免運`,
        available: false
    },
    {
        id: "666",
        typeOfTransport: 6,
        freeOfThreshold: 1200,
        price: 60,
        name: `ATM轉帳付款`,
        description: `滿 999 元免運、高雄市隔日到`,
        available: false
    },
    {
        id: "777",
        typeOfTransport: 7,
        price: 200,
        freeOfThreshold: 1599,
        name: `宅配(宅急便)`,
        description: `滿 1599 元免運`,
        available: false
    },
    {
        id: "888",
        typeOfTransport: 8,
        price: 200,
        freeOfThreshold: 2000,
        name: `宅配(貨到付款)`,
        description: `滿 2000 元免運、高雄市隔日到`
    },
    {
        id: "999",
        typeOfTransport: 9,
        freeOfThreshold: 1,
        price: 0,
        name: `現金(店面取貨，協助保留) `,
        description: `12/12 會員日全館9折優惠`
    }
];

class SendEmailOfReceipt extends ModularizedSendEmailOfReceipt {
    constructor(props) {
        super(props);
    }

    getTransportSupplies() {
        return TRANSPORT_SUPPLIES;
    }
}

export default new SendEmailOfReceipt();
