const edit = true;
import BaseGetDistanceOfSpecificAddress from "./BaseGetDistanceOfSpecificAddress";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
const API_KEY = 'LpWb6qqjSiQ8aLCKVW7GxM0r3frs';

class GetDistanceOfSpecificAddress extends BaseGetDistanceOfSpecificAddress {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/


    /**
     * 計算兩地步行距離
     * @param {string} address - 中文地址，例如："高雄市苓雅區武營路469巷16號"
     * @param {Object} targetCoords - 目標座標 { lat: 緯度, lng: 經度 }
     * @returns {Promise<string>} - 返回距離，例如 "12公里460公尺"
     */
    async calculateWalkingDistance(address, targetCoords) {
        try {
            // 1. 轉換中文地址為座標
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);

            if (!geocodeResponse.data.results.length) {
                throw new Error('無法解析地址');
            }

            const {lat, lng} = geocodeResponse.data.results[0].geometry.location;

            // 2. 計算步行距離
            const distanceMatrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${lat},${lng}&destinations=${targetCoords.lat},${targetCoords.lng}&mode=walking&key=${API_KEY}`;
            const distanceMatrixResponse = await fetch(distanceMatrixUrl);

            const distanceInfo = distanceMatrixResponse.data.rows[0].elements[0];

            if (distanceInfo.status !== 'OK') {
                throw new Error('無法計算距離');
            }

            // 3. 解析距離資訊
            const walkingDistance = distanceInfo.distance.text; // 格式例如 "12 公里 460 公尺"

            return walkingDistance;
        } catch (error) {
            console.error('計算距離失敗:', error.message);
            throw error;
        }
    }

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const address = data.address;
        console.log(address);
        const distance = await this.calculateWalkingDistance(address,{ lat: 22.663524, lng: 120.363903 })
        console.log(distance);
        return distance;
    }
    /** -------------------- async api -------------------- **/
}

export default new GetDistanceOfSpecificAddress();
