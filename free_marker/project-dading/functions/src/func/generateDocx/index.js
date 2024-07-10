const edit = true;
import BaseGenerateDocx from "./BaseGenerateDocx";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import Api from '../../api';
import firebase from "../../base/CommonFirebaseHelper";

// import { load } from '@pspdfkit/nodejs'

class GenerateDocx extends BaseGenerateDocx {

    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /** payload:{"idOfOrder":"訂單編號"}
     *
     * nameOfTravel =>idOfTravel
     * startDateOfTravel =>2月14
     * countsOfPeople =>1
     * priceOfCash =>31188
     * priceOfCredit =>32188
     * priceOfDeposit =>1000
     * yearOfROC: =>113
     * yearOfAD =>2024
     *
     * */

    convertToMinguoYear = (gregorianYear) => {
        const minguoYear = gregorianYear - 1911;
        if (minguoYear > 0) {
            return `${minguoYear}`;
        } else {
            return `前${Math.abs(minguoYear)}`;
        }
    };


    async handleHttpOnCall(data, session) {
        const idOfOrder = data.idOfOrder;
        const order = await Api.fetchOrderItem(idOfOrder);
        const momentOfStartTravel = this.normalizeAsMoment(order.startOfTravel);
        const yearOfAD = Util.getCustomFormatOfDatePresent(momentOfStartTravel, `YYYY`);

        const paramsOfTemplate = {
            nameOfTravel: !_.isEmpty(order.idOfAgentTravel) ? order.idOfAgentTravel : '未填入團號',
            startDateOfTravel: Util.getCustomFormatOfDatePresent(momentOfStartTravel, `MM月DD日`),
            countOfPeople: `${order.countOfPeople}`,
            priceOfCash: `${order.priceOfCash}`,
            priceOfCredit: `${order.priceOfCredit}`,
            priceOfDeposit: `${order.priceOfDeposit}`,
            yearOfAD,
            yearOfROC: Util.getStringOfYearADConvertToMinguoYear(_.toNumber(yearOfAD)),
        }

        const bufferOfDocx = await this.getBufferOfGeneratedDocx(`./template/template_of_dading_contract_20240710.docx`, paramsOfTemplate)
        const result = await this.deployDocxFileToAdminStorage(bufferOfDocx, libpath.join('contract', `大鼎旅行社(合約:${idOfOrder}.docx`));
        if (result.succeed)
            return result.path;

        throw new ERROR(9999, result.message);
    }

    async deployDocxFileToAdminStorage(buffer, fileName = 'folder/filename.extension') {
        if (!fileName.endsWith('.docx')) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.docx`
            }
        }
        return await this.deployButterAsFile2AdminStorage(buffer, fileName, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
    }

    async deployPDFtoAdminStorage(buffer, fileName = 'folder/filename.extension') {
        if (!fileName.endsWith(`.pdf`)) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.pdf`
            }
        }

        return await this.deployButterAsFile2AdminStorage(buffer, fileName, `application/pdf`)
    }

    async deployButterAsFile2AdminStorage(buffer, fileName, contentType) {
        const ref = firebase.storage().bucket();
        const core = ref.file(fileName);
        try {
            await core.save(buffer, {contentType});
            // console.log('File uploaded successfully:', result.metadata);

            const downloadUrl = await core.getSignedUrl({
                action: "read",
                expires: "03-09-3000",
            })
            return {
                succeed: true,
                path: downloadUrl[0],
                message: `produce doc file succeed`
            }
        } catch (error) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：${error.message}`
            }
        }
    }

    async getBufferOfGeneratedDocx(pathOfDocxTemplate = {}, data = {nameOfTravel: "小卉國8日行", startDateOfTravel: "2月17號", countOfPeople: "2"}) {
        /** Load the docx file as binary content */
        const content = fs.readFileSync(pathOfDocxTemplate);
        /** Unzip the content of the file */
        const zip = new PizZip(content);
        /** This will parse the template, and will throw an error if the template is
         invalid, for example, if the template is "{user" (no closing tag) */
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        /** Render the document (Replace {first_name} by John, {last _name} by Doe, ...) */
        doc.render(data);
        /** Get the zip document and generate it as a nodebuffer */
        const buf = doc.getZip().generate({
            type: "nodebuffer",
            /** compression: DEFLATE adds a compression step.
             For a 50MB output document, expect 500ms additional CPU time */
            compression: "DEFLATE",
        });
        /** doing something of log usage,buf is a node.js Buffer, you can either write it to a file or res.
         * persist file will => fs.writeFileSync(`./output${_.toString(Util.getCurrentTimeStamp())}.docx`, buf); */
        return buf;

    }

    /** word轉pdf有點麻煩
     async getBufferOfDocx2PDF(bufferOfDocx) {
     const instance = await load({document: bufferOfDocx})
     const pdfBuffer = await instance.exportPDF();
     await instance.close();
     return Buffer.from(pdfBuffer);
     }
     */

    async executeSample() {
        const bufferOfDocx = await this.getBufferOfGeneratedDocx(`./template_of_dading_contract_0707.docx`, {nameOfTravel: "小卉國8日行", startDateOfTravel: "2月17號", countsOfPeople: "2"})
        // const bufferOfPDF = await this.getBufferOfDocx2PDF(bufferOfDocx);
        // const result = await deployPDFtoAdminStorage(bufferOfPDF, libpath.join('contract', `大鼎${_.toString(Util.getCurrentTimeStamp())}.pdf`));

        const result = await this.deployDocxFileToAdminStorage(bufferOfDocx, libpath.join('contract', `大鼎${_.toString(Util.getCurrentTimeStamp())}.docx`));
        console.log(result);
    }


    /** -------------------- async api -------------------- **/
}

export default new GenerateDocx();
