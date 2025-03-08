const edit = true;
import BaseMaenadsStore from "./BaseMaenadsStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";

class MaenadsStore extends BaseMaenadsStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialCompleted(object) {
        const self = this;

        function setContent(booze) {
            self.setBooze(booze);
            self.setPhoto(booze.photoOfDemo);
            self.setPrice(booze.rangeOfPrice);
            self.setCount(`未選擇`);
            self.setOptions(..._.filter(booze.options, option => option.count > 0));
        }

        function isBooze(param) {
            return param && !Util.isUndefinedNullEmpty(param.rangeOfPrice) && _.isArray(param.options)
        }

        const component = this.getComponent(true);
        if (component) {
            const param = component.propsMobX().paramObject;
            const booze = isBooze(param) ? param : param.booze;
            setContent(booze);
        }

        // const component = this.getComponent(true);
        // if (component) {
        //     const param = component.propsMobX().paramObject;
        //     if (param) {
        //         const booze = param.booze;
        //         this.setBooze(booze);
        //         this.setPhoto(booze.photoOfDemo);
        //         this.setPrice(booze.rangeOfPrice);
        //         this.setCount(`未選擇`);
        //         this.setOptions(..._.filter(booze.options, option => option.count > 0));
        //     }
        // }
    }

    setCurrentOption = (option) => {
        this.setPhoto(option.getPhoto());
        this.setPrice(option.getPrice());
        this.setTitleOfShape(option.getName());
        this.setCount(option.getCount());
        this.setCountOfSubmit(1);
        this.setIndexOfSelected(_.indexOf(this.getOptions(), option));
    }

    getIndexOfOption = (option) => {
        return option ? _.indexOf(this.getOptions(), option) : -1;
    }

    validateCountOfOrder(increase = true) {
        if (this.getIndexOfSelected() < 0) {
            this.getComponent().showWarningSnackMessage(`尚未選擇商品`)
            return;
        }

        const current = _.toNumber(this.getCountOfSubmit());
        if (increase) {
            const result = _.sum([current, 1]);
            this.setCountOfSubmit(result <= this.getCount() ? result : this.getCount())
        } else {
            const result = _.sum([current, -1]);
            this.setCountOfSubmit(result < 2 ? current : result)
        }
    }


    /** -------------------- async api -------------------- **/
}

export default MaenadsStore;
