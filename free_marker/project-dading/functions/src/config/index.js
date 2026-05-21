const edit = true;
import BaseConfig from "./BaseConfig";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import { find } from 'lodash-es';
import libpath from "path";

class Config extends BaseConfig {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    AGENT = [
        {
            "label": "可樂旅遊旅行社股份有限公司",
            "value": 1,
            "certificate": '交觀綜 7781 號‧品保北 0024 號',
        },
        {
            "label": "雄獅旅行社股份有限公司",
            "value": 2,
            "certificate": '交觀綜 2016 號‧品保北 0541 號',
        },
        {
            "label": "五福旅行社股份有限公司台北分公司",
            "value": 3,
            "certificate": '交觀綜 2023 號‧品保高 0059 號',
        },
        {
            "label": "格緻旅行社股份有限公司",
            "value": 4,
            "certificate": '交觀甲 7781 號‧品保北 2171 號',
        },
        {
            "label": "喜鴻旅行社股份有限公司",
            "value": 5,
            "certificate": '交觀綜 2094 號‧品保北 1162 號',

        },
        {
            "label": "百威旅⾏社股份有限公司",
            "value": 6,
            "certificate": '交觀綜 2132 號‧品保北 1174 號',
        },
        {
            "label": "永信旅行社股份有限公司",
            "value": 7,
            "certificate": '交觀綜 2207 號‧品保北 0738 號',
        },
        {
            "label": "尊榮國際旅行社股份有限公司",
            "value": 8,
            "certificate": '交觀綜 2178 號‧品保北 1564 號',
        },
        {
            "label": "山富國際旅行社股份有限公司",
            "value": 9,
            "certificate": '交觀綜 2029 號‧品保北 0030 號',
        },
        {
            "label": "旅天下聯合國際旅行社股份有限公司",
            "value": 10,
            "certificate": '交觀綜 2171 號‧品保北 2137 號',
        },
        {
            "label": "旅遊家旅行社股份有限公司",
            "value": 11,
            "certificate": '交觀綜 2198 號‧品保北 1427 號',
        },
        {
            "label": "聯翔國際旅行社有限公司台北分公司",
            "value": 12,
            "certificate": '交觀綜 2154 號‧品保中 0250 號',
        },
        {
            "label": "駿樺旅行社股份有限公司",
            "value": 13,
            "certificate": '交觀甲 6654 號‧品保北 1438 號',
        },
        {
            "label": "東南旅行社股份有限公司",
            "value": 14,
            "certificate": '交觀綜 2027 號‧品保北 0150 號',
        },
        {
            "label": "大新旅行社股份有限公司",
            "value": 15,
            "certificate": '交觀綜 2048 號‧品保高 0035 號',
        },
        {
            "label": "台鋼燦星國際旅行社股份有限公司",
            "value": 16,
            "certificate": '交觀綜 2136 號‧品保北 1819 號',
        },
        {
            "label": "大榮旅行社份份有限公司",
            "value": 17,
            "certificate": '交觀綜 2173-01 號‧品保北 1681 號',
        },
        {
            "label": "凱旋旅行社股份有限公司-巨匠",
            "value": 18,
            "certificate": '交觀綜 2133 號‧品保北 1009 號',
        },
        {
            "label": "巨大旅行社股份有限公司",
            "value": 19,
            "certificate": '交觀綜 2179 號‧品保北 1960 號',
        },
        {
            "label": "品冠國際旅行社股份有限公司",
            "value": 20,
            "certificate": '交觀綜 2112 號‧品保北 1281 號',
        },
        {
            "label": "現代國際旅行社有限公司",
            "value": 21,
            "certificate": '交觀甲 6913 號‧品保北 1617 號',
        },
        {
            "label": "行健旅行社股份有限公司",
            "value": 22,
            "certificate": '交觀綜 2106 號‧品保北 0870 號',
        },
        {
            "label": "鳳凰國際旅行社股份有限公司",
            "value": 23,
            "certificate": '交觀綜 2006 號‧品保北 0393 號',
        },
        {
            "label": "世興旅行社有限公司台北分公司",
            "value": 24,
            "certificate": '交觀綜 2135 號‧品保中 0198 號',
        }
    ];

    getNameOfAgentByValue(value) {
        const item = find(this.AGENT, (each) => Util.isEqual(each.value, value));
        return item ? item.label : `(未選擇)承辦旅行社`
    }

    getCertificateOfAgentByValue(value) {
        const item = find(this.AGENT, (each) => Util.isEqual(each.value, value));
        return item.certificate;
    }

    /** -------------------- async api -------------------- **/
}

export default new Config();
