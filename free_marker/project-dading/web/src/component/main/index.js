const edit = true;
import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {observer} from "mobx-react";
import {Application} from "../../";
import functions from '../../functions';

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /** following are main-filter handle logic */

    getInjectStyleOfMainFilterGoAheadButton(filter) {
        return Util.getVisibleOrNone(!_.isEmpty(filter.getIdOfOrder()), true)
    }

    getInjectStyleOfMainFilterPasteButton(filter) {
        return Util.getVisibleOrNone(_.isEmpty(filter.getIdOfOrder()), true)
    }

    getInjectStyleOfMainFilterContactTextField(filter) {
        return Util.getVisibleOrNone(filter.getSelectedType() === 2);
    }

    getInjectStyleOfMainFilterHostTextField(filter) {
        return Util.getVisibleOrNone(filter.getSelectedType() === 1);
    }


    getListInjectStyleOfMainFilterAgentToMenuItem(filter) {
        return Util.getVisibleOrNone(filter.getSelectedType() === 4);
    }

    getInjectStyleOfMainFilterAreaOfContactDiv(filter) {
        return Util.getVisibleOrNone(Util.isOrEquals(filter.getSelectedType(), 1, 2), true);
    }

    getInjectStyleOfMainFilterAreaOfStuffDiv(filter) {
        return Util.getVisibleOrNone(Util.isOrEquals(filter.getSelectedType(), 3, 4), true);
    }

    getInjectStyleOfMainFilterDestToAutocomplete(filter) {
        return Util.getVisibleOrNone(_.isEqual(filter.getSelectedType(), 3), true);
    }


    onMainFilterClearButtonClicked(param) {
        param.object.clean();
    }

    onMainFilterPasteButtonClicked(param) {
        const self = this;
        this.readTextClipboard().then((content) => {
            self.getStore().getFilter().setIdOfOrder(content);
        })
    }

    onMainFilterGoAheadButtonClicked(param) {
        const self = this;
        const filter = param.object;
        const id = filter.getIdOfOrder();
        if (!_.isEmpty(id)) {
            this.getStore().fetchOrderById(id).then((order) => {
                self.getStore().toggleIsFilterVisible();
                self.activateOrderDetailDialog(order)
            });
        }
    }

    onAgentToSelectedChange(value, param) {
        if (param.value === 3)
            this.getStore().getFilter().toggleKeyOfDestTo();
    }

    onMainFilterSubmitButtonClicked(param) {
        this.getStore().handleCustomFilter(_.cloneDeep(param.object.data())).then();
    }

    onMainFilterCancelButtonClicked(param) {
        this.getStore().getFilter().clean();
        this.getStore().toggleIsFilterVisible();
    }

    /** following are main-order handle logic */

    onMainAreaOfFuncSearchOfOrderButtonClicked(param) {
        this.getStore().toggleIsFilterVisible();
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
        if (Util.isUndefinedNullEmpty(order)) return;
        Application.getEstablishStore().clean();
        this.refOfCreateOfOrder.current.click();
        Application.getEstablishStore().pushTaskOfCompleted(async (store) => {
            store.sync(order);
        })
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
        const self = this;
        return () => {
            // this.showInfoSnackMessage(`開發中，請稍待`)
            functions.httpOnCallGenerateDocx(self, {idOfOrder: param.object.getId()}).then((pathOfDownload) => self.download(pathOfDownload));
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
        return {background: order.getIsHotCreate() ? '#ffebeb' : 'inherit'};
    }

    onMainOrderExtraIconButtonDeleteClicked(param) {
        return () => {
            this.getStore().deleteOrder(param.object).then(() => this.showInfoSnackMessage(`訂單已刪除`)
            )
        }
    }


    /** -------------------- firebase測試 -------------------- **/

    onMainAreaOfFuncBatchOrderButtonClicked(param) {
        this.getStore().appendsOrder().then();
    }

    onMainAreaOfFuncBatchUpdateButtonClicked(param) {
        this.getStore().updateOrdersConditions().then();
    }

    onMainAreaOfFuncTransactionTestButtonClicked(param) {
        this.getStore().transactionPeople().then();
    }

    onMainAreaOfFuncDeleteSpecificButtonClicked(param) {
        this.getStore().deleteSpecific().then();
    }

    onMainAreaOfFuncDocumentAttrAppendItemButtonClicked(param) {
        this.getStore().appendOrderMember().then();
    }

    onMainAreaOfFuncDocumentAttrDeleteItemButtonClicked(param) {
        this.getStore().deleteOrderMember().then();
    }

    onMainAreaOfFuncIncrementPeopleButtonClicked(param) {
        this.getStore().incrementPeople().then();
    }

    onMainAreaOfFuncLengthOfButtonClicked(param) {
        this.getStore().lengthOfOrder().then();
    }

    onMainAreaOfFuncFetchCountOfButtonClicked(param) {
        this.getStore().testOfFetchCount().then();
    }

    onMainAreaOfFuncFetchSumOfButtonClicked(param) {
        this.getStore().testOfFetchSum().then();
    }

    onMainAreaOfFuncFetchAverageOfButtonClicked(param) {
        this.getStore().testOfFetchAverage().then();
    }

    onMainAreaOfFuncFetchMultiOfButtonClicked(param) {
        this.getStore().testOfFetchFetchMulti().then();
    }

    onMainAreaOfFuncUploadFileButtonClicked(param) {
        this.enableFileSelectView();
    }

    onFilesSelected(files) {
        this.showInfoSnackMessage(`點擊到file-> ${files[0].name}`);
        console.log(45454546,files[0]);
        this.getStore().uploadStorageFile(files[0], 'contract').then(url => {
            this.showInfoSnackMessage(`下載位置=> ${url}`)
            Util.appendInfo(2131321321,' ==> ',url);
        })
    }
}

export default MainComponent;
