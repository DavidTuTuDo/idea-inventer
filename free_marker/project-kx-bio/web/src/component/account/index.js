const edit = true;

import ModularizedAccountComponent from "./ModularizedAccountComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";


class AccountComponent extends ModularizedAccountComponent {
    constructor(props) {
        super(props);
    }

    getInjectStyleOfAccountBasicDiv(account) {
        return Util.getVisibleOrNone(false);
    }
}

export default AccountComponent;
