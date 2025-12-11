import { utiller as Util } from "utiller";

import { isMobile } from "react-device-detect";

let common = require("./common.style.js").default;
let device;
if (isMobile) {
    device = require("./mobile.style.js").default;
} else {
    device = require("./app.style.js").default;
}

export default Util.merO(common, device);
