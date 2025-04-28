const edit = true;
import Api from "./api";
import { utiller as Util, pooller as InfinitePool, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import Listener from "./listener";
import libpath from "path";
import config from "./config";
import moment from "moment";
import fs from "fs";

(async () => {
    const api = new Api();

    async function testOfAdminFetchItems() {
        const items = await api.fetchOrders({ where: (stmt) => stmt.where("countOfPeople", ">", 5) });
        return items;
    }

    async function testOfAdminSubmitItems() {
        await api.submitOrders([{ host: "劉銓遠" }, { host: "陳冠志" }]);
    }

    async function testOfAdminFetchItem() {
        return await api.fetchOrderItem(`XAmxA0jOaYvYHGLdc9FA`);
    }

    async function testOfAdminSubmitItemWithID() {
        return await api.submitOrderItem({ host: "柯虹安" }, `jwefjdijfiosdjoif`);
    }

    async function testOfAdminSubmitItemWithoutID() {
        return await api.submitOrderItem({ host: "高文哲" });
    }

    async function testOfAdminUpdateItem() {
        return await api.updateOrderItem({ countOfPeople: 33 }, `7qws9ctmCN32cELZ2IMh`);
    }

    /** 針對conditions to query出來的document進行update(item) */
    async function testOfAdminUpdateItemsWithCondition() {
        await api.updateOrders([{ contact: "0982-763-479" }], { where: (stmt) => stmt.where("countOfPeople", "==", 1) });
    }

    /** 針對批次的item進行update => {id:'',....contentOfUpdate} */
    async function testOfAdminUpdateItems() {
        await api.updateOrders([
            { comment: `更新${Util.getSimpleTimeYYMMDDHHmmFormat()}`, id: "OHvWFHEsQQ5MEIU1nQya" },
            {
                id: "eU4KfbkVVbGS3w1nbYx3",
                comment: `更新${Util.getSimpleTimeYYMMDDHHmmFormat()}`,
            },
        ]);
    }

    async function testOfDeleteItem() {
        await api.deleteOrderItem(`ucOscCh6oalfSdEbVDOH`);
    }

    async function testOfDeleteItemsWithCondition() {
        await api.deleteOrders(false, { where: (stmt) => stmt.where("countOfPeople", "==", 1001) });
    }

    async function fetchCountOfCollection() {
        return await api.fetchSizeOfOrders();
    }

    async function multiThreadUpdateItem() {
        const tasks = _.range(0, 20).map((each) => async () => {
            const order = await api.fetchOrderItem(`jfk6ALWdhyoAi7f9LyJv`);
            await api.updateOrderItem({ countOfPeople: order.countOfPeople + 1 }, `jfk6ALWdhyoAi7f9LyJv`);
        });

        const worker = new InfinitePool(5);
        await worker.runByEachTask(tasks);
    }

    async function multiThreadUpdateItemAtomically() {
        const tasks = _.range(0, 20).map((each) => async () => {
            await api.updateOrderItemAtomically(async (order, transaction, ref) => {
                const current = order.countOfPeople;
                return { countOfPeople: current + 1 };
            }, `jfk6ALWdhyoAi7f9LyJv`);
        });
        Util.appendInfo(_.size(tasks));
        const worker = new InfinitePool(2);
        await worker.runByEachTask(tasks);
    }
    function normalizeStatement(string) {
        // 將輸入文字按換行符拆分成陣列
        const lines = string.split("\n");

        // 過濾掉包含表情符號或特定關鍵詞的行
        const filteredLines = _.filter(lines, (line) => {
            return !line.trim().match(/💓Sachia 美學|🔎賣場IG:|請搭配/);
        });

        // 保留換行結構並重組成字符串
        return filteredLines.join("\n").trim();
    }

    async function uploadProducts() {
        await api.deleteBoozes(true);
        const items = _.filter(Util.getFileContextInJSON("./sasha_of_product_list_latest.json"),(each) => _.size(each.options) > 1);
        console.log(_.size(items));
        // await api.submitBoozes(Util.getShuffledArrayWithLimitCount(items, 60).map(product => {
        await api.submitBoozes(
          items.map((product) => {
              const price = Util.findLowestValue(product.options);
              return {
                  ...product,
                  price,
                  category: Util.getUniqueValuesBy(product.category, "valueOfType"),
                  rangeOfPrice: Util.getStringOfValueRange(product.options),
                  statement: normalizeStatement(product.statement),
                  priceB4Discount: Math.round(_.sum([price, _.multiply(0.3, price)])),
                  options: _.filter(product.options, (option) => !Util.isUndefinedNullEmpty(option.name)).map((option) => {
                      const price = option.price;
                      return {
                          ...option,
                          priceB4Discount: Math.round(_.sum([price, _.multiply(0.3, price)])),
                      };
                  }),
              };
          }),
        );
    }

    await uploadProducts();

    // console.log(await testOfAdminFetchItems());
    // console.log(await testOfAdminSubmitItems());
    // console.log(await testOfAdminFetchItem());
    // console.log(await testOfAdminSubmitItemWithID());
    // console.log(await testOfAdminSubmitItemWithoutID());
    // console.log(await testOfAdminUpdateItem());
    // console.log(await testOfAdminUpdateItemsWithCondition());
    // console.log(await testOfDeleteItem(`ucOscCh6oalfSdEbVDOH`));
    // console.log(await testOfDeleteItemsWithCondition());
    // console.log(await multiThreadUpdateItem());
    // console.log(await multiThreadUpdateItemAtomically());
})();
