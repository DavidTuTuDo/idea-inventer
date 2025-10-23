const edit = true;

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { google } from "googleapis";
import stream, { Readable } from "stream";
import FirebaseHelper from "./FirebaseHelper";

class GCPHelper {
    async deployDocxFileToAdminStorage(buffer, fileName = "folder/filename.extension") {
        if (!fileName.endsWith(".docx")) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.docx`
            };
        }
        return await this.deployButterAsFile2AdminStorage(buffer, fileName, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`);
    }

    async deployPDFtoAdminStorage(buffer, fileName = `folder/filename.extension`) {
        if (!fileName.endsWith(`.pdf`)) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：副檔名不是.pdf`
            };
        }
        return await this.deployButterAsFile2AdminStorage(buffer, fileName, `application/pdf`);
    }

    async deployButterAsFile2AdminStorage(buffer, fileName, contentType) {
        const ref = FirebaseHelper.storage().bucket();
        const core = ref.file(fileName);
        try {
            await core.save(buffer, { contentType });
            // console.log('File uploaded successfully:', result.metadata);

            const downloadUrl = await core.getSignedUrl({
                action: "read",
                expires: "03-09-3000"
            });

            return {
                succeed: true,
                path: downloadUrl[0],
                message: `produce doc file succeed`
            };
        } catch (error) {
            return {
                succeed: false,
                message: `檔案產生失敗，原因：${error.message}`
            };
        }
    }

    async getBufferOfGeneratedDocx(pathOfDocxTemplate = {}, data = { nameOfTravel: "小卉國8日行", startDateOfTravel: "2月17號", countOfPeople: "2" }) {
        /** Load the docx file as binary content */
        const content = fs.readFileSync(pathOfDocxTemplate);
        /** Unzip the content of the file */
        const zip = new PizZip(content);
        /** This will parse the template, and will throw an error if the template is
         invalid, for example, if the template is "{user" (no closing tag) */
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        });
        /** Render the document (Replace {first_name} by John, {last _name} by Doe, ...) */
        doc.render(data);
        /** Get the zip document and generate it as a nodebuffer */
        const buf = doc.getZip().generate({
            type: "nodebuffer"
            /** compression: DEFLATE adds a compression step.
             For a 50MB output document, expect 500ms additional CPU time */
            // compression: "DEFLATE",
        });
        /** doing something of log usage,buf is a node.js Buffer, you can either write it to a file or res.
         * persist file will => fs.writeFileSync(`./output${_.toString(Util.getCurrentTimeStamp())}.docx`, buf); */
        return buf;
    }

    async authenticate() {
        const auth = new google.auth.GoogleAuth({
            keyFile: "template/googleapi.json", // Path to your service account key file
            scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
        });
        return await auth.getClient();
    }

    async convertDocxToPdfBuffer(docxBuffer, name) {
        const auth = await this.authenticate();
        const drive = google.drive({ version: "v3", auth });
        // Create a readable stream from the docx buffer
        const docxStream = new stream.PassThrough();
        docxStream.end(docxBuffer);
        // Upload the docx buffer as a new Google Docs file
        const fileMetadata = {
            name: name,
            mimeType: "application/vnd.google-apps.document"
        };
        const media = {
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            body: docxStream
        };
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id"
        });
        const fileId = file.data.id;
        // Export the Google Docs file as a PDF
        const response = await drive.files.export(
            {
                fileId: fileId,
                mimeType: "application/pdf"
            },
            { responseType: "arraybuffer" }
        );
        // Delete the temporary Google Docs file
        await drive.files.delete({ fileId: fileId });
        // Return the PDF buffer
        return Buffer.from(response.data);
    }

    async uploadBufferOFDocx2Drive(bufferOfDocx, filePath) {
        const auth = await this.authenticate();
        const drive = google.drive({ version: "v3", auth });

        const fileMetadata = {
            name: libpath.basename(filePath),
            mimeType: "application/vnd.google-apps.document" // Google Docs mime type
        };

        const media = {
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX mime type
            body: Readable.from(bufferOfDocx)
        };

        try {
            const file = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: "id"
            });
            const fileId = file.data.id;
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: "writer",
                    type: "anyone"
                }
            });

            const result = await drive.files.get({
                fileId: fileId,
                fields: "webViewLink"
            });
            return {
                succeed: true,
                path: result.data.webViewLink
            };
        } catch (error) {
            return {
                succeed: false,
                message: `'4123132 error uploading or sharing file:', ${error.message}`
            };
        }
    }
}
