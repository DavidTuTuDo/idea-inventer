const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { size } from "lodash-es";
import BaseIreneQrcodeComponent from "./BaseIreneQrcodeComponent";

class ModularizedIreneQrcodeComponent extends BaseIreneQrcodeComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getWrapInjectStyleOfIreneQrcodeDiv() {
        return { backgroundColor: this.getStore().getColor() ?? `#06a748` };
    }

    getWrapInjectStyleOfIreneQrcodeHrefQrCode(ireneQrcode) {
        return Util.getVisibleOrNone(!this.getStore().getUseRemit());
    }

    getWrapInjectStyleOfIreneQrcodeSubTypography(ireneQrcode) {
        return Util.getVisibleOrNone(size(ireneQrcode.getSub()) > 0);
    }

    onIreneQrcodeScanDivClicked(param) {
        if (this.getStore().getUseRemit()) return this.copyTextToClipboard(this.getStore().getRemitSerial().replace(/\D/g, ""), `已複製匯款帳號`);
        this.gotoUrlWithNewTabDirectly(this.getStore().getHref());
    }

    getInjectStyleOfIreneQrcodeOwlDiv(ireneQrcode) {
        return Util.getVisibleOrNone(this.getStore().getUseRemit());
    }
}

export default ModularizedIreneQrcodeComponent;
