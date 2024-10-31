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

    onInitialCompleted(object) {
        const component = this.getComponent(true);
        if (component) {
            const param = component.propsMobX().paramObject;
            if (param) {
                const booze = param.booze;
                console.log(booze);
                this.setBooze(booze);
                this.setPhoto(booze.headPhoto);
                this.setPrice(booze.rangeOfPrice);
                this.setCount(`未選擇`);
                this.setOptions(...booze.options);
            }
        }
    }

    /** -------------------- async api -------------------- **/
}

export default MaenadsStore;
