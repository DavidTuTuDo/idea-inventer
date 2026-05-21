const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import BaseMetisSetUpStore from "./BaseMetisSetUpStore";
import Clazz from "../metisClazz";

class ModularizedMetisSetUpStore extends BaseMetisSetUpStore {
    constructor(props) {
        super(props);
        this.api = new Clazz();
    }

    async fetch(view = this.getComponent()) {
        const result = {
            ...{}
        };
        await new InfinitePool(2).runByEachTask([
            async () => {
                result.clazzes = await this.api.fetchClazzes(this.getComponent()); /** prepare with default value */
            },
            async () => {
                result.append = this.append /** prepare with default value */;
            }
        ]);
        this.fromJson(result);
        return result;
    }

    async updateClazzState(clazz) {
        await this.api.updateClazzItem(this.getComponent(), clazz, clazz.id);
    }

    async deleteClazzRemote(clazz) {
        await this.api.deleteClazzItem(this.getComponent(), clazz.id);
        clazz.remove();
    }

    appendClassTime(clazz) {
        clazz.pushClassTime({});
    }

    async appendLatestClass() {
        const clazz = await this.api.submitClazzItem();
        this.pushClazzesByIndex(-1, clazz.value);
    }
}

export default ModularizedMetisSetUpStore;
