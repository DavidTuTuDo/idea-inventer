const edit = true;

import BaseDionysusHestiaStore from "./BaseDionysusHestiaStore";
import DionysusBooze from "../dionysusBooze";

class ModularizedDionysusHestiaStore extends BaseDionysusHestiaStore {
    apiOfBooze = new DionysusBooze();

    constructor() {
        super();
        const self = this;
        this.dionysus.fetch = async function (view = self.getComponent()) {
            /** 將dionysus原本的行為拿掉 */
        };
    }

    async fetch(view = this.getComponent()) {
        this.getDionysus().setBoozes(...(await this.apiOfBooze.fetchPureBoozes(view, { type: "where", params: ["visibility", "==", false] })));
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusHestiaStore;
