import puppeteer from 'puppeteer';
import {configerer as Config, configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from "utiller";
import download from 'download-file';

class Browser {

    browser;

    headless = false;
    maxViewPageSize = true;

    constructor(headless = configerer.INVOKE_REAL_CHROME, maxViewPageSize = true) {
        const self = this;
        this.headless = headless;
        this.maxViewPageSize = maxViewPageSize;
    }

    async init() {
        const self = this;

        const option = {
            headless: self.headless
        }
        if (this.maxViewPageSize)
            option.defaultViewport = null;

        this.browser = await puppeteer.launch(option);
    }

    async destroy() {
        await this.browser.close();
    }

    async doSinglePageWork(async) {
        let page;
        try {
            page = await this.browser.newPage()
            await async(page);
        } catch (error) {
            throw new ERROR(6001, error);
        } finally {
            if (page)
                await page.close();
        }
    }

    /** return Promise<HTTPResponse>  */
    static async openPageUtilStable(page, url) {
        return await page.goto(url, {waitUntil: 'networkidle2'})
    }

    /** return XML content  */
    static async getPageXMLContent(page) {
        return await page.content();
    }

    /** return XML content  */
    static async clickSelectorCompletelyLoaded(page, selector) {
        await selector.click();
        await this.pageCompletelyLoaded(page);
    }

    static async selectorExisted(page, stringOfSelector) {
        return await page.$(stringOfSelector) !== null;
    }

    static async getInnerTextOfSelector(page, selector) {
        return await page.evaluate(el => el.innerText, selector)
    }

    static async getAttrOfSelector(page, selector, attr) {
        return await page.evaluate(el => el[attr], selector)
    }

    static async selectCompletelyLoaded(page, stringOfSelector, stringOfValue) {
        await page.select(stringOfSelector, stringOfValue);
        await this.pageCompletelyLoaded(page);
    }

    /** 找出selector特定屬性的property,*/
    static async getSelectorProperty(selector, attr) {
        const attributePair = await selector.getProperty(attr);
        const stringOfVal = attributePair !== null ? await attributePair.jsonValue() : '';
        return stringOfVal;
    }

    static async pageCompletelyLoaded(page) {
        return Util.syncDelay(3500);

        return await page.waitForNavigation({
            waitUntil: 'networkidle0',
        });
    }

    static async download(path, destFolder = './downloads', fileName = undefined) {
        Util.persistByPath(destFolder);
        try {
            await this.asyncDownload(path, destFolder, fileName);
            Util.appendInfo(`download "${path}" succeed`);
        } catch (error) {
            Util.appendError(`download "${path}" fail`, error);
        }
    }

    static async asyncDownload(path, destFolder = './downloads', fileName) {
        const defaultOps = {
            directory: destFolder, //'./songs/',
        }

        if (fileName) {
            defaultOps.filename = fileName;
        }

        return new Promise((resolve, reject) => {
            download(
                path,
                defaultOps
                , (err) => {
                    if (err)
                        reject(`下載失敗 => ${JSON.stringify(err)}`);
                    else
                        resolve(`下載成功`);
                }
            )

        })
    }

}

export default Browser
