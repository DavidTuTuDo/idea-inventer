const edit = true;
import BaseBacchusStore from "./BaseBacchusStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import ApiOfBooze from "../dionysusBooze";

class BacchusStore extends BaseBacchusStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.apiOfBooze = new ApiOfBooze
  }

  async fetch(view = this.getComponent()) {
    const result =  await super.fetch(view);
    const booze = await this.apiOfBooze.fetchBoozeItem(view,view.getUidOfBacchusDetail());
    return {...result,booze}
  }

  async onInitialFetchCompleted(collection) {
    await super.onInitialFetchCompleted(collection);
    const booze = collection.booze;
    console.log(booze);
    if(!Util.isUndefinedNullEmpty(booze)) {
      const banners = booze.options.map((option) => {
        return {
          image: option.photo,
          route: '',
        }
      })
      const result = { banners:Util.getArrayOfSize(banners,12),...booze};
      this.initial(result,false);
    }
  }

  /** -------------------- async api -------------------- **/
}

export default BacchusStore;
