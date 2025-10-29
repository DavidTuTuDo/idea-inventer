const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import BaseDionysusGaiaStore from "./BaseDionysusGaiaStore";
import Booze from "../dionysusBooze";
import BoozeVariant from "../dionysusBoozeVariant";
import DionysusTab from "../dionysusSelectBound";
import BoozeImage from "../dionysusBoozePhoto";
import { action } from "mobx";
import BaseComponent from "../../base/BaseComponent";
import UserInfo from "../../base/BaseUserInfo";
const MAXIMUM_IMAGE_OF_BOOZE = 8;
const MAXIMUM_TEXT_OF_NAME = 50;
const MAXIMUM_TEXT_OF_STATEMENT = 300;
const BOOZE_OF_UNCREATED = "generate";

const textsFetchConfig = {
    main: {
        // defaultTexts: [{ content: "aaa" }, { content: "bbb" }, { content: "ccc" }],
        autoIncrement: true,
        maximumRow: 100,
        onChanged: async (instance, strings) => {
            return await Util.appendInfo("main texts changed");
        },
        onAppendClicked: async (strings, instance) => {
            return await instance.appendMainOptions(strings);
        }
    },
    sub: {
        // defaultTexts: [{ content: "ddd" }, { content: "eee" }, { content: "fff" }],
        autoIncrement: true,
        maximumRow: 100,
        onChanged: async () => {
            return await Util.appendInfo("sub texts changed");
        },
        onAppendClicked: async (strings, instance) => {
            return await instance.appendSubOptions(strings);
        }
    }
};

class ModularizedDionysusGaiaStore extends BaseDionysusGaiaStore {
    constructor(props) {
        super(props);
        this.apiOfTabs = new DionysusTab();
        this.apiOfBooze = new Booze();
        this.apiOfImage = new BoozeImage();
        this.apiOfVariant = new BoozeVariant();
    }

    async onInitialFetchCompleted(collection) {
        let booze = this.getBooze();
        const id = this.getParamOfPidInPath();
        if (Util.isUndefinedNullEmpty(booze) && Util.isFirestoreAutoId(id)) booze = await this.apiOfBooze.fetchBoozeItem(this.getComponent(), id);
        if (!_.isEqual(id, BOOZE_OF_UNCREATED)) this.setIdOfBooze(id);
        if (booze && booze.id) this.validateBooze(booze);
        this.validateSubMainValues();
    }

    validateSubMainValues() {
        this.setBriefMains(...Util.getArrayOfFillMissingValues(this.getBriefMains()));
        this.setBriefSubs(...Util.getArrayOfFillMissingValues(this.getBriefSubs()));
    }

    setScheduleResult = async (schedule) => {
        this.cleanBriefSubs();
        this.cleanBriefMains();
        schedule.dates.forEach((date) => this.appendMainOptions(date));
        schedule.classes.forEach((time) => this.appendSubOptions(time));
        Util.appendInfo(this.getBriefMains().map((each) => each.columnData()));
        Util.appendInfo(this.getBriefSubs().map((each) => each.columnData()));
    };

    @action
    validateBooze(booze) {
        this.setIdOfBooze(booze.id);
        this.setName(booze.name);
        this.setStatement(booze.statement);
        this.setBriefMains(...this.getOptionsOfBrief(booze, "main"));
        this.setBriefSubs(...this.getOptionsOfBrief(booze, "sub"));
        this.setBriefPhotos(...booze.photos);
        this.setSelectedTypeOfProp(booze.selectedTypeOfProp ?? 1);
        this.setVisibility(booze.visibility ?? false);
        this.setTypeOfPropDisabled(booze.initCompleted);
        this.setAllowSelfPickUp(booze.allowSelfPickUp);
        this.setIsHomeTeaching(booze.isHomeTeaching);
        this.setInitCompleted(booze.initCompleted);
        this.setUseMainTrunkDisabled(booze.initCompleted);
        this.setIsHomeTeachingDisabled(booze.initCompleted);
        this.setAllowSelfPickUpDisabled(booze.initCompleted);
        this.setStmtOfDescriptionMaximum(`${_.size(this.getStatement())}/${MAXIMUM_TEXT_OF_STATEMENT}`);
        this.setStmtOfNameMaximum(`${_.size(this.getName())}/${MAXIMUM_TEXT_OF_NAME}`);
    }

