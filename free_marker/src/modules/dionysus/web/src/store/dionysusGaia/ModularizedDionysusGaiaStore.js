const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusGaiaStore from "./BaseDionysusGaiaStore";
import Booze from "../dionysusBooze";
import Image from "../dionysusBoozePhoto";

const MAXIMUM_IMAGE_OF_BOOZE = 8;
const MAXIMUM_TEXT_OF_NAME = 50;
const MAXIMUM_TEXT_OF_DESCRIPTION = 300;

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
        this.apiOfBooze = new Booze();
        this.apiOfImage = new Image();
    }

    async onInitialFetchCompleted(collection) {
        let booze = this.getBooze();
        const id = this.getParamOfPidInPath();
        if (Util.isUndefinedNullEmpty(booze) && Util.isFirestoreAutoId(id)) booze = await this.apiOfBooze.fetchBoozeItem(this.getComponent(), id);

        if (booze && booze.id) {
            console.log(booze);
            this.setIdOfBooze(booze.id);
            this.setName(booze.name);
            this.setStatement(booze.statement);
            this.setBriefMains(...this.getOptionsOfBrief(booze, "main"));
            this.setBriefSubs(...this.getOptionsOfBrief(booze, "sub"));
            this.setBriefPhotos(...booze.photos);
        }
    }

    getOptionsOfBrief = (booze, type = "main") => {
        const attr = _.find(booze.specificAttributes, (each) => _.isEqual(each.key, type));
        return attr ? attr.options : [];
    };

    appendMainOptions = async (strings) => {
        const uniques = Util.findUniqueNonReferenceStrings(
            this.getBriefMains().map((each) => each.label),
            strings
        );
        this.pushBriefMains(...uniques.map((each) => Util.getObjectOfSpecifyKey(each, "main")));
    };

    appendSubOptions = async (strings) => {
        const uniques = Util.findUniqueNonReferenceStrings(
            this.getBriefSubs().map((each) => each.label),
            strings
        );
        this.pushBriefSubs(...uniques.map((each) => Util.getObjectOfSpecifyKey(each, "sub")));
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

    onDescriptionFieldChanged = () => {
        const current = this.getDescription();
        this.setDescription(this.truncateString(current, MAXIMUM_TEXT_OF_DESCRIPTION));
        this.setStmtOfDescriptionMaximum(`${_.size(this.getDescription())}/${MAXIMUM_TEXT_OF_DESCRIPTION}`);
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
    };

    handleIdOfBooze = async () => {
        let id = this.getIdOfBooze();
        if (_.isNil(id) || _.isEmpty(id)) {
            /** 如果商品ID 還沒創建時，必須先拿到document id才能有唯一碼作為圖片路徑需求 */
            const latest = await this.apiOfBooze.submitBoozeItem(this.getComponent());
            this.setIdOfBooze(latest.value.id);
        }
    };

    createBooze4Sure = async () => {
        await this.handleIdOfBooze();
        await this.apiOfBooze.updateBoozeItem(
            this.getComponent(),
            {
                name: this.getName(),
                statement: this.getStatement(),
                photos: this.getBriefPhotos(),
                photoOfDemo: _.head(this.getBriefPhotos()).href,
                specificAttributes: [
                    {
                        key: "main",
                        label: "",
                        options: this.getHandledAttribute(this.getBriefMains().map((each) => each.columnData()))
                    },
                    {
                        key: "sub",
                        label: "",
                        options: this.getHandledAttribute(this.getBriefSubs().map((each) => each.columnData()))
                    }
                ]

                /**
                 * 商品歸屬tab的設定
                 * 每個variant圖片的設定
                 */
            },
            this.getIdOfBooze()
        );
        this.getComponent().showInfoSnackMessage(`成功創立「${this.getName()}」商品`);
    };

    getHandledAttribute = (attrs) => {
        console.log(`before:`, attrs);
        const afters = Util.getArrayOfFillMissingValues(attrs);
        console.log(`after:`, attrs);
        return afters;
    };

    appendQuantityOfSet() {
        /** 針對某個商品的組合(黑-XL)調整數量，必須用atomic，例如當前數量是10，要增加到500，就要atomic增加490！  */
    }

    updateMainSubAttr() {
        /** 更新的時候，就不能刪除既有的主項目｜副項目  */
        /** 可以新增，也要記得提醒當前數量為0  */
    }

    setIndexOfTabSelected() {
        /** 商品在哪個Tab底下，可以複選，所有商品是預設值 */
    }
}

export default ModularizedDionysusGaiaStore;
