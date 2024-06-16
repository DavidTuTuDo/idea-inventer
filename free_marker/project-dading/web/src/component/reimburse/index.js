const edit = true;

import {utiller as Util} from "utiller";
import { inject } from "mobx-react";
import BaseReimburseComponent from "./BaseReimburseComponent";
import { observer } from "mobx-react";
import _ from 'lodash';

@inject("reimburse")
@observer
class ReimburseComponent extends BaseReimburseComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onReimburseRecordSubmitButtonClicked(param) {
    const record = param.object;
    record.joinRecord2Order().then();
  }

  onReimburseRecordUpdateButtonClicked(param) {
    const record = param.object;
    record.updateRecord2Order().then();
  }

  onReimburseBatchUpdateChipClicked(param) {
    const reimburse = param.object;
    reimburse.batchUpdateRecord2Order().then();
  }

  onReimburseBatchCancelChipClicked(param) {
    this.dismiss();
  }

  onReimburseRecordCancelButtonClicked(param) {
    this.dismiss();
  }

  isBatchUpdateMode = () => {
    return this.getStore().getIsListMode();
  }

  isSingleUpdateMode = () => {
    return this.getStore().getIsUpdate();
  }

  getInjectStyleOfReimburseAreaOfBatchXDiv(reimburse) {
    return Util.getVisibleOrNone(this.isBatchUpdateMode(), true);
  }

  getInjectStyleOfReimburseRecordAreaOfFuncXDiv(record) {
    return Util.getVisibleOrNone(!this.isBatchUpdateMode(), true);
  }

  getInjectStyleOfReimburseRecordSubmitButton(record) {
    return Util.getVisibleOrNone(!this.isSingleUpdateMode(), true);
  }

  getInjectStyleOfReimburseRecordUpdateButton(record) {
    return Util.getVisibleOrNone(this.isSingleUpdateMode(), true);
  }

  getVisibleOfCreditArea(record) {
    const numOfSelectedMethod = _.toNumber(record.getSelectedPayMethod());
    return Util.getVisibleOrNone(numOfSelectedMethod === 2);
  }

  getInjectStyleOfReimburseRecordAreaOfOperateDiv(record) {
    return this.getVisibleOfCreditArea(record);
  }

  getInjectStyleOfReimburseRecordAreaOfCreditDiv(record) {
    return this.getVisibleOfCreditArea(record);
  }



  /** -------------------- async api -------------------- **/
}

export default ReimburseComponent;
