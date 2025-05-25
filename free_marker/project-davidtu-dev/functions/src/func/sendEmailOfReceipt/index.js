const edit = true;

import ModularizedSendEmailOfReceipt from "./ModularizedSendEmailOfReceipt";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";

class SendEmailOfReceipt extends ModularizedSendEmailOfReceipt {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /** 有些店家自己商品有序號 */
    shouldDisplaySerialNumber() {
        return true;
    }

    /** 有些店家有抓貨順序，排序上需要根據某些規則 */
    customizeOrder = (items) => {
        Util.mutateBy(items, (item) => {
            const serial = item.idOfPreciseProduct.split(Util.getSeparatorOfUnique()).shift();
            const match = serial.match(/^([A-Z]+)(\d+)$/i);
            const [letter, number] = match ? [match[1], parseInt(match[2], 10)] : [serial, 0];
            return [letter, number]; // 多層排序：先字母，再數字
        });
    };

    /** -------------------- async api -------------------- **/
}

export default new SendEmailOfReceipt();
