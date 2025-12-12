const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import React from "react";
import JobCalendar from "../../base/JobCalendar";
import BaseDemeterComponent from "./BaseDemeterComponent";
import Hera from "../../store/dionysusHera";
import BaseUserInfo from "../../base/BaseUserInfo";

const COLORS_OF_JOB = ["error", "success", "default", "warning", "primary", "secondary"];

class ModularizedDemeterComponent extends BaseDemeterComponent {
    constructor(props) {
        super(props);
        this.apiOfHera = new Hera();
    }

    getColorByString = (str) => {
        // 利用 lodash 將字串的 charCode 累加成一個 hash
        const hash = _.sum(Array.from(str).map((ch) => ch.charCodeAt(0)));

        // 將 hash 映射到 colors 的 index 範圍內
        const index = hash % COLORS_OF_JOB.length;

        return COLORS_OF_JOB[index];
    };

    fetchHeraOfCompound = async (start = "20250101", end = "20250131") => {
        const self = this;
        const startOfPrecisely = _.toNumber(`${start}000000`);
        const endOfPrecisely = _.toNumber(`${end}235959`);

        // 初始化已查詢區間列表
        if (!self.fetchedRanges) self.fetchedRanges = [];

        // 檢查是否已有區間完全包含本次查詢
        const isCovered = self.fetchedRanges.some(({ from, to }) => startOfPrecisely >= from && endOfPrecisely <= to);

        if (isCovered) {
            console.log(`[SKIPPED] 區間 ${start} ~ ${end} 已被覆蓋`);
            return;
        }

        // 查詢資料
        const items = await self.apiOfHera.fetchPureHeras(
            this,
            BaseUserInfo.getUid(),
            { type: "where", params: ["startYYYYMMDDHHmmss", ">=", startOfPrecisely] },
            { type: "where", params: ["startYYYYMMDDHHmmss", "<=", endOfPrecisely] },
            { type: "orderBy", params: ["startYYYYMMDDHHmmss", "desc"] }
        );

        // 存入 Store 並標記顏色
        this.getStore().pushCourses(
            ...items.map((each) => ({
                ...each,
                color: self.getColorByString(each.idOfBooze)
            }))
        );

        // 加入並合併區間
        self.fetchedRanges.push({ from: startOfPrecisely, to: endOfPrecisely });
        self.fetchedRanges = self.mergeRanges(self.fetchedRanges);
    };

    // 👇 區間合併函式：傳入多段區間，自動合併重疊部分
    mergeRanges(ranges) {
        if (!Array.isArray(ranges)) return [];

        // 按照起始時間排序
        const sorted = _.sortBy(ranges, ["from"]);

        const merged = [];
        for (const range of sorted) {
            const last = _.last(merged);

            if (!last || range.from > last.to) {
                // 沒重疊：直接加入
                merged.push({ ...range });
            } else {
                // 有重疊：合併成一段
                last.to = Math.max(last.to, range.to);
            }
        }
        return merged;
    }

    getInjectViewOfDemeterDiv = () => {
        const self = this;
        return (
            <JobCalendar
                onPeriodChanged={(start, end) => {
                    self.fetchHeraOfCompound(start, end).then();
                }}
                // courses={self.sample()}
                courses={self.getStore().getCourses()}
            />
        );
    };

