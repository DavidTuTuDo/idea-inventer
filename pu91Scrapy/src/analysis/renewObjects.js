import Analysis from "./HtmlAnalysis";
import ta from "./ToneAnalysis";
import sla from "./SongListAnalysis";
import rta from "./RankTableAnalysis";
import sa from "./SingersAnalysis";
import puppeteer from "puppeteer";
import Index from "configerer";

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
        headless: !Index.INVOKE_REAL_CHROME
    });

    const page = await browser.newPage();
    await downloadSamples(page, snycDelay);
    console.info('re-new all sample object');
    return 0;
})();
