import puppeteer from 'puppeteer';
import Index from "../configer";


class Browser {

    async constructor(headless = Index.INVOKE_REAL_CHROME) {
        this.browser = await puppeteer.launch({
            headless
        });
    }

    async doSinglePageWork(async){
        let page;
        try {
            page = await this.browser.newPage()
            await async(page);
        } catch (error) {

        } finally {
            if(page)
            await page.close();
        }

    }

}

export default Browser
