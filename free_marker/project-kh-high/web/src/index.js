import "./less";
import BaseApp from "./BaseApp";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseComponent from "./base/BaseComponent";
import Config from "./config";
import Store from "./store";
import React from "react";
import { createBrowserHistory } from "history";
import { RouterStore, syncHistoryWithStore } from "mobx-react-router";
import { Route, Router, Switch } from "react-router-dom";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";

class App extends BaseApp {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
const self = new App();
self.mount();
Util.setEnvironment(Config.env);
export { self as Application };