    // sample = () => {
    //     return [
    //         {
    //             // id: "id_1",
    //             name: "課程 1",
    //             period: "202510212000-202510212200",
    //             color: "default"
    //         },
    //         {
    //             // id: "id_2",
    //             name: "課程 2",
    //             period: "202509251900-202509252000",
    //             color: "success"
    //         },
    //         {
    //             // id: "id_3",
    //             name: "課程 3",
    //             period: "202509281400-202509281500",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_4",
    //             name: "課程 4",
    //             period: "202509241800-202509242000",
    //             color: "error"
    //         },
    //         {
    //             id: "id_5",
    //             name: "課程 5",
    //             period: "202510270900-202510271100",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_6",
    //             name: "課程 6",
    //             period: "202509231800-202509232000",
    //             color: "error"
    //         },
    //         {
    //             id: "id_7",
    //             name: "課程 7",
    //             period: "202510141700-202510141900",
    //             color: "default"
    //         },
    //         {
    //             id: "id_8",
    //             name: "課程 8",
    //             period: "202509262100-202509262200",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_9",
    //             name: "課程 9",
    //             period: "202509150800-202509150900",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_10",
    //             name: "課程 10",
    //             period: "202511011800-202511011900",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_11",
    //             name: "課程 11",
    //             period: "202510081100-202510081200",
    //             color: "error"
    //         },
    //         {
    //             id: "id_12",
    //             name: "課程 12",
    //             period: "202510311100-202510311200",
    //             color: "success"
    //         },
    //         {
    //             id: "id_13",
    //             name: "課程 13",
    //             period: "202509112000-202509112200",
    //             color: "error"
    //         },
    //         {
    //             id: "id_14",
    //             name: "課程 14",
    //             period: "202510050900-202510051000",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_15",
    //             name: "課程 15",
    //             period: "202509221700-202509221800",
    //             color: "error"
    //         },
    //         {
    //             id: "id_16",
    //             name: "課程 16",
    //             period: "202509120900-202509121000",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_17",
    //             name: "課程 17",
    //             period: "202510101100-202510101200",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_18",
    //             name: "課程 18",
    //             period: "202510021800-202510022000",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_19",
    //             name: "課程 19",
    //             period: "202510131900-202510132100",
    //             color: "default"
    //         },
    //         {
    //             id: "id_20",
    //             name: "課程 20",
    //             period: "202510161700-202510161800",
    //             color: "default"
    //         },
    //         {
    //             id: "id_21",
    //             name: "課程 21",
    //             period: "202509111400-202509111500",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_22",
    //             name: "課程 22",
    //             period: "202510182000-202510182200",
    //             color: "success"
    //         },
    //         {
    //             id: "id_23",
    //             name: "課程 23",
    //             period: "202511021300-202511021500",
    //             color: "success"
    //         },
    //         {
    //             id: "id_24",
    //             name: "課程 24",
    //             period: "202509231500-202509231600",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_25",
    //             name: "課程 25",
    //             period: "202510191600-202510191800",
    //             color: "success"
    //         },
    //         {
    //             id: "id_26",
    //             name: "課程 26",
    //             period: "202510061700-202510061800",
    //             color: "success"
    //         },
    //         {
    //             id: "id_27",
    //             name: "課程 27",
    //             period: "202509172000-202509172100",
    //             color: "success"
    //         },
    //         {
    //             id: "id_28",
    //             name: "課程 28",
    //             period: "202510011300-202510011500",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_29",
    //             name: "課程 29",
    //             period: "202510301400-202510301600",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_30",
    //             name: "課程 30",
    //             period: "202509211800-202509212000",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_31",
    //             name: "課程 31",
    //             period: "202509232000-202509232100",
    //             color: "default"
    //         },
    //         {
    //             id: "id_32",
    //             name: "課程 32",
    //             period: "202509141600-202509141700",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_33",
    //             name: "課程 33",
    //             period: "202509241700-202509241800",
    //             color: "success"
    //         },
    //         {
    //             id: "id_34",
    //             name: "課程 34",
    //             period: "202509081900-202509082100",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_35",
    //             name: "課程 35",
    //             period: "202510021900-202510022000",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_36",
    //             name: "課程 36",
    //             period: "202509191700-202509191800",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_37",
    //             name: "課程 37",
    //             period: "202509221900-202509222100",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_38",
    //             name: "課程 38",
    //             period: "202509161100-202509161300",
    //             color: "success"
    //         },
    //         {
    //             id: "id_39",
    //             name: "課程 39",
    //             period: "202509221000-202509221200",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_40",
    //             name: "課程 40",
    //             period: "202509080900-202509081000",
    //             color: "default"
    //         },
    //         {
    //             id: "id_41",
    //             name: "課程 41",
    //             period: "202511061800-202511061900",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_42",
    //             name: "課程 42",
    //             period: "202510141500-202510141600",
    //             color: "success"
    //         },
    //         {
    //             id: "id_43",
    //             name: "課程 43",
    //             period: "202510271500-202510271700",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_44",
    //             name: "課程 44",
    //             period: "202509271500-202509271700",
    //             color: "error"
    //         },
    //         {
    //             id: "id_45",
    //             name: "課程 45",
    //             period: "202510251600-202510251700",
    //             color: "error"
    //         },
    //         {
    //             id: "id_46",
    //             name: "課程 46",
    //             period: "202510151100-202510151300",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_47",
    //             name: "課程 47",
    //             period: "202509160900-202509161100",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_48",
    //             name: "課程 48",
    //             period: "202509301000-202509301100",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_49",
    //             name: "課程 49",
    //             period: "202509270800-202509270900",
    //             color: "default"
    //         },
    //         {
    //             id: "id_50",
    //             name: "課程 50",
    //             period: "202510140900-202510141100",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_51",
    //             name: "課程 51",
    //             period: "202509240800-202509240900",
    //             color: "success"
    //         },
    //         {
    //             id: "id_52",
    //             name: "課程 52",
    //             period: "202509091800-202509092000",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_53",
    //             name: "課程 53",
    //             period: "202511052000-202511052100",
    //             color: "default"
    //         },
    //         {
    //             id: "id_54",
    //             name: "課程 54",
    //             period: "202511031300-202511031500",
    //             color: "default"
    //         },
    //         {
    //             id: "id_55",
    //             name: "課程 55",
    //             period: "202510261800-202510261900",
    //             color: "default"
    //         },
    //         {
    //             id: "id_56",
    //             name: "課程 56",
    //             period: "202509082000-202509082200",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_57",
    //             name: "課程 57",
    //             period: "202510062000-202510062100",
    //             color: "success"
    //         },
    //         {
    //             id: "id_58",
    //             name: "課程 58",
    //             period: "202510251400-202510251500",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_59",
    //             name: "課程 59",
    //             period: "202509231000-202509231200",
    //             color: "error"
    //         },
    //         {
    //             id: "id_60",
    //             name: "課程 60",
    //             period: "202510051700-202510051800",
    //             color: "success"
    //         },
    //         {
    //             id: "id_61",
    //             name: "課程 61",
    //             period: "202509211300-202509211400",
    //             color: "default"
    //         },
    //         {
    //             id: "id_62",
    //             name: "課程 62",
    //             period: "202509091800-202509091900",
    //             color: "default"
    //         },
    //         {
    //             id: "id_63",
    //             name: "課程 63",
    //             period: "202510190800-202510191000",
    //             color: "default"
    //         },
    //         {
    //             id: "id_64",
    //             name: "課程 64",
    //             period: "202510151700-202510151800",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_65",
    //             name: "課程 65",
    //             period: "202510042100-202510042200",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_66",
    //             name: "課程 66",
    //             period: "202509141000-202509141100",
    //             color: "success"
    //         },
    //         {
    //             id: "id_67",
    //             name: "課程 67",
    //             period: "202510251700-202510251900",
    //             color: "success"
    //         },
    //         {
    //             id: "id_68",
    //             name: "課程 68",
    //             period: "202511031800-202511031900",
    //             color: "error"
    //         },
    //         {
    //             id: "id_69",
    //             name: "課程 69",
    //             period: "202511041100-202511041200",
    //             color: "error"
    //         },
    //         {
    //             id: "id_70",
    //             name: "課程 70",
    //             period: "202510081700-202510081800",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_71",
    //             name: "課程 71",
    //             period: "202510061300-202510061400",
    //             color: "primary"
    //         },
    //         {
    //             id: "id_72",
    //             name: "課程 72",
    //             period: "202509221400-202509221500",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_73",
    //             name: "課程 73",
    //             period: "202510251500-202510251600",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_74",
    //             name: "課程 74",
    //             period: "202509221400-202509221500",
    //             color: "error"
    //         },
    //         {
    //             id: "id_75",
    //             name: "課程 75",
    //             period: "202509121000-202509121200",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_76",
    //             name: "課程 76",
    //             period: "202509261100-202509261300",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_77",
    //             name: "課程 77",
    //             period: "202509221600-202509221700",
    //             color: "warning"
    //         },
    //         {
    //             id: "id_78",
    //             name: "課程 78",
    //             period: "202509191700-202509191900",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_79",
    //             name: "課程 79",
    //             period: "202509301500-202509301600",
    //             color: "secondary"
    //         },
    //         {
    //             id: "id_80",
    //             name: "課程 80",
    //             period: "202510090900-202510091000",
    //             color: "success"
    //         },
    //         {
    //             id: "course1",
    //             name: "鋼琴課 A",
    //             period: "202509080900-202509081000",
    //             color: "primary"
    //         },
    //         {
    //             id: "course2",
    //             name: "鋼琴課 B",
    //             period: "202509080930-202509081030",
    //             color: "secondary"
    //         },
    //         {
    //             id: "course3",
    //             name: "舞蹈課",
    //             period: "202509081000-202509081100",
    //             color: "warning"
    //         },
    //         {
    //             id: "course4",
    //             name: "英語會話 A",
    //             period: "202509081000-202509081100",
    //             color: "success"
    //         },
    //         {
    //             id: "course5",
    //             name: "英語會話 B",
    //             period: "202509081030-202509081130",
    //             color: "error"
    //         }
    //     ];
    // };
    /** -------------------- async api -------------------- **/
}

export default ModularizedDemeterComponent;
