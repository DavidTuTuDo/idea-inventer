const edit = true;

import React from "react";
import dayjs from "dayjs"; // 引入 Day.js 代替 Moment
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import BaseHadesComponent from "./BaseHadesComponent";
import JobCalendar from "../../base/JobCalendar";
import Hades from "../../store/hadesHade";

/**
 * 模組化冥王星組件 - 負責處理哈迪斯交易數據與日曆組件的聯動
 */
class ModularizedHadesComponent extends BaseHadesComponent {
    constructor(props) {
        super(props);
        /** 哈迪斯數據 API 實例 */
        this.apiOfHades = new Hades();
    }

    /**
     * 渲染注入日曆視圖的區塊
     * @returns {React.ReactNode}
     */
    getInjectViewOfHadesDiv = () => {
        const self = this;
        return (
            <JobCalendar
                /** 當日曆日期區間變更時觸發 (由 JobCalendar 控制) */
                onPeriodChanged={(start, end) => {
                    self.fetchHadesOfCompound(start, end).then();
                }}
                /** 將 Store 原始數據標準化後傳入 JobCalendar */
                courses={self
                    .getStore()
                    .getHades()
                    .map((each) => self.normalize(each))}
            />
        );
    };

    /**
     * 標準化單一交易數據，使其符合 JobCalendar 格式
     * @param {Object} each - 原始數據項
     * @returns {Object} 標準化後的事件物件
     */
    normalize = (each) => {
        /** 使用 Store 的適配器將 Firebase TS 轉為毫秒數字後格式化 */
        const format = (firebaseTS) => dayjs(this.getStore().normalizeTimestamp(firebaseTS)).format("YYYYMMDDHHmmss");

        // 組合出 period 格式: "起始-結束" (例如 20250101000000-20250101235959)
        const period = `${format(each.timeOfCreate)}-${format(each.timeOfPayment)}`;
        const name = `＄${each.priceOfTotal}`;

        return { ...each, period, name };
    };

    /**
     * 抓取並複合處理指定區間內的交易數據
     * @param {string} start - 開始日期 (YYYYMMDD)
     * @param {string} end - 結束日期 (YYYYMMDD)
     */
    fetchHadesOfCompound = async (start, end) => {
        /** 輔助函式：將 YYYYMMDDHHmmss 字串轉為 Firebase Timestamp 對象 */
        const ts = (stringOfTS) => this.getStore().toFireBaseTimestampObject(dayjs(stringOfTS, "YYYYMMDDHHmmss"));

        /** 精確到秒的開始與結束點 */
        const startOfPrecisely = `${start}000000`;
        const endOfPrecisely = `${end}235959`;

        // 執行 Firebase Query (使用 > 與 < 進行時間過濾)
        const items = await this.apiOfHades.fetchPureHades(
            this,
            UserInfoRef.getUid(),
            { type: "where", params: ["timeOfPayment", ">=", ts(startOfPrecisely)] },
            { type: "where", params: ["timeOfPayment", "<=", ts(endOfPrecisely)] },
            { type: "orderBy", params: ["timeOfPayment", "desc"] }
        );

        // 更新 MobX Store 狀態
        this.getStore().cleanHades();
        this.getStore().pushHades(...items);
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedHadesComponent;
