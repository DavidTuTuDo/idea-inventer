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
                comment: `更新${Util.getSimpleTimeYYMMDDHHmmFormat()}`
            }
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
        const ids = await api.fetchDocumentIdsOfBooze();
        console.log("current ids of Booze ==> ", ids);

        for (const id of ids) {
            console.log(`delete booze(id === ${id}) and it's variant`);
            await api.deleteBoozeItem(id);
            await api.deleteVariants(true, id);
        }

        const products = _.filter(Util.getFileContextInJSON("./sasha_of_products_detail.json"), (each) => _.size(each.options) > 1);
        console.log(`莎夏美學合計商品共有： `, _.size(products), ` 個`);
        // for(const product of Util.getShuffledArrayWithLimitCount(products, 5)){
        for (const product of products) {
            const price = Util.findLowestValue(product.options);
            const options = product.options;
            options.shift(); /** 第一個都是null */
            await api.submitVariants(
                options.map((option) => ({
                    id: `${_.toString(option.value)}sasha`,
                    content: option.name,
                    photo: option.photo,
                    nameOfBooze: product.name,
                    idOfBooze: product.serial,
                    isTaskJob: false,
                    idOfAuthor: `6tirrjZd2ESAPD7RA64pd2N1Bdf2`,
                    allowSelfPickUp: true,
                    quantity: option.count,
                    price: option.price,
                    priceB4Discount: Math.round(_.sum([option.price, _.multiply(0.3, option.price)]))
                })),
                product.serial
            );
            await api.submitBoozeItem(
                {
                    ...product,
                    price,
                    id: product.serial,
                    category: Util.getUniqueValuesBy(product.category, "valueOfType"),
                    rangeOfPrice: Util.getStringOfValueRange(product.options),
                    statement: normalizeStatement(product.statement),
                    needAddress: true,
                    selectedTypeOfProp: 1,
                    visibility: true,
                    idOfAuthor: "6tirrjZd2ESAPD7RA64pd2N1Bdf2",
                    allowSelfPickUp: true,
                    specificAttributes: [{ key: "main", label: "", options: options.map((option) => ({ label: option.name, value: `${_.toString(option.value)}sasha` })) }],
                    priceB4Discount: Math.round(_.sum([price, _.multiply(0.3, price)])) //generateLabelValuePairsWithOrigin //)
                },
                product.serial
            );
        }
    }

    async function uploadCatalogs() {
        function groupByValueOfType(data) {
            return _(data)
                .groupBy("valueOfType")
                .map((items, valueOfType) => {
                    const mainItem = items.find((i) => !_.has(i, "labelOfSubType"));
                    const subItems = items
                        .filter((i) => _.has(i, "labelOfSubType"))
                        .map((i) => ({
                            label: i.labelOfSubType,
                            value: i.valueOfSubType,
                            href: i.href
                        }));

                    return {
                        valueOfType: Number(valueOfType),
                        labelOfType: mainItem?.labelOfType ?? items[0].labelOfType,
                        subTypes: subItems
                    };
                })
                .value();
        }

        const array = Util.getFileContextInJSON("./sasha_of_product_catalog.json");
        const itemsOfCatalog = groupByValueOfType(array);
        // await api.deleteSelects();
        await api.submitSelects(itemsOfCatalog.map((item) => ({ label: item.labelOfType, id: _.toString(item.valueOfType), value: item.valueOfType })));
    }

    async function uploadPaymentOptions() {
        await api.submitOptions([
            {
                name: "LINE支付",
                image: "https://d.line-scdn.net/linepay/portal/v-250924/portal/assets/img/linepay-logo-tw.png",
                description: "",
                indexOfSequence: 3,
                idOfUnique: "linepay"
            },
            {
                name: "綠界支付",
                image: "https://www.ecpay.com.tw/Content/themes/WebStyle20131201/images/service/ecpay_fb.png",
                description: "信用卡、ATM、超商條碼",
                indexOfSequence: 2,
                idOfUnique: "ecpay"
            }
        ]);
    }

    await uploadPaymentOptions();
    // await uploadProducts();
    // await uploadCatalogs();

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
