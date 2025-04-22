const edit = true;

import { exceptioner as ERROR} from "utiller";
import BaseGetCurrentAddress from "./BaseGetCurrentAddress";

class ModularizedGetCurrentAddress extends BaseGetCurrentAddress {
    constructor(props) {
        super(props);
    }

    /** 每個專案都不同哦 */
    getKeyOfGoogleMapAPI() {
        return 'AIzaSyAweW-LpWb6qqjSiQ8aLCKVW7GxM0r3frs';
    }

    /** payload:{"latitude":0,"longitude":0} */
    async handleHttpOnCall(data, session) {
        const {latitude, longitude} = data;
        console.log({latitude, longitude})
        try {
            const address = await this.getAddressFromCoordinates(this.getKeyOfGoogleMapAPI(), latitude, longitude);
            console.log(address);
            return address
        } catch (error) {
            console.log(error.message);
            throw new ERROR(9999, `48451232 ${error.message}`);
        }
    }

    getAddressFromCoordinates = async (API_KEY, latitude, longitude) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}&language=zh-TW`;
        console.log('url===> ', url);
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                return data.results[0].formatted_address; // 返回第一個匹配的地址
            } else {
                throw new Error(`Geocoding failed: ${data.status}`);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            throw error;
        }
    };
}

export default ModularizedGetCurrentAddress;