    getOptionsOfBrief = (booze, type = "main") => {
        const attr = _.find(booze.specificAttributes, (each) => _.isEqual(each.key, type));
        return attr ? attr.options : [];
    };

    appendMainOptions = async (strings) => {
        /** 加入的字串陣列，排除重複的 */
        const uniques = Util.findUniqueNonReferenceStrings(
            this.getBriefMains().map((each) => each.label),
            strings
        );
        /** 找出是否存在過specificAttribute，然後刪掉的又加回去 */
        const bunchOfLatest = this.getAttributesOfMatchLabels(
            uniques,
            _.find((this.getBooze() ?? {}).specificAttributes, (each) => _.isEqual(each.key, "main"))
        );
        /** 為類別加上一個不重複的unique value */
        const latest = Util.getArrayOfFillMissingValues([...this.getBriefMains().map((each) => each.columnData()), ...bunchOfLatest]);
        this.setBriefMains(...latest);
    };

    appendSubOptions = async (strings) => {
        /** 加入的字串陣列，排除重複的 */
        const uniques = Util.findUniqueNonReferenceStrings(
            this.getBriefSubs().map((each) => each.label),
            strings
        );
        /** 找出是否存在過specificAttribute，然後刪掉的又加回去 */
        const bunchOfLatest = this.getAttributesOfMatchLabels(
            uniques,
            _.find((this.getBooze() ?? {}).specificAttributes, (each) => _.isEqual(each.key, "sub"))
        );
        /** 為類別加上一個不重複的unique value */
        const latest = Util.getArrayOfFillMissingValues([...this.getBriefSubs().map((each) => each.columnData()), ...bunchOfLatest]);
        this.setBriefSubs(...latest);
    };

    /** texts fetch */

    getSelectedConfig() {
        return textsFetchConfig[this.getSelected()];
    }

    async getDefaultTextsOfTextFetch() {
        const config = this.getSelectedConfig();
        return config?.defaultTexts;
    }

    autoIncrementOfTextsFetch() {
        const config = this.getSelectedConfig();
        return config?.autoIncrement ?? false;
    }

    getMaximumRowOfTextsFetch() {
        const config = this.getSelectedConfig();
        return config?.maximumRow ?? true;
    }

    onTextsFetchChanged = async (param) => {
        const config = this.getSelectedConfig();
        return (await config?.onChanged(param, this)) ?? Util.appendInfo("default changed");
    };

    onTextsFetchAppendClicked = async (param) => {
        const config = this.getSelectedConfig();
        return (await config?.onAppendClicked(param, this)) ?? Util.appendInfo(`[TEXTSFETCH] default append clicked ${param}`);
    };

    onNameFieldChanged = () => {
        const current = this.getName();
        this.setName(this.truncateString(current, MAXIMUM_TEXT_OF_NAME));
        this.setStmtOfNameMaximum(`${_.size(this.getName())}/${MAXIMUM_TEXT_OF_NAME}`);
    };

    onStatementFieldChanged = () => {
        const current = this.getStatement();
        this.setStatement(this.truncateString(current, MAXIMUM_TEXT_OF_STATEMENT));
        this.setStmtOfDescriptionMaximum(`${_.size(this.getStatement())}/${MAXIMUM_TEXT_OF_STATEMENT}`);
    };

    truncateString(str, length = 30) {
        if (!_.isString(str)) return "";
        return _.truncate(str, {
            length,
            omission: "" // 不加 "..."，若要保留可以改為 '...'
        });
    }

    uploadBriefImages = async (files) => {
        if (_.sum([_.size(this.getBriefPhotos()), _.size(files)]) > MAXIMUM_IMAGE_OF_BOOZE)
            return this.getComponent().showWarningSnackMessage(`已超過數量${MAXIMUM_IMAGE_OF_BOOZE}張圖片`);
        await this.handleIdOfBooze();
        const pathsOfImage = await Promise.all(files.map((file) => this.apiOfImage.uploadStorageOfHref(this.getComponent(), file, this.getIdOfBooze())));
        this.pushBriefPhotos(...pathsOfImage.map((image) => Util.getObjectOfSpecifyKey(image, "href")));
        await this.apiOfBooze.updateBoozeItem(this.getComponent(), { photos: this.getBriefPhotos() }, this.getIdOfBooze());
    };

