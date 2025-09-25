const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusMaenadsStore from "./BaseDionysusMaenadsStore";
import ApiOfVariant from "../dionysusBoozeVariant";
import ApiOfHera from "../dionysusHera";

class ModularizedDionysusMaenadsStore extends BaseDionysusMaenadsStore {
    objectOfVariant = {};

    constructor(props) {
        super(props);
        this.apiOfVariant = new ApiOfVariant();
        this.apiOfHera = new ApiOfHera();
    }

    async onInitialFetchCompleted(collection) {
        const self = this;

        function setContent(booze) {
            self.setBooze(booze);
            self.setPhoto(booze.photoOfDemo);
            self.setRangeOfPrice(booze.rangeOfPrice);
            self.setCount(`未選擇`);
            self.setVariants(..._.map(booze.specificAttributes, (attr) => ({ key: attr.key, options: _.map(attr.options, ({ label, value }) => ({ label, value })) })));
        }

        function isBooze(param) {
            return param && _.isEqual(param.visibility, true);
        }

        async function handleConflictIssue() {
            const [firstOpt, lastOpt] = [_.head(booze.specificAttributes[0].options), _.last(booze.specificAttributes[0].options)];
            const start = Util.getTSOfSpecificDate(firstOpt.label);
            const end = Util.getTSOfSpecificDate(lastOpt.label, { end: true });
            const timesOfOccupied = await self.apiOfHera.fetchPureHeras(
                self.getComponent(),
                booze.idOfAuthor,
                { type: "where", params: ["startYYYYMMDDHHmmss", ">=", start] },
                { type: "where", params: ["startYYYYMMDDHHmmss", "<=", end] },
                { type: "where", params: ["useMainTrunk", "==", true] }
            );
            Util.appendInfo("main trunk裡的項目 itemsOfHera => ", timesOfOccupied);
            const itemsOfHera = Util.getFilteredHeraPeriods(timesOfOccupied, booze.id);
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

        if (booze.isTaskJob && booze.useMainTrunk) await handleConflictIssue();

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
        if (!_.isEmpty(items)) {
            const { level, items: transformed } = this.transformListAutoLevel(items);
            const options = this.getVariants()[level].getOptions();

            transformed.forEach(({ value, quantity }) => {
                const option = _.find(options, (o) => o.getValue() === value);
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
        return _.filter(arr, (o) => {
            const value = _.get(o, key, "").toLowerCase();
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
        if (_.isEmpty(list)) return { level: null, items: [] };

        // 把 id 拆成陣列
        const splitted = list.map((item) => String(item[key]).split("-"));

        // 找出第一個不一致的 index
        let level = 0;
        const maxParts = _.maxBy(splitted, (arr) => arr.length).length;

        for (let i = 0; i < maxParts; i++) {
            const partsAtIndex = splitted.map((arr) => arr[i] || "");
            if (!_.every(partsAtIndex, (val) => val === partsAtIndex[0])) {
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

        const current = _.toNumber(this.getCountOfSubmit());
        const delta = increase ? 1 : -1;
        const next = current + delta;
        const max = this.getCount();

        this.setCountOfSubmit(increase ? _.min([next, max]) : next < 2 ? current : next);
    }
}

export default ModularizedDionysusMaenadsStore;
