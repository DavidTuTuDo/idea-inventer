const edit = true;
import BaseGetCurrentAddress from "./BaseGetCurrentAddress";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";

class GetCurrentAddress extends BaseGetCurrentAddress {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  /** payload:{"latitude":0,"longitude":0} */
  async handleHttpOnCall(data, session) {
      const {latitude,longitude} = data;
      console.log({latitude,longitude})
      try {
          const address = await this.getAddressFromCoordinates('AIzaSyAweW-LpWb6qqjSiQ8aLCKVW7GxM0r3frs',latitude,longitude);
          console.log(address);
          return address
      } catch (error) {
          console.log(error.message);
          throw new ERROR(9999, `48451232 ${error.message}`);
      }
  }

     getAddressFromCoordinates = async (API_KEY,latitude, longitude) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}&language=zh-TW`;
        console.log('url===> ',url);
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

  /** -------------------- async api -------------------- **/
}

export default new GetCurrentAddress();
