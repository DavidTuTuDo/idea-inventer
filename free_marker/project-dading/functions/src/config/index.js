const edit = true;
import BaseConfig from "./BaseConfig";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
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
            "value": 1
        },
        {
            "label": "雄獅旅行社股份有限公司",
            "value": 1
        },
        {
            "label": "五福旅行社股份有限公司台北分公司",
            "value": 2
        },
        {
            "label": "格緻旅行社股份有限公司",
            "value": 4
        },
        {
            "label": "喜鴻旅行社股份有限公司",
            "value": 5
        },
        {
            "label": "百威旅⾏社股份有限公司",
            "value": 6
        },
        {
            "label": "永信旅行社股份有限公司",
            "value": 7
        },
        {
            "label": "尊榮國際旅行社股份有限公司",
            "value": 8
        },
        {
            "label": "山富國際旅行社股份有限公司",
            "value": 9
        },
        {
            "label": "旅天下聯合國際旅行社股份有限公司",
            "value": 10
        },
        {
            "label": "旅遊家旅行社股份有限公司",
            "value": 11
        },
        {
            "label": "聯翔國際旅行社有限公司台北分公司",
            "value": 12
        },
        {
            "label": "駿樺旅行社股份有限公司",
            "value": 13
        },
        {
            "label": "東南旅行社股份有限公司",
            "value": 14
        },
        {
            "label": "大新旅行社股份有限公司",
            "value": 15
        },
        {
            "label": "台鋼燦星國際旅行社股份有限公司",
            "value": 16
        },
        {
            "label": "大榮旅行社份份有限公司",
            "value": 17
        },
        {
            "label": "凱旋旅行社股份有限公司-巨匠",
            "value": 18
        },
        {
            "label": "巨大旅行社股份有限公司",
            "value": 19
        },
        {
            "label": "品冠國際旅行社股份有限公司",
            "value": 20
        },
        {
            "label": "現代國際旅行社有限公司",
            "value": 21
        },
        {
            "label": "行健旅行社股份有限公司",
            "value": 22
        },
        {
            "label": "鳳凰國際旅行社股份有限公司",
            "value": 23
        },
        {
            "label": "世興旅行社有限公司台北分公司",
            "value": 24
        }
    ];

    getNameOfAgentByValue(value) {
        const item = _.find(this.AGENT, (each) => _.isEqual(each.value, value));
        return item ? item.label : `(未選擇)承辦旅行社`
    }

    /** -------------------- async api -------------------- **/
}

export default new Config();
