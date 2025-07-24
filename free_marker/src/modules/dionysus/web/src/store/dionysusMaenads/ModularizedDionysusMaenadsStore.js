const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusMaenadsStore from "./BaseDionysusMaenadsStore";
import ApiOfVariant from "../dionysusBoozeVariant";

class ModularizedDionysusMaenadsStore extends BaseDionysusMaenadsStore {
    objectOfVariantq3 = {};

    constructor(props) {
        super(props);
        this.apiOfVariant = new ApiOfVariant();
    }

    async onInitialCompleted(object) {
        const self = this;

        function setContent(booze) {
            self.setBooze(booze);
            self.setPhoto(booze.photoOfDemo);
            self.setRangeOfPrice(booze.rangeOfPrice);
            self.setCount(`未選擇`);
            self.setVariants(..._.map(booze.specificAttributes, (attr) => ({ key: attr.key, options: _.map(attr.options, ({ label, value }) => ({ label, value })) })));
        }

        function isBooze(param) {
            return param && !Util.isUndefinedNullEmpty(param.rangeOfPrice) && _.isArray(param.options);
        }

        const component = this.getComponent(true);
        if (component) {
            const param = component.propsMobX().paramObject;
            const booze = isBooze(param) ? param : param.booze;
            setContent(booze);
            this.objectOfVariant = Util.toObjectWithAttributeKey(await this.apiOfVariant.fetch(this.getComponent(), booze.id), "id");
            Util.appendInfo("65423123 this.objectOfVariant => ", this.objectOfVariant);
        }
    }

    setSelectedOption = (option) => {
        const variant = option.getParentNode();
        variant.getOptions().map((each) => each.setSelect(false));
        option.setSelect(true);
        this.invalidateVariant();
    };

    invalidateVariant() {
        const keyOfVariant = this.getVariants()
            .map((v) => _.find(v.getOptions(), (o) => o.getSelect())?.getValue())
            .filter(Boolean)
            .join("-");
        const selectedOption = this.objectOfVariant[keyOfVariant];
        selectedOption ? this.setCurrentVariant(selectedOption) : this.setCurrentOptionExist(false);
    }

    setCurrentVariant = (variant) => {
        this.setPhoto(Util.isUndefinedNullEmpty(variant.photo) ? this.getBooze().photoOfDemo : variant.photo);
        this.setPrice(variant.price);
        this.setTitleOfShape(variant.name);
        this.setCount(variant.quantity);
        this.setCountOfSubmit(1);
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
