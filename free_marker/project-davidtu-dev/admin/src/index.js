import Api from "./api";
import { databazer as Databaser, builder as Builder } from "databazer";
import { utiller as Util, pooller as InfinitePool, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import Listener from "./listener";
import firebase from "./base/FirebaseHelper";
import { linepayer as LinePay } from "linepayer";
import libpath from "path";
import config from "./config";
import moment from "moment";

(async () => {
    console.log(`注意注意, 五秒後要部署到admin server了,動到prod的資料就爆炸了.`);

    const api = new Api();
    const listener = new Listener();
    // await api.submitProductItem({
    //     name:'小狗',
    //     count:10,
    //     color:'黑色',
    // })

    async function subtractOne() {
        const item = await api.fetchProductItem(`afIOihtOdfusq7x2lvHU`);
        console.log("取得 item=>", item);
        item.count = item.count - 1;
        const updateContent = { count: item.count - 1 };
        await api.updateProductItem(`afIOihtOdfusq7x2lvHU`, updateContent);
        console.log("update item=>", updateContent);
    }

    async function subtractOneTransaction() {
        await api.updateTestAtomically(async (item, transaction) => {
            const old = item.subTitle;
            const latest = old + 1;
            transaction.set(api.getProductItemDocRef(), api.normalizeProduct({ name: `香蕉 ${latest}` }));
            return { subTitle: latest };
        });
    }

    async function submitSampleProduct() {
        await api.deletePreciseOrders(true);
        await api.deletePreciseProducts(true);
        await api.submitPreciseProducts([
            {
                name: "iphone13 pro",
                price: 100,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [
                    {
                        statement: "iphone13pro 樣板",
                        url: "https://cs-a.ecimg.tw/items/DYARCHA900BUHR3/000001_1634635600.png"
                    }
                ]
            },
            {
                name: "iphone12",
                price: 80,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [
                    {
                        statement: "iphone12 樣板",
                        url: "https://mrmad.com.tw/wp-content/uploads/2020/10/iphone-12-vs-iphone-11.jpg"
                    }
                ]
            },
            {
                name: "iphone11",
                price: 50,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [
                    {
                        statement: "iphone11 樣板",
                        url: "https://www.trustedreviews.com/wp-content/uploads/sites/54/2019/09/iphone11-1-920x613.jpg"
                    }
                ]
            },
            {
                name: "iphoneX",
                price: 40,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [
                    {
                        statement: "iphoneX 樣板",
                        url: "https://www.trustedreviews.com/wp-content/uploads/sites/54/2019/09/iphone11-1-920x613.jpg"
                    }
                ]
            },
            {
                name: "iphone8",
                price: 30,
                quantityOfCurrent: 300,
                maxCountOfPerOrder: 10,
                photos: [
                    {
                        statement: "iphone8 樣板",
                        url: "https://mrmad.com.tw/wp-content/uploads/2020/10/iphone-12-vs-iphone-11.jpg"
                    }
                ]
            }
        ]);
    }

    async function sampleOfFetchUrl() {
        const products = await api.fetchPreciseProducts();
        const urls = _.head(_.flattenDeep(products.map((item) => item.photos)).map((item) => item.url));
        console.log(urls);

        // console.log(_.head(_.flattenDeep([...urls])))
        // return Util.getValueOfPriority(this.imageUrlOfHeadPhoto, );
    }

    async function uploadPaymentOptions() {
        await api.submitOptions([
            {
                name: "Line Pay",
                image: "",
                description: "",
                indexOfSequence: 3,
                idOfUnique: "linepay"
            },
            {
                name: "綠界支付",
                image: "",
                description: "信用卡、ATM、超商支付",
                indexOfSequence: 2,
                idOfUnique: "ecpay"
            }
        ]);
    }

    async function expiredOrderBehavior() {
        console.log("執行 SchedulerOfExpiredOrder 腳本");
        const orders = await api.fetchPreciseOrdersOfLimitation("in", "stateOfPayment", "pending", "waiting");
        /** 比對當前時間是否 > expired time，如果過期了 1.把狀態改成failure, 還有增加失效原因 */
        const currentTimeStamp = Util.getCurrentTimeStamp();
        const results = _.filter(orders, (order) => {
            return currentTimeStamp > api.normalizeTimestamp(order.timeOfExpired);
        });
        const expired = _.map(results, (result) => {
            return {
                ...result,
                messageOfPayment: `已超過付費期限 ${Util.getCurrentTimeFormatYMDHM(api.normalizeTimestamp(result.timeOfExpired))}`,
                stateOfPayment: `failure`
            };
        });
        await api.updatePreciseOrders(expired);
    }

    async function fetchProjectPrettier() {
        const projects = await api.fetchProjects();
        const commit = projects.map((project) => {
            delete project.updateTime;
            delete project._doc;
            delete project.id;
            return project;
        });

        Util.appendFile("./stringOfProject.json", JSON.stringify(commit), true, true);
        await Util.prettier("./stringOfProject.json", 120);
    }

    async function updateCPRT() {
        await api.submitInfoOfCopyRight({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`
        });
    }

    async function updateCPRTContent() {
        await api.submitInfoOfCopyRightContact({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`,
            phone: `+886982763479`,
            email: `freshingmoon0725@gmail.com`
        });
    }

    async function updateCPRTProjects() {
        await api.deleteProjects(true);
        await api.submitProjects([
            {
                image: "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7832.jpg?alt=media&token=5bf27574-f678-462d-8b3a-ea4077c4910e",
                route: "https://kh-high.web.app/",
                indexOfSequence: 0,
                trait: "線上答題 | 高中學測",
                title: "悅考",
                descriptions: [{ statement: "一目暸然的答題方式(單選、多選)" }, { statement: "錯誤回顧、線上協助" }]
            },
            {
                image: "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7833.jpg?alt=media&token=4998b3fa-5571-415a-b0d1-0dd4d5d81486",
                route: "https://yueh-voice.web.app/",
                indexOfSequence: 2,
                trait: "線上播放器 ｜客製化",
                title: "悅耳",
                descriptions: [{ statement: "建立自己的線上專輯" }, { statement: "聲音的故事（PODCASTS、街聲）" }]
            },
            {
                image: "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7838.jpg?alt=media&token=8c1aa03d-5aff-4e93-9745-7bd3bd92e5ed",
                route: "empty",
                indexOfSequence: 4,
                trait: "施工中 | 知識變現 | 技能販售",
                title: "悅薪",
                descriptions: [{ statement: "施工中" }, { statement: "時薪制販售技能（科目教學、美編、美髮、美睫）" }, { statement: "線上付款（降低人工筆記、保障權益）" }]
            },
            {
                image: "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FS__3342348.jpg?alt=media&token=dfdc178e-aa97-4e3c-95d8-7029cbeef62f",
                route: "https://yueh-pu.web.app/",
                indexOfSequence: 1,
                trait: "音樂｜和弦譜",
                title: "悅譜",
                descriptions: [{ statement: "和弦即時轉調（原調、男女建議調性）" }, { statement: "字體調整（手機、平板、電腦）" }]
            },
            {
                image: "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7834.jpg?alt=media&token=9a973889-89a8-4c41-ae34-509b4182646f",
                route: "empty",
                indexOfSequence: 5,
                trait: "施工中 | 線上預約 | 申請",
                title: "悅曆",
                descriptions: [{ statement: "施工中" }, { statement: "場地預約、資格審核、違規計點紀錄" }]
            },
            {
                image: "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7840.jpg?alt=media&token=0634dc18-6bff-450b-950a-2493898dcc66",
                route: "empty",
                indexOfSequence: 7,
                trait: "施工中 | 線上小説 ｜黑底白字",
                title: "悅讀",
                descriptions: [{ statement: "線上閱讀，使用案底色鮮少眼睛壓力" }, { statement: "閱讀紀錄，全文檢索" }]
            }
        ]);
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
        /** 拿到所有product id，因為 /product/{id}/variants 要逐個刪除 */
        const ids = await api.fetchDocumentIdsOfBooze();
        for (const id of ids) await api.deleteVariants(true, id);
        await api.deleteBoozes(true);

        const items = _.filter(Util.getFileContextInJSON("./sasha_of_products_detail_1746177966129.json"), (each) => _.size(each.options) > 1);
        const products = Util.getShuffledArrayWithLimitCount(
            items.filter((item) => _.size(item.options) < 15),
            10
        );
        // const products = products;
        await api.submitBoozes(
            _(products)
                .map(({ serial, options, category, statement, ...rest }) => {
                    const lowestPrice = Util.findLowestValue(options);
                    return {
                        ...rest,
                        price: lowestPrice,
                        id: serial,
                        specificAttributes: getSpecificAttributes(options),
                        category: Util.getUniqueValuesBy(category, "valueOfType"),
                        rangeOfPrice: Util.getStringOfValueRange(options),
                        statement: normalizeStatement(statement),
                        priceB4Discount: Math.round(lowestPrice * 1.3),
                        // 處理 options
                        options: _(options)
                            .filter(({ count }) => count > 0)
                            .map(({ name, price: optPrice, photo, count, ...other }) => ({
                                name,
                                photo,
                                count,
                                ...other,
                                price: optPrice,
                                priceB4Discount: Math.round(optPrice * 1.3)
                            }))
                            .value()
                    };
                })
                .value()
        );
        console.log(`＊＊＊已完成products collection 上傳，合計 ${_.size(products)} 筆`);
        for (const product of products) await api.submitVariants(getVariants(product.options), product.serial);
        console.log(`＊＊＊已完成products ->variants collection 上傳，合計 ${_.size(products)} 筆`);
    }

    function getVariants(options) {
        return _(options)
            .filter(({ count }) => count > 0)
            .map(({ count, photo, price, value }, idx) => ({
                id: `default_${value}`,
                quantity: count,
                photo,
                price,
                trait: { default: value },
                // 原本 sum([price, price*0.3]) → 直接 price*1.3，然後四捨五入
                priceB4Discount: Math.round(price * 1.3)
            }))
            .value();
    }

    function getSpecificAttributes(subs) {
        const options = _(subs)
            .filter(({ count }) => count > 0)
            .map(({ name, value }, index) => ({ value, label: name }))
            .value();

        return [
            {
                key: "default",
                label: "預設",
                options
            }
        ];
    }

    /**  刻意製造雙層結構的傷品  */

    async function uploadFakedProducts() {
        /** 拿到所有product id，因為 /product/{id}/variants 要逐個刪除 */
        const ids = await api.fetchDocumentIdsOfBooze();
        console.log(ids);
        await api.deleteBatchParentItems(["dionysus", "variants"], ids);
        const items = _.filter(Util.getFileContextInJSON("./sasha_of_products_detail_1746177966129.json"), (each) => _.size(each.options) > 1);
        const products = Util.getShuffledArrayWithLimitCount(
            items.filter((item) => _.size(item.options) < 15),
            10
        );
        // const products = products;

        const deploys = products.map(({ serial, options, category, statement, ...rest }) => {
            const lowestPrice = Util.findLowestValue(options);
            return {
                dionysus: api.normalizeBooze({
                    ...rest,
                    price: lowestPrice,
                    id: serial,
                    specificAttributes: getFakeSpecificAttributes(options),
                    category: Util.getUniqueValuesBy(category, "valueOfType"),
                    rangeOfPrice: Util.getStringOfValueRange(options),
                    statement: normalizeStatement(statement),
                    priceB4Discount: Math.round(lowestPrice * 1.3),
                    // 處理 options
                    options: _(options)
                        .filter(({ count }) => count > 0)
                        .map(({ name, price: optPrice, photo, count, ...other }) => ({
                            name,
                            photo,
                            count,
                            ...other,
                            price: optPrice,
                            priceB4Discount: Math.round(optPrice * 1.3)
                        }))
                        .value()
                }),
                variants: getFakeVariants(options, serial).map((variant) => api.normalizeVariant(variant))
            };
        });
        console.log(deploys);

        await api.submitBatchBoozeVariantItems(deploys);

        console.log(`＊＊＊已完成products ->variants collection 上傳，合計 ${_.size(products)} 筆`);
    }

    function getFakeSpecificAttributes(subs) {
        const options = _(subs)
            .filter(({ count }) => count > 0)
            .map(({ name, value }) => ({ value, label: name }))
            .value();

        return [
            {
                key: "default",
                label: "選項",
                options
            },
            {
                key: "size",
                label: "尺寸",
                options: [
                    { value: 0, label: "S號" },
                    { value: 1, label: "M號" },
                    { value: 2, label: "L號" }
                ]
            }
        ];
    }

    function getFakeVariants(options, idOfBooze) {
        const variants = Util.generateCombinations(...getFakeSpecificAttributes(options));
        for (const variant of variants) {
            const option = _.find(options, (each) => each.value === variant.trait.default);
            variant.quantity = option.count;
            variant.photo = option.photo;
            variant.quantity = option.count;
            variant.priceB4Discount = Math.round(option.price * 1.3);
            variant.price = option.price;
            variant.idOfBooze = idOfBooze;
            console.log(variants);
        }
        return variants;
    }

    async function testFetchResult() {
        console.log("執行 SchedulerOfExpiredOrder 腳本");
        const orders = await api.fetchPreciseOrdersOfLimitation("in", "stateOfPayment", "pending", "waiting");
        console.log(
            "測試測試",
            orders.map((each) => each.id)
        );
    }

    async function testUpdate() {
        const result = await api.updatePreciseOrderItem({ isRestoreItems: true }, "fgttkfVeqoETfys6ZWcK");
        console.log(result);
    }

    // await testUpdate();
    // await testFetchResult();
    await uploadProducts();
    // await uploadFakedProducts();
    // await expiredOrderBehavior();
    // await updateCPRT();
    // await updateCPRTContent();
    // await updateCPRTProjects();
    // await uploadPaymentOptions();
    // await sampleOfFetchUrl();
    // await submitSampleProduct();
    // console.log(await api.fetchTest());
    // const pool = new InfinitePool(3);
    // await pool.runByTimes(subtractOneTransaction, 2);
    // await api.updateTestTransaction((object) => { return {title:"杜明岳"}})
    // await api.updateProductItem(`53dNl6edK7K3tGLBj71n`,api.normalizeProduct({count:101},true))
})();
