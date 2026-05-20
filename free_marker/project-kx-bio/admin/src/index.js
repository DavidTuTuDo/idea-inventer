const edit = true;

import Api from "./api";
import { utiller as Util, pooller as InfinitePool, exceptioner as ERROR } from "utiller";
import _ from "lodash";

(async () => {
    const api = new Api();

    async function uploadBoozeVariants() {
        const ids = await api.fetchDocumentIdsOfBooze();
        console.log("current ids of Booze ==> ", ids);
        /** batch delete storage : 要記得firestore/storage/甚至firebase上所有的路徑(a/b/c/d.png)都是視覺化，真正要刪除的d.png並非是在 a/b/c底下，所以要針對每個檔案regEx去做CRUD */
        await api.batchDeleteStorageByPrefixes(ids.map((id) => `dionysus/${id}/images/`));
        /** batch delete booze/variant */
        await api.deleteBatchBoozeVariantItems(ids);
        let products = Util.getFileContextInJSON("./temp/variants.json");
        console.log(`康新生物合計商品共有： `, _.size(products), ` 個`);
        await api.submitBatchBoozeVariantItems(
            products.map((product) => {
                const price = Util.getRandomValue(5000, 10000);
                const priceB4Discount = Math.round(_.sum([price, _.multiply(0.3, price)]));
                const gallery = product.photos?.map((photo) => ({ href: photo }));
                return {
                    dionysus: {
                        photos: gallery,
                        banner: gallery,
                        photoOfDemo: product.photos?.[0],
                        name: product.name,
                        price,
                        statement: `${product.brief}\n${product.description}`,
                        id: product.id,
                        category: [product.category],
                        rangeOfPrice: "",
                        needAddress: true,
                        selectedTypeOfProp: 1 /** 商品種類 */,
                        visibility: true,
                        initCompleted: true,
                        idOfAuthor: "VDXGpGmUINfJLLEKRUvB4ZEFYHH2",
                        allowSelfPickUp: true,
                        keywords: [...Util.generateUniversalKeywords(product.name), "康新", "康新生物", "康新生物科技"],
                        specificAttributes: [{ key: "main", label: "", options: [{ label: product.name, value: `${product.id}kxBio` }] }],
                        priceB4Discount
                    },
                    variants: [
                        {
                            id: `${product.id}kxBio`,
                            content: product.name,
                            photo: product.photos?.[0],
                            nameOfBooze: product.name,
                            idOfBooze: product.id,
                            isTaskJob: false,
                            visibility: true,
                            idOfAuthor: `VDXGpGmUINfJLLEKRUvB4ZEFYHH2`,
                            allowSelfPickUp: true,
                            quantity: 100,
                            price: price,
                            priceB4Discount
                        }
                    ]
                };
            })
        );
    }

    async function uploadCatalogs() {
        const categories = Util.getFileContextInJSON("./temp/categories.json");
        await api.submitSelectBounds(
            _.filter(categories, (category) => category.href?.includes("collections")).map((item) => ({
                label: item.name,
                id: `kxBio${Util.toString(item.category)}`,
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
