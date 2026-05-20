const edit = true;
import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {observer} from "mobx-react";
import functions from '../../functions';
import Router from "../../router";

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
        return Util.getVisibleOrNone(!Util.isEmpty(filter.getIdOfOrder()), true)
    }

    getInjectStyleOfMainFilterPasteButton(filter) {
        return Util.getVisibleOrNone(Util.isEmpty(filter.getIdOfOrder()), true)
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
        return Util.getVisibleOrNone(Util.isEqual(filter.getSelectedType(), 3), true);
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
        if (!Util.isEmpty(id)) {
            this.getStore().fetchOrderById(id).then((order) => {
                self.getStore().toggleIsFilterVisible();
                self.activateOrderDetailDialog(order)
            });
        }
    }

    onAgentToSelectedChange(value, param) {
        if (param.value === 3) this.getStore().getFilter().toggleKeyOfDestTo();
    }

    onMainFilterSubmitButtonClicked(param) {
        this.exeAsyncT(this.getStore().handleCustomFilter(Util.cloneDeep(param.object.data())));
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

    getInjectPropsOfMainOrderContactTextField(order) {
        return {
            helperText: this.completedPaid(order) ?
                `付清：${order.getFeeOfTotal()} 元` : `未繳：${order.getFeeOfNotReceived()} 元`
        }
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
        this.App().getEstablishStore().clean();
        this.refOfCreateOfOrder.current.click();
        this.App().getEstablishStore().pushTaskOfCompleted(async (store) => {
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
        this.exeAsyncT(this.getStore().handleOrderByCondition());
    }

    onMainAreaOfFuncBaseOnDatePickerChange(param) {
        this.exeAsyncT(this.getStore().handleOrderByCondition(true));
    }

    onMainAreaOfFuncAppendOfOrderButtonClicked(param) {
        this.exeAsyncT(this.getStore().appendOrder());
    }

    onMainOrderMenuIconButtonClicked(param) {
        this.activateOrderDetailDialog(param.object.data());
    }

    onMainOrderExtraIconButtonContractOfPdfClicked(param) {
        const self = this;
        return () => {
            functions.httpOnCallGeneratePDF(self, {idOfOrder: param.object.getId()})
                .then((pathOfDownload) => self.gotoUrlWithNewTabDirectly(pathOfDownload));
        }
    }

    onMainOrderExtraIconButtonContractOfWordClicked(param) {
        const self = this;
        return () => {
            functions.httpOnCallGenerateDocx(self, {idOfOrder: param.object.getId()})
                .then((pathOfDownload) => self.gotoUrlWithNewTabDirectly(pathOfDownload));
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
        let color = 'inherit';

        if (this.hotCreate(order)) color = '#ffebeb'; else if (this.completedPaid(order)) color = '#d5e4f0';

        return {background: color};

    }

    /** 剛創建出來的訂單 */
    hotCreate(order) {
        return order.getIsHotCreate();
    }

    /** 已結清的訂單 */
    completedPaid(order) {
        return Util.toNumber(order.getFeeOfNotReceived()) <= 0;
    }

    onMainOrderExtraIconButtonDeleteClicked(param) {
        return () => {
            this.getStore().deleteOrder(param.object).then(() => this.showInfoSnackMessage(`訂單已刪除`))
        }
    }

    onMainAreaOfFuncAdminStuffButtonClicked(param) {
        Router.gotoAdminAnalysisPage(this.getComponentInstance());
    }

    /** -------------------- firebase測試 -------------------- **/

    onMainAreaOfFuncBatchOrderButtonClicked(param) {
        this.exeAsyncT(this.getStore().appendsOrder());
    }

    onMainAreaOfFuncBatchUpdateButtonClicked(param) {
        this.exeAsyncT(this.getStore().updateOrdersConditions());
    }

    onMainAreaOfFuncTransactionTestButtonClicked(param) {
        this.exeAsyncT(this.getStore().transactionPeople());
    }

    onMainAreaOfFuncDeleteSpecificButtonClicked(param) {
        this.exeAsyncT(this.getStore().deleteSpecific());
    }

    onMainAreaOfFuncDocumentAttrAppendItemButtonClicked(param) {
        this.exeAsyncT(this.getStore().appendOrderMember());
    }

    onMainAreaOfFuncDocumentAttrDeleteItemButtonClicked(param) {
        this.exeAsyncT(this.getStore().deleteOrderMember());
    }

    onMainAreaOfFuncIncrementPeopleButtonClicked(param) {
        this.exeAsyncT(this.getStore().incrementPeople());
    }

    onMainAreaOfFuncLengthOfButtonClicked(param) {
        this.exeAsyncT(this.getStore().lengthOfOrder());
    }

    onMainAreaOfFuncFetchCountOfButtonClicked(param) {
        this.exeAsyncT(this.getStore().testOfFetchCount());
    }

    onMainAreaOfFuncFetchSumOfButtonClicked(param) {
        this.exeAsyncT(this.getStore().testOfFetchSum());
    }

    onMainAreaOfFuncFetchAverageOfButtonClicked(param) {
        this.exeAsyncT(this.getStore().testOfFetchAverage());
    }

    onMainAreaOfFuncFetchMultiOfButtonClicked(param) {
        this.exeAsyncT(this.getStore().testOfFetchFetchMulti());
    }

    onMainAreaOfFuncUploadFileButtonClicked(param) {
        this.enableFileSelectView();
    }

    onFilesSelected(files) {
        this.showInfoSnackMessage(`點擊到file-> ${files[0].name}`);
        console.log(45454546, files[0]);
        this.getStore().uploadStorageFile(files[0], 'contract').then(url => {
            this.showInfoSnackMessage(`下載位置=> ${url}`)
            Util.appendInfo(2131321321, ' ==> ', url);
        })
    }
}

export default MainComponent;