    handleIdOfBooze = async () => {
        const id = Util.isUndefinedNullEmpty(this.getIdOfBooze()) ? this.getParamOfPidInPath() : this.getIdOfBooze();
        if (Util.isUndefinedNullEmpty(id) || _.isEqual(BOOZE_OF_UNCREATED, id)) {
            /** 如果商品ID 還沒創建時，必須先拿到document id才能有唯一碼作為圖片路徑需求 */
            Util.appendInfo(" debug ==> ", this.getObjectOfBooze());
            const latest = await this.apiOfBooze.submitBoozeItem(this.getComponent(), this.getObjectOfBooze());
            this.setIdOfBooze(latest.value.id);
            this.setBooze(latest.value);
            this.getComponent().props.navigate(`/gaia/${this.getIdOfBooze()}`);
        } else this.setIdOfBooze(id);
    };

    recoverBooze4Sure = async () => {
        const booze = await this.apiOfBooze.fetchBoozeItem(this.getComponent(), this.getIdOfBooze());
        this.validateBooze(booze);
        this.getComponent().showInfoSnackMessage(`已成功復原`);
    };

    deleteBooze4Sure = async () => {
        await this.apiOfBooze.deleteBoozeItem(this.getComponent(), this.getIdOfBooze());
        await this.apiOfVariant.deleteVariants(this.getComponent(), true, this.getIdOfBooze());
        this.getComponent().showInfoSnackMessage(`已成功刪除`);
    };

    getObjectOfBooze = () => {
        return {
            id: this.getIdOfBooze(),
            name: this.getName(),
            statement: this.getStatement(),
            photos: this.getBriefPhotos(),
            photoOfDemo: _.size(this.getBriefPhotos()) > 0 ? _.head(this.getBriefPhotos()).href : "",
            ...this.modifySpecificAttribute(),
            visibility: this.getVisibility(),
            idOfAuthor: UserInfo.getUid(),
            isTaskJob: this.belong2TaskJob(),
            useMainTrunk: this.getUseMainTrunk(),
            selectedTypeOfProp: this.getSelectedTypeOfProp(),
            allowSelfPickUp: this.getAllowSelfPickUp(),
            isHomeTeaching: this.getIsHomeTeaching()
        };
    };

    showErrorMsg4UpdateVisibility = async (msg) => {
        await this.apiOfBooze.updateBoozeItem(this.getComponent(), { visibility: false }, this.getIdOfBooze());
        this.setVisibility(false);
        this.getComponent().showErrorSnackMessage(msg);
    };

    createBooze4Sure = async () => {
        await this.handleIdOfBooze();
        if (_.size(this.getBriefPhotos()) === 0) return this.showErrorMsg4UpdateVisibility(`至少需要上傳一張「商品圖片」`);
        if (_.size(this.getName()) < 2) return this.showErrorMsg4UpdateVisibility(`「商品名稱」必須超過2個字元`);
        if (this.belong2TaskJob() && _.size(this.getBriefSubs()) === 0) return this.showErrorMsg4UpdateVisibility(`需要新增課程的「日期與「時段」`);
        if (_.size(this.getBriefSubs()) === 0) return this.showErrorMsg4UpdateVisibility(`商品選項至少需要一個「主選項」`);

        const result = await this.apiOfBooze.updateBoozeItem(this.getComponent(), { ...this.getObjectOfBooze(), initCompleted: true, visibility: true }, this.getIdOfBooze());
        /** variants裡面要放商品名稱，免得結帳還要去拿龐大的Booze物件 */
        this.setInitCompleted(true);
        const variants = await this.apiOfVariant.fetchDocumentIdsOfVariant(this.getComponent(), this.getIdOfBooze());
        await this.apiOfVariant.updateVariants(
            this.getComponent(),
            variants.map((id) => ({ id, nameOfBooze: this.getName(), visibility: this.getVisibility(), isHomeTeaching: this.getIsHomeTeaching() })),
            this.getIdOfBooze()
        );
        this.invalidateBooze({ ...result.value });
        if (this.getInitCompleted()) this.getComponent().showInfoSnackMessage(`成功更新「${this.getName()}」商品`);
    };

