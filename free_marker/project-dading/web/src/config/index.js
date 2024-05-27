const edit = true;
import BaseConfig from "./BaseConfig";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class Config extends BaseConfig {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    COUNTRY_OF_TRAVEL = [{"label": "法國", "value": "1"}, {"label": "美國", "value": "2"}, {"label": "西班牙", "value": "3"}, {"label": "中國", "value": "4"}, {
        "label": "意大利",
        "value": "5"
    }, {"label": "土耳其", "value": "6"}, {"label": "墨西哥", "value": "7"}, {"label": "泰國", "value": "8"}, {"label": "德國", "value": "9"}, {"label": "英國", "value": "10"}, {
        "label": "日本",
        "value": "11"
    }, {"label": "馬來西亞", "value": "12"}, {"label": "越南", "value": "13"}, {"label": "澳大利亞", "value": "14"}, {"label": "加拿大", "value": "15"}, {
        "label": "印度",
        "value": "16"
    }, {"label": "韓國", "value": "17"}, {"label": "印尼", "value": "18"}, {"label": "荷蘭", "value": "19"}, {"label": "瑞士", "value": "20"}, {"label": "奧地利", "value": "21"}, {
        "label": "俄羅斯",
        "value": "22"
    }, {"label": "希臘", "value": "23"}, {"label": "葡萄牙", "value": "24"}, {"label": "阿聯酋", "value": "25"}, {"label": "新加坡", "value": "26"}, {
        "label": "沙特阿拉伯",
        "value": "27"
    }, {"label": "匈牙利", "value": "28"}, {"label": "愛爾蘭", "value": "29"}, {"label": "南非", "value": "30"}, {"label": "埃及", "value": "31"}, {
        "label": "摩洛哥",
        "value": "32"
    }, {"label": "阿根廷", "value": "33"}, {"label": "巴西", "value": "34"}, {"label": "越南", "value": "35"}, {"label": "柬埔寨", "value": "36"}, {"label": "奧地利", "value": "37"}, {
        "label": "波蘭",
        "value": "38"
    }, {"label": "捷克", "value": "39"}, {"label": "芬蘭", "value": "40"}, {"label": "瑞典", "value": "41"}, {"label": "丹麥", "value": "42"}, {"label": "挪威", "value": "43"}, {
        "label": "比利時",
        "value": "44"
    }, {"label": "匈牙利", "value": "45"}, {"label": "葡萄牙", "value": "46"}, {"label": "希臘", "value": "47"}, {"label": "愛爾蘭", "value": "48"}, {
        "label": "冰島",
        "value": "49"
    }, {"label": "盧森堡", "value": "50"}, {"label": "斯洛伐克", "value": "51"}, {"label": "保加利亞", "value": "52"}, {"label": "羅馬尼亞", "value": "53"}, {
        "label": "塞爾維亞",
        "value": "54"
    }, {"label": "黑山", "value": "55"}, {"label": "馬其頓", "value": "56"}, {"label": "阿爾巴尼亞", "value": "57"}, {"label": "格魯吉亞", "value": "58"}, {
        "label": "亞美尼亞",
        "value": "59"
    }, {"label": "亞塞拜然", "value": "60"}, {"label": "白俄羅斯", "value": "61"}, {"label": "摩爾多瓦", "value": "62"}, {"label": "烏克蘭", "value": "63"}, {
        "label": "哈薩克斯坦",
        "value": "64"
    }, {"label": "烏茲別克斯坦", "value": "65"}, {"label": "土庫曼斯坦", "value": "66"}, {"label": "塔吉克斯坦", "value": "67"}, {"label": "吉爾吉斯斯坦", "value": "68"}, {
        "label": "俄羅斯",
        "value": "69"
    }, {"label": "蒙古", "value": "70"}, {"label": "韓國", "value": "71"}, {"label": "北韓", "value": "72"}, {"label": "中國", "value": "73"}, {"label": "日本", "value": "74"}, {
        "label": "越南",
        "value": "75"
    }, {"label": "柬埔寨", "value": "76"}, {"label": "老撾", "value": "77"}, {"label": "泰國", "value": "78"}, {"label": "緬甸", "value": "79"}, {
        "label": "馬來西亞",
        "value": "80"
    }, {"label": "新加坡", "value": "81"}, {"label": "文萊", "value": "82"}, {"label": "菲律賓", "value": "83"}, {"label": "印尼", "value": "84"}, {
        "label": "東帝汶",
        "value": "85"
    }, {"label": "澳大利亞", "value": "86"}, {"label": "新西蘭", "value": "87"}, {"label": "巴布亞新幾內亞", "value": "88"}, {"label": "所羅門群島", "value": "89"}, {
        "label": "斐濟",
        "value": "90"
    }, {"label": "薩摩亞", "value": "91"}, {"label": "瓦努阿圖", "value": "92"}, {"label": "紐埃", "value": "93"}, {"label": "吐瓦魯", "value": "94"}, {
        "label": "瑙魯",
        "value": "95"
    }, {"label": "馬紹爾群島", "value": "96"}, {"label": "帛琉", "value": "97"}, {"label": "密克羅尼西亞", "value": "98"}, {"label": "美國", "value": "99"}, {
        "label": "加拿大",
        "value": "100"
    }, {"label": "墨西哥", "value": "101"}, {"label": "巴哈馬", "value": "102"}, {"label": "古巴", "value": "103"}, {"label": "牙買加", "value": "104"}, {
        "label": "海地",
        "value": "105"
    }, {"label": "多米尼加", "value": "106"}, {"label": "波多黎各", "value": "107"}, {"label": "安提瓜和巴布達", "value": "108"}, {"label": "聖基茨和尼維斯", "value": "109"}, {
        "label": "多米尼克",
        "value": "110"
    }, {"label": "聖盧西亞", "value": "111"}, {"label": "聖文森特和格林納丁斯", "value": "112"}, {"label": "巴巴多斯", "value": "113"}, {
        "label": "格林納達",
        "value": "114"
    }, {"label": "特立尼達和多巴哥", "value": "115"}, {"label": "哥斯達黎加", "value": "116"}, {"label": "巴拿馬", "value": "117"}, {"label": "尼加拉瓜", "value": "118"}, {
        "label": "洪都拉斯",
        "value": "119"
    }, {"label": "薩爾瓦多", "value": "120"}, {"label": "危地馬拉", "value": "121"}, {"label": "伯利茲", "value": "122"}, {"label": "哥倫比亞", "value": "123"}, {
        "label": "委內瑞拉",
        "value": "124"
    }, {"label": "蓋亞那", "value": "125"}, {"label": "蘇里南", "value": "126"}, {"label": "厄瓜多爾", "value": "127"}, {"label": "秘魯", "value": "128"}, {
        "label": "巴西",
        "value": "129"
    }, {"label": "玻利維亞", "value": "130"}, {"label": "巴拉圭", "value": "131"}, {"label": "烏拉圭", "value": "132"}, {"label": "阿根廷", "value": "133"}, {
        "label": "智利",
        "value": "134"
    }, {"label": "埃及", "value": "135"}, {"label": "利比亞", "value": "136"}, {"label": "突尼斯", "value": "137"}, {"label": "阿爾及利亞", "value": "138"}, {
        "label": "摩洛哥",
        "value": "139"
    }, {"label": "蘇丹", "value": "140"}, {"label": "南蘇丹", "value": "141"}, {"label": "厄立特里亞", "value": "142"}, {"label": "吉布提", "value": "143"}, {
        "label": "索馬里",
        "value": "144"
    }, {"label": "埃塞俄比亞", "value": "145"}, {"label": "烏干達", "value": "146"}, {"label": "肯尼亞", "value": "147"}, {"label": "坦桑尼亞", "value": "148"}, {
        "label": "盧旺達",
        "value": "149"
    }, {"label": "布隆迪", "value": "150"}, {"label": "剛果民主共和國", "value": "151"}, {"label": "贊比亞", "value": "152"}, {"label": "安哥拉", "value": "153"}, {
        "label": "莫桑比克",
        "value": "154"
    }, {"label": "津巴布韋", "value": "155"}, {"label": "納米比亞", "value": "156"}, {"label": "博茨瓦納", "value": "157"}, {"label": "南非", "value": "158"}, {
        "label": "賴索托",
        "value": "159"
    }, {"label": "斯威士蘭", "value": "160"}, {"label": "馬達加斯加", "value": "161"}, {"label": "科摩羅", "value": "162"}, {"label": "塞舌爾", "value": "163"}, {
        "label": "毛里求斯",
        "value": "164"
    }, {"label": "馬拉維", "value": "165"}, {"label": "馬里", "value": "166"}, {"label": "布基納法索", "value": "167"}, {"label": "尼日爾", "value": "168"}, {
        "label": "奈及利亞",
        "value": "169"
    }, {"label": "乍得", "value": "170"}, {"label": "中非共和國", "value": "171"}, {"label": "喀麥隆", "value": "172"}, {"label": "赤道幾內亞", "value": "173"}, {
        "label": "加蓬",
        "value": "174"
    }, {"label": "剛果共和國", "value": "175"}, {"label": "聖多美和普林西比", "value": "176"}, {"label": "烏干達", "value": "177"}, {"label": "剛果民主共和國", "value": "178"}, {
        "label": "加蓬",
        "value": "179"
    }, {"label": "赤道幾內亞", "value": "180"}, {"label": "布隆迪", "value": "181"}, {"label": "盧旺達", "value": "182"}, {"label": "聖多美和普林西比", "value": "183"}, {
        "label": "塞舌爾",
        "value": "184"
    }, {"label": "科摩羅", "value": "185"}, {"label": "馬達加斯加", "value": "186"}, {"label": "毛里求斯", "value": "187"}, {"label": "南非", "value": "188"}]

    /** -------------------- async api -------------------- **/
}

export default new Config();
