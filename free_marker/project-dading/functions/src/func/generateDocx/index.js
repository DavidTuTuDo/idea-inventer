const edit = true;
import BaseGenerateDocx from "./BaseGenerateDocx";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Api from '../../api';
import gcp from "../../base/GCPHelper";
import config from "../../config";


class GenerateDocx extends BaseGenerateDocx {

    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /**
     * payload:{"idOfOrder":"訂單編號"}
     * nameOfTravel =>idOfTravel
     * startDateOfTravel =>2月14
     * countsOfPeople =>1
     * priceOfCash =>31188
     * priceOfCredit =>32188
     * priceOfDeposit =>1000
     * yearOfROC: =>113
     * yearOfAD =>2024
     **/
    async handleHttpOnCall(data, session) {
        const idOfOrder = data.idOfOrder;
        const order = await Api.fetchOrderItem(idOfOrder);
        const momentOfStartTravel = this.normalizeAsDayjs(order.startOfTravel);
        const yearOfAD = Util.getCustomFormatOfDatePresent(momentOfStartTravel, `YYYY`);

        const paramsOfTemplate = {
            nameOfTravel: !Util.isEmpty(order.idOfAgentTravel) ? order.idOfAgentTravel : '未填入團號',
            startDateOfTravel: Util.getCustomFormatOfDatePresent(momentOfStartTravel, `MM月DD日`),
            countOfPeople: `${order.countOfPeople}`,
            priceOfCash: `${order.priceOfCash}`,
            priceOfCredit: `${order.priceOfCredit}`,
            priceOfDeposit: `${order.priceOfDeposit}`,
            nameOfAgent: config.getNameOfAgentByValue(order.selectedAgent),
            certifOfAgent: config.getCertificateOfAgentByValue(order.selectedAgent),
            yearOfAD,
            yearOfROC: Util.getStringOfYearADConvertToMinguoYear(Util.toNumber(yearOfAD)),
        }
        const fileName = `大鼎旅行社(訂單|${idOfOrder})`;
        const bufferOfDocx4Word = await gcp.getBufferOfGeneratedDocx(`./template/template_of_dading_contract_20240711-07-forDocx.docx`, paramsOfTemplate)
        const result = await gcp.uploadBufferOFDocx2Drive(bufferOfDocx4Word, `${fileName}.docx`)

        /**
         * 部署docx的腳本，可是會用微軟的word開啟，格式會亂掉
         * const result = await this.deployDocxFileToAdminStorage(bufferOfDocx, libpath.join('contract', `${fileName}.docx`));
         **/
        if (result.succeed)
            return result.path;

        throw new ERROR(9999, `485421212 ${result.message}`);
    }

}

export default new GenerateDocx();
