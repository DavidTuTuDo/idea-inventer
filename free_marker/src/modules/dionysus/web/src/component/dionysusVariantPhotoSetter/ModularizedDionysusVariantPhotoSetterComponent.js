const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusVariantPhotoSetterComponent from "./BaseDionysusVariantPhotoSetterComponent";

class ModularizedDionysusVariantPhotoSetterComponent extends BaseDionysusVariantPhotoSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusVariantPhotoSetterVariantUpdateIconButtonClicked(param) {
        this.getComponentInstance().getStore().onVariantPhotoUpdate(param.object).then();
    }

    onDionysusVariantPhotoSetterVariantPreviewChipClicked(param) {
        this.showSuccessSnackMessage(`開啟預覽畫面`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusVariantPhotoSetterComponent;
