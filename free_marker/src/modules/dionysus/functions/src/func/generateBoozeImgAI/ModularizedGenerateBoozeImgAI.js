const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import libpath from "path";
import BaseGenerateBoozeImgAI from "./BaseGenerateBoozeImgAI";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

class ModularizedGenerateBoozeImgAI extends BaseGenerateBoozeImgAI {
    /** -------------------- fields -------------------- **/

    /** Imagen 3 預設模型 */
    static DEFAULT_MODEL = "imagen-3.0-generate-002";

    /** Imagen 單次最大產圖數 */
    static MAX_IMAGES_PER_REQUEST = 4;

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /**
     * HTTP onCall 進入點。
     *
     * @param {object} data - 前端傳入的資料。
     * @param {string} data.name - 商品名稱。
     * @param {string} data.description - 商品描述。
     * @param {number} [data.count=1] - 要產生的圖片數量。
     * @param {string} data.id - 商品 ID，用於組合 Storage 路徑 (dionysus/:id/images)。
     * @param {number} [data.maxSizeKB=500] - 壓縮後每張圖片的最大大小 (KB)。
     * @param {string} [data.model="imagen-3.0-generate-002"] - Gemini/Imagen 模型名稱。
     * @param {object} session - Firebase Auth session。
     * @returns {Promise<{name: string, description: string, pathesOfImg: string[]}>}
     */
    async handleHttpOnCall(data, session) {
        const { name, description = "", count = 1, id, maxSizeKB = 500, model = ModularizedGenerateBoozeImgAI.DEFAULT_MODEL } = data;

        // ---- 參數驗證 ----
        if (Util.isUndefinedNullEmpty(name)) {
            this.appendErrorLog(9999, `generateBoozeImgAI: name（商品名稱）為必填`);
        }
        if (Util.isUndefinedNullEmpty(id)) {
            this.appendErrorLog(9999, `generateBoozeImgAI: id（商品 ID）為必填`);
        }

        const storagePath = `dionysus/${id}/images`;

        // ---- 初始化 Gemini AI ----
        const apiKey = process.env.GEMINI_API_KEY;
        if (Util.isUndefinedNullEmpty(apiKey)) {
            this.appendErrorLog(9999, `generateBoozeImgAI: 未設定 GEMINI_API_KEY 環境變數`);
        }

        const ai = new GoogleGenAI({ apiKey });

        this.appendLog(`🚀 generateBoozeImgAI: 開始處理 name="${name}", count=${count}, model="${model}"`);

        // ---- Step 1: 透過 Gemini 優化商品描述 ----
        const optimizedDescription = await this._optimizeDescription(ai, name, description);
        this.appendLog(`📝 優化後描述: ${optimizedDescription.substring(0, 100)}...`);

        // ---- Step 2: 產生圖片 ----
        const imageBuffers = await this._generateImages(ai, model, name, optimizedDescription, count);
        this.appendLog(`🎨 成功產生 ${imageBuffers.length} 張圖片`);

        // ---- Step 3: 壓縮圖片 ----
        const compressedFiles = await this._compressImages(imageBuffers, name, maxSizeKB);
        this.appendLog(`📦 壓縮完成，共 ${compressedFiles.length} 張`);

        // ---- Step 4: 上傳至 Storage ----
        const pathesOfImg = await this.uploadStorageFiles(compressedFiles, storagePath, `${Math.max(maxSizeKB * 2, 1024)}KB`, { timeoutMs: 60000 });
        this.appendLog(`☁️ 上傳完成: ${pathesOfImg.length} 張圖片`);

        // ---- Step 5: 回傳結果 ----
        return {
            name,
            description: optimizedDescription,
            pathesOfImg
        };
    }

    /** -------------------- async api -------------------- **/

    /**
     * 透過 Gemini 文字模型優化商品描述。
     * @param {GoogleGenAI} ai - GoogleGenAI 實例。
     * @param {string} name - 商品名稱。
     * @param {string} description - 原始描述。
     * @returns {Promise<string>} - 優化後的描述。
     * @private
     */
    async _optimizeDescription(ai, name, description) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [
                    `你是一位專業的商品文案撰寫專家。請根據以下商品資訊，優化商品描述，使其更具吸引力和專業感。\n\n` +
                        `商品名稱：${name}\n` +
                        `原始描述：${description || "無"}\n\n` +
                        `請直接回覆優化後的描述文字（繁體中文），不要加上任何前綴、標題或標點符號以外的裝飾。控制在 200 字以內。`
                ]
            });
            const text = response.text?.trim();
            return text || description || "";
        } catch (error) {
            this.appendLog(`⚠️ 優化描述失敗，使用原始描述: ${error.message}`);
            return description || "";
        }
    }

    /**
     * 根據模型類型產生圖片。
     * @param {GoogleGenAI} ai - GoogleGenAI 實例。
     * @param {string} modelName - 模型名稱 (e.g., "imagen-3.0-generate-002" 或 "gemini-2.0-flash-exp")。
     * @param {string} name - 商品名稱。
     * @param {string} description - 商品描述。
     * @param {number} count - 要生成的圖片數量。
     * @returns {Promise<Buffer[]>} - 圖片 Buffer 陣列。
     * @private
     */
    async _generateImages(ai, modelName, name, description, count) {
        if (modelName.startsWith("imagen")) {
            return await this._generateImagesWithImagen(ai, modelName, name, description, count);
        }
        return await this._generateImagesWithGemini(ai, modelName, name, description, count);
    }

    /**
     * 使用 Imagen 模型生成圖片。
     * Imagen 每次最多產生 4 張，超過 4 張會分批請求。
     * @private
     */
    async _generateImagesWithImagen(ai, modelName, name, description, count) {
        const prompt = this._buildImagePrompt(name, description);
        const buffers = [];
        let remaining = count;

        while (remaining > 0) {
            const batchCount = Math.min(remaining, ModularizedGenerateBoozeImgAI.MAX_IMAGES_PER_REQUEST);

            this.appendLog(`🖼️ Imagen: 請求 ${batchCount} 張圖片 (剩餘 ${remaining})`);

            const response = await ai.models.generateImages({
                model: modelName,
                prompt,
                config: {
                    numberOfImages: batchCount
                }
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                for (const img of response.generatedImages) {
                    const buffer = Buffer.from(img.image.imageBytes, "base64");
                    buffers.push(buffer);
                }
            }

            remaining -= batchCount;
        }

        return buffers.slice(0, count);
    }

    /**
     * 使用 Gemini 模型生成圖片（支援 responseModalities: IMAGE）。
     * Gemini 每次請求產生 1 張，需迭代呼叫。
     * @private
     */
    async _generateImagesWithGemini(ai, modelName, name, description, count) {
        const buffers = [];

        for (let i = 0; i < count; i++) {
            this.appendLog(`🖼️ Gemini: 產生第 ${i + 1}/${count} 張圖片`);

            const prompt = `${this._buildImagePrompt(name, description)} Variation ${i + 1}.`;

            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: [prompt],
                    config: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                });

                // 從 response 中取出圖片
                const parts = response.candidates?.[0]?.content?.parts || [];
                for (const part of parts) {
                    if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
                        buffers.push(Buffer.from(part.inlineData.data, "base64"));
                    }
                }
            } catch (error) {
                this.appendLog(`⚠️ Gemini 第 ${i + 1} 張圖片產生失敗: ${error.message}`);
            }
        }

        return buffers.slice(0, count);
    }

    /**
     * 建構圖片生成 Prompt。
     * @param {string} name - 商品名稱。
     * @param {string} description - 商品描述。
     * @returns {string} - 英文 Prompt。
     * @private
     */
    _buildImagePrompt(name, description) {
        return (
            `Professional product photography of "${name}". ` +
            `${description ? description + ". " : ""}` +
            `High quality, studio lighting, clean white background, commercial product shot, ` +
            `sharp focus, 4K resolution, elegant composition.`
        );
    }

    /**
     * 壓縮所有圖片至目標大小以下。
     * @param {Buffer[]} imageBuffers - 原始圖片 Buffer 陣列。
     * @param {string} name - 商品名稱（用於檔名）。
     * @param {number} maxSizeKB - 目標最大大小 (KB)。
     * @returns {Promise<Array<{name: string, blob: Buffer}>>} - 壓縮後的檔案物件陣列。
     * @private
     */
    async _compressImages(imageBuffers, name, maxSizeKB) {
        const maxBytes = maxSizeKB * 1024;
        const files = [];

        for (let i = 0; i < imageBuffers.length; i++) {
            this.appendLog(`📦 壓縮第 ${i + 1}/${imageBuffers.length} 張圖片 (目標: ${maxSizeKB}KB)`);
            const compressed = await this._compressSingleImage(imageBuffers[i], maxBytes);
            this.appendLog(`   → 壓縮結果: ${(compressed.length / 1024).toFixed(1)}KB`);

            files.push({
                name: `${name}_${i + 1}_${Date.now()}.jpg`,
                blob: compressed
            });
        }
        return files;
    }

    /**
     * 壓縮單張圖片到指定大小以下。
     * 策略：先降低 JPEG quality → 再降低解析度。
     * @param {Buffer} buffer - 原始圖片 Buffer。
     * @param {number} maxBytes - 最大 bytes。
     * @returns {Promise<Buffer>} - 壓縮後的 Buffer。
     * @private
     */
    async _compressSingleImage(buffer, maxBytes) {
        // 第一階段：僅透過降低 quality 來壓縮
        for (let quality = 90; quality >= 10; quality -= 10) {
            const result = await sharp(buffer).jpeg({ quality }).toBuffer();
            if (result.length <= maxBytes) return result;
        }

        // 第二階段：同時降低解析度 + quality
        const metadata = await sharp(buffer).metadata();
        let width = metadata.width || 1024;
        let height = metadata.height || 1024;

        while (width > 200 && height > 200) {
            width = Math.floor(width * 0.75);
            height = Math.floor(height * 0.75);
            const result = await sharp(buffer).resize(width, height, { fit: "inside" }).jpeg({ quality: 60 }).toBuffer();
            if (result.length <= maxBytes) return result;
        }

        // 最後手段：強制壓到最小
        return sharp(buffer).resize(400, 400, { fit: "inside" }).jpeg({ quality: 30 }).toBuffer();
    }
}

export default ModularizedGenerateBoozeImgAI;
