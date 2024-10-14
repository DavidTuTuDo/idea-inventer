import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Sun Oct 13 2024 02:27:45 GMT+0800 (Taipei Standard Time)
 */

class sashanailgel_scraper {

}

export {sashanailgel_scraper as sashanailgel_scraper}

if (configerer.DEBUG_MODE) {
    (async () => {
            const browser = await puppeteer.launch({
                headless: false
            });

            const page = await browser.newPage();
            await page.goto(`https://www.sachianail.com/plist/-1`, {waitUntil: 'networkidle2', timeout: 0});
            //   const items = await page.$$eval('#gl-container > *', elements => {
            //   const titles = await page.$$eval('#gl-container .gl-title', elements => {
            // '#'=>代表id '.'=>代表class
            // .$eval = evaluate
            // $ 是拿到 reference
            // $$ 是拿到 element list


            /**
             const parentElement = await page.$('#gl-container');  // 获取父元素
             */

            const parentElement = await page.$$('#gl-container > *');  // 获取父元素
            for (const each of parentElement) {
                const titleElement = await each.$('.gl-title');
                const titleText = await titleElement.evaluate(el => el.innerText);
                console.log(titleText);

                const hrefOfDetailElement = await each.$('gl-img > gl-item-image > img-link')
                const srcValue = await hrefOfDetailElement.evaluate(el => el.href);  // 或者 el.getAttribute('src') 来更精确获取原始值
                console.log(srcValue);

            }
            // console.log(parentElement[0]);

            // 获取父元素下class="gl-title"的子元素
            // const titleElements = await parentElement.$$('.gl-title'); // 找到所有子元素class="gl-title"
            //
            // // 遍历这些子元素并获取文本
            // for (let element of titleElements) {
            //     const text = await element.$eval(el => el.innerText);  // 也可以使用el.innerHTML或其他属性
            //     console.log(text);
            // }

            //     , elements => {
            //     // 将所有子元素的文本或其他属性提取出来
            //     return elements.map(element => {
            //         return {name:element.$$eval('gl-title')}
            //     }); // 或者 element.outerHTML 获取HTML内容
            // });

        }
    )();
}
