import { configerer } from "configerer";
import { pooller as InfinitePool, spider as Spider, utiller as Util } from 'utiller';
import _ from 'lodash';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Fri Nov 14 2025 02:39:42 GMT+0800 (Taiwan Standard Time)
 */
const ENABLE_OF_OPEN_BROWSER = false;
const MAXIMUM_PAGES_OF_FETCHER = 7;

class beattiya_spider extends Spider {

    constructor(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' }) {
        super(pu, {} = { visible: ENABLE_OF_OPEN_BROWSER, host: '' });
    }

    fetch = async () => {
        const self = this;
        // ==================== 取得[產品]所有分類(保健系列/精華液系列) ====================
        const fetcher = async (page) => {
            const categorySelector = '#navbar .three-dimension-menu.qk-dropdown_menu .level-2-dropdown.scrollbar > *';
            const categoryRows = await page.$$(categorySelector);
            const categories = await Promise.all(
                categoryRows.map(async (row, index) => ({
                    href: await this.fetchAttributeOfEl(row, 'a', 'href'),
                    name: await this.fetchAttributeOfEl(row, 'a', 'innerText'),
                    category: index
                }))
            );
            console.log(`📂 分類列表 ==> ${_.size(categories)}`, categories);
            return categories;
        };
        const categories = await this.activatePage4Task({ fetcher, href: `https://www.its-beattiya.com.tw/` });
        await Util.persistJsonFilePrettier('./temp/categories.json', categories);
        // ==================== 爬取所有分類的產品並合併 ====================
        const handler = new InfinitePool(MAXIMUM_PAGES_OF_FETCHER, 'itsBeat');
        /** 同時間最多開10個頁面抓取 */
        handler.enableTaskTimeout(true, 60000);

        const boozes = [];
        await handler.runByParams(async (param) => {
            const result = await self.boozeFetcher(param);
            boozes.push(...result);
        }, ...categories);

        console.log(`📦 所有boozes ==> ${_.size(boozes)}`, boozes);
        await Util.persistJsonFilePrettier('./temp/boozes.json', boozes);

        const variants = [];
        await handler.runByParams(async (param) => {
            variants.push(await self.variantFetcher(param));
        }, ...boozes);

        console.log(`📦 所有variants ==> 太長了！不PRINT`);
        await Util.persistJsonFilePrettier('./temp/variants.json', variants);
    };

    /**
     * 拿都循過一輪[1,2,3...-> 下一頁]之後的商品資訊
     * @param {Object} cat - 分類物件，需包含 href 屬性
     * @param {string} cat.href - 分類的 URL
     * @returns {Promise<Array>} 所有產品的陣列，每個產品包含 { href, name, id, belonging }
     */
    boozeFetcher = async (cat) => {
        /** todo:collections才是有商品列表的頁面 */
        if (!cat.href?.includes('collections')) return [];
        const fetchBoozes = async (page, cat) => {
            console.log(`coming as ${cat.name}`)
            const attrMap = {
                href: 'href',
                name: 'data-name',
                id: 'data-id',
                belonging: 'data-list'
            };
            const selector = '#template #collection .products_content > *';
            const rows = await page.$$(selector);
            return await Promise.all(rows.map(async (row) => {
                const bean = await this.fetchAttributesOfEl(row, '.productClick', attrMap);
                return { ...bean, category: cat.category };
            }));
        };
        const selectorOfPagingN = '.pagination-container .pagination > *';
        const fetcher = async (page) => await fetchBoozes(page, cat);
        return await this.fetchElementsTilPageEnd({ href: cat.href, fetcher, selectorOfPagingN, signOfPagingN: '»' });
    };

    /** 取得單一商品'細節'資訊 */
    variantFetcher = async (booze) => {
        const self = this;

        const task = async (page, booze) => {
            const nodeOfP = await page.$(`#product`);

            async function getVariant() {
                const name = await self.fetchAttributeOfEl(nodeOfP, `#product_content .product_title h1`, 'innerText');
                const brief = await self.fetchAttributeOfEl(nodeOfP, `#product_content .product_brief`, 'innerText');
                const fetchOfDescription = async () => {
                    const children = await nodeOfP.$$(`#product_description .desc_body .ckeditor > *`);
                    console.log(`variant children:${_.size(children)}`);
                    const contents = await Promise.all(children.map(async (child) => await self.fetchAttributeOfEl(child, '', 'innerText')));
                    return contents.join('\n');
                };
                const slogan = await self.fetchAttributeOfEl(nodeOfP, '#product_content .product_slogan', 'innerText');
                const fetchOfPhotos = async () => {
                    const children = await nodeOfP.$$(`#variant_photos .thumb-container`);
                    return await Promise.all(children.map(async (child) => await self.fetchAttributeOfEl(child, 'img', 'src')));
                };
                const description = await fetchOfDescription();
                const photos = await fetchOfPhotos();
                return { name, brief, slogan, description, photos, category: booze.category };
            }

            await Util.syncDelay(5);
            return await getVariant();
        };
        const fetcher = async (page) => await task(page, booze);
        return this.activatePage4Task({ fetcher, href: booze.href });
    };
}

export { beattiya_spider as beattiya_spider };

if (configerer.DEBUG_MODE) {
    (async () => {
            console.log(`itsBeattiya 爬爬爬開跑`);
            const handler = new beattiya_spider(puppeteer, { visible: ENABLE_OF_OPEN_BROWSER, host: 'https://www.its-beattiya.com.tw' });
            await handler.initial();
            const result = await Util.measureExecutionTime(handler.fetch.bind(handler));
            console.log(result.zh_TW);
            await handler.terminate();
            console.log(`完成itsBeattiya的爬蟲`);
            return 0;
        }
    )();
}
