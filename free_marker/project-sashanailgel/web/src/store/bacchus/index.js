const edit = true;
import BaseBacchusStore from "./BaseBacchusStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import Banner from "../bacchusBanner";
import BaseStore from "../../base/BaseStore";
import route from "react-router-dom/es/Route";

class BacchusStore extends BaseBacchusStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
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
      const result = {banners,...booze};
      console.log(result);
      this.initial(result,false);
    }
  }

  /** -------------------- async api -------------------- **/
}

export default BacchusStore;
