const edit = true;
import BaseCartieStore from "./BaseCartieStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";

class CartieStore extends BaseCartieStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    validateCountOfOrder(brief, increase = true) {
        const current = _.toNumber(brief.getCountOfSubmit());
        if (increase) {
            const result = _.sum([current, 1]);
            /**
             * 要判斷當前數量有沒有超過 銷售數量
             * this.setCountOfSubmit(current > brief.getCount() ? current : result) */
            brief.setCountOfSubmit(result)
        } else {
            const result = _.sum([current, -1]);
            brief.setCountOfSubmit(current < 2 ? current : result)
        }
    }

    /** -------------------- async api -------------------- **/
}

export default CartieStore;
