import {configer} from "configer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import Browser from "./browser";

/** author:明悅
 *  create time:Wed Oct 13 2021 17:25:32 GMT+0800 (Taipei Standard Time)
 */

class ceec_scrape_script {

}

export {ceec_scrape_script as ceec_scrape_script}

if (configer.DEBUG_MODE) {
    (async () => {
            const browser = new Browser(true);
            await browser.init();


            const openCeeCTask = async (page) => {
                await Browser.openPageUtilStable(page, 'https://www.ceec.edu.tw/xmfile?xsmsid=0J052424829869345634')
                // console.log(await page.content());
                const selectors = await page.$$(`.tagList > ul > li`)
                /** 等同於querySelectorAll */
                console.log(selectors.length);
                for (const selector of selectors) {
                    const label = await Browser.getInnerTextOfSelector(page, selector);
                    if (_.isEqual("全部", label)) continue;
                    console.log('頁面===> ', label);
                    await Browser.clickSelectorCompletelyLoaded(page, selector);

                    if (await Browser.selectorExisted(page, `span[class="dev-script-oper"]`)) {
                        await Browser.selectCompletelyLoaded(page, `span[class="dev-script-oper"] > select`, `50`)
                    }

                    const filesOfEachYear = await page.$$(`#PageListContainer > .ListTable >.rwdTable > tbody > tr`);
                    /** 沒有註明代表tagName .代表className, #代表id, $$代表querySelectorForAll, $代表querySelector*/
                    for (const eachYear of filesOfEachYear) {
                        const yearTitle = await Browser.getInnerTextOfSelector(page, await eachYear.$(`.title`));
                        const papers = await eachYear.$$(`.download > ul > li`);
                        if (papers !== null && papers.length > 0) {
                            for (const paper of papers) {
                                const element = await paper.$(`a`);
                                const val = await element.getProperty('title');
                                const href = await element.getProperty('href');
                                const stringOfVal = href !== null ? await val.jsonValue() : '';
                                const stringOfHref = href !== null ? await href.jsonValue() : '';
                                if (Util.isPathEqualsFileType(stringOfHref, 'pdf')) {
                                    Util.appendInfo(`考科:${label}, 考卷:${stringOfVal}, 網址:${stringOfHref}`)
                                    await Browser.download(stringOfHref, `./download/${label}/${yearTitle}`, `${stringOfVal}.pdf`);
                                    await Util.syncDelay(50);
                                }
                            }
                        }
                    }
                }
            }
            await browser.doSinglePageWork(openCeeCTask);
            await browser.destroy();

        }
    )();
}
