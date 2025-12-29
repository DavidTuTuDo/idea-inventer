const edit = true;

import ModularizedSendEmailOfReceipt from "./ModularizedSendEmailOfReceipt";

class SendEmailOfReceipt extends ModularizedSendEmailOfReceipt {
    constructor(props) {
        super(props);
    }

    listOfCC() {
        return ["doraemon.leung.1@gmail.com"];
    }
}

export default new SendEmailOfReceipt();
