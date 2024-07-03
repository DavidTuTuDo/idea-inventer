const edit = true;
import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {observer} from "mobx-react";
import {Application} from "../../";

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /** following are main-filter handle logic */

    getInjectStyleOfMainFilterOfSearchOrderGoAheadButton(filterOfSearchOrder) {
        return Util.getVisibleOrNone(!_.isEmpty(filterOfSearchOrder.getIdOfOrder()), true)
    }

    getInjectStyleOfMainFilterOfSearchOrderPasteButton(filterOfSearchOrder) {
        return Util.getVisibleOrNone(_.isEmpty(filterOfSearchOrder.getIdOfOrder()), true)
    }

    onMainFilterOfSearchOrderClearButtonClicked(param) {
        param.object.clean();
    }

    onMainFilterOfSearchOrderPasteButtonClicked(param) {
        const self = this;
        this.readTextClipboard().then((content) => {
            self.getStore().getFilterOfSearchOrder().setIdOfOrder(content);
        })
    }

    onMainFilterOfSearchOrderGoAheadButtonClicked(param) {
        const self = this;
        const filter = param.object;
        const id = filter.getIdOfOrder();
        if(!_.isEmpty(id)) {
            this.getStore().fetchOrderById(id).then((order) => {
                self.getStore().toggleIsFilterOfSearchOrderVisible();
                self.activateOrderDetailDialog(order)});
        }

    }

    /** following are main-order handle logic */

    onMainAreaOfFuncSearchOfOrderButtonClicked(param) {
        this.getStore().toggleIsFilterOfSearchOrderVisible();
    }

    getInjectPropsOfMainOrderCommentTextField(order) {
        return {helperText: `創單時間：${Util.getSimpleTimeYYMMDDHHmmFormat(order.getCreateTime())}`}
    }

    onMainOrderExtraIconButtonCopyIdClicked(param) {
        const self = this;
        const order = param.object;
        return () => {
            self.copyTextToClipboard(order.getId(), `已複製「${order.getHost()}」訂單編號`)
        }
    }


    activateOrderDetailDialog = (order) => {
        if(Util.isUndefinedNullEmpty(order)) return;
        Application.getEstablishStore().clean();
        this.refOfCreateOfOrder.current.click();
        Application.getEstablishStore().pushTaskOfCompleted(async (store) => {
            store.sync(order);
        })
    }

    onMainFilterOfSearchOrderCancelButtonClicked(param) {
        this.getStore().getFilterOfSearchOrder().clean();
        this.getStore().toggleIsFilterOfSearchOrderVisible();
    }

    onMainFilterOfSearchOrderSubmitButtonClicked(param) {
        this.showInfoSnackMessage(`施工中，請稍待`);
        console.log(this.getStore().getFilterOfSearchOrder().data());
    }

    onMainOrderStartOfTravelDatePickerChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onMainOrderDestinationAutocompleteChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onMainOrderCommentTextFieldChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onMainOrderCountOfPeopleTextFieldChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onMainOrderContactTextFieldChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onMainOrderHostTextFieldChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onMainOrderPriceOfDepositTextFieldChange(param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    onAgentSelectedChange(value, param) {
        this.getStore().invalidateOfRemote(param.object)
    }

    invalidateOfRemote(order) {
        this.getStore().invalidateOfRemote(order)
    }

    onOrderBySelectedChange(value, param) {
        this.getStore().handleOrderByCondition().then();
    }

    onMainAreaOfFuncBaseOnDatePickerChange(param) {
        this.getStore().handleOrderByCondition(true).then();
    }

    onMainAreaOfFuncAppendOfOrderButtonClicked(param) {
        this.getStore().appendOrder().then();
    }

    onMainOrderMenuIconButtonClicked(param) {
        this.activateOrderDetailDialog(param.object.data());
    }

    onMainOrderExtraIconButtonContractClicked(param) {
        return () => {
            this.showInfoSnackMessage(`開發中，請稍待`)
        }
    }

    onMainOrderExtraIconButtonEditClicked(param) {
        const self = this;
        const order = param.object;
        return () => {
            self.activateOrderDetailDialog(order.data());
        }
    }

    getInjectStyleOfMainOrderCard(order) {
        return {background : order.getIsHotCreate() ? '#ffebeb' : 'inherit'};
    }

    onMainOrderExtraIconButtonDeleteClicked(param) {
        return () => {
            this.getStore().deleteOrder(param.object).then(() => this.showInfoSnackMessage(`訂單已刪除`)
            )
        }
    }


    /** -------------------- async api -------------------- **/
}

export default MainComponent;
