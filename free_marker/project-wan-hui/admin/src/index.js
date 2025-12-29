const edit = true;

import Api from "./api";
import { utiller as Util, pooller as InfinitePool, exceptioner as ERROR } from "utiller";
import _ from "lodash";

(async () => {
    const api = new Api();

    function getAllPhotos(product) {
        // 使用 ES11 ?. 確保 data 或 introduces 不存在時不會報錯
        // 使用 _.flatMap 提取所有 photos 並攤平
        return _.flatMap(product?.introduces, (item) => item.photos ?? []) ?? [];
    }

    function getExpression(product) {
        const stmts = [];
        if (product && _.isArray(product.introduces)) {
            product.introduces.forEach((each) => {
                if (_.size(each.description) > 5) stmts.push(`${each.title}\n\n${each.description}\n`);
            });
        }
        return stmts.join("\n");
    }

    /**
     * // --- 測試各種情境 ---
     *     console.log(safeToNumber("1,250"));      // 1250
     *     console.log(safeToNumber("$ 1,250.50")); // 1250.5
     *     console.log(safeToNumber("NT$ 5,000"));  // 5000
     *     console.log(safeToNumber("-1,200"));     // -1200
     *     console.log(safeToNumber(undefined));    // 0
     *     console.log(safeToNumber("abc"));        // 0
     * @param value
     * @return {number|*|number}
     */
    function safeToNumber(value) {
        // 1. 處理 null 或 undefined (ES11)
        if (value == null) return 0;

        // 2. 如果已經是數字，直接回傳
        if (_.isNumber(value)) return value;

        // 3. 清洗字串：
        // - toString() 確保處理非字串型態
        // - replace(/[^\d.-]/g, '')：移除除了數字、負號、小數點以外的所有字元（如逗號、$, NT...）
        const cleanValue = value.toString().replace(/[^\d.-]/g, "");

        // 4. 轉換並處理無法解析的情況
        // 使用 ?? (ES11) 確保如果解析失敗回傳 0
        const result = _.toNumber(cleanValue);

        return _.isNaN(result) ? 0 : result;
    }

    async function uploadBoozeVariants() {
        const ids = await api.fetchDocumentIdsOfBooze();
        console.log("current ids of Booze ==> ", ids);
        /** batch delete storage : 要記得firestore/storage/甚至firebase上所有的路徑(a/b/c/d.png)都是視覺化，真正要刪除的d.png並非是在 a/b/c底下，所以要針對每個檔案regEx去做CRUD */
        await api.batchDeleteStorageByPrefixes(ids.map((id) => `dionysus/${id}/images/`));
        /** batch delete booze/variant */
        await api.deleteBatchBoozeVariantItems(ids);
        let products = Util.getFileContextInJSON("./temp/variants.json");
        console.log(`丸卉食品合計商品共有： `, _.size(products), ` 個`);
        await api.submitBatchBoozeVariantItems(
            products.map((product) => {
                const variants = product.variants || []; // 確保是陣列
                const hasV = variants.length > 0;
                // 先將資料清洗並轉換好，避免在 findLowestValue 裡反覆處理
                const cleanedVariants = variants.map((v) => ({
                    price: safeToNumber(v.price),
                    priceB4Discount: safeToNumber(v.priceB4Discount)
                }));
                // 這裡直接傳入 cleanedVariants
                const price = hasV ? Util.findLowestValue(cleanedVariants, "price") : 0;
                const priceB4Discount = hasV ? Util.findLowestValue(cleanedVariants, "priceB4Discount") : 0;
                const gallery = product.photos?.map((photo) => ({ href: photo })) ?? [];
                const additional = getAllPhotos(product).map((photo) => ({ href: photo }));

                // console.log(`${product.name}`,` ==> `,additional);

                const expression = getExpression(product);
                gallery.push(...additional);
                const rangeOfPrice = Util.getStringOfValueRange(variants.map((each) => ({ price: safeToNumber(each.price) })));
                const id = Util.getRandomHashV2(20);
                return {
                    dionysus: {
                        photos: gallery,
                        photoOfDemo: product.photoOfDemo,
                        name: product.name,
                        price,
                        statement: `${product.brief}\n\n${expression}`,
                        id,
                        category: [product.category],
                        rangeOfPrice,
                        needAddress: true,
                        selectedTypeOfProp: 1 /** 商品種類 */,
                        visibility: true,
                        initCompleted: true,
                        idOfAuthor: "Z6fYO4zDLhQQXWqPtHn0tpe8VfR2",
                        allowSelfPickUp: true,
                        keywords: [...Util.generateUniversalKeywords(product.name), "丸文", "丸文食品", "綠川"],
                        specificAttributes: [{ key: "main", label: "", options: variants.map((variant) => ({ label: variant.name, value: `${variant.id}wanHui` })) }],
                        priceB4Discount
                    },
                    variants: variants.map((variant) => ({
                        id: `${variant.id}wanHui`,
                        content: variant.name,
                        photo: variant.photo,
                        nameOfBooze: product.name,
                        idOfBooze: id,
                        isTaskJob: false,
                        visibility: true,
                        idOfAuthor: `Z6fYO4zDLhQQXWqPtHn0tpe8VfR2`,
                        allowSelfPickUp: true,
                        quantity: variant.count,
                        price: safeToNumber(variant.price),
                        priceB4Discount: safeToNumber(variant.priceB4Discount)
                    }))
                };
            })
        );
    }

    async function uploadCatalogs() {
        const categories = Util.getFileContextInJSON("./temp/categories.json");
        await api.submitSelectBounds(
            _.filter(categories, (category) => category.href?.includes("product")).map((item) => ({
                label: item.name,
                id: `wanHui${item.category}`,
                value: item.category
            }))
        );
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
    // console.log(`全桌壞光光！`)

    await uploadCatalogs();
    await uploadPaymentOptions();
    await uploadBoozeVariants();
})();
