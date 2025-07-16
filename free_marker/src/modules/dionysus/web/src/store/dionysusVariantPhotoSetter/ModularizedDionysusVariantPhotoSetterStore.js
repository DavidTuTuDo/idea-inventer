const edit = true;

import BaseDionysusVariantPhotoSetterStore from "./BaseDionysusVariantPhotoSetterStore";

class ModularizedDionysusVariantPhotoSetterStore extends BaseDionysusVariantPhotoSetterStore {
    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        const variants = await this.getComponent().getStore().getVariantsOfCombination();
        this.setVariants(...variants);
    }
}

export default ModularizedDionysusVariantPhotoSetterStore;
