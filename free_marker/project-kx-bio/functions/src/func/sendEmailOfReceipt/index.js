const edit = true;

import ModularizedSendEmailOfReceipt from "./ModularizedSendEmailOfReceipt";

class SendEmailOfReceipt extends ModularizedSendEmailOfReceipt {
    constructor(props) {
        super(props);
    }

    listOfCC() {
        return ["a0939460655@gmail.com"];
    }
}

export default new SendEmailOfReceipt();
