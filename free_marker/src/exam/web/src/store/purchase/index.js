/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-05-31-15-09-12
 */
import BasePurchaseStore from "./BasePurchaseStore";

class PurchaseStore extends BasePurchaseStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.pushPurchasePlansByIndex(0,
            {
                name: `購買方案`,
                price: `價格`,
                id: 1,
            }
        )
    }


    /** -------------------- async api -------------------- **/
}

export default PurchaseStore;
