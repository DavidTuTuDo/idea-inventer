import BaseHistoryRhythmStore from "./BaseHistoryRhythmStore";
import {utiller as Util,} from "utiller";
import _ from "lodash";

class HistoryRhythmStore extends BaseHistoryRhythmStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.personalRhythm.enableManual();
    }

    fetchNext = async (view) => {
        if (this.getLengthOfPuOfRecord() > 0) {
            const origins = await this.fetchPuOfRecords(view);
            const items = this.getHackToFavItemsFromRecords(origins);
            this.getPersonalRhythm().pushFavoritePus(...items)
            this.pushPuOfRecords(...origins);
            /** 為了讓fetchPuOfRecordNextPageItems可以抓到lastItem */
        }
    }

    getHackToFavItemsFromRecords(itemsOfRecord = []) {
        return itemsOfRecord.map(record => {
            return {
                ...record,
                name: `[${record.singer}]${record.name}`,
                needTitle: true,
                title: Util.getCurrentTimeFormatYMDHM(this.normalizeTimestamp(record.updateTime))
            }
        });
    }

    fetch = async (view) => {
        this.setState('loading');
        const origins = await this.fetchPuOfRecords(view);
        const items = this.getHackToFavItemsFromRecords(origins);
        this.getPersonalRhythm().setFavoritePus(...items);
        this.setPuOfRecords(...origins);
        /** 為了讓fetchPuOfRecordNextPageItems可以抓到lastItem */

        if (_.size(origins) === 0) this.setHasPageItems(false);
    }

    /** -------------------- async api -------------------- **/
}

export default HistoryRhythmStore;
