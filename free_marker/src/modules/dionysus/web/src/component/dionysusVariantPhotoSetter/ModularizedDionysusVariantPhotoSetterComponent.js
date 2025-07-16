const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusVariantPhotoSetterComponent from "./BaseDionysusVariantPhotoSetterComponent";

class ModularizedDionysusVariantPhotoSetterComponent extends BaseDionysusVariantPhotoSetterComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.currentVaient = undefined;
    }

    onDionysusVariantPhotoSetterVariantUpdateIconButtonClicked(param) {
        this.currentVaient = param.object;
        this.enableImageSelectView(false);
    }

    onDionysusVariantPhotoSetterVariantPreviewChipClicked(param) {
        this.openImageDialog(param.object.photo);
    }

    getInjectStyleOfDionysusVariantPhotoSetterVariantUpdateIconButton(variant) {
        return Util.getVisibleOrHidden(variant.existing, true);
    }

    onFilesSelected(files) {
        this.getComponentInstance().getStore().onVariantPhotoUpdate(this.currentVaient, files).then();
    }

    getInjectStyleOfDionysusVariantPhotoSetterVariantPreviewChip(variant) {
        return Util.getVisibleOrHidden(!Util.isUndefinedNullEmpty(variant.photo));
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusVariantPhotoSetterComponent;
