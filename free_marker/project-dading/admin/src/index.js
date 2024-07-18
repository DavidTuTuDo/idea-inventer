const edit = true;
import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/FirebaseHelper";
import {linepayer as LinePay} from "linepayer";
import libpath from 'path';
import config from './config';
import moment from 'moment';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';


(async () => {

    // console.log(firebase.storage().bucket());

    async function deployDocxFileToAdminStorage(buffer, fileName = 'folder/filename.extension') {
        if (!fileName.endsWith('.docx')) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.docx`
            }
        }
        return await deployButterAsFile2AdminStorage(buffer, fileName, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
    }

    async function deployPDFtoAdminStorage(buffer, fileName = 'folder/filename.extension') {
        if (!fileName.endsWith(`.pdf`)) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.pdf`
            }
        }

        return await deployButterAsFile2AdminStorage(buffer, fileName, `application/pdf`)
    }

    async function deployButterAsFile2AdminStorage(buffer, fileName, contentType) {
        const ref = firebase.storage().bucket()
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
                path: downloadUrl,
                message: `produce doc file succeed`
            }
        } catch (error) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：${error.message}`
            }
        }
    }

    async function getBufferOfGeneratedDocx(pathOfDocxTemplate = {}, data = {nameOfTravel: "小卉國8日行", startDateOfTravel: "2月17號", countsOfPeople: "2"}) {
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

    async function getBufferOfDocx2PDF(bufferOfDocx) {
        const instance = await load({document: bufferOfDocx})
        const pdfBuffer = await instance.exportPDF();
        await instance.close();
        return Buffer.from(pdfBuffer);
    }


    // const bufferOfDocx = await getBufferOfGeneratedDocx(`./template_of_dading_contract_0707.docx`, {nameOfTravel: "小卉國8日行", startDateOfTravel: "2月17號", countsOfPeople: "2"})
    // const bufferOfPDF = await getBufferOfDocx2PDF(bufferOfDocx);
    // // const result = await deployPDFtoAdminStorage(bufferOfPDF, libpath.join('contract', `大鼎${_.toString(Util.getCurrentTimeStamp())}.pdf`));
    //
    // const result = await deployDocxFileToAdminStorage(bufferOfDocx, libpath.join('contract', `大鼎${_.toString(Util.getCurrentTimeStamp())}.docx`));
    // console.log(result);
    const api = new Api();
    console.log(await api.fetchOrders());

})();


