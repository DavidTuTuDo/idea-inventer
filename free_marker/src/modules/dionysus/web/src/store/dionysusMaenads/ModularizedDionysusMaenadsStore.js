const edit = true;

/** 全域暫存：依據 idOfAuthor 快取 timesOfOccupied，避免同一 author 反覆 fetch */
const cacheOfTimesOccupied = new Map();

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { every, filter, find, get, head, last, map, maxBy, min, size } from "lodash-es";
import BaseDionysusMaenadsStore from "./BaseDionysusMaenadsStore";
import ApiOfVariant from "../dionysusBoozeVariant";
import ApiOfHera from "../dionysusHera";
import UserInfo from "../../base/BaseUserInfo";

class ModularizedDionysusMaenadsStore extends BaseDionysusMaenadsStore {
    objectOfVariant = {};

    constructor(props) {
        super(props);
        this.apiOfVariant = new ApiOfVariant();
        this.apiOfHera = new ApiOfHera();
    }

    isSingleItemOfBooze = () => {
        const conditionA = size(this.getVariants()) === 1;
        const conditionB = size(this.getVariants()[0]?.getOptions()) === 1;
        return conditionA && conditionB;
    };

    async onInitialFetchCompleted(collection) {
        const self = this;

        function setContent(booze) {
            self.setBooze(booze);
            self.setPhoto(booze.photoOfDemo);
            self.setRangeOfPrice(booze.rangeOfPrice);
            self.setCount(`未選擇`);
            self.setVariants(...map(booze.specificAttributes, (attr) => ({ key: attr.key, options: map(attr.options, ({ label, value }) => ({ label, value })) })));
        }

        function isBooze(param) {
            return param && Util.isEqual(param.visibility, true);
        }

        async function handleConflictIssue() {
            const [firstOpt, lastOpt] = [head(booze.specificAttributes[0].options), last(booze.specificAttributes[0].options)];
            const start = Util.getTSOfSpecificDate(firstOpt.label);
            const end = Util.getTSOfSpecificDate(lastOpt.label, { end: true });
            const cacheKey = booze.idOfAuthor;
            let timesOfOccupied;
            if (cacheOfTimesOccupied.has(cacheKey)) {
                timesOfOccupied = cacheOfTimesOccupied.get(cacheKey);
                Util.appendInfo(`使用快取的 timesOfOccupied (idOfAuthor: ${cacheKey})`);
            } else {
                timesOfOccupied = await self.apiOfHera.fetchPureHeras(
                    self.getComponent(),
                    booze.idOfAuthor,
                    { type: "where", params: ["startYYYYMMDDHHmmss", ">=", start] },
                    { type: "where", params: ["startYYYYMMDDHHmmss", "<=", end] },
                    { type: "where", params: ["useMainTrunk", "==", true] },
                    { type: "orderBy", params: ["startYYYYMMDDHHmmss"] }
                );
                cacheOfTimesOccupied.set(cacheKey, timesOfOccupied);
            }

            /** Hack: 將今天(含)以前的日期全部注入為已佔用時段，讓 checkPeriodConflict 判定衝突 */
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "YYYYMMDD"
            const firstDateStr = firstOpt.label.split("(")[0].trim().replace(/\//g, ""); // "YYYYMMDD"
            const syntheticOccupied = [];
            let cursor = new Date(firstDateStr.slice(0, 4) + "-" + firstDateStr.slice(4, 6) + "-" + firstDateStr.slice(6, 8));
            const todayDate = new Date(todayStr.slice(0, 4) + "-" + todayStr.slice(4, 6) + "-" + todayStr.slice(6, 8));
            while (cursor <= todayDate) {
                const ymd = cursor.toISOString().slice(0, 10).replace(/-/g, "");
                syntheticOccupied.push({
                    period: `${ymd}0000-${ymd}2359`,
                    idOfBooze: "__PAST_DATE_OCCUPIED__",
                    idOfVariant: `__PAST_${ymd}__`
                });
                cursor.setDate(cursor.getDate() + 1);
            }

            const mergedOccupied = [...timesOfOccupied, ...syntheticOccupied];
            Util.appendInfo("main trunk裡的項目 (含過去日期hack) itemsOfHera => ", mergedOccupied);
            const itemsOfHera = Util.getFilteredHeraPeriods(mergedOccupied, booze.id);
            Util.appendInfo("篩選過後的 itemsOfHera => ", itemsOfHera);
            /** 如果有課程衝突，就將其數量設定為0，前端用戶看到Chip會是disabled */
            self.listOfVariant.forEach((v) => {
                if (Util.checkPeriodConflict(v, itemsOfHera).conflict) v.quantity = 0;
            });
        }

        const param = this.getComponent(true).propsMobX().paramObject;
        const booze = isBooze(param) ? param : param.booze;
        setContent(booze);

        this.listOfVariant = await this.apiOfVariant.fetchPureVariants(this.getComponent(), booze.id);
        this.objectOfVariant = Util.toObjectWithAttributeKey(this.listOfVariant, "id");
        Util.appendInfo("商品variant的detail infos => ", this.objectOfVariant);

        if (booze.isTaskJob && booze.useMainTrunk) {
            await handleConflictIssue();
            // 1. 安全地取得目標選項，如果中間任何一個環節不存在，就會回傳 undefined 而不是報錯
            const targetOption = this.getVariants()?.[1]?.getOptions()?.[0];
            // 2. 確定有拿到東西，才執行設定
            if (targetOption !== undefined) await this.setSelectedOption(targetOption);
        }

        this.getComponent().invalidatePageTitle(booze?.name ?? "特選商品");
        if (this.isSingleItemOfBooze()) await self.setSelectedOption(this.getVariants()[0].getOptions()[0]);
        return await super.onInitialFetchCompleted(collection);
    }

    setSelectedOption = async (option) => {
        const variant = option.getParentNode();
        const shouldSelect = !option.getSelect();
        variant.getOptions().forEach((o) => o.setSelect(false)); // 先全部取消
        if (shouldSelect) option.setSelect(true); // 若原本沒有被選中，才選中當前 option
        await this.invalidateVariant();
    };

    invalidateVariant = async () => {
        const keyOfVariant = this.getVariants()
            .map(
                (v) =>
                    v
                        .getOptions()
                        .find((o) => o.getSelect())
                        ?.getValue() || ""
            )
            .join("-");

        const items = this.getListOfSpecific(this.listOfVariant, keyOfVariant);
        if (!Util.isEmpty(items)) {
            const { level, items: transformed } = this.transformListAutoLevel(items);
            const options = this.getVariants()[level].getOptions();

            transformed.forEach(({ value, quantity }) => {
                const option = find(options, (o) => o.getValue() === value);
                option?.setQuantity(quantity);
            });
        } else this.getVariants().forEach((v) => v.getOptions().forEach((o) => o.setQuantity(1)));

        const selectedOption = this.objectOfVariant[keyOfVariant];
        selectedOption ? this.setCurrentVariant(selectedOption) : this.clearCurrentVariant();
    };

    clearCurrentVariant = () => {
        this.setCurrentOptionExist(false);
        this.setPhoto(this.getBooze().photoOfDemo);
        this.setRangeOfPrice(this.getBooze().rangeOfPrice);
        this.setCount(`未選擇`);
        this.setCountOfSubmit(0);
    };

    /**
     * // 範例資料
     * const obj = [
     *   {id:'3aAb0-cVc013',count:3},
     *   {id:'aAb09B-tfc',count:5},
     *   {id:'3aAb0-vdc',count:5},
     *   {id:'bbb-cVc013',count:7},
     *   {id:'3aAb0-cvc',count:9}
     * ];
     *
     * // 前綴匹配 '3aAb0-'
     * const result1 = filterByAffix(obj, '3aAb0-');
     * console.log(result1);
     * // [{id:'3aAb0-cVc013',count:3},{id:'3aAb0-vdc',count:5},{id:'3aAb0-cvc',count:9}]
     *
     * // 後綴匹配 '-cVc013'
     * const result2 = filterByAffix(obj, '-cVc013');
     * console.log(result2);
     * // [{id:'3aAb0-cVc013',count:3},{id:'bbb-cVc013',count:7}]
     *
     * */
    getListOfSpecific = (arr, affix, key = "id") => {
        const lowerAffix = affix.toLowerCase();
        return filter(arr, (o) => {
            const value = get(o, key, "").toLowerCase();
            // 前綴匹配
            if (affix.startsWith("-")) {
                // 後綴匹配
                return value.endsWith(lowerAffix);
            } else {
                // 前綴匹配
                return value.startsWith(lowerAffix);
            }
        });
    };

    /**
     const list1 = [
     { id: 'Vjc7oyWX-J27uNPeK', quantity: 1 },
     { id: 'Vjc7oyWX-tKiNOOqp', quantity: 1 },
     { id: 'Vjc7oyWX-uyuWvBA8', quantity: 1 }
     ];
     console.log(transformListAutoLevel(list1));
     {
     level: 1,
     items: [
     { value: 'J27uNPeK', quantity: 1 },
     { value: 'tKiNOOqp', quantity: 1 },
     { value: 'uyuWvBA8', quantity: 1 }
     ]}
     const list2 = [
     { id: 'U6WBjgWm-tKiNOOqp', quantity: 1 },
     { id: 'Vjc7oyWX-tKiNOOqp', quantity: 1 },
     { id: 'dl4TQ3Ir-tKiNOOqp', quantity: 1 },
     { id: 'wsuoJ7Gz-tKiNOOqp', quantity: 1 }
     ];
     console.log(transformListAutoLevel(list2));
     { level: 0,
     items: [
     { value: 'U6WBjgWm', quantity: 1 },
     { value: 'Vjc7oyWX', quantity: 1 },
     { value: 'dl4TQ3Ir', quantity: 1 },
     { value: 'wsuoJ7Gz', quantity: 1 }
     ]}
     */
    transformListAutoLevel = (list, key = "id") => {
        if (Util.isEmpty(list)) return { level: null, items: [] };

        // 把 id 拆成陣列
        const splitted = list.map((item) => String(item[key]).split("-"));

        // 找出第一個不一致的 index
        let level = 0;
        const maxParts = maxBy(splitted, (arr) => arr.length).length;

        for (let i = 0; i < maxParts; i++) {
            const partsAtIndex = splitted.map((arr) => arr[i] || "");
            if (!every(partsAtIndex, (val) => val === partsAtIndex[0])) {
                level = i;
                break;
            }
        }

        return {
            level,
            items: list.map((item) => ({
                value: item[key].split("-")[level] || "",
                quantity: item.quantity
            }))
        };
    };

    setCurrentVariant = (variant) => {
        this.setPhoto(Util.isUndefinedNullEmpty(variant.photo) ? this.getBooze().photoOfDemo : variant.photo);
        this.setPrice(variant.price);
        this.setTitleOfShape(variant.content);
        this.setCount(variant.quantity);
        this.setCountOfSubmit(variant.quantity > 0 ? 1 : 0);
        this.setCurrentOptionExist(true);
        this.setSelectedVariant(variant);
    };

    validateCountOfOrder(increase = true) {
        if (!this.getCurrentOptionExist()) return this.getComponent().showWarningSnackMessage(`尚未選擇商品`);

        const current = Util.toNumber(this.getCountOfSubmit());
        const delta = increase ? 1 : -1;
        const next = current + delta;
        const max = this.getCount();

        this.setCountOfSubmit(increase ? min([next, max]) : next < 2 ? current : next);
    }
}

export default ModularizedDionysusMaenadsStore;