    modifySpecificAttribute() {
        const object = {};
        object["specificAttributes"] = [
            {
                key: "main",
                label: "",
                options: Util.getArrayOfFillMissingValues(this.getBriefMains().map((each) => each.columnData()))
            },
            {
                key: "sub",
                label: "",
                options: Util.getArrayOfFillMissingValues(this.getBriefSubs().map((each) => each.columnData()))
            }
        ];
        Util.appendInfo(object);
        return object;
    }

    invalidateBooze = (newbie) => {
        const latest = Util.mergeObject(this.getBooze(), newbie);
        Util.appendInfo(" origin ==> ", this.getBooze());
        Util.appendInfo(" newbie ==> ", newbie);
        Util.appendInfo(" latest ==> ", latest);
        this.setBooze(latest);
        this.validateBooze(latest);
    };

    /**
     * 預想用戶可能會刪掉原本的選項，然後再加入相同的選項，這個情況下，應該要維持value(uid)的一致性
     * const labels = ['a', 'b', 'c', 'd'];
     * const options = [
     *   { value: 'xxx', label: 'a' },
     *   { value: 'x12', label: 'd' },
     *   { value: 'cdd', label: 'e' }
     * ];
     *
     * console.log(matchLabelsWithFallback(labels, options));
     * [
     *   { value: 'xxx', label: 'a' },
     *   { value: '', label: 'b' },
     *   { value: '', label: 'c' },
     *   { value: 'x12', label: 'd' }
     * ]
     */
    getAttributesOfMatchLabels = (strings, specifyAttribute) => {
        const labelMap = _.keyBy((specifyAttribute ?? {}).options || [], "label");
        return strings.map((label) => {
            return labelMap[label] || { value: "", label };
        });
    };

    /** indexSetter的call function */
    fetchTextsOfIndexSetter = async () => {
        const indexOfSelected = this.getBooze().category ?? [];
        const tabs = (await this.apiOfTabs.fetchSelectBounds(this.getComponent())) ?? [];
        return Util.getItemsOfMarkMatching(tabs, indexOfSelected);
    };

    enableGopTopOfIndexSetter = () => {
        return UserInfo.isAdmin();
    };

    submitTextsOfIndexSetter = async (rows) => {
        await this.handleIdOfBooze();
        const indexesOfCategory = _.filter(rows, (row) => _.isEqual(true, row.belong)).map((each) => each.value);
        const tabsOfSubmit = rows.map((row) => {
            delete row.belong;
            return row;
        });

        if (UserInfo.isAdmin())
            await this.apiOfTabs.submitSelectBounds(
                this.getComponent(),
                tabsOfSubmit.map((each) => ({ ...each, id: _.toString(each.value) }))
            );
        await this.apiOfBooze.updateBoozeItem(this.getComponent(), { category: indexesOfCategory }, this.getIdOfBooze());
        this.getBooze().category = indexesOfCategory;
    };

    updateSpecificAttributes = async () => {
        await this.handleIdOfBooze();
        await this.apiOfBooze.updateBoozeItem(this.getComponent(), this.modifySpecificAttribute(), this.getIdOfBooze());
    };

    getVariantsOfCombination = async () => {
        /** label, id:main(value)-sub(value), quantity, priceB4, price, photo */
        await this.handleIdOfBooze();
        const variants = Util.renameKeysInArray(Util.generateVariants([this.getBriefMains(), this.getBriefSubs()]), ["label", "labelOfVariant"], ["value", "id"]);
        const variantsOfRemote = (await this.apiOfVariant.fetchPureVariants(this.getComponent(), this.getIdOfBooze())) ?? [];
        const latest = Util.getArrayOfMergeBySpecificId(
            variants,
            variantsOfRemote.map((each) => {
                return { ...each, existing: true };
            })
        );
        Util.appendInfo(latest);
        return latest;
    };

    onVariantQuantityUpdate = async (variant) => {
        await this.apiOfVariant.updateVariantItem(this.getComponent(), { quantity: variant.quantity }, variant.id, this.getIdOfBooze());
        this.getComponent().showSuccessSnackMessage(`${variant.labelOfVariant} 數量：${variant.quantity}`);
    };

