import puppeteer from 'puppeteer';
import GlobalConfig from "../GlobalConfig";


class Browser {

    async constructor(headless = GlobalConfig.INVOKE_REAL_CHROME) {
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
