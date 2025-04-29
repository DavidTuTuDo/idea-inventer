const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseGetDistanceOfSpecificAddress from "./BaseGetDistanceOfSpecificAddress";

class ModularizedGetDistanceOfSpecificAddress extends BaseGetDistanceOfSpecificAddress {
    constructor(props) {
        super(props);
    }

    /** 每個專案都不同哦 */
    getKeyOfGoogleAPI() {
        return "AIzaSyAweW-LpWb6qqjSiQ8aLCKVW7GxM0r3frs";
    }

    /**
     * 計算兩地步行距離
     * @param {string} address - 中文地址，例如："高雄市苓雅區武營路469巷16號"
     * @param {Object} targetCoords - 目標座標 { lat: 緯度, lng: 經度 }
     * @returns {Promise<string>} - 返回距離，例如 "12公里460公尺"
     */
    async calculateWalkingDistance(address, targetCoords) {
        try {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.getKeyOfGoogleAPI()}`;
            const geocodeResponse = await fetch(geocodeUrl);

            if (!geocodeResponse.ok) {
                throw new Error(`Geocoding API 請求失敗，HTTP 狀態碼: ${geocodeResponse.status}`);
            }

            const geocodeData = await geocodeResponse.json();

            if (!geocodeData.results.length) {
                throw new Error("無法解析地址");
            }

            const { lat, lng } = geocodeData.results[0].geometry.location;

            const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat},${lng}&destinations=${targetCoords.lat},${targetCoords.lng}&mode=walking&key=${this.getKeyOfGoogleAPI()}`;
            const distanceMatrixResponse = await fetch(distanceMatrixUrl);

            if (!distanceMatrixResponse.ok) {
                throw new Error(`Distance Matrix API 請求失敗，HTTP 狀態碼: ${distanceMatrixResponse.status}`);
            }

            const distanceMatrixData = await distanceMatrixResponse.json();
            console.log("Distance Matrix API Response:", JSON.stringify(distanceMatrixData, null, 2));

            const distanceInfo = distanceMatrixData.rows?.[0]?.elements?.[0];

            if (!distanceInfo || distanceInfo.status !== "OK") {
                throw new Error("無法計算距離，請檢查輸入資料或 API 回應");
            }

            // 解析距離並將單位改為中文
            const distanceText = distanceInfo.distance.text; // 格式例如 "6.3 km" 或 "400 m"
            const formattedDistance = distanceText.replace("km", "公里").replace("m", "公尺"); // 替換英文單位為中文單位

            return formattedDistance;
        } catch (error) {
            console.error("計算距離失敗:", error.message);
            throw error;
        }
    }

    async handleHttpOnCall(data, session) {
        const address = data.address;
        const distance = await this.calculateWalkingDistance(address, { lat: 22.663524, lng: 120.363903 });
        return distance;
    }
}

export default ModularizedGetDistanceOfSpecificAddress;