    onVariantsQuantityUpdate = async (variants, component) => {
        const submits = _.filter(variants, (variant) => !variant.existing);
        const updates = _.filter(variants, (variants) => variants.existing);

        await this.apiOfVariant.updateVariants(
            this.getComponent(),
            updates.map((each) => {
                return { id: each.id, quantity: each.quantity };
            }),
            this.getIdOfBooze()
        );

        if (_.size(submits) > 0) await this.submitCustomVariant(submits);
        if (component instanceof BaseComponent) component.dismiss();
        this.getComponent().showSuccessSnackMessage(`已更新全部數量`);
    };

    submitCustomVariant = async (submits) => {
        await this.updateSpecificAttributes();
        await this.apiOfVariant.submitVariants(
            this.getComponent(),
            submits.map((each) => {
                return {
                    ...each,
                    content: each.labelOfVariant,
                    idOfBooze: this.getIdOfBooze(),
                    idOfAuthor: UserInfo.getUid(),
                    nameOfBooze: this.getName(),
                    isTaskJob: this.belong2TaskJob(),
                    useMainTrunk: this.getUseMainTrunk(),
                    photo: this.getBriefPhotoOfHead()?.getHref(),
                    allowSelfPickUp: this.getAllowSelfPickUp(),
                    isHomeTeaching: this.getIsHomeTeaching(),
                    visibility: this.getVisibility()
                };
            }),
            this.getIdOfBooze()
        );
    };

    belong2TaskJob = () => {
        return _.isEqual(2, this.getSelectedTypeOfProp());
    };

    onVariantPriceUpdate = async (variant, variants) => {
        await this.apiOfVariant.updateVariantItem(this.getComponent(), { price: variant.price, priceB4Discount: variant.priceB4Discount }, variant.id, this.getIdOfBooze());
        await this.updatePriceOfBooze(variants);
        this.getComponent().showSuccessSnackMessage(`${variant.labelOfVariant} $${variant.price})`);
    };

    updatePriceOfBooze = async (variants) => {
        const lowest = _.minBy(variants, "price");
        const greatest = _.maxBy(variants, "price");
        const isEqual = _.isEqual(lowest.price, greatest.price);
        const rangeOfPrice = isEqual ? `$${lowest.price}` : `$${lowest.price} - $${greatest.price}`;
        await this.apiOfBooze.updateBoozeItem(this.getComponent(), { rangeOfPrice, price: lowest.price, priceB4Discount: lowest.priceB4Discount }, this.getIdOfBooze());
    };

    onVariantsPriceUpdate = async (variants, component) => {
        const submits = _.filter(variants, (variant) => !variant.existing);
        const updates = _.filter(variants, (variants) => variants.existing);

        if (_.size(submits) > 0) await this.submitCustomVariant(submits);
        await this.updatePriceOfBooze(variants);
        await this.apiOfVariant.updateVariants(
            this.getComponent(),
            updates.map((each) => ({ id: each.id, price: each.price, priceB4Discount: each.priceB4Discount })),
            this.getIdOfBooze()
        );

        if (component instanceof BaseComponent) component.dismiss();
        this.getComponent().showSuccessSnackMessage(`已更新全部價格`);
    };

    onVariantPhotoUpdate = async (variant, files) => {
        if (_.size(files) < 1) this.getComponent().showSuccessSnackMessage(`選取圖片出現異常問題`);
        const href = await this.apiOfImage.uploadStorageOfHref(this.getComponent(), files[0], this.getIdOfBooze());
        variant.setPhoto(href);
        await this.apiOfVariant.updateVariantItem(this.getComponent(), { photo: href }, variant.id, this.getIdOfBooze());
        this.getComponent().showSuccessSnackMessage(`已更新(${variant.labelOfVariant})`);
    };

    onVisibilityChanged = async () => {
        if (!this.getInitCompleted()) {
            this.setVisibility(false);
            return this.getComponent().showErrorSnackMessage(`必須先點擊「下一步」`);
        }
        await this.handleIdOfBooze();
        await this.apiOfBooze.updateBoozeItem(this.getComponent(), { visibility: this.getVisibility() }, this.getIdOfBooze());
    };
}

export default ModularizedDionysusGaiaStore;
