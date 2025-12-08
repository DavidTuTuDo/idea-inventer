import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import * as fs from 'fs';

/** author:明悅
 *  create time:Sun Jul 07 2024 16:01:51 GMT+0800 (Taipei Standard Time)
 */

class docx_template {

}

export {docx_template as docx_template}

if (configerer.DEBUG_MODE) {
    (async () => {
            const PizZip = require("pizzip");
            const Docxtemplater = require("docxtemplater");

// Load the docx file as binary content
            const content = fs.readFileSync(`./template_of_dading_contract.docx`);
// Unzip the content of the file
            const zip = new PizZip(content);
// This will parse the template, and will throw an error if the template is
// invalid, for example, if the template is "{user" (no closing tag)
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
// Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
            doc.render({
                nameOfTravel: "台中3日行",
            startDateOfTravel : "12月2號",
                countsOfPeople: "6",
            });
// Get the zip document and generate it as a nodebuffer
            const buf = doc.getZip().generate({
                type: "nodebuffer",
                // compression: DEFLATE adds a compression step.
                // For a 50MB output document, expect 500ms additional CPU time
                compression: "DEFLATE",
            });
// buf is a nodejs Buffer, you can either write it to a
// file or res.send it with express for example.
            fs.writeFileSync(`./output${_.toString(Util.getCurrentTimeStamp())}.docx`, buf);
        }
    )();
}
