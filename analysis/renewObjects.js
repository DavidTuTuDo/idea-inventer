import Analysis from "./brain/HtmlAnalysis";
import ta from "./brain/ToneAnalysis";
import sla from "./brain/SongListAnalysis";
import rta from "./brain/RankTableAnalysis";
import sa from "./brain/SingersAnalysis";
import puppeteer from "puppeteer";
import GlobalConfig from "../GlobalConfig";

(async () => {
    async function snycDelay(delayInms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true);
            }, delayInms);
        });
    }

    async function downloadSamples() {

        async function download(engineer) {
            await engineer.downloadSample(page, snycDelay);
        }
        await download(new ta());
        await download(new Analysis());
        await download(new sla());
        await download(new rta());
        await download(new sa());
    }

    const browser = await puppeteer.launch({
        headless: !GlobalConfig.INVOKE_REAL_CHROME
    });

    const page = await browser.newPage();
    await downloadSamples(page, snycDelay);
    console.info('re-new all sample object');
    return 0;
})();
